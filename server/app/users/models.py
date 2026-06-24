from typing import List, Optional
from sqlmodel import Field, SQLModel, Column, JSON

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    username: str = Field(index=True, unique=True)
    role: str # "admin" | "caixa" | "vendedor" | "financeiro" | "estoque" | "gestor_geral" | "gestor_rh"
    passwordHash: str
    isTempPassword: bool = Field(default=True)
    salary: float = Field(default=0.0)
    
    # Armazena histórico em formato JSON no PostgreSQL
    tags: List[dict] = Field(default=[], sa_column=Column(JSON))
    promotions: List[dict] = Field(default=[], sa_column=Column(JSON))
