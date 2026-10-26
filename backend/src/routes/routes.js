const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
//const auditoriaController = require('./controllers/auditoriaController');

// Rota de teste simples
router.get('/teste', (req, res) => {
    res.json({ mensagem: "A API está funcionando perfeitamente!" });
});

// Rota para LER dados do BigQuery (Agora é POST para receber os filtros do React)
router.post('/dados-dashboard', apiController.getDadosBigQuery);

// Rota para GRAVAR ação do usuário
router.post('/acao-usuario', apiController.postAcaoSheets);

// Rota para GRAVAR auditoria no banco de dados PostgreSQL
// router.post('/api/gravar-auditoria', auditoriaController.gravarLoteAuditoria);

module.exports = router;