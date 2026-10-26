const { BigQuery } = require('@google-cloud/bigquery');

// Se você estiver rodando no Cloud Run, ele pega as credenciais automaticamente.
// Localmente, você precisa ter logado via CLI (gcloud auth application-default login)
const bigquery = new BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

module.exports = bigquery;