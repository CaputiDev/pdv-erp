# Guia de Primeiro Acesso (Configuração de Segurança)

Este guia explica como realizar o primeiro acesso ao sistema **PDV ERP** e configurar a conta do administrador para garantir a segurança dos dados comerciais da aplicação.

---

## 🔒 Credenciais Padrão Iniciais

Ao inicializar o banco de dados e o aplicativo pela primeira vez, uma conta de administrador principal é gerada automaticamente com as seguintes credenciais padrão:

*   **Usuário:** `admin`
*   **Senha:** `admin123`

---

## 🚀 Fluxo de Primeiro Acesso

Por questões de segurança, **essas credenciais são de uso único e temporário**. O sistema exige a alteração completa do usuário e da senha logo no primeiro login.

### Passo a Passo

1.  **Inicialize os Serviços**: Certifique-se de que o backend e o frontend estejam rodando.

2.  **Faça o Login Inicial**: Abra o aplicativo (mobile ou web) e digite as credenciais:

    *   Usuário: `admin`
    *   Senha: `admin123`

3.  **Redirecionamento Automático**: O sistema detectará o uso de credenciais padrão e redirecionará você imediatamente para a página

    **Redefinir Credenciais**, bloqueando o acesso às telas do sistema até que a alteração seja feita.

4.  **Altere os Dados**:

    *   **Novo Nome de Usuário (Admin):** Defina um novo usuário personalizado para o administrador (ex: `gerente_joao`, `admin_empresa`). *Por segurança, o sistema não aceita que o usuário continue sendo `"admin"`.*
    *   **Nova Senha:** Cadastre uma senha segura pessoal (mínimo de 6 caracteres).
    *   **Confirmar Nova Senha:** Digite novamente a nova senha para confirmação.

5.  **Salve os Dados**: Clique em **Salvar Nova Senha**.

6.  **Sincronização Automática**: Suas novas credenciais serão salvas localmente e enviadas automaticamente para o backend na próxima sincronização, onde a nova senha será armazenada de forma criptografada.

A partir desse momento, as credenciais `admin` / `admin123` são permanentemente excluídas e você poderá acessar o sistema utilizando seu novo usuário e senha.
