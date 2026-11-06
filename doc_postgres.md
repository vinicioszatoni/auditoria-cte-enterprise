# Documentação de Estrutura de Banco de Dados - PostgreSQL

**Projeto:** Sistema de Auditoria e Gestão de Fretes (Transportes GB)
**Módulo:** Ingestão de Dados e Parametrização Logística
**Data de Atualização:** Novembro de 2026

## Visão Geral

Este documento descreve as tabelas (DDL) necessárias no banco de dados relacional PostgreSQL (hospedado na Cloud AWS/GCP).
Estes dados alimentarão as visões analíticas no BigQuery (GCP) no formato D-1 ou via streaming, suportando as frentes de **Geração de Tabelas de Frete**, **Central de Generalidades**, **Auditoria de CT-es** e **Gestão de Usuários (IAM)**.

### 1. Tabela: Gestão de Usuários e Acessos (`cad_usuarios`)

Tabela responsável pelo controle de autenticação (SSO / Local) e autorização (Roles) da aplicação.

```
CREATE TABLE cad_usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255),          -- Nulo se o acesso for exclusivo via SSO corporativo
    funcao VARCHAR(100),              -- Ex: 'Especialista em Logística'
    departamento VARCHAR(100),        -- Ex: 'Transportes'
    slack_id VARCHAR(100),            -- Utilizado para futuras integrações de notificação
    role VARCHAR(20) DEFAULT 'USER',  -- Permissões: 'ADMIN', 'USER', 'VIEWER'
    sso_provider VARCHAR(50),         -- Identificador do provedor: 'AZURE', 'GOOGLE', 'LOCAL'
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_email ON cad_usuarios (email);

```

### 2. Tabela: Auditoria e Tratativas de CT-e (`log_auditoria_taxas`)

Responsável por armazenar as decisões manuais e em massa (Aprovações e Reprovações) do time operacional sobre os CT-es divergentes.

```
CREATE TABLE log_auditoria_taxas (
    id SERIAL PRIMARY KEY,
    chave_cte VARCHAR(44) NOT NULL,
    transportador VARCHAR(150) NOT NULL,
    tipo_taxa VARCHAR(50) NOT NULL,   -- Ex: 'FRETE_PESO', 'GRIS', 'PEDAGIO', 'TDE'
    tabela_ariba VARCHAR(100),
    vigencia_inicio DATE,
    vigencia_fim DATE,
    tarifa_calculada NUMERIC(12, 4) DEFAULT 0,
    tarifa_cobrada NUMERIC(12, 4) DEFAULT 0,
    valor_diferenca NUMERIC(12, 4) DEFAULT 0,
    decisao VARCHAR(50) NOT NULL,     -- 'APROVAR' ou 'REPROVAR'
    motivo_recusa VARCHAR(150),       -- 'tabela_errada', 'duplicidade', 'taxa_nao_negociada'
    observacao TEXT,
    origem_auditoria VARCHAR(50),     -- Ex: 'FILA_INDIVIDUAL', 'ANALISE_MASSA'
    usuario_email VARCHAR(150) NOT NULL, -- Vínculo com cad_usuarios
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_chave ON log_auditoria_taxas (chave_cte, tipo_taxa);

```

### 3. Tabela: Central de Generalidades (`cad_generalidades`)

Armazena restrições e taxas acessórias (TRT, TDE, TDA, Agendamento).
**Arquitetura:** Utiliza *Soft Delete* e controle de versão através da coluna `id_grupo_tarifa` para garantir rastreabilidade histórica em caso de edição ou exclusão.

```
CREATE TABLE cad_generalidades (
    id SERIAL PRIMARY KEY,
    id_grupo_tarifa UUID NOT NULL,       -- Agrupador para versionamento da mesma tarifa
    status_registro VARCHAR(20) DEFAULT 'ATIVO', -- 'ATIVO', 'EDITADO', 'EXCLUIDO'
    
    -- Dados Logísticos e Contratuais
    codigo_documento_ariba VARCHAR(100) NOT NULL,
    data_abertura_negociacao DATE,
    data_inicio_vigencia DATE,
    data_final_vigencia DATE,
    transportador VARCHAR(150) NOT NULL,
    
    -- Abrangência
    codigo_cnpj_cpf VARCHAR(20),         -- Nulo para TRT, Preenchido para TDE/Agendamento
    uf_destino VARCHAR(2),
    cidade_destino VARCHAR(150),
    
    -- Tipificação
    tarifa VARCHAR(50) NOT NULL,         -- Ex: 'TRT', 'TDE', 'TDA', 'AGENDAMENTO'
    tipo_cobranca VARCHAR(50) NOT NULL,  -- Ex: 'VALOR FIXO', 'VALOR MINIMO', 'PERCENTUAL'
    
    -- Financeiro e Regras
    valor NUMERIC(12, 4) DEFAULT 0,
    aplicacao_base TEXT,                 -- Ex: 'Frete Peso, Pedágio' (Para TRT)
    
    -- Auditoria de Sistema
    usuario_cadastro VARCHAR(150),
    email_usuario VARCHAR(150),
    data_hora_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generalidades_status ON cad_generalidades (status_registro, data_inicio_vigencia, data_final_vigencia);
CREATE INDEX idx_generalidades_pesquisa ON cad_generalidades (codigo_documento_ariba, transportador, codigo_cnpj_cpf);

```

