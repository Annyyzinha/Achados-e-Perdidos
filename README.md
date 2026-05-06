# 🔍 Audiovisual | Sistema de Achados e Perdidos

> Repositório destinado ao desenvolvimento do Trabalho de Conclusão de Curso (TCC 1) do curso de Engenharia de Software da Universidade Tecnológica Federal do Paraná (UTFPR) - Campus Cornélio Procópio.

## 📋 Descrição do Projeto

Este projeto consiste em um sistema web para a gestão centralizada de itens achados e perdidos no campus da UTFPR. A plataforma permite que a comunidade acadêmica registre objetos encontrados e reivindique pertences perdidos, com um fluxo de validação e custódia gerenciado pelo Setor de Audiovisual.

## ✨ Funcionalidades Principais (Requisitos)

- **Autenticação Institucional:** Acesso restrito via Google OAuth 2.0 para domínios `@utfpr.edu.br` e `@alunos.utfpr.edu.br`.
- **Feed Principal:** Grade de exibição de itens validados com filtros por categoria e data.
- **Cadastro de Itens:** Registro de novos achados com descrição, local, data e upload de fotografia.
- **Painel Administrativo:** Gestão de status dos itens (Pendente, Em Custódia, Devolvido) e geração de relatórios para o Setor de Audiovisual.
- **Perfil do Usuário:** Consulta ao histórico de itens reportados e seus respectivos status.

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** JavaScript (ES6+)
- **Frontend:** Next.js e React.js
- **Backend:** Node.js
- **Banco de Dados:** MongoDB (NoSQL)
- **Estilização:** Bootstrap 5 e CSS Modules

## 🚀 Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/Annyyzinha/Achados-e-Perdidos.git](https://github.com/Annyyzinha/Achados-e-Perdidos.git)

2. **Instale as dependências:**
    ```bash
    npm install

3. **Configure as variáveis de ambiente:**
    ```bash
    Crie um arquivo .env na raiz seguindo o modelo das credenciais do MongoDB e Google OAuth.

4. **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev

---
**Acadêmica:** Anny Vitoria Costa (RA: 2495449)

**Orientadora:** Prof. Monique Emidio de Oliveira