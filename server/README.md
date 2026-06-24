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
