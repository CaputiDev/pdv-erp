# Backend PDV ERP

## 🛠️ Tecnologias e Requisitos Necessários

Antes de iniciar, verifique se possui as seguintes ferramentas configuradas na sua máquina:

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🐳 Docker</h3>
      <hr>
      <ul>
        <li>Banco de dados PostgreSQL (container <code>pdv-erp-db</code>)</li>
        <li>Instanciação da API isolada (container <code>pdv-erp-server</code>)</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🐍 Python 3.10+</h3>
      <hr>
      <ul>
        <li>Necessário apenas para execução híbrida local</li>
        <li>Criação de ambiente virtual isolado (<code>venv</code>)</li>
        <li>Gerenciador de pacotes <code>pip</code> ativo</li>
      </ul>
    </td>
  </tr>
</table>

---

## 💻 Tecnologias Usadas

O backend foi desenvolvido utilizando as seguintes tecnologias:

- **Python 3.11**: Linguagem de programação robusta, de alta legibilidade e eficiência.
- **FastAPI**: Framework web moderno e veloz para construção de APIs assíncronas em Python.
- **SQLModel**: ORM híbrido que combina SQLAlchemy e Pydantic para validação e mapeamento de dados eficiente.
- **PostgreSQL**: Banco de dados relacional robusto e escalável.
- **Docker & Docker Compose**: Ferramentas para empacotamento e gerenciamento de infraestrutura em containers.
- **Uvicorn**: Servidor ASGI leve e de alta performance para hospedar a aplicação FastAPI.

---

## 🚀 Como executar tudo pelo Docker (Recomendado)

Para rodar todo o ambiente (Banco PostgreSQL + API FastAPI em Python) de forma integrada e sem necessidade de configurar nada localmente, execute o comando abaixo na pasta `server/`:

```bash
docker compose up --build -d
```

Este comando irá:

1. Provisionar o banco PostgreSQL no container `pdv-erp-db`.
2. Compilar e iniciar o servidor FastAPI no container `pdv-erp-server` exposto na porta `8000`.

A API estará rodando em **[http://127.0.0.1:8000](http://127.0.0.1:8000)** e a documentação Swagger em **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

---

<details>
<summary><b>Clique para expandir as instruções de execução híbrida</b></summary>

## 🛠️ Como Executar de Forma Híbrida (Banco no Docker + Python Local)

Se você preferir rodar apenas o banco no Docker e executar a API diretamente na sua máquina local:

### 1. Iniciar apenas o Banco de Dados

Execute para subir somente o container do PostgreSQL:

```bash
docker compose up db -d
```

### 2. Configurar o Ambiente Python

Na pasta `server/`, crie e ative um ambiente virtual:

#### Windows

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### Linux / macOS

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

</details>

---

## 📂 Estrutura de Rotas

- `GET /clientes` / `POST /clientes`: Consulta e cadastro/sincronização de clientes.
- `GET /produtos` / `POST /produtos`: Consulta e cadastro/sincronização de produtos.
- `GET /pedidos` / `POST /pedidos`: Histórico e fechamento de pedidos com baixa automática no estoque.
- `POST /sync`: Endpoint centralizado para processar em lote os dados gerados em modo offline no app mobile.

---

## 🧪 Testes Automatizados

O backend possui uma suíte completa de testes de integração automatizados para validar o fluxo de autenticação, permissões por cargo, ciclo de vida do caixa, incidentes e sincronização offline.

### 📋 O que é testado?

1. **Autenticação JWT**: Login de usuários e geração do token JWT.
2. **Senha Temporária**: Fluxo obrigatório de troca de senha no primeiro login.
3. **RBAC (Role-Based Access Control)**: Restrições de rotas com base no cargo (ex: apenas `admin` pode criar usuários).
4. **Ciclo de vida do Caixa (CaixaSession)**: Abertura, fechamento e validação de sessão ativa de caixa.
5. **Atas de Incidentes**: Registro eletrônico de incidentes e consultas de assinantes.
6. **Sincronização em Lote (`/sync`)**: Sincronização e mesclagem de todas as entidades (Clientes, Produtos, Categorias, Pedidos, Usuários, Sessões de Caixa e Incidentes) enviadas offline pelo app mobile.

### 🚀 Como executar os testes

Os testes são executados localmente utilizando o ambiente virtual (`venv`) da aplicação.

#### Executar a Suíte de Testes

Para rodar os testes garantindo que o diretório raiz está no caminho de importação (`PYTHONPATH`), execute:

```bash
python -m pytest tests/
```

Ou definindo a variável de ambiente `PYTHONPATH` diretamente:

**Windows (PowerShell):**
```powershell
$env:PYTHONPATH="."
pytest tests/
```

**Linux / macOS:**
```bash
PYTHONPATH=. pytest tests/
```

> [!NOTE]
> Os testes utilizam um banco de dados SQLite em memória (`sqlite:///:memory:`) configurado com `StaticPool` para isolamento total dos testes, garantindo que a execução dos testes não afete o seu banco de dados PostgreSQL local ou do Docker.
