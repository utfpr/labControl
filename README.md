# Project: LabControl — Evolução de Tecnologia

Este repositório contém a reengenharia e atualização de um sistema legado, adotando uma arquitetura de **Monorepo** e uma metodologia de desenvolvimento experimental baseada integralmente em IA.

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
├── backend/       # API, Regras de Negócio e Persistência de Dados
├── frontend/      # Interface de Usuário e Experiência do Cliente
└── docs/          # Histórico de prompts e documentação técnica

```

### Detalhamento das Camadas:

* **`backend/`**: Responsável por toda a lógica de servidor, integração com banco de dados e exposição de endpoints. Seguindo a premissa do projeto, toda a arquitetura (REST, GraphQL, ou Microservices) será definida via instruções de IA.
* **`frontend/`**: Contém a aplicação cliente. A escolha de frameworks, componentes e gerenciamento de estado será estritamente baseada nos questionamentos e respostas obtidos durante o desenvolvimento.

## 🚀 Fluxo de Trabalho

O ciclo de vida de cada funcionalidade segue este fluxo:

1. **Definição de Contexto:** O humano descreve o estado atual e o objetivo desejado.
2. **Prompting:** Questionamento direcionado à LLM para obtenção da solução.
3. **Aplicação Direta:** O código gerado é inserido no monorepo sem alterações manuais de lógica.
4. **Feedback Loop:** Em caso de erros, os logs são devolvidos à IA para diagnóstico e nova geração de código.

---