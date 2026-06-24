from typing import List, Optional
from sqlmodel import Field, SQLModel, Column, JSON

class CaixaSession(SQLModel, table=True):
    id: str = Field(primary_key=True)
    openedBy: str
    openedAt: str
    closedAt: Optional[str] = None
    initialCash: float
    finalCash: Optional[float] = None
    status: str # "open" | "closed"
    
    # Armazena transações como JSON no Postgres
    transactions: List[dict] = Field(default=[], sa_column=Column(JSON))
