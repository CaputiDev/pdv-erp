from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.sessions.models import CaixaSession
from app.users.models import User
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/caixas", tags=["Sessões de Caixa"])

class OpenCaixaRequest(BaseModel):
    initialCash: float

class CloseCaixaRequest(BaseModel):
    finalCash: float

class CaixaSessionResponse(BaseModel):
    id: str
    openedBy: str
    openedAt: str
    closedAt: Optional[str]
    initialCash: float
    finalCash: Optional[float]
    status: str
    transactions: List[dict]

    class Config:
        from_attributes = True

@router.post("/abrir", response_model=CaixaSessionResponse)
def abrir_caixa(
    payload: OpenCaixaRequest,
    current_user: User = Depends(require_roles(["admin", "caixa"])),
    session: Session = Depends(get_session)
):
    # Verificar se já existe caixa aberto para o operador
    active = session.exec(
        select(CaixaSession)
        .where(CaixaSession.openedBy == current_user.username)
        .where(CaixaSession.status == "open")
    ).first()

    if active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já possui uma sessão de caixa aberta."
        )

    new_session = CaixaSession(
        id=f"session-{int(datetime.utcnow().timestamp() * 1000)}",
        openedBy=current_user.username,
        openedAt=datetime.utcnow().isoformat(),
        initialCash=payload.initialCash,
        status="open",
        transactions=[]
    )

    session.add(new_session)
    session.commit()
    session.refresh(new_session)
    return new_session

@router.post("/fechar", response_model=CaixaSessionResponse)
def fechar_caixa(
    payload: CloseCaixaRequest,
    current_user: User = Depends(require_roles(["admin", "caixa"])),
    session: Session = Depends(get_session)
):
    # Buscar caixa ativo
    active = session.exec(
        select(CaixaSession)
        .where(CaixaSession.openedBy == current_user.username)
        .where(CaixaSession.status == "open")
    ).first()

    if not active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma sessão de caixa aberta encontrada para este operador."
        )

    active.closedAt = datetime.utcnow().isoformat()
    active.finalCash = payload.finalCash
    active.status = "closed"

    session.add(active)
    session.commit()
    session.refresh(active)
    return active

@router.get("/ativo", response_model=Optional[CaixaSessionResponse])
def obter_caixa_ativo(
    current_user: User = Depends(require_roles(["admin", "caixa"])),
    session: Session = Depends(get_session)
):
    active = session.exec(
        select(CaixaSession)
        .where(CaixaSession.openedBy == current_user.username)
        .where(CaixaSession.status == "open")
    ).first()
    return active
