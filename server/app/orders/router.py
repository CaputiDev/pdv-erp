import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.clients.models import Client
from app.products.models import Product, Category
from app.orders.models import Order
from app.users.models import User
from app.sessions.models import CaixaSession
from app.incidents.models import Incident
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
    synced_categories = []
    synced_users = []
    synced_sessions = []
    synced_incidents = []

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

    # 2. Sincronizar Categorias (Upsert)
    if payload.categories:
        for category in payload.categories:
            try:
                with session.begin_nested():
                    db_category = session.get(Category, category.id)
                    if db_category:
                        category_data = category.model_dump(exclude_unset=True)
                        for key, val in category_data.items():
                            setattr(db_category, key, val)
                        session.add(db_category)
                    else:
                        session.add(category)
                synced_categories.append(category.id)
            except Exception as e:
                logging.error(f"Erro ao sincronizar categoria {category.id}: {str(e)}", exc_info=True)
                continue

    # 3. Sincronizar Produtos (Upsert)
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

    # 4. Sincronizar Pedidos (Transação aninhada individual)
    for order in payload.orders:
        try:
            with session.begin_nested():
                order_id = process_single_order(order, session)
            synced_orders.append(order_id)
        except Exception as e:
            logging.error(f"Erro ao sincronizar pedido {order.id}: {str(e)}", exc_info=True)
            continue

    # 5. Sincronizar Usuários (Upsert)
    if payload.users:
        for user in payload.users:
            try:
                with session.begin_nested():
                    db_user = session.get(User, user.id)
                    if db_user:
                        user_data = user.model_dump(exclude_unset=True, exclude={"passwordHash"})
                        for key, val in user_data.items():
                            setattr(db_user, key, val)
                        
                        # Verificar se a senha foi alterada no client
                        from app.core.security import verify_password, hash_password
                        password_changed = True
                        if user.passwordHash == db_user.passwordHash:
                            password_changed = False
                        elif verify_password(user.passwordHash, db_user.passwordHash):
                            password_changed = False
                            
                        if password_changed:
                            # Se o valor já for um hash bcrypt válido, salva direto. Se for texto plano, gera o hash.
                            if user.passwordHash.startswith("$2b$") or user.passwordHash.startswith("$2a$"):
                                db_user.passwordHash = user.passwordHash
                            else:
                                db_user.passwordHash = hash_password(user.passwordHash)
                        
                        session.add(db_user)
                    else:
                        from app.core.security import hash_password
                        # Senha que vem do client pela primeira vez: se não for hash bcrypt, gera o hash
                        if not (user.passwordHash.startswith("$2b$") or user.passwordHash.startswith("$2a$")):
                            user.passwordHash = hash_password(user.passwordHash)
                        session.add(user)
                synced_users.append(user.id)
            except Exception as e:
                logging.error(f"Erro ao sincronizar usuário {user.id}: {str(e)}", exc_info=True)
                continue

    # 6. Sincronizar Sessões de Caixa (Upsert)
    if payload.sessions:
        for caixa_session in payload.sessions:
            try:
                with session.begin_nested():
                    db_session = session.get(CaixaSession, caixa_session.id)
                    if db_session:
                        session_data = caixa_session.model_dump(exclude_unset=True)
                        for key, val in session_data.items():
                            setattr(db_session, key, val)
                        session.add(db_session)
                    else:
                        session.add(caixa_session)
                synced_sessions.append(caixa_session.id)
            except Exception as e:
                logging.error(f"Erro ao sincronizar caixa_session {caixa_session.id}: {str(e)}", exc_info=True)
                continue

    # 7. Sincronizar Incidentes (Upsert)
    if payload.incidents:
        for incident in payload.incidents:
            try:
                with session.begin_nested():
                    db_incident = session.get(Incident, incident.id)
                    if db_incident:
                        incident_data = incident.model_dump(exclude_unset=True)
                        for key, val in incident_data.items():
                            setattr(db_incident, key, val)
                        session.add(db_incident)
                    else:
                        session.add(incident)
                synced_incidents.append(incident.id)
            except Exception as e:
                logging.error(f"Erro ao sincronizar incidente {incident.id}: {str(e)}", exc_info=True)
                continue

    session.commit()

    return SyncResponse(
        synced_clients=synced_clients,
        synced_products=synced_products,
        synced_orders=synced_orders,
        synced_categories=synced_categories,
        synced_users=synced_users,
        synced_sessions=synced_sessions,
        synced_incidents=synced_incidents
    )
