from typing import List
from pydantic import BaseModel
from app.clients.models import Client
from app.products.models import Product

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
