# Backend PDV ERP

## 🛠️ Tecnologias e Requisitos Necessários

Antes de iniciar, verifique se possui as seguintes ferramentas configuradas na sua máquina:

1. **Docker**: Necessário para rodar o banco de dados PostgreSQL e os containers da API de forma isolada.
2. **Python 3.10+** (Apenas se optar por rodar a API localmente na sua máquina física fora do Docker):
   - Ambiente virtual configurado (`venv`).
   - Gerenciador de pacotes `pip` atualizado.

---

## 🚀 Como Executar pelo Docker (Tudo-em-um)

Para rodar todo o ambiente (Banco PostgreSQL + API FastAPI em Python) de forma integrada e sem necessidade de configurar nada localmente, execute o comando abaixo na pasta `server/`:

```bash
docker compose up --build -d
```

Este comando irá:
1. Provisionar o banco PostgreSQL no container `pdv-erp-db`.
2. Compilar e iniciar o servidor FastAPI no container `pdv-erp-server` exposto na porta `8000`.

A API estará rodando em **[http://127.0.0.1:8000](http://127.0.0.1:8000)** e a documentação Swagger em **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

---

## 🛠️ Como Executar de Forma Híbrida (Banco no Docker + Python Local)

Se você preferir rodar apenas o banco no Docker e executar a API diretamente na sua máquina local:

### 1. Iniciar apenas o Banco de Dados

Execute para subir somente o container do PostgreSQL:

```bash
docker compose up db -d
```

### 2. Configurar o Ambiente Python

Na pasta `server/`, crie e ative um ambiente virtual:

#### No Windows:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### No Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 3. Instalar Dependências

Com o ambiente virtual ativado, instale as dependências:

```bash
pip install -r requirements.txt
```

---

### 4. Rodar o Servidor FastAPI

Execute o servidor localmente em modo de desenvolvimento (com recarregamento automático):

```bash
uvicorn app.main:app --reload
```

O servidor estará rodando em `http://127.0.0.1:8000`.

---

### 5. Documentação Interativa (Swagger UI)

Após iniciar o servidor, você pode acessar a interface do Swagger para interagir e testar as rotas da API em:

👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 📂 Estrutura de Rotas

- `GET /clientes` / `POST /clientes`: Consulta e cadastro/sincronização de clientes.
- `GET /produtos` / `POST /produtos`: Consulta e cadastro/sincronização de produtos.
- `GET /pedidos` / `POST /pedidos`: Histórico e fechamento de pedidos com baixa automática no estoque.
- `POST /sync`: Endpoint centralizado para processar em lote os dados gerados em modo offline no app mobile.
