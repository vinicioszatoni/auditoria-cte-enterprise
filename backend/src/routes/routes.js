const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const generalidadesController = require('../controllers/generalidadesController'); // NOVO

// Rotas Dashboard (BigQuery)
router.post('/dados-dashboard', apiController.getDadosBigQuery);
router.post('/acao-usuario', apiController.postAcaoSheets);

// ==========================================
// ROTAS DE CADASTRO (PostgreSQL - AWS)
// ==========================================
// router.post('/api/gravar-auditoria', auditoriaController.gravarLoteAuditoria);
router.post('/api/generalidades', generalidadesController.salvarGeneralidades);
router.get('/api/generalidades', generalidadesController.buscarHistorico);

module.exports = router;