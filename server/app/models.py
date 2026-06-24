from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel

# ----------------- Database Models -----------------

class Client(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    cpf: Optional[str] = None

class Product(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    price: float
    stock: int
    barcode: Optional[str] = None
    criticalStock: int = Field(default=0)

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


# ----------------- Input / Output Schemas (DTOs) -----------------

class CartItemInput(BaseModel):
    productId: str
    productName: str
    price: float
    quantity: int

class OrderInput(BaseModel):
    id: str
    clientId: str
    clientName: str
    items: List[CartItemInput]
    total: float
    status: str
    date: str

class OrderOutput(BaseModel):
    id: str
    clientId: str
    clientName: str
    total: float
    status: str
    date: str
    items: List[CartItemInput]

    class Config:
        from_attributes = True


class SyncPayload(BaseModel):
    clients: List[Client]
    products: List[Product]
    orders: List[OrderInput]


class SyncResponse(BaseModel):
    synced_clients: List[str]
    synced_products: List[str]
    synced_orders: List[str]
