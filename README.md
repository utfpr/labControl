# Project: LabControl — Evolução de Tecnologia

Este repositório contém a reengenharia e atualização de um sistema legado, adotando uma arquitetura de web e uma metodologia de desenvolvimento experimental baseada integralmente em IA.

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
├── api/           # Backend, API, Regras de Negócio e Persistência de Dados
├── frontend/      # Interface de Usuário e Experiência do Cliente
└── docs/          # Histórico de prompts e documentação técnica

```

### Detalhamento das Camadas:

* **`api/`**: Responsável por toda a lógica de servidor, integração com banco de dados e exposição de endpoints. Seguindo a premissa do projeto, toda a arquitetura (REST, GraphQL, ou Microservices) será definida via instruções de IA.
* **`web/`**: Contém a aplicação cliente. A escolha de frameworks, componentes e gerenciamento de estado será estritamente baseada nos questionamentos e respostas obtidos durante o desenvolvimento.

## 🚀 Fluxo de Trabalho

O ciclo de vida de cada funcionalidade segue este fluxo:

1. **Definição de Contexto:** O humano descreve o estado atual e o objetivo desejado.
2. **Prompting:** Questionamento direcionado à LLM para obtenção da solução.
3. **Aplicação Direta:** O código gerado é inserido no monorepo sem alterações manuais de lógica.
4. **Feedback Loop:** Em caso de erros, os logs são devolvidos à IA para diagnóstico e nova geração de código.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** (v20+)
- **NestJS** (Framework backend)
- **TypeORM** (ORM para modelagem relacional)
- **PostgreSQL** (Banco de Dados)
- **Docker & Docker Compose** (Infraestrutura)
- **Swagger** (Documentação da API)

## 📦 Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (Recomendado v20 LTS)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e Docker Compose

## 🚀 Como Executar o Projeto

**1. Clone o repositório e acesse a pasta da API:**
\`\`\`bash
git clone https://github.com/utfpr/labControl.git
cd labControl/api
\`\`\`

**2. Instale as dependências locais:**
\`\`\`bash
yarn install
\`\`\`

**3. Suba a infraestrutura via Docker:**
O comando abaixo irá baixar as imagens, compilar a aplicação e iniciar o Banco de Dados, o pgAdmin e a API em background.
\`\`\`bash
yarn services:api
\`\`\`
*(Nota: Este script executa `docker compose -f docker-compose.yml up -d`)*

**4. Acompanhe os logs (Opcional):**
\`\`\`bash
yarn services:logs
\`\`\`

## 📍 Acessos Locais

Com os containers rodando, os seguintes serviços estarão disponíveis:

- **API:** [http://localhost:3000](http://localhost:3000)
- **Swagger (Documentação e Testes):** [http://localhost:3000/docs](http://localhost:3000/docs)
- **pgAdmin (Gerenciamento do BD):** [http://localhost:5050](http://localhost:5050)
  - **Login:** `admin@admin.com`
  - **Senha:** `admin`

## 🏗️ Módulos Implementados

Até o momento, a API contempla os seguintes módulos e relacionamentos:
- **Usuários** (Relacionados a Cursos)
- **Cursos** - **Locais** (Laboratórios - Relacionados a Cursos e Supervisores)
- **Equipamentos** (Relacionados a Cursos e Locais)
- **Disciplinas** (Relacionadas a Usuários responsáveis)
- **Aulas** (Relacionadas a Disciplinas, Locais e Professores)

## 🛑 Como Parar a Aplicação

Para parar os containers sem perder os dados do banco:
\`\`\`bash
yarn services:down
\`\`\`

Para parar e **destruir** o banco de dados (zerar o sistema):
\`\`\`bash
yarn services:clean
\`\`\`
