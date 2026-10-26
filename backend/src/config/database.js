const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    max: 20, // Limite máximo de conexões simultâneas
    idleTimeoutMillis: 30000,
});

// Teste de conexão ao iniciar o servidor
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
        release();
    }
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
};