# 🚚 Transportes GB - Auditoria Financeira de CT-e

Um sistema de padrão SaaS Enterprise desenvolvido para automatizar, gerir e auditar divergências de cobranças logísticas (Conhecimentos de Transporte Eletrônico - CT-e). A plataforma cruza dados de faturamento em tempo real contra tabelas de frete negociadas (Ariba), oferecendo fluxos de aprovação individual e em massa.

## 🚀 Principais Funcionalidades

* **Dashboard Analítico:** Visualização de KPIs financeiros, evolução temporal de divergências e análise de Pareto por transportador utilizando `Recharts` e `React Google Charts`.
* **Auditoria em Massa (Agrupada):** Identificação automática de anomalias repetitivas por taxa (Frete Peso, Pedágio, GRIS, Ad Valorem, SEC/CAT, TDE) para aprovação ou reprovação em lote.
* **Fila Individual de CT-e:** Análise profunda documento a documento, com detalhamento visual da tarifa calculada vs. cobrada.
* **UI/UX Avançada (Glassmorphism):** Interface construída com design de vidro fosco, tipografia de precisão (`tabular-nums` para valores financeiros) e suporte dinâmico a diferentes resoluções de tela.
* **Autenticação:** Preparado para integração com SSO Corporativo e painel de gestão de perfil.

## 🛠️ Stack Tecnológica

**Frontend (Cliente)**
* React.js (via Vite)
* Bootstrap + CSS Customizado (Design Tokens)
* Recharts & React Icons
* Axios para requisições HTTP

**Backend (API & Orquestração)**
* Node.js com Express
* Autenticação via JWT (Roadmap)

**Banco de Dados (Arquitetura Híbrida)**
* **Google BigQuery (OLAP):** Leitura de alto desempenho para cruzamento massivo de milhões de linhas e extração de KPIs analíticos.
* **PostgreSQL (OLTP):** Escrita e persistência relacional para armazenar as decisões de auditoria, históricos e perfis de utilizadores.

## ⚙️ Como Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) (v16 ou superior)
* Acesso ao Google Cloud (Chave JSON do BigQuery)
* Banco de Dados PostgreSQL configurado

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/vinicioszatoni/auditoria-cte-enterprise.git](https://github.com/vinicioszatoni/auditoria-cte-enterprise.git)
   cd auditoria-cte-enterprise