// ============================================================================
// ARQUIVO: backend/routes/rotasIbge.js
// ============================================================================
const express = require('express');
const router = express.Router();

// 1. UTILIZANDO O SEU ARQUIVO DE CONFIGURAÇÃO CENTRALIZADO DO BIGQUERY
// Isso garante que a autenticação (CLI/GCP) ocorra da mesma forma que no apiController.js
const bigquery = require('../config/bigquery'); 

// 2. BUSCANDO O PROJECT_ID DO SEU .ENV (Da mesma forma que no apiController)
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'ssdx-operacoes-logistica';

router.get('/api/rotas-ibge', async (req, res) => {
  try {
    // 3. CONSTRUÇÃO DA QUERY NOS MOLDES DO SEU API CONTROLLER
    const VIEW_IBGE = `\`${PROJECT_ID}.transportes.rotas_ibge_auditoria\``;
    
    const query = `
      SELECT 
        slg_uf, 
        estado, 
        cod_cidade, 
        nome_cidade, 
        cod_mesorregiao, 
        mesorregiao, 
        cep_inicial, 
        cep_final
      FROM ${VIEW_IBGE}
      ORDER BY slg_uf, nome_cidade
    `;

    // 4. EXECUÇÃO DA QUERY UTILIZANDO createQueryJob() COMO NO API CONTROLLER
    const [job] = await bigquery.createQueryJob({ query: query });
    const [rows] = await job.getQueryResults();
    
    res.status(200).json(rows);
    
  } catch (error) {
    console.error('Erro ao consultar View do IBGE no BigQuery:', error);
    res.status(500).json({ erro: 'Falha ao processar malha geográfica.' });
  }
});

module.exports = router;