from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.incidents.models import Incident
from app.users.models import User
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/incidentes", tags=["Atas e Ocorrências"])

class CreateIncidentRequest(BaseModel):
    employeeId: str
    employeeName: str
    description: str
    witnessName: str

class IncidentResponse(BaseModel):
    id: str
    employeeId: str
    employeeName: str
    description: str
    date: str
    documentRef: str
    signedBy: List[str]

    class Config:
        from_attributes = True

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def criar_incidente(
    payload: CreateIncidentRequest,
    current_user: User = Depends(require_roles(["admin", "gestor_rh", "gestor_geral"])),
    session: Session = Depends(get_session)
):
    timestamp_ms = int(datetime.utcnow().timestamp() * 1000)
    
    new_incident = Incident(
        id=f"incident-{timestamp_ms}",
        employeeId=payload.employeeId,
        employeeName=payload.employeeName,
        description=payload.description,
        date=datetime.utcnow().isoformat(),
        documentRef=f"ATA-{timestamp_ms}",
        signedBy=[current_user.name, payload.witnessName]
    )

    session.add(new_incident)
    session.commit()
    session.refresh(new_incident)
    return new_incident

@router.get("/", response_model=List[IncidentResponse])
def listar_incidentes(
    current_user: User = Depends(require_roles(["admin", "gestor_rh", "gestor_geral"])),
    session: Session = Depends(get_session)
):
    incidents = session.exec(select(Incident).order_by(Incident.date.desc())).all()
    return incidents
