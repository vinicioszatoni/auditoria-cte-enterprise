const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const generalidadesController = require('../controllers/generalidadesController');
const auditoriaController = require('../controllers/auditoriaController');
const tabelasController = require('../controllers/tabelasController');

// ==========================================
// ROTAS DE ANALYTICS (BigQuery GCP)
// ==========================================
router.post('/dados-dashboard', apiController.getDadosBigQuery);
router.post('/acao-usuario', apiController.postAcaoSheets);

// ==========================================
// ROTAS DE LOGÍSTICA E PRECIFICAÇÃO (PostgreSQL AWS)
// Nota: Os controllers já estão mapeados no app.use('/api', routes), então não repita "/api" aqui.
// ==========================================

// 1. Auditoria
router.post('/gravar-auditoria', auditoriaController.gravarLoteAuditoria);

// 2. Generalidades e Restrições
router.post('/generalidades', generalidadesController.salvarGeneralidades);
router.get('/generalidades', generalidadesController.buscarHistorico);

// 3. Tabelas de Frete (Motor Digitalizador)
router.post('/tabela-frete', tabelasController.salvarTabelaFrete);

module.exports = router;