from typing import List
from sqlmodel import Field, SQLModel, Column, JSON

class Incident(SQLModel, table=True):
    id: str = Field(primary_key=True)
    employeeId: str
    employeeName: str
    description: str
    date: str
    documentRef: str
    
    # Armazena assinaturas (Array de nomes) em JSON
    signedBy: List[str] = Field(default=[], sa_column=Column(JSON))
