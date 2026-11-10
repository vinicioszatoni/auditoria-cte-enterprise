const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const generalidadesController = require('../controllers/generalidadesController');
const auditoriaController = require('../controllers/auditoriaController');
const tabelasController = require('../controllers/tabelasController');
const authController = require('../controllers/authController'); // INCLUÍDO

// ==========================================
// ROTAS DE AUTENTICAÇÃO E USUÁRIOS
// ==========================================
router.post('/auth/login', authController.login);
router.post('/auth/atualizar-senha', authController.atualizarSenha);
router.get('/auth/sso', authController.loginSSO); // Em prod pode ser via redirect (SAML/OAuth)

// ==========================================
// ROTAS DE ANALYTICS (BigQuery GCP)
// ==========================================
router.post('/dados-dashboard', apiController.getDadosBigQuery);
router.post('/acao-usuario', apiController.postAcaoSheets);

// ==========================================
// ROTAS DE LOGÍSTICA E PRECIFICAÇÃO (PostgreSQL AWS)
// ==========================================
router.post('/gravar-auditoria', auditoriaController.gravarLoteAuditoria);
router.post('/generalidades', generalidadesController.salvarGeneralidades);
router.get('/generalidades', generalidadesController.buscarHistorico);
router.post('/tabela-frete', tabelasController.salvarTabelaFrete);

module.exports = router;