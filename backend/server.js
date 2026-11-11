require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const routes = require('./src/routes/routes');
const rotasIbge = require('./src/routes/rotasIbge'); 

const app = express();

// ============================================================================
// 1. CONFIGURAÇÕES DE SEGURANÇA BÁSICA E PAYLOADS
// ============================================================================
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// [FUTURO - CLOUD AWS/GCP] - Blindagem Corporativa (Descomentar na Nuvem)
/*
app.use(helmet()); // Trava vulnerabilidades HTTP conhecidas (XSS, Sniffing)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { erro: 'DDoS/BruteForce detectado. Tente novamente mais tarde.' } });
app.use('/api/', limiter);
*/

// ============================================================================
// 2. CONFIGURAÇÃO DE CORS (Ambiente Dinâmico)
// ============================================================================
// [PRESENTE - LOCAL] Permite acesso irrestrito do seu computador
app.use(cors());

// [FUTURO - CLOUD AWS/GCP] Permite acesso apenas dos domínios oficiais da empresa
/*
const dominiosPermitidos = [process.env.FRONTEND_URL];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || dominiosPermitidos.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Acesso bloqueado pela política de CORS da empresa.'));
        }
    },
    credentials: true
}));
*/

// ============================================================================
// 3. ROTEAMENTO
// ============================================================================
app.use('/api', routes); // Todas as rotas da API ganham o prefixo /api
app.use('/', rotasIbge); // Mantido o mapeamento raiz para manter a view do Ibge operante

// ============================================================================
// 4. INICIALIZAÇÃO DO SERVIDOR (Agnóstico à Nuvem)
// ============================================================================
// A Nuvem sempre injetará a porta via process.env.PORT, se não houver, cai no 3000 (Local)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT} [Ambiente: ${process.env.NODE_ENV || 'LOCAL'}]`);
});
