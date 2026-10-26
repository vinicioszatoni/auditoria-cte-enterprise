const bigquery = require('../config/bigquery');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const DATASET_ID = 'transportes';

const VIEW_DASHBOARD = `\`${PROJECT_ID}.${DATASET_ID}.vw_indicadores_auditoria_ctes\``;
const VIEW_FILA = `\`${PROJECT_ID}.${DATASET_ID}.vw_fila_auditoria_ctes\``;
const VIEW_HISTORICO = `\`${PROJECT_ID}.${DATASET_ID}.vw_historico_tratativas\``;

exports.getDadosBigQuery = async (req, res) => {
    try {
        const filtros = req.body || {};
        
        let whereGlobal = "1=1";
        if (filtros.transportador && filtros.transportador !== 'Todos') whereGlobal += ` AND grp_transportador = '${filtros.transportador}'`;
        if (filtros.fluxo && filtros.fluxo !== 'Todos') whereGlobal += ` AND des_fluxo_logistico = '${filtros.fluxo}'`;
        if (filtros.rotaUf && filtros.rotaUf !== 'Todos') whereGlobal += ` AND c_rota_uf = '${filtros.rotaUf}'`;
        if (filtros.rotaCid && filtros.rotaCid !== 'Todos') whereGlobal += ` AND c_rota_cid = '${filtros.rotaCid}'`;
        
        // Novos Filtros Globais de Origem e Destino
        if (filtros.ufOrigem && filtros.ufOrigem !== 'Todos') whereGlobal += ` AND c_rota_uf LIKE '${filtros.ufOrigem} > %'`;
        if (filtros.ufDestino && filtros.ufDestino !== 'Todos') whereGlobal += ` AND c_rota_uf LIKE '% > ${filtros.ufDestino}'`;
        if (filtros.cidadeOrigem && filtros.cidadeOrigem !== 'Todos') whereGlobal += ` AND c_rota_cid LIKE '${filtros.cidadeOrigem} > %'`;
        if (filtros.cidadeDestino && filtros.cidadeDestino !== 'Todos') whereGlobal += ` AND c_rota_cid LIKE '% > ${filtros.cidadeDestino}'`;

        let colFretePeso = "IFNULL(diff_frete_peso,0)";
        let colPedagio = "IFNULL(diff_pedagio,0)";
        let colSeccat = "IFNULL(diff_seccat,0)";
        let colGris = "IFNULL(diff_gris,0)";
        let colAdvlr = "IFNULL(diff_advlr,0)";
        let colTde = "IFNULL(diff_tde,0)";

        if (filtros.duplicidade === 'SEM_IMPACTO') {
            const zeraSeDuplo = "CASE WHEN flg_cte_peso_duplicado = 'X' THEN 0 ELSE";
            colFretePeso = `(${zeraSeDuplo} ${colFretePeso} END)`;
            colPedagio = `(${zeraSeDuplo} ${colPedagio} END)`;
            colSeccat = `(${zeraSeDuplo} ${colSeccat} END)`;
            colGris = `(${zeraSeDuplo} ${colGris} END)`;
            colAdvlr = `(${zeraSeDuplo} ${colAdvlr} END)`;
            colTde = `(${zeraSeDuplo} ${colTde} END)`;
        }

        const calcPos = col => `(CASE WHEN ${col} > 0 THEN ${col} ELSE 0 END)`;
        const calcNeg = col => `(CASE WHEN ${col} < 0 THEN ABS(${col}) ELSE 0 END)`;
        const calcAbs = col => `ABS(${col})`;

        const diffPos = `${calcPos(colFretePeso)} + ${calcPos(colPedagio)} + ${calcPos(colSeccat)} + ${calcPos(colGris)} + ${calcPos(colAdvlr)} + ${calcPos(colTde)}`;
        const diffNeg = `${calcNeg(colFretePeso)} + ${calcNeg(colPedagio)} + ${calcNeg(colSeccat)} + ${calcNeg(colGris)} + ${calcNeg(colAdvlr)} + ${calcNeg(colTde)}`;
        const diffAbs = `${calcAbs(colFretePeso)} + ${calcAbs(colPedagio)} + ${calcAbs(colSeccat)} + ${calcAbs(colGris)} + ${calcAbs(colAdvlr)} + ${calcAbs(colTde)}`;

        let whereMes = "1=1";
        if (filtros.mes && filtros.mes !== 'Todos') whereMes = `c_mes = '${filtros.mes}'`; 

        const baseCTEs = `
            WITH BaseGlobal AS (
                SELECT *,
                    (${diffPos}) as diff_pos_calc, (${diffNeg}) as diff_neg_calc, (${diffAbs}) as diff_abs_calc,
                    ${colFretePeso} as t_peso, ${colPedagio} as t_pedagio, ${colSeccat} as t_sec,
                    ${colGris} as t_gris, ${colAdvlr} as t_adv, ${colTde} as t_tde,
                    SPLIT(c_rota_uf, ' > ')[OFFSET(0)] as uf_origem
                FROM ${VIEW_DASHBOARD} WHERE ${whereGlobal}
            ),
            BaseMes AS ( SELECT * FROM BaseGlobal WHERE ${whereMes} )
        `;

        // =========================================================
        // EXTRAÇÃO INTELIGENTE DE FILTROS (Adicionado c_mes para ativar as datas)
        // =========================================================
        const queryFiltros = `
          SELECT 
            ARRAY(SELECT DISTINCT c_mes FROM ${VIEW_DASHBOARD} WHERE c_mes IS NOT NULL) AS meses,
            ARRAY(SELECT DISTINCT grp_transportador FROM ${VIEW_DASHBOARD} WHERE grp_transportador IS NOT NULL) AS transportadores,
            ARRAY(SELECT DISTINCT des_fluxo_logistico FROM ${VIEW_DASHBOARD} WHERE des_fluxo_logistico IS NOT NULL) AS fluxos,
            
            ARRAY(SELECT DISTINCT documento_ariba_ws FROM ${VIEW_HISTORICO} WHERE documento_ariba_ws IS NOT NULL) AS tabelas,
            ARRAY(SELECT DISTINCT des_faixa FROM ${VIEW_HISTORICO} WHERE des_faixa IS NOT NULL) AS faixas,
            ARRAY(SELECT DISTINCT uf_remetente FROM ${VIEW_HISTORICO} WHERE uf_remetente IS NOT NULL) AS ufsOrigem,
            ARRAY(SELECT DISTINCT uf_destinatario FROM ${VIEW_HISTORICO} WHERE uf_destinatario IS NOT NULL) AS ufsDestino,
            ARRAY(SELECT DISTINCT rota_uf FROM ${VIEW_HISTORICO} WHERE rota_uf IS NOT NULL) AS rotasUf,
            ARRAY(SELECT DISTINCT cidade_remetente FROM ${VIEW_HISTORICO} WHERE cidade_remetente IS NOT NULL) AS cidadesOrigem,
            ARRAY(SELECT DISTINCT cidade_destinatario FROM ${VIEW_HISTORICO} WHERE cidade_destinatario IS NOT NULL) AS cidadesDestino,
            ARRAY(SELECT DISTINCT rota_cidade FROM ${VIEW_HISTORICO} WHERE rota_cidade IS NOT NULL) AS rotasCid,
            ARRAY(SELECT DISTINCT id_rota FROM ${VIEW_HISTORICO} WHERE id_rota IS NOT NULL) AS idsRota
        `;
        const queryKPIs = `${baseCTEs} SELECT SUM(vlr_frete_bruto_spend) as freteBruto, SUM(CASE WHEN status_auditoria != 'Pendente' THEN vlr_frete_bruto_spend ELSE 0 END) as freteAuditadoVal, SUM(qtd_ctes) as volCtes, SUM(CASE WHEN status_auditoria != 'Pendente' THEN qtd_ctes ELSE 0 END) as volAuditadoVal, SUM(diff_abs_calc) as divTotal, SUM(diff_neg_calc) as divNeg, SUM(diff_pos_calc) as divPos, SUM(CASE WHEN diagnostico_cte = 'Sem Divergência' THEN qtd_ctes ELSE 0 END) as volSemDiv, SUM(CASE WHEN diagnostico_cte = 'Margem Aceitável' THEN qtd_ctes ELSE 0 END) as volMargem, SUM(CASE WHEN diagnostico_cte != 'Sem Divergência' AND diagnostico_cte != 'Margem Aceitável' THEN qtd_ctes ELSE 0 END) as volDivergente FROM BaseMes`;
        const queryEvolucao = `${baseCTEs} SELECT c_mes as mes, SUM(CASE WHEN status_auditoria != 'Pendente' THEN vlr_frete_bruto_spend ELSE 0 END) as auditadoR, SUM(vlr_frete_bruto_spend) as faturadoR, SUM(CASE WHEN status_auditoria != 'Pendente' THEN qtd_ctes ELSE 0 END) as auditadoV, SUM(qtd_ctes) as faturadoV FROM BaseGlobal WHERE c_mes IS NOT NULL GROUP BY mes ORDER BY mes ASC LIMIT 12`;
        
        const queryTaxasMensal = `${baseCTEs} SELECT c_mes as mes, SUM(ABS(t_peso)) as frete_peso, SUM(ABS(t_pedagio)) as pedagio, SUM(ABS(t_sec)) as seccat, SUM(ABS(t_gris)) as gris, SUM(ABS(t_adv)) as advlr, SUM(ABS(t_tde)) as tde FROM BaseGlobal WHERE c_mes IS NOT NULL GROUP BY mes ORDER BY mes ASC LIMIT 12`;
        
        const queryTranspStack = `${baseCTEs} SELECT grp_transportador as transportador, SUM(CASE WHEN status_auditoria != 'Pendente' THEN vlr_frete_bruto_spend ELSE 0 END) as auditado, SUM(vlr_frete_bruto_spend) as faturado FROM BaseMes WHERE grp_transportador IS NOT NULL GROUP BY grp_transportador ORDER BY faturado DESC LIMIT 10`;
        const queryRotaStack = `${baseCTEs} SELECT c_rota_uf as rota, SUM(CASE WHEN status_auditoria != 'Pendente' THEN vlr_frete_bruto_spend ELSE 0 END) as auditado, SUM(vlr_frete_bruto_spend) as faturado FROM BaseMes WHERE c_rota_uf IS NOT NULL GROUP BY c_rota_uf ORDER BY faturado DESC LIMIT 10`;
        const queryMapaUF = `${baseCTEs} SELECT CONCAT('BR-', uf_origem) as uf, IFNULL(SUM(CASE WHEN status_auditoria != 'Pendente' THEN vlr_frete_bruto_spend ELSE 0 END) / NULLIF(SUM(vlr_frete_bruto_spend), 0) * 100, 0) as pct_auditado FROM BaseMes WHERE uf_origem IS NOT NULL GROUP BY uf`;

        const queryCardsTaxas = `${baseCTEs} SELECT SUM(ABS(t_peso)) as absPeso, SUM(${calcNeg('t_peso')}) as negPeso, SUM(${calcPos('t_peso')}) as posPeso, SUM(ABS(t_pedagio)) as absPedagio, SUM(${calcNeg('t_pedagio')}) as negPedagio, SUM(${calcPos('t_pedagio')}) as posPedagio, SUM(ABS(t_gris)) as absGris, SUM(${calcNeg('t_gris')}) as negGris, SUM(${calcPos('t_gris')}) as posGris, SUM(ABS(t_adv)) as absAdvlr, SUM(${calcNeg('t_adv')}) as negAdvlr, SUM(${calcPos('t_adv')}) as posAdvlr, SUM(ABS(t_sec)) as absSeccat, SUM(${calcNeg('t_sec')}) as negSeccat, SUM(${calcPos('t_sec')}) as posSeccat, SUM(ABS(t_tde)) as absTde, SUM(${calcNeg('t_tde')}) as negTde, SUM(${calcPos('t_tde')}) as posTde FROM BaseMes`;
        const queryMensalDiv = `${baseCTEs} SELECT c_mes as mes, SUM(CASE WHEN diagnostico_cte != 'Sem Divergência' AND diagnostico_cte != 'Margem Aceitável' THEN qtd_ctes ELSE 0 END) as qtd_divergente, SUM(diff_neg_calc) as valor_negativo, SUM(diff_pos_calc) as valor_positivo FROM BaseGlobal WHERE c_mes IS NOT NULL GROUP BY mes ORDER BY mes ASC LIMIT 12`;
        const queryRotasCidDiff = `${baseCTEs} SELECT c_rota_cid as rota, SUM(diff_neg_calc) as valor_neg, SUM(diff_pos_calc) as valor_pos FROM BaseMes WHERE c_rota_cid IS NOT NULL GROUP BY c_rota_cid`;
        const queryMatrizFarol = `${baseCTEs} SELECT 'Frete Peso' as taxa, SUM(CASE WHEN ABS(t_peso) <= 0.01 THEN qtd_ctes ELSE 0 END) as sem_div, SUM(CASE WHEN ABS(t_peso) > 0.01 AND ABS(t_peso) <= 0.50 THEN qtd_ctes ELSE 0 END) as aceitavel, SUM(CASE WHEN ABS(t_peso) > 0.50 THEN qtd_ctes ELSE 0 END) as divergente FROM BaseMes UNION ALL SELECT 'Pedágio' as taxa, SUM(CASE WHEN ABS(t_pedagio) <= 0.01 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_pedagio) > 0.01 AND ABS(t_pedagio) <= 0.50 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_pedagio) > 0.50 THEN qtd_ctes ELSE 0 END) FROM BaseMes UNION ALL SELECT 'GRIS' as taxa, SUM(CASE WHEN ABS(t_gris) <= 0.01 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_gris) > 0.01 AND ABS(t_gris) <= 0.50 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_gris) > 0.50 THEN qtd_ctes ELSE 0 END) FROM BaseMes UNION ALL SELECT 'Ad Valorem' as taxa, SUM(CASE WHEN ABS(t_adv) <= 0.01 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_adv) > 0.01 AND ABS(t_adv) <= 0.50 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_adv) > 0.50 THEN qtd_ctes ELSE 0 END) FROM BaseMes UNION ALL SELECT 'SEC/CAT' as taxa, SUM(CASE WHEN ABS(t_sec) <= 0.01 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_sec) > 0.01 AND ABS(t_sec) <= 0.50 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_sec) > 0.50 THEN qtd_ctes ELSE 0 END) FROM BaseMes UNION ALL SELECT 'TDE' as taxa, SUM(CASE WHEN ABS(t_tde) <= 0.01 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_tde) > 0.01 AND ABS(t_tde) <= 0.50 THEN qtd_ctes ELSE 0 END), SUM(CASE WHEN ABS(t_tde) > 0.50 THEN qtd_ctes ELSE 0 END) FROM BaseMes`;
        const queryTabelaAuxiliar = `${baseCTEs} SELECT grp_transportador as transportador, c_rota_cid as rota, SUM(qtd_ctes) as qtd_total, SUM(CASE WHEN diagnostico_cte != 'Sem Divergência' AND diagnostico_cte != 'Margem Aceitável' THEN qtd_ctes ELSE 0 END) as qtd_div, SUM(vlr_frete_bruto_spend) as faturamento, SUM(diff_neg_calc) as div_neg, SUM(diff_pos_calc) as div_pos, SUM(diff_abs_calc) as div_abs FROM BaseMes GROUP BY 1, 2 ORDER BY div_abs DESC LIMIT 50`;

        // =========================================================
        // FILTROS EXCLUSIVOS PARA A VIEW DA FILA DE AUDITORIA
        // =========================================================
        const condicoes = [];
        
        if (filtros.transportador && filtros.transportador !== 'Todos') condicoes.push(`grp_transportador = '${filtros.transportador}'`);
        // Correção da extração de Data/Mês para as views cruas (Fila/Histórico)
        if (filtros.mes && filtros.mes !== 'Todos') condicoes.push(`SUBSTR(CAST(dt_hr_emissao AS STRING), 1, 7) = '${filtros.mes}'`);
        if (filtros.fluxo && filtros.fluxo !== 'Todos') condicoes.push(`des_fluxo_logistico = '${filtros.fluxo}'`);
        
        // Uso de nomes tolerantes para Rota na View da Fila (trata nulos e aliases)
        if (filtros.rotaUf && filtros.rotaUf !== 'Todos') condicoes.push(`(rota_uf = '${filtros.rotaUf}' OR c_rota_uf = '${filtros.rotaUf}')`);
        if (filtros.rotaCid && filtros.rotaCid !== 'Todos') condicoes.push(`(rota_cidade = '${filtros.rotaCid}' OR c_rota_cid = '${filtros.rotaCid}')`);
        
        // Cidades Origem/Destino com wildcard
        if (filtros.ufOrigem && filtros.ufOrigem !== 'Todos') condicoes.push(`(uf_remetente = '${filtros.ufOrigem}' OR c_rota_uf LIKE '${filtros.ufOrigem} > %')`);
        if (filtros.ufDestino && filtros.ufDestino !== 'Todos') condicoes.push(`(uf_destinatario = '${filtros.ufDestino}' OR c_rota_uf LIKE '% > ${filtros.ufDestino}')`);
        if (filtros.cidadeOrigem && filtros.cidadeOrigem !== 'Todos') condicoes.push(`(cidade_remetente = '${filtros.cidadeOrigem}' OR c_rota_cid LIKE '${filtros.cidadeOrigem} > %')`);
        if (filtros.cidadeDestino && filtros.cidadeDestino !== 'Todos') condicoes.push(`(cidade_destinatario = '${filtros.cidadeDestino}' OR c_rota_cid LIKE '% > ${filtros.cidadeDestino}')`);
        // Se houver condições, junta com " AND ". Se não, retorna string vazia.
        const whereClause = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
        
        let queryTabela;

        if (filtros.abaAtiva === 'relatorio_dinamico') {
            const rel = [];
            
            // Construção progressiva da Query baseada apenas nos campos preenchidos
            if (filtros.dt_inicio && filtros.dt_fim) rel.push(`DATE(dt_hr_emissao) BETWEEN '${filtros.dt_inicio}' AND '${filtros.dt_fim}'`);
            else if (filtros.dt_inicio) rel.push(`DATE(dt_hr_emissao) >= '${filtros.dt_inicio}'`);
            
            if (filtros.transportador) rel.push(`grp_transportador LIKE '%${filtros.transportador}%'`);
            if (filtros.fluxo) rel.push(`des_fluxo_logistico = '${filtros.fluxo}'`);
            if (filtros.tabelaPreco) rel.push(`documento_ariba_ws LIKE '%${filtros.tabelaPreco}%'`);
            if (filtros.ufOrigem) rel.push(`uf_remetente = '${filtros.ufOrigem}'`);
            if (filtros.ufDestino) rel.push(`uf_destinatario = '${filtros.ufDestino}'`);
            if (filtros.rotaUf) rel.push(`rota_uf = '${filtros.rotaUf}'`);
            if (filtros.cidadeOrigem) rel.push(`cidade_remetente LIKE '%${filtros.cidadeOrigem}%'`);
            if (filtros.cidadeDestino) rel.push(`cidade_destinatario LIKE '%${filtros.cidadeDestino}%'`);
            if (filtros.rotaCidade) rel.push(`rota_cidade = '${filtros.rotaCidade}'`);
            if (filtros.idRota) rel.push(`id_rota = '${filtros.idRota}'`);
            if (filtros.faixa) rel.push(`des_faixa = '${filtros.faixa}'`);

            const whereRelatorio = rel.length > 0 ? `WHERE ${rel.join(' AND ')}` : '';
            queryTabela = `SELECT * FROM ${VIEW_HISTORICO} ${whereRelatorio} LIMIT 2000`; // Limite maior para extração

        } else if (filtros.abaAtiva === 'auditoria' || filtros.abaAtiva === 'analiseMassa') {
            queryTabela = `SELECT * FROM ${VIEW_FILA} ${whereClause} LIMIT 2000`;
        } else {
            queryTabela = `SELECT * FROM ${VIEW_DASHBOARD} WHERE ${whereGlobal} AND ${whereMes} LIMIT 500`;
        }

        const [ 
            [resFiltros], [resKPIs], [resEvolucao], [resTranspStack], [resRotaStack], [resMapaUF],
            [resCardsTaxas], [resMensalDiv], [resRotasCidDiff], [resMatriz], [resTabAuxiliar], [resTabela],
            [resTaxasMensal] // => PROMISE DEVOLVIDA!
        ] = await Promise.all([
            bigquery.createQueryJob({ query: queryFiltros }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryKPIs }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryEvolucao }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryTranspStack }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryRotaStack }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryMapaUF }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryCardsTaxas }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryMensalDiv }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryRotasCidDiff }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryMatrizFarol }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryTabelaAuxiliar }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryTabela }).then(job => job[0].getQueryResults()),
            bigquery.createQueryJob({ query: queryTaxasMensal }).then(job => job[0].getQueryResults()),
        ]);

        const evolucaoFormatada = resEvolucao.map(item => ({ ...item, pct: item.faturadoR > 0 ? Number(((item.auditadoR / item.faturadoR) * 100).toFixed(1)) : 0 }));
        const mapaFormatado = [["Estado", "% Auditado"]];
        resMapaUF.forEach(r => mapaFormatado.push([r.uf, Number(r.pct_auditado.toFixed(1))]));
        
        const objKpi = resKPIs[0] || {};
        const calcPct = (auditado, total) => total > 0 ? ((auditado / total) * 100).toFixed(1) : 0;
        const kpisReais = {
            freteBruto: objKpi.freteBruto || 0, freteAuditadoPct: calcPct(objKpi.freteAuditadoVal, objKpi.freteBruto), freteAuditadoVal: objKpi.freteAuditadoVal || 0,
            volCtes: objKpi.volCtes || 0, volAuditadoPct: calcPct(objKpi.volAuditadoVal, objKpi.volCtes), volAuditadoVal: objKpi.volAuditadoVal || 0,
            divTotal: objKpi.divTotal || 0, divNeg: objKpi.divNeg || 0, divPos: objKpi.divPos || 0, taxaDiv: calcPct(objKpi.volDivergente, objKpi.volCtes),
            volSemDiv: objKpi.volSemDiv || 0, volMargem: objKpi.volMargem || 0, volDivergente: objKpi.volDivergente || 0
        };
        const filtrosDisponiveis = resFiltros[0] || { meses: [], fluxos: [], transportadores: [], rotasUf: [], rotasCid: [] };
        filtrosDisponiveis.meses = filtrosDisponiveis.meses ? filtrosDisponiveis.meses.sort().reverse() : [];

        const rotasCidPos = resRotasCidDiff.filter(r => r.valor_pos > 0).map(r => ({ rota: r.rota, valor: r.valor_pos }));
        const rotasCidNeg = resRotasCidDiff.filter(r => r.valor_neg > 0).map(r => ({ rota: r.rota, valor: r.valor_neg }));

        res.status(200).json({ 
            kpis: kpisReais, evolucao: evolucaoFormatada, transpStack: resTranspStack, rotaStack: resRotaStack, mapaUF: mapaFormatado, filtrosOpcoes: filtrosDisponiveis,
            cardsAuditoria: resCardsTaxas[0] || {}, mensalDiv: resMensalDiv, rotasCidPos: rotasCidPos, rotasCidNeg: rotasCidNeg, matrizFarol: resMatriz, tabelaAuxiliar: resTabAuxiliar, tabela: resTabela,
            taxasMensal: resTaxasMensal
        });

    } catch (error) {
        console.error("Erro BQ:", error);
        res.status(500).json({ erro: "Erro ao buscar dados reais do BigQuery" });
    }
};

exports.postAcaoSheets = async (req, res) => { res.status(200).json({ sucesso: true, mensagem: `Documento ${req.body.status} com sucesso!` }); };