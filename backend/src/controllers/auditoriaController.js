const db = require('../config/database');

exports.gravarLoteAuditoria = async (req, res) => {
    const tratativas = req.body;
    if (!Array.isArray(tratativas) || tratativas.length === 0) return res.status(400).json({ erro: 'Nenhum dado enviado.' });

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        // ATENÇÃO: Apontado para o schema "core."
        const queryInsert = `INSERT INTO core.log_auditoria_taxas (chave_cte, transportador, tipo_taxa, tabela_ariba, vigencia_inicio, vigencia_fim, tarifa_calculada, tarifa_cobrada, valor_diferenca, decisao, motivo_recusa, observacao, origem_auditoria, usuario_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;

        for (const item of tratativas) {
            const valores = [ item.chave_cte, item.transportador || 'N/A', item.tipo_taxa, item.tabela_ariba || null, item.vigencia_inicio === 'N/A' ? null : item.vigencia_inicio, item.vigencia_fim === 'N/A' ? null : item.vigencia_fim, item.tarifa_calculada || 0, item.tarifa_cobrada || 0, item.valor_diferenca || 0, item.decisao, item.motivo_recusa || null, item.observacao || null, item.origem_auditoria || 'Massa', item.usuario_email || 'sistema' ];
            await client.query(queryInsert, valores);
        }

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: `${tratativas.length} auditorias gravadas no DB AWS.` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro na Auditoria:", error);
        res.status(500).json({ erro: 'Falha ao gravar. Transação revertida.' });
    } finally {
        client.release();
    }
};