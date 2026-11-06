// ============================================================================
// ARQUIVO: backend/config/database.js
// ============================================================================
const { Pool } = require('pg');

// Lógica Híbrida: Se existir DATABASE_URL (AWS/GCP), usa a URL. 
// Caso contrário, usa as variáveis locais do seu computador.
const configBd = process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL,
        ssl: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog') ? { rejectUnauthorized: false } : false
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
      };

const pool = new Pool(configBd);

pool.on('error', (err, client) => {
    console.error('Erro crítico no PostgreSQL:', err);
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro de conexão com o PostgreSQL:', err.message);
    } else {
        console.log(`✅ Conexão com PostgreSQL estabelecida! [Modo: ${process.env.DATABASE_URL ? 'CLOUD' : 'LOCAL'}]`);
        release();
    }
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
};