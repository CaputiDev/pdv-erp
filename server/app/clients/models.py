from typing import Optional
from sqlmodel import Field, SQLModel

class Client(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    cpf: Optional[str] = None
