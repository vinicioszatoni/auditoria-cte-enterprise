// ARQUIVO: backend/controllers/authController.js
const db = require('../config/database');

// Login Local com verificação de Senha Padrão
exports.login = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });

    try {
        const query = `SELECT * FROM core.cad_usuarios WHERE email = $1 AND status = 'Ativo'`;
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado ou inativo.' });
        }

        const usuario = result.rows[0];
        
        // Em produção, usar bcrypt. Aqui validaremos a string direta ou o hash simulado.
        if (usuario.senha_hash !== senha) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        // Verifica se é a senha padrão (nome do usuário + @123)
        const senhaPadrao = `${usuario.nome.split(' ')[0]}@123`;
        const precisaTrocarSenha = (senha === senhaPadrao);

        // Retorna os dados do usuário (em produção, incluir JWT token)
        res.status(200).json({
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                funcao: usuario.funcao,
                departamento: usuario.departamento,
                role: usuario.role,
                sso_provider: usuario.sso_provider,
                precisaTrocarSenha: precisaTrocarSenha // Flag para o Frontend
            }
        });
    } catch (error) {
        console.error("Erro no Auth:", error);
        res.status(500).json({ erro: 'Erro interno de autenticação.' });
    }
};

exports.atualizarSenha = async (req, res) => {
    const { email, novaSenha } = req.body;
    try {
        // Futuro: Criptografar novaSenha com bcrypt
        await db.query(`UPDATE core.cad_usuarios SET senha_hash = $1 WHERE email = $2`, [novaSenha, email]);
        res.status(200).json({ sucesso: true, mensagem: 'Senha atualizada com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Falha ao atualizar a senha.' });
    }
};

// Rota Mockada de SSO (Para teste local / simulação Alquimia)
exports.loginSSO = async (req, res) => {
    try {
        // No Alquimia real, o request virá com um Token JWT do Keycloak/AzureAD
        // Como estamos preparando a base, vamos forçar um usuário de teste
        const query = `SELECT * FROM core.cad_usuarios WHERE email = 'vinicios.cordeiro@grupoboticario.com.br' AND status = 'Ativo'`;
        const result = await db.query(query);
        
        if(result.rows.length > 0) {
            res.status(200).json({ usuario: result.rows[0] });
        } else {
            res.status(401).json({ erro: 'Usuário SSO não cadastrado na base.' });
        }
    } catch (error) {
        res.status(500).json({ erro: 'Falha no SSO.' });
    }
};