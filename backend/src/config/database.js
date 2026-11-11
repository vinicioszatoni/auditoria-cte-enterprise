// ============================================================================
// ARQUIVO: src/config/database.js
// ============================================================================
const { Pool } = require('pg');

// Configuração utilizando as variáveis exclusivas do projeto (Alquimia / AWS)
const configBd = {
    user: process.env.AUDITORIA_CTE_BACKEND_USER,
    password: process.env.AUDITORIA_CTE_BACKEND_PASSWORD,
    database: process.env.AUDITORIA_CTE_BACKEND_NAME,
    host: process.env.AUDITORIA_CTE_BACKEND_HOST || 'localhost',
    port: process.env.AUDITORIA_CTE_BACKEND_PORT || 5432,
    // SSL é obrigatório para bancos na nuvem (AWS/GCP) em ambientes superiores
    ssl: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog') 
        ? { rejectUnauthorized: false } 
        : false
};

const pool = new Pool(configBd);

pool.on('error', (err) => {
    console.error('Erro crítico no PostgreSQL:', err);
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro de conexão com o PostgreSQL:', err.message);
    } else {
        console.log(`✅ Conexão com PostgreSQL estabelecida! [Ambiente: ${process.env.NODE_ENV || 'LOCAL'}]`);
        release();
    }
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params)
};