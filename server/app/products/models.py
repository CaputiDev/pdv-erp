from typing import Optional
from sqlmodel import Field, SQLModel

class Category(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str

class Product(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    price: float
    stock: int
    barcode: Optional[str] = None
    criticalStock: int = Field(default=0)
    retiradoNoEstoque: bool = Field(default=False)
    shippingCost: float = Field(default=0.0)
    categoryId: Optional[str] = Field(default=None, foreign_key="category.id")
