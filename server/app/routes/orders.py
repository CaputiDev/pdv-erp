from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models import (
    Client, Product, Order, OrderItem,
    OrderInput, OrderOutput, SyncPayload, SyncResponse
)

router = APIRouter(tags=["Pedidos e Sincronização"])

@router.get("/pedidos", response_model=List[OrderOutput])
def read_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    return orders

def process_single_order(order_input: OrderInput, session: Session) -> str:
    """
    Processa um único pedido e atualiza o estoque do produto.
    Retorna o ID do pedido se processado com sucesso.
    """
    # 1. Idempotência: verificar se o pedido já existe
    db_order = session.get(Order, order_input.id)
    if db_order:
        return db_order.id

    # 2. Criar ou verificar cliente
    db_client = session.get(Client, order_input.clientId)
    if not db_client:
        db_client = Client(id=order_input.clientId, name=order_input.clientName)
        session.add(db_client)
        session.flush()

    # 3. Instanciar pedido
    new_order = Order(
        id=order_input.id,
        clientId=order_input.clientId,
        clientName=order_input.clientName,
        total=order_input.total,
        status=order_input.status,
        date=order_input.date
    )
    session.add(new_order)
    session.flush()

    # 4. Validar itens e dar baixa no estoque se concluído
    for item in order_input.items:
        db_product = session.get(Product, item.productId)
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto com ID {item.productId} não encontrado"
            )

        if order_input.status == "concluido":
            if db_product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Estoque insuficiente para o produto '{db_product.name}'. Disponível: {db_product.stock}, Solicitado: {item.quantity}"
                )
            db_product.stock -= item.quantity
            session.add(db_product)

        new_item = OrderItem(
            orderId=new_order.id,
            productId=item.productId,
            productName=item.productName,
            price=item.price,
            quantity=item.quantity
        )
        session.add(new_item)

    session.flush()
    return new_order.id

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
    import logging
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

