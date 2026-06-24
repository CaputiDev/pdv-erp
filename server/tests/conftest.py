import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import get_session

# Importar todos os modelos para registrar o metadata do SQLModel antes do create_all
from app.clients.models import Client
from app.products.models import Product, Category
from app.orders.models import Order, OrderItem
from app.users.models import User
from app.sessions.models import CaixaSession
from app.incidents.models import Incident

# Banco de dados SQLite em memória para os testes com StaticPool para compartilhamento de conexão
sqlite_url = "sqlite://"
engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

@pytest.fixture(name="session")
def session_fixture():
    # Cria as tabelas antes de cada teste
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    # Limpa as tabelas após cada teste
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def override_get_session():
        yield session
    
    # Sobrescreve a dependência de obter sessão do banco
    app.dependency_overrides[get_session] = override_get_session
    yield TestClient(app)
    # Limpa as dependências após os testes finalizarem
    app.dependency_overrides.clear()
