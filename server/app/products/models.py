from typing import Optional
from sqlmodel import Field, SQLModel

class Product(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    price: float
    stock: int
    barcode: Optional[str] = None
    criticalStock: int = Field(default=0)
