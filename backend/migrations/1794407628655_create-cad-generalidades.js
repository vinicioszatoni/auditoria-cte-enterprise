exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS core.cad_generalidades (
        id SERIAL PRIMARY KEY,
        id_grupo_tarifa UUID NOT NULL,
        status_registro VARCHAR(20) DEFAULT 'ATIVO',
        codigo_documento_ariba VARCHAR(100) NOT NULL,
        data_abertura_negociacao DATE,
        data_inicio_vigencia DATE,
        data_final_vigencia DATE,
        transportador VARCHAR(150) NOT NULL,
        codigo_cnpj_cpf VARCHAR(20),
        uf_destino VARCHAR(2),
        cidade_destino VARCHAR(150),
        tarifa VARCHAR(50) NOT NULL,
        tipo_cobranca VARCHAR(50) NOT NULL,
        valor NUMERIC(12, 4) DEFAULT 0,
        aplicacao_base TEXT,
        usuario_cadastro VARCHAR(150),
        email_usuario VARCHAR(150),
        data_hora_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_generalidades_status ON core.cad_generalidades (status_registro, data_inicio_vigencia, data_final_vigencia);
    CREATE INDEX IF NOT EXISTS idx_generalidades_pesquisa ON core.cad_generalidades (codigo_documento_ariba, transportador, codigo_cnpj_cpf);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS core.cad_generalidades CASCADE;`);
};