### 4. Tabela: Central de Tabelas de Frete (`cad_tabelas_frete`)

Estrutura desnormalizada (*Unpivoted*) gerada a partir do motor digitalizador de planilhas. Transforma colunas horizontais de faixa de peso em linhas (Coluna `des_faixa_peso`), otimizando o cruzamento de dados no BigQuery.

```
CREATE TABLE cad_tabelas_frete (
    id SERIAL PRIMARY KEY,
    id_rota VARCHAR(255) NOT NULL,       -- Chave estruturada: Ex: PR-SC 341-351
    documento_ariba_ws VARCHAR(100),
    dt_abertura_negociacao DATE,
    dt_inicio_vigencia DATE,
    dt_final_vigencia DATE,
    modelo_contratacao VARCHAR(100),
    tp_negociacao VARCHAR(100),
    etapa_logistica VARCHAR(100),
    fluxo_logistico VARCHAR(100),
    free_time_hrs INT DEFAULT 0,
    prazo_entrega_dias INT DEFAULT 0,
    prazo_pagamento_dias INT DEFAULT 0,
    transportadora VARCHAR(150),
    tp_veiculo VARCHAR(100),
    carroceria VARCHAR(100),
    combustivel VARCHAR(100),
    incoterm VARCHAR(10),
    carga_perigosa VARCHAR(10),
    seguro_carga VARCHAR(50),
    
    -- Malha Geográfica
    uf_origem VARCHAR(2),
    cidade_origem VARCHAR(150),
    cep_origem VARCHAR(20),
    uf_destino VARCHAR(2),
    cidade_destino VARCHAR(150),
    cep_destino_inicial VARCHAR(20),
    cep_destino_final VARCHAR(20),
    mesorregiao_destino VARCHAR(150),
    
    fator_conversao_peso_cubado VARCHAR(50),
    
    -- UNPIVOT: Faixas de Peso
    des_faixa_peso VARCHAR(50) NOT NULL, -- Ex: '10_kg', '100_kg', 'excedente_kg'
    vlr_frete_faixa NUMERIC(12, 4) DEFAULT 0,
    vlr_frete_lotacao NUMERIC(12, 4) DEFAULT 0,
    
    -- Taxas Acessórias
    gris_pct NUMERIC(10, 4) DEFAULT 0,
    advlr_pct NUMERIC(10, 4) DEFAULT 0,
    trt_pct NUMERIC(10, 4) DEFAULT 0,
    trt_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    trt_vlr_minimo NUMERIC(10, 4) DEFAULT 0,
    tde_pct NUMERIC(10, 4) DEFAULT 0,
    tde_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    tde_vlr_minimo NUMERIC(10, 4) DEFAULT 0,
    tda_pct NUMERIC(10, 4) DEFAULT 0,
    tda_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    tda_vlr_minimo NUMERIC(10, 4) DEFAULT 0,
    tso_pct NUMERIC(10, 4) DEFAULT 0,
    tso_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    tso_vlr_minimo NUMERIC(10, 4) DEFAULT 0,
    suframa_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    seguro_fluvial_pct NUMERIC(10, 4) DEFAULT 0,
    seguro_fluvial_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    seguro_fluvial_vlr_minimo NUMERIC(10, 4) DEFAULT 0,
    pedagio_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    pedagio_fracao_kg NUMERIC(10, 4) DEFAULT 0,
    pedagio_kg NUMERIC(10, 4) DEFAULT 0,
    emex_pct NUMERIC(10, 4) DEFAULT 0,
    emex_vlr_fixo NUMERIC(10, 4) DEFAULT 0,
    emex_vlr_minimo NUMERIC(10, 4) DEFAULT 0,
    emissao_cte_vlr_fixo NUMERIC(10, 2) DEFAULT 0,
    tx_agendamento_vlr_fixo NUMERIC(10, 2) DEFAULT 0,
    tx_armazenagem_vlr_fixo NUMERIC(10, 2) DEFAULT 0,
    tx_paletizacao_vlr_fixo NUMERIC(10, 2) DEFAULT 0,
    reentrega_pct NUMERIC(10, 4) DEFAULT 0,
    devolucao_pct NUMERIC(10, 4) DEFAULT 0,
    diaria_vlr_fixo NUMERIC(10, 2) DEFAULT 0,
    carga_descarga_vlr_fixo NUMERIC(10, 2) DEFAULT 0,
    
    -- Metadados de Ingestão
    usuario_cadastro VARCHAR(150),
    email_cadastro VARCHAR(150),
    dt_hr_cadastro_planilha_frete TIMESTAMP,
    dt_hr_ingestao_banco TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tbl_frete_rota ON cad_tabelas_frete (documento_ariba_ws, transportadora, uf_origem, cidade_origem, uf_destino, cidade_destino);

```