require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const routes = require('./src/routes/routes');
const rotasIbge = require('./src/routes/rotasIbge'); // 1. Adicione a importação do novo arquivo

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

app.use('/api', routes);
app.use('/', rotasIbge); // 2. Conecte a nova rota na raiz do servidor para manter /api/rotas-ibge

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}/api/teste`);
});