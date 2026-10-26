require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Permite que o front-end em React converse com o Node
const routes = require('./src/routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(cors()); // Libera o acesso
app.use(express.json()); // Permite receber dados em JSON (das ações do usuário)

// Usa as rotas que vamos definir
app.use('/api', routes);

// Liga o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}/api/teste`);
});