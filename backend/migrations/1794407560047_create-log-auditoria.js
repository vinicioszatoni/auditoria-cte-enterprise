exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS core.log_auditoria_taxas (
        id SERIAL PRIMARY KEY,
        chave_cte VARCHAR(44) NOT NULL,
        transportador VARCHAR(150) NOT NULL,
        tipo_taxa VARCHAR(50) NOT NULL,
        tabela_ariba VARCHAR(100),
        vigencia_inicio DATE,
        vigencia_fim DATE,
        tarifa_calculada NUMERIC(12, 4) DEFAULT 0,
        tarifa_cobrada NUMERIC(12, 4) DEFAULT 0,
        valor_diferenca NUMERIC(12, 4) DEFAULT 0,
        decisao VARCHAR(50) NOT NULL,
        motivo_recusa VARCHAR(150),
        observacao TEXT,
        origem_auditoria VARCHAR(50),
        usuario_email VARCHAR(150) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_auditoria_chave ON core.log_auditoria_taxas (chave_cte, tipo_taxa);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS core.log_auditoria_taxas CASCADE;`);
};