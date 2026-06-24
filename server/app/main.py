from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.clients.router import router as clients_router
from app.products.router import router as products_router
from app.orders.router import router as orders_router
from app.users.router import router as users_router
from app.sessions.router import router as sessions_router
from app.incidents.router import router as incidents_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa o banco de dados e cria tabelas se não existirem
    init_db()
    yield

app = FastAPI(
    title="PDV ERP API Backend",
    description="API simples e robusta para sincronização offline-first do PDV ERP",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração de CORS para permitir requisições de dispositivos móveis
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
app.include_router(users_router)
app.include_router(sessions_router)
app.include_router(incidents_router)
app.include_router(clients_router)
app.include_router(products_router)
app.include_router(orders_router)

@app.get("/", tags=["Geral"])
def root():
    return {
        "status": "online",
        "message": "PDV ERP API está funcionando!",
        "docs": "/docs"
    }
