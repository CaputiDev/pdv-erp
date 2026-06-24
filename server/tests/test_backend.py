import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.users.models import User
from app.core.security import hash_password

def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_admin_initialization_and_login(client: TestClient):
    # Fazer login com o admin padrão (deve criar se não existir)
    response = client.post("/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    assert data["isTempPassword"] is True

def test_admin_first_login_credential_change(client: TestClient):
    # 1. Login com admin padrão
    login_resp = client.post("/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Tentar mudar a senha mantendo o username 'admin' (deve falhar com 400 por segurança)
    fail_change = client.post("/auth/change-password", json={
        "newPassword": "admin_nova_senha",
        "newUsername": "admin"
    }, headers=headers)
    assert fail_change.status_code == 400
    assert "alterar o nome de usuário padrão" in fail_change.json()["detail"]

    # 3. Mudar a senha e o username com sucesso
    success_change = client.post("/auth/change-password", json={
        "newPassword": "admin_nova_senha",
        "newUsername": "superadmin"
    }, headers=headers)
    assert success_change.status_code == 200
    assert success_change.json()["username"] == "superadmin"

    # 4. Tentar logar com credenciais antigas (deve falhar com 401)
    old_login = client.post("/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert old_login.status_code == 401

    # 5. Logar com novas credenciais
    new_login = client.post("/auth/login", json={
        "username": "superadmin",
        "password": "admin_nova_senha"
    })
    assert new_login.status_code == 200
    new_data = new_login.json()
    assert new_data["role"] == "admin"
    assert new_data["isTempPassword"] is False

def test_user_creation_by_admin(client: TestClient):
    # 1. Login como admin para obter token
    # Usar superadmin pois mudamos a credencial no teste anterior se for o mesmo banco
    # Mas como cada teste recebe uma instância limpa (conftest cria novo banco para cada teste),
    # o admin padrão ainda é admin/admin123 no início de test_user_creation_by_admin.
    login_resp = client.post("/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Criar novo funcionário (caixa)
    create_resp = client.post("/usuarios", json={
        "name": "Maria Caixa",
        "username": "maria_caixa",
        "role": "caixa",
        "salary": 2500.00
    }, headers=headers)
    
    assert create_resp.status_code == 201
    user_data = create_resp.json()
    assert user_data["username"] == "maria_caixa"
    assert user_data["role"] == "caixa"
    assert "tempPassword" in user_data

    # 3. Listar funcionários
    list_resp = client.get("/usuarios", headers=headers)
    assert list_resp.status_code == 200
    users = list_resp.json()
    assert len(users) >= 2 # admin e maria_caixa

def test_change_temporary_password(client: TestClient):
    # 1. Login admin e cadastrar usuário temporário
    admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    create_resp = client.post("/usuarios", json={
        "name": "Vendedor 1",
        "username": "vendedor1",
        "role": "vendedor",
        "salary": 2000.00
    }, headers={"Authorization": f"Bearer {admin_token}"})
    
    temp_pass = create_resp.json()["tempPassword"]

    # 2. Logar com senha temporária
    user_login = client.post("/auth/login", json={
        "username": "vendedor1",
        "password": temp_pass
    })
    assert user_login.status_code == 200
    user_data = user_login.json()
    assert user_data["isTempPassword"] is True
    
    user_token = user_data["access_token"]
    headers = {"Authorization": f"Bearer {user_token}"}

    # 3. Alterar senha temporária
    change_resp = client.post("/auth/change-password", json={
        "newPassword": "vendedor_nova_senha"
    }, headers=headers)
    assert change_resp.status_code == 200

    # 4. Tentar logar com a nova senha
    new_login = client.post("/auth/login", json={
        "username": "vendedor1",
        "password": "vendedor_nova_senha"
    })
    assert new_login.status_code == 200
    assert new_login.json()["isTempPassword"] is False

def test_rbac_restrictions(client: TestClient):
    # 1. Criar e logar como vendedor
    admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    create_resp = client.post("/usuarios", json={
        "name": "Vendedor Restrito",
        "username": "vend_rest",
        "role": "vendedor",
        "salary": 1800.00
    }, headers={"Authorization": f"Bearer {admin_token}"})
    temp_pass = create_resp.json()["tempPassword"]

    # Ativar senha do vendedor
    user_login = client.post("/auth/login", json={"username": "vend_rest", "password": temp_pass})
    user_token = user_login.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    client.post("/auth/change-password", json={"newPassword": "vend_rest_pass"}, headers=user_headers)

    # Re-logar com senha definitiva
    final_login = client.post("/auth/login", json={"username": "vend_rest", "password": "vend_rest_pass"})
    user_token = final_login.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 2. Vendedor tenta cadastrar funcionário (deve falhar com 403)
    fail_create = client.post("/usuarios", json={
        "name": "Outro Caixa",
        "username": "outro_caixa",
        "role": "caixa",
        "salary": 2000.00
    }, headers=user_headers)
    assert fail_create.status_code == 403

def test_caixa_session_lifecycle(client: TestClient):
    # 1. Login admin (possui todas as funções)
    admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verificar que não há caixa ativo
    active_resp = client.get("/caixas/ativo", headers=headers)
    assert active_resp.status_code == 200
    assert active_resp.json() is None

    # 3. Abrir caixa
    open_resp = client.post("/caixas/abrir", json={"initialCash": 150.00}, headers=headers)
    assert open_resp.status_code == 200
    assert open_resp.json()["status"] == "open"
    assert open_resp.json()["initialCash"] == 150.00

    # 4. Tentar abrir novamente (deve falhar com 400)
    reopen_resp = client.post("/caixas/abrir", json={"initialCash": 100.00}, headers=headers)
    assert reopen_resp.status_code == 400

    # 5. Fechar caixa
    close_resp = client.post("/caixas/fechar", json={"finalCash": 150.00}, headers=headers)
    assert close_resp.status_code == 200
    assert close_resp.json()["status"] == "closed"
    assert close_resp.json()["finalCash"] == 150.00

def test_incident_creation_and_list(client: TestClient):
    # 1. Login admin
    admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Criar incidente
    inc_resp = client.post("/incidentes/", json={
        "employeeId": "user-12345",
        "employeeName": "João Silva",
        "description": "Atraso no início do expediente sem justificativa.",
        "witnessName": "Supervisor Pedro"
    }, headers=headers)
    
    assert inc_resp.status_code == 201
    inc_data = inc_resp.json()
    assert inc_data["employeeName"] == "João Silva"
    assert "documentRef" in inc_data
    assert len(inc_data["signedBy"]) == 2

    # 3. Listar incidentes
    list_resp = client.get("/incidentes/", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

def test_bulk_synchronization(client: TestClient):
    response = client.post("/sync", json={
        "clients": [
            {
                "id": "client-offline-1",
                "name": "Cliente Offline 1",
                "phone": "1199999999",
                "email": "offline1@test.com",
                "address": "Rua 1",
                "cpf": "12345678900",
                "creditLimit": 1000.0,
                "creditScore": 600
            }
        ],
        "products": [
            {
                "id": "product-offline-1",
                "name": "Produto Offline 1",
                "price": 49.90,
                "stock": 10,
                "barcode": "123456789",
                "criticalStock": 2,
                "retiradoNoEstoque": True,
                "shippingCost": 15.00
            }
        ],
        "orders": [
            {
                "id": "order-offline-1",
                "clientId": "client-offline-1",
                "clientName": "Cliente Offline 1",
                "items": [
                    {
                        "productId": "product-offline-1",
                        "productName": "Produto Offline 1",
                        "price": 49.90,
                        "quantity": 2
                    }
                ],
                "total": 114.80, # 2 * 49.90 + 15.00 (frete)
                "discount": 0.0,
                "shippingCost": 15.00,
                "status": "concluido",
                "salespersonId": "user-sales",
                "salespersonName": "Vendedor Teste",
                "date": "2026-06-24T12:00:00Z"
            }
        ],
        "categories": [
            {
                "id": "cat-1",
                "name": "Categoria Teste"
            }
        ],
        "users": [],
        "sessions": [],
        "incidents": []
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "client-offline-1" in data["synced_clients"]
    assert "product-offline-1" in data["synced_products"]
    assert "order-offline-1" in data["synced_orders"]
    assert "cat-1" in data["synced_categories"]

def test_admin_delete_user(client: TestClient):
    # 1. Login admin
    admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Criar funcionário
    create_resp = client.post("/usuarios", json={
        "name": "Maria Para Excluir",
        "username": "maria_excluir",
        "role": "caixa",
        "salary": 2200.00
    }, headers=admin_headers)
    maria_id = create_resp.json()["id"]

    # 3. Logar como a nova usuária (para obter token de não-admin)
    maria_temp_pass = create_resp.json()["tempPassword"]
    maria_login = client.post("/auth/login", json={"username": "maria_excluir", "password": maria_temp_pass})
    maria_token = maria_login.json()["access_token"]
    maria_headers = {"Authorization": f"Bearer {maria_token}"}

    # 4. Maria tenta excluir a si mesma (ou outro usuário) - deve falhar com 403 (RBAC)
    fail_delete_rbac = client.delete(f"/usuarios/{maria_id}", headers=maria_headers)
    assert fail_delete_rbac.status_code == 403

    # 5. Admin tenta se auto-excluir (deve falhar com 400)
    # Primeiro obter ID do admin logado buscando na lista de usuários
    users_list = client.get("/usuarios", headers=admin_headers).json()
    admin_id = next(u["id"] for u in users_list if u["username"] == "admin")
    
    fail_delete_self = client.delete(f"/usuarios/{admin_id}", headers=admin_headers)
    assert fail_delete_self.status_code == 400
    assert "não pode excluir a si mesmo" in fail_delete_self.json()["detail"]

    # 6. Admin exclui Maria com sucesso (deve retornar 204)
    success_delete = client.delete(f"/usuarios/{maria_id}", headers=admin_headers)
    assert success_delete.status_code == 204

    # 7. Verificar se Maria realmente foi excluída da lista de usuários
    users_list_after = client.get("/usuarios", headers=admin_headers).json()
    assert not any(u["id"] == maria_id for u in users_list_after)
