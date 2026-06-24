from fastapi import HTTPException, status
from sqlmodel import Session
from app.clients.models import Client
from app.products.models import Product
from app.orders.models import Order, OrderItem
from app.orders.schemas import OrderInput

def process_single_order(order_input: OrderInput, session: Session) -> str:
    """
    Processa um único pedido e atualiza o estoque do produto.
    Retorna o ID do pedido se processado com sucesso.
    """
    # 1. Idempotência: verificar se o pedido já existe
    db_order = session.get(Order, order_input.id)
    if db_order:
        if db_order.status == "pendente" and order_input.status == "concluido":
            # Atualizar status do pedido
            db_order.status = "concluido"
            session.add(db_order)
            # Atualizar estoque dos produtos
            for item in order_input.items:
                db_product = session.get(Product, item.productId)
                if not db_product:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Produto com ID {item.productId} não encontrado"
                    )
                if db_product.stock < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Estoque insuficiente para o produto '{db_product.name}'. Disponível: {db_product.stock}, Solicitado: {item.quantity}"
                    )
                db_product.stock -= item.quantity
                session.add(db_product)
            session.flush()
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
