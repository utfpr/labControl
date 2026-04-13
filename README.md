# Project: LabControl — Evolução de Tecnologia

Este repositório contém a reengenharia e atualização de um sistema legado, adotando uma arquitetura web moderna e uma metodologia de desenvolvimento experimental baseada integralmente em Inteligência Artificial.

## 🤖 Filosofia de Desenvolvimento: "AI-Only Implementation"

Este projeto segue uma diretriz rigorosa de desenvolvimento assistido por modelos de linguagem de larga escala (LLM). A governança do código baseia-se nos seguintes pilares:

1. **Desenvolvimento 100% via LLM:** Todo o código, configuração de ambiente, scripts de automação e documentação técnica são gerados por instruções de IA.
2. **Restrição de Intervenção Humana:** A interação humana é **estritamente limitada** ao papel de "Prompt Engineer" e "Integrador".
   * Não há escrita manual de lógica de programação por parte de humanos.
   * O papel humano consiste em fornecer contexto, requisitos e aplicar as respostas obtidas dos questionamentos feitos às LLMs.
     
3. **Rastreabilidade de Decisões:** As escolhas arquiteturais e correções de bugs são submetidas à validação lógica da IA antes da implementação no repositório.

## 🏗️ Estrutura do Monorepo

O sistema está organizado para suportar múltiplos pacotes e serviços de forma centralizada:

```text
/
├── api/     # Backend, API, Regras de Negócio e Persistência de Dados
├── web/     # Interface de Usuário e Experiência do Cliente
└── docs/    # Histórico de prompts e documentação técnica
```

### Detalhamento das Camadas:

* **`api/`**: Responsável por toda a lógica de servidor, autenticação, integração com banco de dados e exposição de endpoints. Arquitetura modular baseada no framework NestJS.
* **`web/`**: Contém a aplicação cliente desenvolvida em Next.js. O gerenciamento de estado, rotas e componentes visuais (Tailwind CSS) são orientados às instruções geradas pela IA para uma UI/UX responsiva e moderna.

## 🚀 Fluxo de Trabalho

O ciclo de vida de cada funcionalidade segue este fluxo:

1. **Definição de Contexto:** O humano descreve o estado atual e o objetivo desejado.
2. **Prompting:** Questionamento direcionado à LLM para obtenção da solução.
3. **Aplicação Direta:** O código gerado é inserido no monorepo sem alterações manuais de lógica.
4. **Feedback Loop:** Em caso de erros, os logs são devolvidos à IA para diagnóstico e nova geração de código.

---

## 🛠️ Tecnologias Utilizadas

### Backend (/api)
- **Node.js** (v20+)
- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Autenticação JWT & Bcrypt**
- **Swagger** (Documentação da API)

### Frontend (/web)
- **React & Next.js**
- **Tailwind CSS**
- **Lucide Icons**

### Infraestrutura & Ferramentas
- **Docker & Docker Compose**
- **Yarn Workspaces**

## 📦 Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (Recomendado v20 LTS)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e Docker Compose

## 🚀 Como Executar o Projeto

**1. Clone o repositório e acesse a pasta da API:**
```bash
git clone https://github.com/utfpr/labControl.git
```

**2. Instale as dependências locais do Backend:**
```bash
cd labControl/api
yarn install
```

**3. Instale as dependências locais do Frontend:**
```bash
cd labControl/web
yarn install
```

**4. Suba os servidores (api e web) via Docker:**
O comando abaixo irá baixar as imagens, compilar a aplicação e iniciar o Banco de Dados, o pgAdmin e a API em background.
```bash
yarn services:api
```
*(Nota: Este script executa `docker compose -f docker-compose.yml up -d`)*

Abra outro terminal para o Frontend:
```bash
yarn services:web
```

## 📍 Acessos Locais

Com os containers rodando, os seguintes serviços estarão disponíveis:

- **Frontend (Painel Web):** [http://localhost:3001](http://localhost:3001) (A porta pode variar dependendo da configuração local do Next.js)
- **Backend (API):** [http://localhost:3000](http://localhost:3000)
- **Swagger (Documentação e Testes):** [http://localhost:3000/docs](http://localhost:3000/docs)
- **pgAdmin (Gerenciamento do BD):** [http://localhost:5050](http://localhost:5050)
  - **Login:** `admin@admin.com`
  - **Senha:** `admin`

## 🏗️ Módulos Implementados

Até o momento, o sistema contempla os seguintes módulos, fluxos e regras de negócio:
- **Usuários** (Relacionados a Cursos)
- **Cursos** - **Locais** (Laboratórios - Relacionados a Cursos e Supervisores)
- **Equipamentos** (Relacionados a Cursos e Locais)
- **Disciplinas** (Relacionadas a Usuários responsáveis)
- **Aulas** (Relacionadas a Disciplinas, Locais e Professores)

- **Autenticação e Segurança:** Login via JWT, hash de senhas e proteção de rotas por perfis de acesso (ALUNO, SUPERVISOR, ADMIN).
- **Gestão de Usuários:**
  - Fluxo de Auto-registro para novos alunos com envio de Comprovante de Matrícula (Upload de PDF).
  - Painel de Gestão (Admin/Supervisor) dividido em abas: Usuários Pendentes (Aguardando Aprovação), Ativos e Bloqueados.
  - Visualização inline de documentos PDF e modais dinâmicos para alteração de status.
- **Gestão Cadastral (CRUDs):**
  - Cursos: Criação, edição e exclusão. Relacionamento direto com a base de usuários.
  - Locais (Laboratórios): Gestão de espaços físicos. Relacionados a cursos e supervisores.
  - Equipamentos: Controle de inventário, vinculados a Cursos e Locais.
  - Módulos Planejados: Disciplinas, Aulas e Reservas de Equipamentos/Laboratórios.

## 🛑 Comandos Úteis

Acompanhar logs do Backend:
```bash
yarn services:logs
```

Para parar os containers sem perder os dados do banco:
```bash
yarn services:down
```

Para parar e **destruir** o banco de dados (zerar o sistema):
```bash
yarn services:clean
```
