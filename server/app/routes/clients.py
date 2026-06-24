from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from sqlalchemy.exc import IntegrityError
from app.database import get_session
from app.models import Client

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.get("/", response_model=List[Client])
def read_clients(session: Session = Depends(get_session)):
    clients = session.exec(select(Client)).all()
    return clients

@router.post("/", response_model=Client)
def create_or_update_client(client: Client, session: Session = Depends(get_session)):
    db_client = session.get(Client, client.id)
    if db_client:
        # Update client
        client_data = client.model_dump(exclude_unset=True)
        for key, value in client_data.items():
            setattr(db_client, key, value)
        session.add(db_client)
        session.commit()
        session.refresh(db_client)
        return db_client
    else:
        # Create client
        session.add(client)
        session.commit()
        session.refresh(client)
        return client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: str, session: Session = Depends(get_session)):
    db_client = session.get(Client, client_id)
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    try:
        session.delete(db_client)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir o cliente pois ele possui pedidos associados."
        )
    return

