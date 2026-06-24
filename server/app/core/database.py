import os
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pdv_db")

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    # Garantir que o SQLModel conheça todos os modelos antes de chamar create_all
    from app.clients.models import Client
    from app.products.models import Product
    from app.orders.models import Order, OrderItem
    
    SQLModel.metadata.create_all(engine)
    
    # Garantir que o banco inicie sem dados de teste ("string") residuais
    from sqlmodel import select
    
    with Session(engine) as session:
        try:
            # 1. Remover itens de pedido associados a IDs "string"
            db_items = session.exec(
                select(OrderItem).where(
                    (OrderItem.orderId == "string") | (OrderItem.productId == "string")
                )
            ).all()
            for item in db_items:
                session.delete(item)
                
            # 2. Remover pedidos de teste "string"
            db_orders = session.exec(
                select(Order).where(
                    (Order.id == "string") | (Order.clientId == "string")
                )
            ).all()
            for order in db_orders:
                session.delete(order)
                
            # 3. Remover clientes de teste "string"
            db_clients = session.exec(
                select(Client).where(Client.id == "string")
            ).all()
            for client in db_clients:
                session.delete(client)
                
            # 4. Remover produtos de teste "string"
            db_products = session.exec(
                select(Product).where(Product.id == "string")
            ).all()
            for product in db_products:
                session.delete(product)
                
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Erro ao limpar dados de teste residuais no banco: {e}")

def get_session():
    with Session(engine) as session:
        yield session
