const db = require('../config/database'); 
const { v4: uuidv4 } = require('uuid');

exports.salvarGeneralidades = async (req, res) => {
    const payload = req.body;
    if (!payload.docAriba || !payload.transportador) return res.status(400).json({ erro: 'Dados ausentes.' });
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        let grupoTarifaId = payload.id_grupo_tarifa || uuidv4(); 

        if (payload.id || payload.id_grupo_tarifa) {
            await client.query(`UPDATE core.cad_generalidades SET status_registro = 'EDITADO' WHERE id_grupo_tarifa = $1 AND status_registro = 'ATIVO'`, [grupoTarifaId]);
        }

        if (payload.status === 'Excluído') {
            await client.query(`UPDATE core.cad_generalidades SET status_registro = 'EXCLUIDO' WHERE id_grupo_tarifa = $1 AND status_registro = 'EDITADO'`, [grupoTarifaId]);
            await client.query('COMMIT');
            return res.status(200).json({ sucesso: true, mensagem: 'Generalidade excluída.' });
        }

        const queryInsert = `INSERT INTO core.cad_generalidades (id_grupo_tarifa, status_registro, codigo_documento_ariba, data_abertura_negociacao, data_inicio_vigencia, data_final_vigencia, codigo_cnpj_cpf, uf_destino, cidade_destino, tarifa, tipo_cobranca, transportador, valor, aplicacao_base, usuario_cadastro, email_usuario) VALUES ($1, 'ATIVO', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;

        const inserirLinha = async (cnpj, uf, cidade, tipoCobranca, valor) => {
            if (!valor || parseFloat(valor) === 0) return;
            const aplicacaoBase = payload.aplicacaoTRT && payload.aplicacaoTRT.length > 0 ? payload.aplicacaoTRT.join(', ') : null;
            const valores = [grupoTarifaId, payload.docAriba, payload.dataNegociacao || null, payload.dataInicio || null, payload.dataFim || null, cnpj || null, uf || null, cidade || null, payload.tipoCadastro, tipoCobranca, payload.transportador, parseFloat(valor), aplicacaoBase, payload.usuario?.nome || 'Sistema', payload.usuario?.email || 'sistema@empresa.com'];
            await client.query(queryInsert, valores);
        };

        const iteradoresCNPJ = payload.cnpjsCliente?.length > 0 ? payload.cnpjsCliente : [null];
        const iteradoresCidades = payload.cidadesDestino?.length > 0 ? payload.cidadesDestino : [null];
        const cidadesFinais = payload.abrangenciaDestino === 'Todas' ? ['TODAS AS CIDADES'] : iteradoresCidades;

        for (const cnpj of iteradoresCNPJ) {
            for (const cidade of cidadesFinais) {
                const ufAssociada = payload.ufsDestino?.length > 0 ? payload.ufsDestino.join(',') : null;
                await inserirLinha(cnpj, ufAssociada, cidade, 'VALOR FIXO', payload.valorFixo);
                await inserirLinha(cnpj, ufAssociada, cidade, 'PERCENTUAL', payload.valorPercentual);
                await inserirLinha(cnpj, ufAssociada, cidade, 'VALOR MINIMO', payload.valorMinimo);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: 'Generalidade salva no PostgreSQL AWS!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ erro: 'Falha no BD AWS ao salvar Generalidades.' });
    } finally {
        client.release();
    }
};

exports.buscarHistorico = async (req, res) => {
    try {
        const query = `SELECT id_grupo_tarifa as id, codigo_documento_ariba as docAriba, transportador, tarifa as tipo, data_inicio_vigencia as dataInicio, data_final_vigencia as dataFim, status_registro as status FROM core.cad_generalidades WHERE status_registro = 'ATIVO' GROUP BY 1, 2, 3, 4, 5, 6, 7 ORDER BY MAX(data_hora_cadastro) DESC LIMIT 100;`;
        const result = await db.pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Falha na consulta de generalidades.' });
    }
};