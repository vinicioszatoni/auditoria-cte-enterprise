// ============================================================================
// ARQUIVO: backend/controllers/tabelasController.js
// ============================================================================
// const db = require('../config/database'); // [FUTURO - Descomentar quando AWS estiver configurada]

exports.salvarTabelaFrete = async (req, res) => {
    const payload = req.body; // { linhasGeradas, negociacao, parametros, tarifasSalvas, usuario }
    
    // ------------------------------------------------------------------------
    // [PRESENTE - MOCK] - Retorna sucesso para o Front sem gravar em banco
    // ------------------------------------------------------------------------
    return res.status(201).json({ sucesso: true, mensagem: `Base com ${payload.linhasGeradas.length} linhas enviada para processamento.` });

    // ------------------------------------------------------------------------
    // [FUTURO - INTEGRAÇÃO POSTGRES AWS] - Descomentar a partir daqui
    // ------------------------------------------------------------------------
    /*
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); // Transação Atômica

        const dataHoraPlanilha = new Date().toISOString();

        // Insere as colunas de acordo com a planilha modelo
        const queryInsert = `
            INSERT INTO cad_tabelas_frete (
                id_rota, 
                documento_ariba_ws, 
                dt_abertura_negociacao, 
                dt_inicio_vigencia,
                dt_final_vigencia,
                modelo_contratacao,
                tp_negociacao, 
                etapa_logistica, 
                fluxo_logistico,
                free_time_hrs, 
                prazo_entrega_dias, 
                prazo_pagamento_dias,
                transportadora, 
                tp_veiculo, 
                carroceria, 
                combustivel, 
                incoterm, 
                carga_perigosa, 
                seguro_carga,
                uf_origem, 
                cidade_origem, 
                cep_origem, 
                uf_destino, 
                cidade_destino, 
                cep_destino_inicial, 
                cep_destino_final, 
                mesorregiao_destino,
                fator_conversao_peso_cubado, 
                des_faixa_peso, 
                vlr_frete_faixa, 
                vlr_frete_lotacao,
                gris_pct, 
                advlr_pct, 
                trt_pct, 
                trt_vlr_fixo, 
                trt_vlr_minimo, 
                tde_pct, 
                tde_vlr_fixo, 
                tde_vlr_minimo,
                tda_pct, 
                tda_vlr_fixo, 
                tda_vlr_minimo, 
                tso_pct, 
                tso_vlr_fixo, 
                tso_vlr_minimo, 
                suframa_vlr_fixo,
                seguro_fluvial_pct, 
                seguro_fluvial_vlr_fixo, 
                seguro_fluvial_vlr_minimo,
                pedagio_vlr_fixo, 
                pedagio_fracao_kg, 
                pedagio_kg, 
                emex_pct, 
                emex_vlr_fixo, 
                emex_vlr_minimo,
                emissao_cte_vlr_fixo, 
                tx_agendamento_vlr_fixo, 
                tx_armazenagem_vlr_fixo, 
                tx_paletizacao_vlr_fixo,
                reentrega_pct, 
                devolucao_pct, 
                diaria_vlr_fixo, 
                carga_descarga_vlr_fixo,
                usuario_cadastro, 
                email_cadastro, 
                dt_hr_cadastro_planilha_frete
            ) VALUES (
                $1,
                $2, 
                $3, 
                $4, 
                $5, 
                $6, 
                $7, 
                $8, 
                $9, 
                $10, 
                $11, 
                $12, 
                $13, 
                $14, 
                $15, 
                $16, 
                $17, 
                $18, 
                $19,
                $20, 
                $21, 
                $22, 
                $23, 
                $24, 
                $25, 
                $26, 
                $27, 
                $28, 
                $29, 
                $30, 
                $31, 
                $32, 
                $33, 
                $34, 
                $35, 
                $36,
                $37, 
                $38, 
                $39, 
                $40, 
                $41, 
                $42, 
                $43, 
                $44, 
                $45, 
                $46, 
                $47, 
                $48, 
                $49, 
                $50, 
                $51, 
                $52, 
                $53,
                $54, 
                $55, 
                $56, 
                $57, 
                $58, 
                $59, 
                $60, 
                $61, 
                $62, 
                $63, 
                $64, 
                $65, 
                $66
            )
        `;

        const CAPITAIS_BR = ['ARACAJU', 'BELEM', 'BELO HORIZONTE', 'BOA VISTA', 'BRASILIA', 'CAMPO GRANDE', 'CUIABA', 'CURITIBA', 'FLORIANOPOLIS', 'FORTALEZA', 'GOIANIA', 'JOAO PESSOA', 'MACAPA', 'MACEIO', 'MANAUS', 'NATAL', 'PALMAS', 'PORTO ALEGRE', 'PORTO VELHO', 'RECIFE', 'RIO BRANCO', 'RIO DE JANEIRO', 'SALVADOR', 'SAO LUIS', 'SAO PAULO', 'TERESINA', 'VITORIA'];

        const getF = (t, f) => t.faixasValores && t.faixasValores[f] ? parseFloat(t.faixasValores[f]) : 0;
        const pt = (v) => v ? parseFloat(v) : 0;

        for (const linha of payload.linhasGeradas) {
            const isCapital = CAPITAIS_BR.includes(String(linha.cidDestino).toUpperCase());
            const tipoRegiao = isCapital ? 'Capital' : 'Interior';
            
            let t = payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-${tipoRegiao}`];
            if (!t) t = payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-Ambas`] || payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-Capital`] || payload.tarifasSalvas[`${linha.ufOrigem} ➔ ${linha.ufDestino}-Interior`] || {};

            // O seu Excel transforma as colunas horizontais em verticais.
            // Para CADA linha gerada, iteramos por cada FAIXA DE PESO que existir e geramos o insert
            const faixasParaGravar = Object.keys(t.faixasValores || {});
            
            if(faixasParaGravar.length === 0) {
               // Insere fallback caso não existam faixas (Ex: Só Lotação)
               faixasParaGravar.push('N/A');
            }

            for (const faixa of faixasParaGravar) {
                const valorFaixa = faixa === 'N/A' ? 0 : pt(t.faixasValores[faixa]);
                
                // Formata o ID_ROTA (Ex: PR-SC 341-351) usando substr do IBGE
                const cepO_curto = String(linha.cepIniO).substring(0,3);
                const cepD_curto = String(linha.cepIniD).substring(0,3);
                const id_rota_calc = `${linha.ufOrigem}-${linha.ufDestino} ${cepO_curto}-${cepD_curto}`.toUpperCase();

                const valores = [
                    id_rota_calc, 
                    String(payload.negociacao.docAriba).toUpperCase(),
                    payload.negociacao.dataAbertura || null, 
                    payload.negociacao.dataInicio || null, 
                    payload.negociacao.dataFinal || null,
                    String(payload.negociacao.modeloContratacao).toUpperCase(), 
                    String(payload.negociacao.tipoNegociacao).toUpperCase(),
                    String(payload.parametros.etapa).toUpperCase(), 
                    String(payload.parametros.fluxo).toUpperCase(),
                    parseInt(t.freeTime) || 0, 
                    parseInt(t.prazoEntrega) || 0, 
                    parseInt(t.prazoPagamento) || 0,
                    String(payload.parametros.transportador).toUpperCase(), 
                    String(linha.veiculo).toUpperCase(),
                    String(linha.carroceria).toUpperCase(), 
                    String(linha.combustivel).toUpperCase(),
                    String(payload.negociacao.incoterm).toUpperCase(), 
                    String(payload.parametros.cargaPerigosa).toUpperCase(),
                    String(payload.parametros.seguroCarga).toUpperCase(), 
                    String(linha.ufOrigem).toUpperCase(),
                    String(linha.cidOrigem).toUpperCase(), 
                    linha.cepIniO, String(linha.ufDestino).toUpperCase(),
                    String(linha.cidDestino).toUpperCase(), 
                    linha.cepIniD, linha.cepFimD,
                    String(linha.mesoDestino).toUpperCase(), 
                    String(payload.parametros.fatorCubagem).toUpperCase(),
                    String(faixa).replace(/ /g, '_').toUpperCase(), 
                    valorFaixa, 
                    pt(t.freteLotacao),
                    
                    // Taxas Acessórias
                    pt(t.grisPct), 
                    pt(t.advlrPct), 
                    pt(t.trtPct), 
                    pt(t.trtFixo), 
                    pt(t.trtMin), 
                    pt(t.tdePct), 
                    pt(t.tdeFixo), 
                    pt(t.tdeMin),
                    pt(t.tdaPct), 
                    pt(t.tdaFixo), 
                    pt(t.tdaMin), 
                    pt(t.tsoPct), 
                    pt(t.tsoFixo), 
                    pt(t.tsoMin), 
                    pt(t.suframa),
                    pt(t.segFluvialPct), 
                    pt(t.segFluvialFixo), 
                    pt(t.segFluvialMin),
                    pt(t.pedagioFixo), 
                    pt(t.pedagioFracao), 
                    pt(t.pedagioKg), 
                    pt(t.emexPct), 
                    pt(t.emexFixo), 
                    pt(t.emexMin),
                    pt(t.emissaoCte), 
                    pt(t.agendamento), 
                    pt(t.armazenagem), 
                    pt(t.paletizacao),
                    pt(t.reentregaPct), 
                    pt(t.devolucaoPct), 
                    pt(t.diaria), 
                    pt(t.cargaDescarga),
                    
                    payload.usuario.nome, 
                    payload.usuario.email, 
                    dataHoraPlanilha
                ];
                
                await client.query(queryInsert, valores);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: 'Tabela de frete inserida (Unpivoted) no Postgres AWS com sucesso!' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro na gravação da Tabela de Fretes:', error);
        res.status(500).json({ erro: 'Falha ao gravar no banco de dados AWS. Transação revertida.' });
    } finally {
        client.release();
    }
    */
};