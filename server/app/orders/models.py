from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class Order(SQLModel, table=True):
    id: str = Field(primary_key=True)
    clientId: str = Field(foreign_key="client.id")
    clientName: str
    total: float
    status: str  # "pendente" | "concluido"
    date: str

    # Relationship back-reference
    items: List["OrderItem"] = Relationship(back_populates="order", cascade_delete=True)

class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    orderId: str = Field(foreign_key="order.id", index=True)
    productId: str = Field(foreign_key="product.id")
    productName: str
    price: float
    quantity: int

    # Relationship link to parent order
    order: Optional[Order] = Relationship(back_populates="items")
