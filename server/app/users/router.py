import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.users.models import User
from app.core.security import (
    hash_password, verify_password, create_access_token, 
    get_current_user, require_roles
)

router = APIRouter(tags=["Autenticação e Usuários"])

# Schemas de Entrada e Saída
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    isTempPassword: bool
    role: str
    name: str

class ChangePasswordRequest(BaseModel):
    newPassword: str
    newUsername: Optional[str] = None

class CreateUserRequest(BaseModel):
    name: str
    username: str
    role: str
    salary: float

class CreateUserResponse(BaseModel):
    id: str
    name: str
    username: str
    role: str
    tempPassword: str

class PromoteRequest(BaseModel):
    newRole: str

class PraiseRequest(BaseModel):
    tag: str

class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    role: str
    salary: float
    tags: List[dict]
    promotions: List[dict]

    class Config:
        from_attributes = True

# --- ROTAS ---

@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    # Buscar usuário (case-insensitive)
    user = session.exec(select(User).where(User.username == payload.username.lower())).first()
    
    # Se for o primeiro acesso e o banco estiver vazio, criar o admin padrão!
    if not user and payload.username.lower() == "admin":
        from app.core.database import engine
        # Verificar se realmente não há nenhum usuário cadastrado no banco
        all_users = session.exec(select(User)).all()
        if len(all_users) == 0:
            admin_user = User(
                id="admin-id-1",
                name="Administrador Principal",
                username="admin",
                role="admin",
                passwordHash=hash_password("admin123"),
                isTempPassword=True,
                salary=10000.0,
                tags=[],
                promotions=[]
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)
            user = admin_user

    if not user or not verify_password(payload.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )

    # Gerar token JWT
    token = create_access_token(data={"sub": user.username})

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        isTempPassword=user.isTempPassword,
        role=user.role,
        name=user.name
    )

@router.post("/auth/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if len(payload.newPassword) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 6 caracteres."
        )

    # Validar e atualizar nome de usuário se fornecido
    if payload.newUsername:
        normalized_username = payload.newUsername.strip().lower()
        if not normalized_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O nome de usuário não pode ser vazio."
            )
        
        # Se for admin, exigir que mude o usuário padrão "admin" por segurança
        if current_user.role == "admin" and normalized_username == "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você deve alterar o nome de usuário padrão 'admin' por segurança."
            )

        # Verificar se está em uso por outro usuário
        existing = session.exec(
            select(User).where(User.username == normalized_username, User.id != current_user.id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome de usuário já está em uso por outro funcionário."
            )
        
        current_user.username = normalized_username

    current_user.passwordHash = hash_password(payload.newPassword)
    current_user.isTempPassword = False
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {
        "message": "Credenciais atualizadas com sucesso!",
        "username": current_user.username
    }

@router.post("/usuarios", response_model=CreateUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: CreateUserRequest,
    current_user: User = Depends(require_roles(["admin", "gestor_rh"])),
    session: Session = Depends(get_session)
):
    # Validar username duplicado
    existing = session.exec(select(User).where(User.username == payload.username.lower())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já cadastrado!"
        )

    # Gerar senha temporária de 6 dígitos numéricos
    temp_pass = str(random.randint(100000, 999999))

    new_user = User(
        id=f"user-{int(datetime.utcnow().timestamp() * 1000)}",
        name=payload.name,
        username=payload.username.lower(),
        role=payload.role,
        passwordHash=hash_password(temp_pass),
        isTempPassword=True,
        salary=payload.salary,
        tags=[],
        promotions=[]
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return CreateUserResponse(
        id=new_user.id,
        name=new_user.name,
        username=new_user.username,
        role=new_user.role,
        tempPassword=temp_pass
    )

@router.get("/usuarios", response_model=List[UserResponse])
def list_users(
    current_user: User = Depends(require_roles(["admin", "gestor_geral", "gestor_rh"])),
    session: Session = Depends(get_session)
):
    users = session.exec(select(User)).all()
    return users

@router.put("/usuarios/{id}/promover", response_model=UserResponse)
def promote(
    id: str,
    payload: PromoteRequest,
    current_user: User = Depends(require_roles(["admin", "gestor_rh"])),
    session: Session = Depends(get_session)
):
    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")

    old_role = user.role
    user.role = payload.newRole
    
    # Adicionar ao histórico de promoções
    promo_entry = {
        "oldRole": old_role,
        "newRole": payload.newRole,
        "date": datetime.utcnow().isoformat()
    }
    # No SQLModel, para mutar JSON localmente em memória precisamos forçar flag ou criar nova lista
    user.promotions = list(user.promotions) + [promo_entry]
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/usuarios/{id}/elogiar", response_model=UserResponse)
def praise(
    id: str,
    payload: PraiseRequest,
    current_user: User = Depends(require_roles(["admin", "gestor_rh"])),
    session: Session = Depends(get_session)
):
    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")

    current_month = datetime.utcnow().strftime("%Y-%m")
    
    # Validar regra: Limite de 1 "Funcionário do Mês" por mês por usuário
    if payload.tag == "Funcionário do Mês":
        for t in user.tags:
            if t.get("tag") == "Funcionário do Mês" and t.get("date", "").startswith(current_month):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Este funcionário já recebeu o prêmio 'Funcionário do Mês' neste período."
                )

    praise_entry = {
        "tag": payload.tag,
        "date": datetime.utcnow().isoformat()
    }
    user.tags = list(user.tags) + [praise_entry]

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete("/usuarios/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    id: str,
    current_user: User = Depends(require_roles(["admin"])),
    session: Session = Depends(get_session)
):
    user = session.get(User, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado"
        )
    
    # Impedir que o administrador exclua a si mesmo
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O administrador não pode excluir a si mesmo."
        )
        
    session.delete(user)
    session.commit()
    return None
