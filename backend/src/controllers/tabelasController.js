const db = require('../config/database'); 

exports.salvarTabelaFrete = async (req, res) => {
    const payload = req.body;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); 
        const dataHoraPlanilha = new Date().toISOString();
        const queryInsert = `INSERT INTO core.cad_tabelas_frete (id_rota, documento_ariba_ws, dt_abertura_negociacao, dt_inicio_vigencia, dt_final_vigencia, modelo_contratacao, tp_negociacao, etapa_logistica, fluxo_logistico, free_time_hrs, prazo_entrega_dias, prazo_pagamento_dias, transportadora, tp_veiculo, carroceria, combustivel, incoterm, carga_perigosa, seguro_carga, uf_origem, cidade_origem, cep_origem, uf_destino, cidade_destino, cep_destino_inicial, cep_destino_final, mesorregiao_destino, fator_conversao_peso_cubado, des_faixa_peso, vlr_frete_faixa, vlr_frete_lotacao, gris_pct, advlr_pct, trt_pct, trt_vlr_fixo, trt_vlr_minimo, tde_pct, tde_vlr_fixo, tde_vlr_minimo, tda_pct, tda_vlr_fixo, tda_vlr_minimo, tso_pct, tso_vlr_fixo, tso_vlr_minimo, suframa_vlr_fixo, seguro_fluvial_pct, seguro_fluvial_vlr_fixo, seguro_fluvial_vlr_minimo, pedagio_vlr_fixo, pedagio_fracao_kg, pedagio_kg, emex_pct, emex_vlr_fixo, emex_vlr_minimo, emissao_cte_vlr_fixo, tx_agendamento_vlr_fixo, tx_armazenagem_vlr_fixo, tx_paletizacao_vlr_fixo, reentrega_pct, devolucao_pct, diaria_vlr_fixo, carga_descarga_vlr_fixo, usuario_cadastro, email_cadastro, dt_hr_cadastro_planilha_frete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66)`;

        const CAPITAIS_BR = ['SE-ARACAJU', 'PA-BELEM', 'MG-BELO HORIZONTE', 'RR-BOA VISTA', 'DF-BRASILIA', 'MS-CAMPO GRANDE', 'MT-CUIABA', 'PR-CURITIBA', 'SC-FLORIANOPOLIS', 'CE-FORTALEZA', 'GO-GOIANIA', 'PB-JOAO PESSOA', 'AP-MACAPA', 'AL-MACEIO', 'AM-MANAUS', 'RN-NATAL', 'TO-PALMAS', 'RS-PORTO ALEGRE', 'RO-PORTO VELHO', 'PE-RECIFE', 'AC-RIO BRANCO', 'RJ-RIO DE JANEIRO', 'BA-SALVADOR', 'MA-SAO LUIS', 'SP-SAO PAULO', 'PI-TERESINA', 'ES-VITORIA'];
        const pt = (v) => v ? parseFloat(v) : 0;

        for (const linha of payload.linhasGeradas) {
            const isCapital = CAPITAIS_BR.includes(String(linha.ufDestino + '-' + linha.cidDestino).toUpperCase());
            const tipoRegiao = isCapital ? 'Capital' : 'Interior';
            
            let t = payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-${tipoRegiao}`];
            if (!t) t = payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-Ambas`] || payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-Capital`] || payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-Interior`] || {};

            const faixasParaGravar = Object.keys(t.faixasValores || {});
            if(faixasParaGravar.length === 0) faixasParaGravar.push('N/A');

            for (const faixa of faixasParaGravar) {
                const valorFaixa = faixa === 'N/A' ? 0 : pt(t.faixasValores[faixa]);
                const cepO_curto = String(linha.cepIniO).substring(0,3);
                const cepD_curto = String(linha.cepIniD).substring(0,3);
                const id_rota_calc = `${linha.ufOrigem}-${linha.ufDestino} ${cepO_curto}-${cepD_curto}`.toUpperCase();

                const valores = [ id_rota_calc, String(payload.negociacao.docAriba).toUpperCase(), payload.negociacao.dataAbertura || null, payload.negociacao.dataInicio || null, payload.negociacao.dataFinal || null, String(payload.negociacao.modeloContratacao).toUpperCase(), String(payload.negociacao.tipoNegociacao).toUpperCase(), String(payload.parametros.etapa).toUpperCase(), String(payload.parametros.fluxo).toUpperCase(), parseInt(t.freeTime) || 0, parseInt(t.prazoEntrega) || 0, parseInt(t.prazoPagamento) || 0, String(payload.parametros.transportador).toUpperCase(), String(linha.veiculo).toUpperCase(), String(linha.carroceria).toUpperCase(), String(linha.combustivel).toUpperCase(), String(payload.negociacao.incoterm).toUpperCase(), String(payload.parametros.cargaPerigosa).toUpperCase(), String(payload.parametros.seguroCarga).toUpperCase(), String(linha.ufOrigem).toUpperCase(), String(linha.cidOrigem).toUpperCase(), linha.cepIniO, String(linha.ufDestino).toUpperCase(), String(linha.cidDestino).toUpperCase(), linha.cepIniD, linha.cepFimD, String(linha.mesoDestino).toUpperCase(), String(payload.parametros.fatorCubagem).toUpperCase(), String(faixa).replace(/ /g, '_').toUpperCase(), valorFaixa, pt(t.freteLotacao), pt(t.grisPct), pt(t.advlrPct), pt(t.trtPct), pt(t.trtFixo), pt(t.trtMin), pt(t.tdePct), pt(t.tdeFixo), pt(t.tdeMin), pt(t.tdaPct), pt(t.tdaFixo), pt(t.tdaMin), pt(t.tsoPct), pt(t.tsoFixo), pt(t.tsoMin), pt(t.suframa), pt(t.segFluvialPct), pt(t.segFluvialFixo), pt(t.segFluvialMin), pt(t.pedagioFixo), pt(t.pedagioFracao), pt(t.pedagioKg), pt(t.emexPct), pt(t.emexFixo), pt(t.emexMin), pt(t.emissaoCte), pt(t.agendamento), pt(t.armazenagem), pt(t.paletizacao), pt(t.reentregaPct), pt(t.devolucaoPct), pt(t.diaria), pt(t.cargaDescarga), payload.usuario?.nome || 'Sistema', payload.usuario?.email || 'sistema@empresa.com', dataHoraPlanilha ];
                
                await client.query(queryInsert, valores);
            }
        }
        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: 'Tabela de frete inserida no DB AWS com sucesso.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ erro: 'Falha ao salvar tabela de frete.' });
    } finally {
        client.release();
    }
};