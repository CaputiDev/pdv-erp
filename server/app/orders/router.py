import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.clients.models import Client
from app.products.models import Product
from app.orders.models import Order
from app.orders.schemas import OrderInput, OrderOutput, SyncPayload, SyncResponse
from app.orders.services import process_single_order

router = APIRouter(tags=["Pedidos e Sincronização"])

@router.get("/pedidos", response_model=List[OrderOutput])
def read_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    return orders

@router.post("/pedidos", response_model=OrderOutput)
def create_order(order_input: OrderInput, session: Session = Depends(get_session)):
    try:
        order_id = process_single_order(order_input, session)
        session.commit()
        db_order = session.get(Order, order_id)
        return db_order
    except HTTPException as e:
        session.rollback()
        raise e
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao criar pedido: {str(e)}"
        )

@router.post("/sync", response_model=SyncResponse)
def sync_data(payload: SyncPayload, session: Session = Depends(get_session)):
    synced_clients = []
    synced_products = []
    synced_orders = []

    # 1. Sincronizar Clientes (Upsert individual para registrar sucessos)
    for client in payload.clients:
        try:
            with session.begin_nested():
                db_client = session.get(Client, client.id)
                if db_client:
                    client_data = client.model_dump(exclude_unset=True)
                    for key, val in client_data.items():
                        setattr(db_client, key, val)
                    session.add(db_client)
                else:
                    session.add(client)
            synced_clients.append(client.id)
        except Exception as e:
            logging.error(f"Erro ao sincronizar cliente {client.id}: {str(e)}", exc_info=True)
            continue

    # 2. Sincronizar Produtos (Upsert individual)
    for product in payload.products:
        try:
            with session.begin_nested():
                db_product = session.get(Product, product.id)
                if db_product:
                    product_data = product.model_dump(exclude_unset=True)
                    for key, val in product_data.items():
                        setattr(db_product, key, val)
                    session.add(db_product)
                else:
                    session.add(product)
            synced_products.append(product.id)
        except Exception as e:
            logging.error(f"Erro ao sincronizar produto {product.id}: {str(e)}", exc_info=True)
            continue

    session.flush()

    # 3. Sincronizar Pedidos (Transação aninhada individual por pedido)
    for order in payload.orders:
        try:
            with session.begin_nested():
                order_id = process_single_order(order, session)
            synced_orders.append(order_id)
        except Exception as e:
            logging.error(f"Erro ao sincronizar pedido {order.id}: {str(e)}", exc_info=True)
            continue

    session.commit()

    return SyncResponse(
        synced_clients=synced_clients,
        synced_products=synced_products,
        synced_orders=synced_orders
    )
