// ============================================================================
// ARQUIVO: src/config/runMigrations.js
// ============================================================================
const runner = require('node-pg-migrate');
const { pool } = require('./database');
const path = require('path');

async function executarMigrations() {
    // Executa se achar o host do banco usando a variável do Alquimia
    if (!process.env.AUDITORIA_CTE_BACKEND_HOST) {
        console.warn("⚠️ Credenciais de banco não encontradas. Pulando migrations.");
        return;
    }

    console.log("⏳ Iniciando verificação de Migrations...");
    const client = await pool.connect();
    
    try {
        await runner.default({
            dbClient: client,
            dir: path.join(__dirname, '../../migrations'),
            direction: 'up', 
            migrationsTable: 'pgmigrations', 
            log: console.log
        });
        console.log("✅ Migrations executadas com sucesso!");
    } catch (error) {
        console.error("❌ Erro crítico ao executar migrations:", error);
        process.exit(1); // Trava a subida do app se o banco não puder ser criado
    } finally {
        client.release();
    }
}

module.exports = executarMigrations;