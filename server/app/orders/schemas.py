from typing import List, Optional
from pydantic import BaseModel
from app.clients.models import Client
from app.products.models import Product, Category
from app.users.models import User
from app.sessions.models import CaixaSession
from app.incidents.models import Incident

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
    discount: float = 0.0
    shippingCost: float = 0.0
    status: str
    salespersonId: str = ""
    salespersonName: str = ""
    date: str

class OrderOutput(BaseModel):
    id: str
    clientId: str
    clientName: str
    total: float
    discount: float
    shippingCost: float
    status: str
    salespersonId: str
    salespersonName: str
    date: str
    items: List[CartItemInput]

    class Config:
        from_attributes = True

class SyncPayload(BaseModel):
    clients: List[Client]
    products: List[Product]
    orders: List[OrderInput]
    categories: Optional[List[Category]] = None
    users: Optional[List[User]] = None
    sessions: Optional[List[CaixaSession]] = None
    incidents: Optional[List[Incident]] = None

class SyncResponse(BaseModel):
    synced_clients: List[str]
    synced_products: List[str]
    synced_orders: List[str]
    synced_categories: List[str] = []
    synced_users: List[str] = []
    synced_sessions: List[str] = []
    synced_incidents: List[str] = []
