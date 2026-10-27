import React, { useState, useEffect, Fragment, useMemo } from 'react';
import axios from 'axios';
import { FaClipboardList, FaClock, FaHistory, FaSearch, FaFilter, FaArrowDown, FaArrowUp, FaTimes, FaSignInAlt, FaTruck, FaWeightHanging, FaRoad, FaFileInvoiceDollar, FaFileContract, FaChartLine, FaEye, FaCheck, FaBan, FaExclamationTriangle, FaCheckDouble, FaDownload, FaChartBar, FaLayerGroup } from 'react-icons/fa';
import { MdSpaceDashboard } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, LabelList, Legend } from 'recharts';
import { Chart as GeoChart } from "react-google-charts";
import './App.css';

// ================= ESTILOS E CORES PADRONIZADOS =================
const COR_POS = '#5DADE2';       
const COR_NEG = '#EB984E';       
const COR_VERDE = '#346E4A';     
const COR_VERDE_CLARO = '#A3B8AC'; 
const COR_OK = '#7DCEA0';        
const COR_WARN = '#F7DC6F';      
const COR_ERR = '#F1948A';       

const estiloTitulo = { fontSize: '12px', fontWeight: '700', color: '#2c3e50', margin: 0 };
const estiloRotulo = { fontSize: '10px', fontWeight: 'bold', fill: '#2c3e50' };
const estiloLegenda = { fontSize: '10px', fontWeight: 'bold', color: '#7f8c8d', paddingTop: '2px' };

// ============================================================================
// COMPONENTE: TELA DE RELATÓRIO (Histórico Dinâmico)
// ============================================================================
function TelaRelatorio({ filtrosOpcoes }) {
  const [filtrosRelatorio, setFiltrosRelatorio] = useState({
    dt_inicio: '', dt_fim: '', transportador: '', fluxo: '', tabelaPreco: '',
    ufOrigem: '', ufDestino: '', rotaUf: '', cidadeOrigem: '', cidadeDestino: '',
    rotaCidade: '', idRota: '', faixa: ''
  });
  
  const [tabela, setTabela] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const handleFilterChange = (e) => {
    setFiltrosRelatorio({ ...filtrosRelatorio, [e.target.name]: e.target.value });
  };

  const limparFiltros = () => {
    setFiltrosRelatorio({
      dt_inicio: '', dt_fim: '', transportador: '', fluxo: '', tabelaPreco: '',
      ufOrigem: '', ufDestino: '', rotaUf: '', cidadeOrigem: '', cidadeDestino: '',
      rotaCidade: '', idRota: '', faixa: ''
    });
  };

  const gerarRelatorio = () => {
    setCarregando(true);
    setBuscaRealizada(true);
    
    axios.post('http://localhost:3000/api/dados-dashboard', { abaAtiva: 'relatorio_dinamico', ...filtrosRelatorio })
      .then(response => {
        setTabela(response.data.tabela || []);
        setCarregando(false);
      })
      .catch(error => {
        console.error("Erro ao gerar relatório:", error);
        setCarregando(false);
      });
  };

  const exportarCSV = () => {
    if (tabela.length === 0) return alert('Nenhum dado para exportar.');
    const colunas = Object.keys(tabela[0]);
    const cabecalho = colunas.join(';');
    const linhas = tabela.map(row => colunas.map(col => {
      let val = row[col];
      if (val !== null && typeof val === 'object' && val.value) val = String(val.value).substring(0, 19).replace('T', ' ');
      return `"${String(val || '').replace(/"/g, '""')}"`;
    }).join(';'));
    
    const csvContent = "\uFEFF" + [cabecalho, ...linhas].join('\n'); 
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `relatorio_auditoria_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colunas = tabela.length > 0 ? Object.keys(tabela[0]) : [];

  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Relatório de Auditoria e Tratativas 📊</h5>
          <span className="text-muted" style={{ fontSize: '11px' }}>Defina os parâmetros abaixo para gerar o relatório.</span>
        </div>
        <button className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center" style={{ fontSize: '12px', backgroundColor: '#346E4A' }} onClick={exportarCSV} disabled={tabela.length === 0}>
          <FaDownload className="me-2"/> Exportar Excel (CSV)
        </button>
      </div>

      {/* Painel de Filtros mais compacto */}
      <div className="kpi-card p-2 mb-2 bg-white shadow-sm border-0 d-flex flex-column">
        <h6 className="fw-bold text-uppercase mb-2 ms-1" style={{ fontSize: '11px', color: '#7f8c8d' }}>Parâmetros de Extração</h6>
        
        <div className="row g-2 mb-2 px-1">
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Emissão (Início)</label>
            <input type="date" className="form-control form-control-sm border-secondary shadow-none" name="dt_inicio" value={filtrosRelatorio.dt_inicio} onChange={handleFilterChange} style={{ fontSize: '11px' }} />
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Emissão (Fim)</label>
            <input type="date" className="form-control form-control-sm border-secondary shadow-none" name="dt_fim" value={filtrosRelatorio.dt_fim} onChange={handleFilterChange} style={{ fontSize: '11px' }} />
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Transportador</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="transportador" value={filtrosRelatorio.transportador} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todos</option>
              {filtrosOpcoes?.transportadores?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Fluxo Logístico</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="fluxo" value={filtrosRelatorio.fluxo} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todos</option>
              {filtrosOpcoes?.fluxos?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Tabela Ariba</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="tabelaPreco" value={filtrosRelatorio.tabelaPreco} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.tabelas?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Faixa de Cobrança</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="faixa" value={filtrosRelatorio.faixa} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.faixas?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>UF Origem</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="ufOrigem" value={filtrosRelatorio.ufOrigem} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.ufsOrigem?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>UF Destino</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="ufDestino" value={filtrosRelatorio.ufDestino} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.ufsDestino?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Rota UF</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="rotaUf" value={filtrosRelatorio.rotaUf} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.rotasUf?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Cidade Origem</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="cidadeOrigem" value={filtrosRelatorio.cidadeOrigem} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.cidadesOrigem?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Cidade Destino</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="cidadeDestino" value={filtrosRelatorio.cidadeDestino} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.cidadesDestino?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>Rota Cidade</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="rotaCidade" value={filtrosRelatorio.rotaCidade} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todas</option>
              {filtrosOpcoes?.rotasCid?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-md-2 mt-1">
            <label className="form-label mb-0" style={{ fontSize: '10px', fontWeight: 'bold' }}>ID Rota</label>
            <select className="form-select form-select-sm border-secondary shadow-none" name="idRota" value={filtrosRelatorio.idRota} onChange={handleFilterChange} style={{ fontSize: '11px' }}>
              <option value="">Todos</option>
              {filtrosOpcoes?.idsRota?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        
        {/* Rodapé colado com os inputs */}
        <div className="d-flex justify-content-end gap-2 border-top pt-2 px-1 mt-auto">
          <button className="btn btn-sm btn-light fw-bold shadow-sm" style={{ fontSize: '12px', backgroundColor: '#c1c3c5' }} onClick={limparFiltros}>Limpar Campos</button>
          <button className="btn btn-sm text-white fw-bold shadow-sm" style={{ fontSize: '12px', backgroundColor: '#2c3e50' }} onClick={gerarRelatorio}>
            {carregando ? 'Consultando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      <div className="kpi-card p-0 overflow-hidden d-flex flex-column flex-grow-1 bg-white">
        {!buscaRealizada ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1 text-muted fw-bold" style={{ fontSize: '13px' }}>
            Preencha os parâmetros e clique em "Gerar Relatório".
          </div>
        ) : carregando ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <div className="spinner-border" style={{ color: '#346E4A' }}></div>
          </div>
        ) : tabela.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center flex-grow-1 text-muted fw-bold">
            Nenhum dado encontrado para os filtros informados.
          </div>
        ) : (
          <div className="custom-scrollbar" style={{ overflow: 'auto', flex: 1 }}>
            <table className="table table-hover table-sm mb-0 text-center align-middle" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
              <thead className="bg-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
                  {colunas.map((col, idx) => <th key={idx} className="px-3 border-end">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {tabela.map((row, idx) => (
                  <tr key={idx}>
                    {colunas.map((col, cIdx) => {
                      let valorCell = row[col];
                      // Correção definitiva para objetos de Data vindos do BQ
                      if (valorCell !== null && typeof valorCell === 'object' && valorCell.value) {
                        valorCell = String(valorCell.value).substring(0, 19).replace('T', ' ');
                      } else if (valorCell !== null) {
                        valorCell = String(valorCell);
                      } else {
                        valorCell = '-';
                      }
                      return <td key={cIdx} className="px-3 border-end border-bottom">{valorCell}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: TELA DE ANÁLISE EM MASSA (NOVO UI/UX)
// ============================================================================
function TelaAnaliseMassa({ dados, onSalvarTratativas }) {
  const [taxaAtiva, setTaxaAtiva] = useState('SECCAT');
  const [padraoSelecionado, setPadraoSelecionado] = useState(null);

  // Estados do Modal
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [decisaoFinal, setDecisaoFinal] = useState('');
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [obsLivre, setObsLivre] = useState('');

  const { tabela = [] } = dados || {};

  const agrupamentoReal = useMemo(() => {
    const grupos = {};

    tabela.forEach(row => {
      let diffUnit = 0, valorTaxa = 0, valorTabela = 0, tarifaNegociada = 0;

      if (taxaAtiva === 'FRETE_PESO') { 
        diffUnit = Number(row.diff_frete_peso || 0); valorTaxa = Number(row.vlr_frete_peso_spend || 0); 
        valorTabela = Number(row.vlr_frete_peso_tabela || 0); tarifaNegociada = Number(row.vlr_tarifa_frete_peso || 0);
      }
      else if (taxaAtiva === 'PEDAGIO') { 
        diffUnit = Number(row.diff_pedagio || 0); valorTaxa = Number(row.vlr_pedagio_spend || 0); 
        valorTabela = Number(row.vlr_pedagio_tabela || 0); 
        if (Number(row.pedagio_vlr_fixo_tabela || 0) > 0) tarifaNegociada = Number(row.pedagio_vlr_fixo_tabela);
        else if (Number(row.pedagio_fracao_kg_tabela || 0) > 0) tarifaNegociada = Number(row.pedagio_fracao_kg_tabela);
        else tarifaNegociada = Number(row.pedagio_kg_tabela || 0);
      }
      else if (taxaAtiva === 'GRIS') { 
        diffUnit = Number(row.diff_gris || 0); valorTaxa = Number(row.vlr_gris_spend || 0); 
        valorTabela = Number(row.vlr_gris_tabela || 0); tarifaNegociada = Number(row.vlr_gris_tabela || 0);
      }
      else if (taxaAtiva === 'ADVLR') { 
        diffUnit = Number(row.diff_advlr || 0); valorTaxa = Number(row.vlr_advlr_spend || 0); 
        valorTabela = Number(row.vlr_advlr_tabela || 0); tarifaNegociada = Number(row.vlr_advlr_tabela || 0);
      }
      else if (taxaAtiva === 'SECCAT') { 
        diffUnit = Number(row.diff_emissao_seccat || 0); valorTaxa = Number(row.vlr_emissao_seccat_spend || 0); 
        valorTabela = Number(row.vlr_emissao_seccat_tabela || 0); tarifaNegociada = Number(row.vlr_emissao_seccat_tabela || 0);
      }
      else if (taxaAtiva === 'TDE') { 
        diffUnit = Number(row.diff_tde || 0); valorTaxa = Number(row.vlr_tde_spend || 0); 
        valorTabela = Number(row.vlr_tde_tabela || 0); tarifaNegociada = Number(row.vlr_tde_tabela || 0);
      }

      if (Math.abs(diffUnit) <= 0.01) return;

      const transportador = row.grp_transportador || 'N/A';
      const rota = row.rota_uf || row.c_rota_uf || 'N/A';
      const tabelaAriba = row.documento_ariba_ws || 'N/A';
      
      let divergenciaPct = 0;
      if (valorTabela > 0) divergenciaPct = Number((((valorTaxa - valorTabela) / valorTabela) * 100).toFixed(1));
      else if (valorTaxa > 0) divergenciaPct = 100;

      const tarifaAgrupamento = tarifaNegociada.toFixed(4);
      const chaveGrupo = `${transportador}|${tabelaAriba}|${rota}|${tarifaAgrupamento}|${divergenciaPct}`;

      if (!grupos[chaveGrupo]) {
        grupos[chaveGrupo] = {
          id: chaveGrupo, transportador, rota, tabelaAriba, tarifaNegociada, divergenciaPct,
          qtd: 0, impacto: 0, ctes: []
        };
      }

      const extrairData = (campoData) => {
        if (!campoData) return 'N/A';
        return (typeof campoData === 'object' && campoData.value ? String(campoData.value) : String(campoData)).substring(0, 10);
      };

      grupos[chaveGrupo].qtd += 1;
      grupos[chaveGrupo].impacto += diffUnit;
      grupos[chaveGrupo].ctes.push({
        chave: row.cod_chave_acesso || 'N/A', emissao: extrairData(row.dt_hr_emissao),
        tabela: tabelaAriba, inicioVig: extrairData(row.dt_inicio_vigencia), fimVig: extrairData(row.dt_final_vigencia),
        ufOrigem: row.uf_remetente || (row.c_rota_uf ? row.c_rota_uf.split(' > ')[0] : 'N/A'),
        cidOrigem: row.cidade_remetente || 'N/A',
        ufDestino: row.uf_destinatario || (row.c_rota_uf ? row.c_rota_uf.split(' > ')[1] : 'N/A'),
        cidDestino: row.cidade_destinatario || 'N/A',
        valorTaxa, valorTabela, diferenca: diffUnit
      });
    });

    return Object.values(grupos).sort((a, b) => Math.abs(b.impacto) - Math.abs(a.impacto));
  }, [tabela, taxaAtiva]);

  const fecharModal = () => {
    setPadraoSelecionado(null); setItensSelecionados([]); setDecisaoFinal(''); setMotivoReprovacao(''); setObsLivre('');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked && padraoSelecionado) setItensSelecionados(padraoSelecionado.ctes.map(c => c.chave));
    else setItensSelecionados([]);
  };

  const handleSelectItem = (chave, isChecked) => {
    if (isChecked) setItensSelecionados([...itensSelecionados, chave]);
    else setItensSelecionados(itensSelecionados.filter(i => i !== chave));
  };

  const isBotaoGravarHabilitado = () => {
    if (itensSelecionados.length === 0) return false;
    if (!decisaoFinal) return false;
    if (decisaoFinal === 'REPROVAR' && !motivoReprovacao) return false;
    return true;
  };

  const gravarAuditoria = () => {
    const payload = itensSelecionados.map(chave => ({ chave, taxa: taxaAtiva, status: decisaoFinal, motivo: motivoReprovacao, obs: obsLivre }));
    onSalvarTratativas(payload); 
    alert(`${itensSelecionados.length} CT-es ${decisaoFinal === 'APROVAR' ? 'aprovados' : 'reprovados'} com sucesso!`);
    fecharModal();
  };

  const taxas = [
    { id: 'FRETE_PESO', nome: 'Frete Peso' }, { id: 'PEDAGIO', nome: 'Pedágio' },
    { id: 'GRIS', nome: 'GRIS' }, { id: 'ADVLR', nome: 'Ad Valorem' },
    { id: 'SECCAT', nome: 'SEC/CAT' }, { id: 'TDE', nome: 'TDE' }
  ];

  const formatarMoeda = (valor) => valor ? Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';

  const exportarLoteCSV = () => {
    if (!padraoSelecionado || padraoSelecionado.ctes.length === 0) return;
    const colunas = Object.keys(padraoSelecionado.ctes[0]);
    const cabecalho = colunas.join(';');
    const linhas = padraoSelecionado.ctes.map(row => colunas.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(';'));
    const csvContent = "\uFEFF" + [cabecalho, ...linhas].join('\n'); 
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `lote_analise_${taxaAtiva}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLogoTransportador = (nome) => {
    if (!nome) return null;
    const nomeBusca = nome.toLowerCase();
    if (nomeBusca.includes('patrus')) return '/patrus.png';
    if (nomeBusca.includes('bertolini')) return '/bertolini.png';
    return null;
  };

  return (
    <div className="d-flex flex-column gap-3" style={{ height: '100%' }}>
      <div className="px-2 mt-1">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Auditoria Por Taxas</h4>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Agrupamento automático de divergências</span>
      </div>

      {/* SELETOR DE TAXAS MODERNO */}
      <div className="d-flex gap-2" style={{ alignItems: 'center' }}>
        {taxas.map(t => {
          const isAtivo = taxaAtiva === t.id;
          return (
            <button 
              key={t.id} 
              className={`btn shadow-sm fw-bold`} 
              style={{ 
                backgroundColor: isAtivo ? 'var(--dark-highlight)' : 'var(--card-solid)', 
                color: isAtivo ? 'white' : 'var(--text-secondary)',
                fontSize: '12px', 
                borderRadius: 'var(--radius-pill)', 
                padding: '0 24px',
                minHeight: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: isAtivo ? 'none' : '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              onClick={() => setTaxaAtiva(t.id)}
            >
              {t.nome}
            </button>
          );
        })}
      </div>

      {/* GRELHA DE AGRUPAMENTOS GLASS */}
      <div className="glass-panel p-0 overflow-hidden d-flex flex-column flex-grow-1">
        <div className="custom-scrollbar" style={{ overflow: 'auto', flex: 1 }}>
          <table className="table table-borderless table-hover table-sm mb-0 align-middle text-center" style={{ fontSize: '12px', backgroundColor: 'transparent' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', zIndex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <tr className="text-uppercase" style={{ fontSize: '10px', color: 'var(--text-aux)' }}>
                <th className="px-3 py-3 text-start">Transportador</th>
                <th className="px-3 py-3">Tabela Ariba</th>
                <th className="px-3 py-3">Rota (UF)</th>
                <th className="px-3 py-3">Tarifa Negociada</th>
                <th className="px-3 py-3">Divergência (%)</th>
                <th className="px-3 py-3">Volume</th>
                <th className="px-3 py-3">Impacto (R$)</th>
                <th className="px-3 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {agrupamentoReal.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                  <td className="px-3 py-2 text-start fw-bold" style={{ color: 'var(--primary)' }}>
                    <div className="d-flex align-items-center gap-2">
                      {getLogoTransportador(row.transportador) && (
                        <img src={getLogoTransportador(row.transportador)} alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '4px' }} />
                      )}
                      <span>{row.transportador}</span>
                    </div>
                  </td>
                  <td className="px-3 fw-bold" style={{ color: 'var(--text-secondary)' }}>{row.tabelaAriba}</td>
                  <td className="px-3">
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontSize: '11px' }}>{row.rota}</span>
                  </td>
                  <td className="px-3 fw-bold" style={{ color: 'var(--text-main)' }}>R$ {formatarMoeda(row.tarifaNegociada)}</td>
                  <td className="px-3 fw-bold" style={{ color: row.divergenciaPct > 0 ? 'var(--status-error-txt)' : (row.divergenciaPct < 0 ? 'var(--status-success-txt)' : 'var(--text-main)') }}>
                    {row.divergenciaPct > 0 ? '+' : ''}{row.divergenciaPct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </td>
                  <td className="px-3">
                    <span style={{ backgroundColor: 'var(--text-aux)', color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: '700' }}>{row.qtd}</span>
                  </td>
                  <td className="px-3 fw-bold" style={{ color: row.impacto < 0 ? 'var(--status-error-txt)' : 'var(--status-success-txt)' }}>R$ {formatarMoeda(row.impacto)}</td>
                  <td className="px-3">
                    <button className="btn btn-sm fw-bold shadow-sm" style={{ backgroundColor: 'var(--card-solid)', color: 'var(--primary)', fontSize: '11px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }} onClick={() => setPadraoSelecionado(row)}>
                      Auditar Lote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALHES COM GLASSMORPHISM */}
      {padraoSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 32, 42, 0.4)', backdropFilter: 'blur(6px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel d-flex flex-column" style={{ width: '1500px', maxWidth: '95vw', maxHeight: '95vh', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--card-solid)', border: 'none', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
              <div>
                <h6 className="fw-bold mb-1 text-start" style={{ color: 'var(--text-main)', fontSize: '16px' }}>Lote de Divergência: {taxaAtiva}</h6>
                <span className="fw-bold" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Transportador: <span style={{color: 'var(--primary)'}}>{padraoSelecionado.transportador}</span> | Tabela: <span style={{color: 'var(--primary)'}}>{padraoSelecionado.tabelaAriba}</span> | Rota: <span style={{color: 'var(--primary)'}}>{padraoSelecionado.rota}</span>
                </span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm fw-bold shadow-sm d-flex align-items-center" style={{ backgroundColor: 'var(--card-blue)', color: 'var(--dark-highlight)', borderRadius: 'var(--radius-sm)' }} onClick={exportarLoteCSV}>
                  <FaDownload className="me-2"/> CSV
                </button>
                <button className="btn btn-sm btn-light border-0 shadow-sm" style={{ borderRadius: 'var(--radius-pill)' }} onClick={fecharModal}><FaTimes className="text-muted"/></button>
              </div>
            </div>

            <div className="card-body p-0 custom-scrollbar" style={{ overflowY: 'auto', flex: 1, minHeight: '30vh' }}>
              <table className="table table-borderless table-hover table-sm mb-0 text-center align-middle" style={{ fontSize: '11px', whiteSpace: 'nowrap', backgroundColor: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', zIndex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <tr className="text-uppercase" style={{ fontSize: '10px', color: 'var(--text-aux)' }}>
                    <th className="px-3 py-2"><input className="form-check-input shadow-sm" type="checkbox" style={{ cursor: 'pointer', borderRadius: '4px' }} onChange={handleSelectAll} checked={padraoSelecionado.ctes.length > 0 && itensSelecionados.length === padraoSelecionado.ctes.length} /></th>
                    <th className="px-3 py-2 text-start">Código CT-e</th>
                    <th className="px-3 py-2">Emissão</th>
                    <th className="px-3 py-2">Tab. Ariba</th>
                    <th className="px-3 py-2">Início Vig.</th>
                    <th className="px-3 py-2">Fim Vig.</th>
                    <th className="px-3 py-2">UF Origem</th>
                    <th className="px-3 py-2">Cid. Origem</th>
                    <th className="px-3 py-2">UF Destino</th>
                    <th className="px-3 py-2">Cid. Destino</th>
                    <th className="px-3 py-2">R$ Cobrado</th>
                    <th className="px-3 py-2">R$ Calculado</th>
                    <th className="px-3 py-2">Diferença</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {padraoSelecionado.ctes.map((cte, idx) => (
                    <tr key={idx} style={{ backgroundColor: itensSelecionados.includes(cte.chave) ? 'var(--status-success-bg)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                      <td className="px-3 py-2"><input className="form-check-input shadow-sm" type="checkbox" style={{ cursor: 'pointer', borderRadius: '4px' }} checked={itensSelecionados.includes(cte.chave)} onChange={(e) => handleSelectItem(cte.chave, e.target.checked)} /></td>
                      <td className="px-3 py-2 text-start fw-bold" style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{cte.chave}</td>
                      <td className="px-3 py-2">{cte.emissao}</td>
                      <td className="px-3 py-2 fw-bold text-muted">{cte.tabela}</td>
                      <td className="px-3 py-2">{cte.inicioVig}</td>
                      <td className="px-3 py-2">{cte.fimVig}</td>
                      <td className="px-3 py-2 fw-bold">{cte.ufOrigem}</td>
                      <td className="px-3 py-2 text-muted">{cte.cidOrigem}</td>
                      <td className="px-3 py-2 fw-bold">{cte.ufDestino}</td>
                      <td className="px-3 py-2 text-muted">{cte.cidDestino}</td>
                      <td className="px-3 py-2 fw-bold" style={{ color: 'var(--text-main)' }}>R$ {formatarMoeda(cte.valorTaxa)}</td>
                      <td className="px-3 py-2 fw-bold" style={{ color: 'var(--text-secondary)' }}>R$ {formatarMoeda(cte.valorTabela)}</td>
                      <td className="px-3 py-2 fw-bold" style={{ color: cte.diferenca < 0 ? 'var(--status-error-txt)' : 'var(--status-success-txt)' }}>
                        {cte.diferenca < 0 ? '-' : '+'} R$ {formatarMoeda(Math.abs(cte.diferenca))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Decisão de Auditoria</h6>
                <span style={{ backgroundColor: 'var(--text-aux)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: '700' }}>{itensSelecionados.length} selecionados</span>
              </div>
              
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Decisão Final</label>
                  <select className="form-select form-select-sm shadow-sm" style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '700', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} value={decisaoFinal} onChange={(e) => { setDecisaoFinal(e.target.value); if (e.target.value !== 'REPROVAR') setMotivoReprovacao(''); }}>
                    <option value="">Selecione...</option>
                    <option value="APROVAR">✅ Aprovado</option>
                    <option value="REPROVAR">❌ Reprovado</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Motivo</label>
                  <select className="form-select form-select-sm shadow-sm" style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '700', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} value={motivoReprovacao} onChange={(e) => setMotivoReprovacao(e.target.value)} disabled={decisaoFinal !== 'REPROVAR'}>
                    <option value="">Selecione...</option>
                    <option value="tabela_errada">Tabela Desatualizada</option>
                    <option value="duplicidade">Duplicidade de Cobrança</option>
                    <option value="taxa_nao_negociada">Taxa Não Negociada</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Observações Livres</label>
                  <input type="text" className="form-control form-control-sm shadow-sm" placeholder="Comentários adicionais..." style={{ fontSize: '12px', fontWeight: '600', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} value={obsLivre} onChange={(e) => setObsLivre(e.target.value)} />
                </div>
              </div>
            </div>
            
            <div className="p-4 d-flex justify-content-end gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'var(--card-solid)' }}>
              <button className="btn btn-sm fw-bold shadow-sm" style={{ backgroundColor: 'white', color: 'var(--text-secondary)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)', padding: '8px 20px' }} onClick={fecharModal}>Cancelar</button>
              <button 
                className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center" 
                style={{ backgroundColor: isBotaoGravarHabilitado() ? 'var(--dark-highlight)' : 'var(--text-aux)', borderRadius: 'var(--radius-md)', padding: '8px 24px', cursor: isBotaoGravarHabilitado() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }} 
                onClick={gravarAuditoria} disabled={!isBotaoGravarHabilitado()}
              >
                <FaCheck className="me-2"/> Aplicar em Massa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE: AVISO EM DESENVOLVIMENTO
// ============================================================================
function TelaEmDesenvolvimento({ titulo }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100%', minHeight: '60vh' }}>
      <div className="text-center p-5 bg-white shadow-sm border" style={{ maxWidth: '400px', borderRadius: '12px' }}>
        <FaClock size={50} style={{ color: '#A3B8AC', marginBottom: '20px' }} />
        <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>{titulo}</h5>
        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
          Módulo em fase de arquitetura e desenvolvimento. Estará disponível em breve nas próximas atualizações do sistema.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL (Orquestrador)
// ============================================================================
export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('visaoGeral');
  const [carregando, setCarregando] = useState(false);
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [perfilForm, setPerfilForm] = useState({ funcao: 'Especialista em Logística', senha: '', confirmaSenha: '' });

  // NOVO: Estado Global de Tratativas para sincronizar decisões entre as telas
  const [tratativasGlobais, setTratativasGlobais] = useState({});

  const handleSalvarTratativas = (novasTratativas) => {
    setTratativasGlobais(prev => {
      const atualizado = { ...prev };
      novasTratativas.forEach(t => {
        if (!atualizado[t.chave]) atualizado[t.chave] = {};
        atualizado[t.chave][t.taxa] = { status: t.status, motivo: t.motivo, obs: t.obs };
      });
      return atualizado;
    });
  };

  // NOVO: Remove a decisão da memória global
  const handleRemoverTratativa = (chave, taxaId) => {
    setTratativasGlobais(prev => {
      const atualizado = { ...prev };
      if (atualizado[chave]) {
        delete atualizado[chave][taxaId];
        if (Object.keys(atualizado[chave]).length === 0) delete atualizado[chave];
      }
      return atualizado;
    });
  };

  const filtrosPadrao = { mes: 'Todos', transportador: 'Todos', fluxo: 'Todos', rotaUf: 'Todos', rotaCid: 'Todos', ufOrigem: 'Todos', ufDestino: 'Todos', cidadeOrigem: 'Todos', cidadeDestino: 'Todos', duplicidade: 'COM_IMPACTO' };

  // 1. Estado de Filtros Independente
  const [filtros, setFiltros] = useState({
    visaoGeral: { ...filtrosPadrao },
    painelAuditoria: { ...filtrosPadrao },
    auditoria: { ...filtrosPadrao },
    relatorio: { ...filtrosPadrao },
    analiseMassa: { ...filtrosPadrao } // Adicionado para exibir Fila por Taxas
  });

  // 2. Estado de Dados Cacheado Independente
  const [dadosAba, setDadosAba] = useState({
    visaoGeral: null,
    painelAuditoria: null,
    auditoria: null,
    relatorio: null,
    analiseMassa: null // Adicionado para exibir Fila por Taxas
  });

  const filtrosAtuais = filtros[telaAtiva] || filtrosPadrao;
  const dadosAtuais = dadosAba[telaAtiva];
  
  const filtrosOpcoes = dadosAba.visaoGeral?.filtrosOpcoes || dadosAba.painelAuditoria?.filtrosOpcoes || dadosAba.auditoria?.filtrosOpcoes || dadosAba.relatorio?.filtrosOpcoes || {};

  const atualizarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [telaAtiva]: { ...prev[telaAtiva], [campo]: valor }
    }));
  };

  const carregarDados = (filtrosOverride = null) => {
    if (!['visaoGeral', 'painelAuditoria', 'auditoria', 'relatorio', 'analiseMassa'].includes(telaAtiva)) return;
    
    setCarregando(true);
    const payload = { ...(filtrosOverride || filtros[telaAtiva]), abaAtiva: telaAtiva };
    
    axios.post('http://localhost:3000/api/dados-dashboard', payload)
      .then(response => { 
        setDadosAba(prev => ({ ...prev, [telaAtiva]: response.data })); 
        setCarregando(false); 
      })
      .catch(error => { console.error("Erro BQ:", error); setCarregando(false); });
  };

  const limparFiltros = () => {
    setFiltros(prev => ({ ...prev, [telaAtiva]: { ...filtrosPadrao } }));
    carregarDados(filtrosPadrao);
  };

  useEffect(() => { 
    if (usuarioLogado && ['visaoGeral', 'painelAuditoria', 'auditoria', 'relatorio', 'analiseMassa'].includes(telaAtiva)) {
      if (!dadosAba[telaAtiva]) carregarDados();
    }
  }, [usuarioLogado, telaAtiva]);

  useEffect(() => {
    if (usuarioLogado && ['visaoGeral', 'painelAuditoria', 'auditoria', 'relatorio', 'analiseMassa'].includes(telaAtiva)) {
      carregarDados();
    }
  }, [filtros[telaAtiva]?.mes]);

  const formatarMes = (yyyyMM) => {
    if(!yyyyMM || yyyyMM === 'Todos') return 'Todos os Meses';
    const partes = yyyyMM.split('-');
    if(partes.length === 2) return `${partes[1]}/${partes[0]}`;
    return yyyyMM;
  };

  const getBreadcrumb = () => {
    const base = 'Gestão de Fretes > ';
    if(telaAtiva === 'visaoGeral') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Painel Geral</span></>;
    if(telaAtiva === 'painelAuditoria') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Painel de Auditoria</span></>;
    if(telaAtiva === 'auditoria') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Auditoria por CT-e</span></>;
    if(telaAtiva === 'analiseMassa') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Auditoria por Taxas</span></>;
    if(telaAtiva === 'geracaoTemplate') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Geração Template</span></>;
    if(telaAtiva === 'repositorioTabelas') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Repositório Tabelas</span></>;
    if(telaAtiva === 'relatorio') return <>{base} <span style={{color: '#346E4A', fontWeight: '900'}}>Relatórios</span></>;
    return <>{base}</>;
  };

  if (!usuarioLogado) return <TelaLogin onLogin={setUsuarioLogado} />;

  // Spinner central (só aparece se estiver a carregar E se não houver dados em cache para esta aba)
  if (carregando && !dadosAtuais) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'transparent' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)', width: '3rem', height: '3rem' }}></div>
      <h2 className="fw-bold mt-3" style={{ color: 'var(--text-main)' }}>Carregando dados de CT-e...</h2>
    </div>
  );

  // NOVO: Função para extrair as iniciais do utilizador para o Avatar
  const getIniciais = (nome) => {
    if (!nome) return 'GB';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  return (
    <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh', padding: '20px 24px', gap: '24px', backgroundColor: 'transparent', boxSizing: 'border-box' }}>
      
      {/* FLOATING NAVIGATION (AppShell Lateral) */}
      <aside className="d-flex flex-column" style={{
        backgroundColor: 'var(--dark-highlight)',
        borderRadius: 'var(--radius-xl)',
        width: '260px',
        minWidth: '260px', /* Garante que o menu nunca é esmagado */
        height: 'calc(100vh - 40px)', /* Altura total menos o padding superior/inferior */
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
        zIndex: 100,
        overflow: 'hidden',
        flexShrink: 0 /* Impede o flexbox de encolher a barra */
      }}>
        
        <div className="d-flex flex-column align-items-center py-4 mb-2">
          <div style={{
            width: '52px', height: '52px', backgroundColor: 'var(--card-solid)', 
            borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginBottom: '5px', boxShadow: '0 4px 0px rgba(0,0,0,0.05)'
          }}>
            <img src="/logo.png" alt="Logo GB" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          </div>
          <h6 className="fw-bold text-white mb-0" style={{ fontSize: '15px', letterSpacing: '0.5px' }}>Transportes GB</h6>
        </div>
        
        <div className="sidebar-menu custom-scrollbar" style={{ overflowY: 'auto', flex: 100, padding: '0 10px' }}>
          <div className="menu-section" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>DASHBOARD</div>
          <button className={`menu-item ${telaAtiva === 'visaoGeral' ? 'active' : ''}`} onClick={() => setTelaAtiva('visaoGeral')} style={{ borderRadius: 'var(--radius-md)' }}><MdSpaceDashboard className="menu-icon"/> Painel Geral</button>
          <button className={`menu-item ${telaAtiva === 'painelAuditoria' ? 'active' : ''}`} onClick={() => setTelaAtiva('painelAuditoria')} style={{ borderRadius: 'var(--radius-md)' }}><FaChartLine className="menu-icon"/> Painel Auditoria</button>
          
          <div className="menu-section mt-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>AUDITORIA</div>
          <button className={`menu-item ${telaAtiva === 'auditoria' ? 'active' : ''}`} onClick={() => setTelaAtiva('auditoria')} style={{ borderRadius: 'var(--radius-md)' }}><FaClipboardList className="menu-icon"/> Fila por CT-e</button>
          <button className={`menu-item ${telaAtiva === 'analiseMassa' ? 'active' : ''}`} onClick={() => setTelaAtiva('analiseMassa')} style={{ borderRadius: 'var(--radius-md)' }}><FaLayerGroup className="menu-icon"/> Fila por Taxas</button>

          <div className="menu-section mt-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>TABELAS DE FRETE</div>
          <button className={`menu-item ${telaAtiva === 'geracaoTemplate' ? 'active' : ''}`} onClick={() => setTelaAtiva('geracaoTemplate')} style={{ borderRadius: 'var(--radius-md)' }}><FaFileContract className="menu-icon"/> Geração Template</button>
          <button className={`menu-item ${telaAtiva === 'repositorioTabelas' ? 'active' : ''}`} onClick={() => setTelaAtiva('repositorioTabelas')} style={{ borderRadius: 'var(--radius-md)' }}><FaSearch className="menu-icon"/> Repositório Tabelas</button>
        </div>

        <div className="mt-auto px-3 pb-4 pt-2">
          <div className="menu-section mb-2" style={{ paddingLeft: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>HISTÓRICO</div>
          <button className={`menu-item ${telaAtiva === 'relatorio' ? 'active' : ''}`} onClick={() => setTelaAtiva('relatorio')} style={{ borderRadius: 'var(--radius-md)' }}><FaHistory className="menu-icon"/> Relatórios</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', overflow: 'hidden' }}>
        
        {/* PAGE HEADER COM AVATAR */}
        <header className="d-flex justify-content-between align-items-center" style={{ padding: '5px 10px 20px 10px' }}>
          <div className="fw-bold" style={{ fontSize: '17px', color: 'var(--text-main)' }}>{getBreadcrumb()}</div>
          
          <div className="d-flex gap-3 align-items-center">
            {telaAtiva !== 'relatorio' && (
              <>
                <button className="btn btn-sm glass-panel fw-bold d-flex align-items-center" style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.8)' }} onClick={limparFiltros}>
                  Limpar Filtros
                </button>
                
                <select className="form-select form-select-sm glass-panel fw-bold" style={{ width: '140px', fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.8)', cursor: 'pointer' }} value={filtrosAtuais.mes} onChange={(e) => atualizarFiltro('mes', e.target.value)}>
                  <option value="Todos">Todos os Meses</option>
                  {filtrosOpcoes?.meses?.map(m => (<option key={m} value={m}>{formatarMes(m)}</option>))}
                </select>
                
                <button className="btn btn-sm glass-panel fw-bold d-flex align-items-center" style={{ fontSize: '12px', color: 'var(--text-main)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.8)' }} onClick={() => setPainelFiltrosAberto(true)}>
                  <FaFilter className="me-2" style={{ color: 'var(--text-aux)' }}/> Filtros
                </button>
              </>
            )}

            {/* AVATAR DO UTILIZADOR */}
            <div 
              className="user-avatar shadow-sm"
              style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--card-blue)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                border: '2px solid var(--card-solid)', marginLeft: '10px'
              }} 
              title={`Meu Perfil (${usuarioLogado.nome})`} 
              onClick={() => setMenuUsuarioAberto(true)}
            >
              {getIniciais(usuarioLogado.nome)}
            </div>
          </div>
        </header>

        {/* CONTAINER DINÂMICO DE ECRÃS */}
        <div className="content-wrapper custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px 10px', borderRadius: 'var(--radius-xl)' }}>
          {telaAtiva === 'visaoGeral' && dadosAtuais && <TelaVisaoGeral nomeUsuario={usuarioLogado.nome} dados={dadosAtuais} />}
          {telaAtiva === 'painelAuditoria' && dadosAtuais && <TelaPainelAuditoria nomeUsuario={usuarioLogado.nome} dados={dadosAtuais} />}
          
          {/* VERIFIQUE SE ESTA LINHA ABAIXO EXISTE: */}
          {telaAtiva === 'auditoria' && dadosAtuais && <TelaFilaAuditoria nomeUsuario={usuarioLogado.nome} dados={dadosAtuais} tratativasGlobais={tratativasGlobais} onSalvarTratativas={handleSalvarTratativas} onRemoverTratativa={handleRemoverTratativa} />}
          
          {telaAtiva === 'relatorio' && <TelaRelatorio filtrosOpcoes={filtrosOpcoes} />}
          {telaAtiva === 'analiseMassa' && dadosAtuais && <TelaAnaliseMassa dados={dadosAtuais} onSalvarTratativas={handleSalvarTratativas} />}
          
          {telaAtiva === 'geracaoTemplate' && <TelaEmDesenvolvimento titulo="Geração de Template de Frete" />}
          {telaAtiva === 'repositorioTabelas' && <TelaEmDesenvolvimento titulo="Repositório de Tabelas e Contratos" />}
        </div>

        {/* PAINEL OFFCANVAS DE FILTROS */}
        {painelFiltrosAberto && <div className="offcanvas-backdrop fade show" style={{ backdropFilter: 'blur(6px)' }} onClick={() => setPainelFiltrosAberto(false)}></div>}
        <div className={`offcanvas offcanvas-end shadow-lg ${painelFiltrosAberto ? 'show' : ''}`} style={{ visibility: painelFiltrosAberto ? 'visible' : 'hidden', borderLeft: 'none', width: '360px', borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)', backgroundColor: 'var(--card-solid)' }}>
          <div className="offcanvas-header border-bottom py-4 px-4">
            <div><h6 className="offcanvas-title fw-bold mb-0" style={{ fontSize: '17px', color: 'var(--text-main)' }}>Filtros Globais</h6></div>
            <button className="btn btn-sm btn-light border-0" style={{ borderRadius: 'var(--radius-pill)' }} onClick={() => setPainelFiltrosAberto(false)}><FaTimes className="text-muted"/></button>
          </div>
          <div className="offcanvas-body p-4 custom-scrollbar">
            {/* O conteúdo interno dos filtros permanece estruturalmente igual, as classes CSS genéricas tratarão da fonte */}
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Fluxo Logístico</label>
              <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.fluxo} onChange={(e) => atualizarFiltro('fluxo', e.target.value)}>
                <option value="Todos">Todos</option>
                {filtrosOpcoes?.fluxos?.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Transportador</label>
              <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.transportador} onChange={(e) => atualizarFiltro('transportador', e.target.value)}>
                <option value="Todos">Todos</option>
                {filtrosOpcoes?.transportadores?.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>UF Origem</label>
                <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.ufOrigem} onChange={(e) => atualizarFiltro('ufOrigem', e.target.value)}>
                  <option value="Todos">Todas</option>
                  {filtrosOpcoes?.ufsOrigem?.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>UF Destino</label>
                <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.ufDestino} onChange={(e) => atualizarFiltro('ufDestino', e.target.value)}>
                  <option value="Todos">Todas</option>
                  {filtrosOpcoes?.ufsDestino?.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Rota (UF Origem &gt; UF Destino)</label>
              <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.rotaUf} onChange={(e) => atualizarFiltro('rotaUf', e.target.value)}>
                <option value="Todos">Todas</option>
                {filtrosOpcoes?.rotasUf?.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Cidade Origem</label>
                <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.cidadeOrigem} onChange={(e) => atualizarFiltro('cidadeOrigem', e.target.value)}>
                  <option value="Todos">Todas</option>
                  {filtrosOpcoes?.cidadesOrigem?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Cidade Destino</label>
                <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.cidadeDestino} onChange={(e) => atualizarFiltro('cidadeDestino', e.target.value)}>
                  <option value="Todos">Todas</option>
                  {filtrosOpcoes?.cidadesDestino?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Rota (Cid Origem &gt; Cid Destino)</label>
              <select className="form-select form-select-sm border-secondary shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-sm)' }} value={filtrosAtuais.rotaCid} onChange={(e) => atualizarFiltro('rotaCid', e.target.value)}>
                <option value="Todos">Todas</option>
                {filtrosOpcoes?.rotasCid?.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Divergências Duplicadas</label>
              <div className="border rounded p-3 bg-light shadow-sm" style={{ fontSize: '13px', borderRadius: 'var(--radius-md)' }}>
                <div className="form-check mb-2 d-flex align-items-center">
                  <input className="form-check-input mt-0 me-2" type="radio" id="optCom" checked={filtrosAtuais.duplicidade === 'COM_IMPACTO'} onChange={() => atualizarFiltro('duplicidade', 'COM_IMPACTO')} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  <label className="form-label fw-bold" htmlFor="optCom" style={{ color: 'var(--primary)', cursor: 'pointer', margin: 0 }}>Com Impacto Duplicidade</label>
                </div>
                <div className="form-check d-flex align-items-center">
                  <input className="form-check-input mt-0 me-2" type="radio" id="optSem" checked={filtrosAtuais.duplicidade === 'SEM_IMPACTO'} onChange={() => atualizarFiltro('duplicidade', 'SEM_IMPACTO')} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  <label className="form-label text-muted fw-bold" htmlFor="optSem" style={{ cursor: 'pointer', margin: 0 }}>Sem Impacto (Ignorar)</label>
                </div>
              </div>
            </div>
          </div>
          <div className="offcanvas-footer p-4 border-top" style={{ backgroundColor: 'var(--card-solid)' }}>
            <button className="btn w-100 fw-bold shadow-sm" style={{ backgroundColor: 'var(--dark-highlight)', color: 'white', borderRadius: 'var(--radius-md)', padding: '10px' }} onClick={() => { setPainelFiltrosAberto(false); carregarDados(); }}>Aplicar Filtros</button>
          </div>
        </div>

        {/* MODAL PERFIL DO USUÁRIO (ESTILO FUTURISTA) */}
        {menuUsuarioAberto && usuarioLogado && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 32, 42, 0.4)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel d-flex flex-column shadow-lg" style={{ width: '420px', maxWidth: '90vw', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--card-solid)', border: '1px solid rgba(255,255,255,0.8)' }}>
              
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '16px' }}>Meu Perfil</h6>
                <button className="btn btn-sm btn-light border-0 shadow-sm" style={{ borderRadius: 'var(--radius-pill)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMenuUsuarioAberto(false)}><FaTimes className="text-muted"/></button>
              </div>
              
              <div className="p-4 custom-scrollbar" style={{ overflowY: 'auto', backgroundColor: '#F8FAFC', maxHeight: '80vh' }}>
                <div className="mb-3">
                  <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Nome Completo</label>
                  <input type="text" className="form-control form-control-sm fw-bold" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }} value={usuarioLogado.nome} disabled />
                </div>
                
                <div className="mb-3">
                  <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Email Corporativo</label>
                  <input type="text" className="form-control form-control-sm fw-bold" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }} value={usuarioLogado.email} disabled />
                </div>
                
                <div className="mb-4">
                  <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Função</label>
                  <input type="text" className="form-control form-control-sm shadow-sm fw-bold" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-main)' }} value={perfilForm.funcao} onChange={(e) => setPerfilForm({...perfilForm, funcao: e.target.value})} />
                  <div style={{ fontSize: '10px', color: 'var(--text-aux)', marginTop: '6px', fontWeight: '600' }}>Somente usuários master podem alterar permissões sistêmicas.</div>
                </div>

                <div className="p-3 mb-4" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Segurança & Acesso</h6>
                  <div className="mb-3">
                    <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Nova Senha</label>
                    <input type="password" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="••••••••" value={perfilForm.senha} onChange={(e) => setPerfilForm({...perfilForm, senha: e.target.value})} />
                  </div>
                  <div className="mb-1">
                    <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Confirmar Senha</label>
                    <input type="password" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="••••••••" value={perfilForm.confirmaSenha} onChange={(e) => setPerfilForm({...perfilForm, confirmaSenha: e.target.value})} />
                  </div>
                </div>

                <button className="btn w-100 fw-bold shadow-sm mb-2 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px' }} onClick={() => { alert('Perfil atualizado com sucesso!'); setMenuUsuarioAberto(false); }}>
                  <FaCheck className="me-2"/> Salvar Alterações
                </button>
                <button className="btn w-100 fw-bold d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-txt)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid transparent' }} onClick={() => { setMenuUsuarioAberto(false); setUsuarioLogado(null); }}>
                  <FaSignInAlt className="me-2" style={{ transform: 'rotate(180deg)' }}/> Sair do Sistema
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ============================================================================
// COMPONENTE: TELA DE LOGIN (NOVO UI)
// ============================================================================
function TelaLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Extrai "Vinicios Cordeiro" de "vinicios.cordeiro@..."
  const extrairNomeDoEmail = (emailStr) => {
    if (!emailStr) return 'Usuário';
    const partes = emailStr.split('@')[0].split('.');
    return partes.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  const handleLoginLocal = (e) => {
    e.preventDefault();
    if (!email) return;
    onLogin({ email: email, nome: extrairNomeDoEmail(email) });
  };

  const handleSSO = (e) => {
    e.preventDefault();
    onLogin({ email: 'vinicios.cordeiro@grupoboticario.com.br', nome: 'Vinicios Cordeiro' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
      <div className="glass-panel text-center" style={{ width: '420px', padding: '40px 30px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
        <div className="d-flex justify-content-center mb-4">
          <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--card-solid)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
            <img src="/logo.png" alt="Logo GB" style={{ width: '50px' }} />
          </div>
        </div>
        
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Transportes GB</h4>
        <p className="mb-4" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Sistema de Auditoria de Fretes</p>
        
        <form onSubmit={handleLoginLocal} className="mb-4 text-start">
          <div className="mb-3">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>E-mail</label>
            <input type="email" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '12px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="seu.nome@grupoboticario.com.br" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Senha</label>
            <input type="password" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '12px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          <button type="submit" className="btn w-100 fw-bold shadow-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px', transition: 'all 0.2s' }}>
            Entrar
          </button>
        </form>

        <div className="d-flex align-items-center mb-4">
          <hr className="flex-grow-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
          <span className="px-3" style={{ fontSize: '11px', color: 'var(--text-aux)', fontWeight: '800', textTransform: 'uppercase' }}>Ou</span>
          <hr className="flex-grow-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
        </div>
        
        <button 
          className="btn w-100 fw-bold shadow-sm d-flex justify-content-center align-items-center" 
          style={{ backgroundColor: 'var(--dark-highlight)', color: 'white', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px', transition: 'all 0.2s' }} 
          onClick={handleSSO} type="button"
        >
          <FaSignInAlt className="me-2"/> Entrar via SSO Corporativo
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE V0: VISÃO GERAL (NOVO UI/UX)
// ============================================================================
function TelaVisaoGeral({ nomeUsuario, dados }) {
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const horaAtual = new Date().getHours();
  let saudacao = '🌙 Boa noite';
  if (horaAtual >= 5 && horaAtual < 13) saudacao = '☀️ Bom dia';
  else if (horaAtual >= 13 && horaAtual < 19) saudacao = '⛅ Boa tarde';

  const [visaoGrafico, setVisaoGrafico] = useState('moeda');
  
  const { kpis = {}, evolucao = [], taxasMensal = [], transpStack = [], rotaStack = [], mapaUF = [] } = dados || {};
  
  // Paleta Nativa para Gráficos Recharts (Injetada diretamente para evitar bugs de CSS Variables no SVG)
  const TEMA = {
    chart1: '#2A6F9A', chart2: '#8EC3EA', chart3: '#2F9A7E', chart4: '#DF7659', chart5: '#CF9426',
    dark: '#1F4D6A', textMain: '#14202A', textAux: '#5F6D78',
    success: '#22735C', warn: '#85580A', error: '#B1412A'
  };

  const formatarMoeda = (valor) => valor ? valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
  const formatarNumero = (valor) => valor ? valor.toLocaleString('pt-BR') : '0';

  const prepararDadosTop10 = (dadosBrutos) => {
    if(!dadosBrutos) return [];
    return [...dadosBrutos].map(item => ({ ...item, pctAuditado: item.faturado > 0 ? Number(((item.auditado / item.faturado) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => b.faturado - a.faturado).slice(0, 10).reverse(); 
  };
  const dadosTranspStackProntos = prepararDadosTop10(transpStack).reverse();
  const dadosRotaStackProntos = prepararDadosTop10(rotaStack).reverse();

  const tooltipFormatter = (value, name) => {
    if (name === '% Auditado' || name === 'pctAuditado') return [`${value}%`, name];
    if (visaoGrafico === 'moeda' || name.includes('Total') || name.includes('Faturado') || name.includes('Frete') || name.includes('Pedágio') || name.includes('SEC') || name.includes('GRIS') || name.includes('Ad Valorem') || name.includes('TDE')) return [`R$ ${formatarNumero(Math.round(value))}`, name];
    return [formatarNumero(value), name];
  };

  const totalQ = kpis.volCtes || 0;
  const qtdSemDiv = kpis.volSemDiv || 0;
  const qtdMargem = kpis.volMargem || 0;
  const qtdDiv = kpis.volDivergente || 0;

  const pctSemDiv = totalQ > 0 ? (qtdSemDiv / totalQ) * 100 : 0;
  const pctMargem = totalQ > 0 ? (qtdMargem / totalQ) * 100 : 0;
  const pctDiv = totalQ > 0 ? (qtdDiv / totalQ) * 100 : 0;

  return (
    <div className="d-flex flex-column gap-3">
      {/* HEADER DE BOAS VINDAS CLEAN */}
      <div className="px-2 mb-1 mt-2">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{saudacao}, {nomeUsuario}.</h4>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Resumo de auditoria atualizado em {dataHoje}</span>
      </div>

      {/* LINHA 1: KPIS PRINCIPAIS */}
      <div className="row g-3">
        <div className="col-md-3">
          <div className="glass-panel d-flex flex-column justify-content-between p-3" style={{ height: '100%' }}>
            <div>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-aux)', margin: 0, textTransform: 'uppercase' }}>Frete Bruto Base</h6>
                <div style={{ padding: '6px', backgroundColor: 'var(--primary-soft)', borderRadius: 'var(--radius-sm)' }}><FaTruck size={14} color={TEMA.chart1}/></div>
              </div>
              <div className="tabular-nums" style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '12px' }}>R$ {formatarNumero(Math.round(kpis.freteBruto))}</div>
            </div>
            <div>
              <div style={{ height: '6px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: '6px' }}>
                <div style={{ width: `${kpis.freteAuditadoPct}%`, height: '100%', backgroundColor: TEMA.chart1, borderRadius: 'var(--radius-pill)' }}></div>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                <span>{kpis.freteAuditadoPct}% Auditado</span>
                <span style={{ color: TEMA.chart1 }}>R$ {formatarNumero(Math.round(kpis.freteAuditadoVal))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="glass-panel d-flex flex-column justify-content-between p-3" style={{ height: '100%' }}>
            <div>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-aux)', margin: 0, textTransform: 'uppercase' }}>Volume De CT-Es</h6>
                <div style={{ padding: '6px', backgroundColor: 'rgba(142, 195, 234, 0.2)', borderRadius: 'var(--radius-sm)' }}><FaClipboardList size={14} color={TEMA.chart2}/></div>
              </div>
              <div className="tabular-nums" style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '12px' }}>{formatarNumero(kpis.volCtes)}</div>
            </div>
            <div>
              <div style={{ height: '6px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: '6px' }}>
                <div style={{ width: `${kpis.volAuditadoPct}%`, height: '100%', backgroundColor: TEMA.chart2, borderRadius: 'var(--radius-pill)' }}></div>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                <span>{kpis.volAuditadoPct}% Auditado</span>
                <span style={{ color: TEMA.chart2 }}>{formatarNumero(Math.round(kpis.volAuditadoVal))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="glass-panel d-flex flex-column justify-content-between p-3" style={{ height: '100%' }}>
            <div>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-aux)', margin: 0, textTransform: 'uppercase' }}>Divergência Total</h6>
                <div style={{ padding: '6px', backgroundColor: 'rgba(47, 154, 126, 0.2)', borderRadius: 'var(--radius-sm)' }}><FaFileInvoiceDollar size={14} color={TEMA.chart3}/></div>
              </div>
              <div className="tabular-nums" style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '12px' }}>R$ {formatarNumero(Math.round(kpis.divTotal))}</div>
            </div>
            <div className="d-flex justify-content-between mt-auto tabular-nums" style={{ fontSize: '11px' }}>
              <span className="fw-bold d-flex align-items-center px-2 py-1" style={{ color: TEMA.chart1, backgroundColor: 'rgba(42, 111, 154, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                <FaArrowDown className="me-1" size={10}/> A Receber: R$ {formatarNumero(Math.round(kpis.divNeg))}
              </span>
              <span className="fw-bold d-flex align-items-center px-2 py-1" style={{ color: TEMA.error, backgroundColor: 'var(--status-error-bg)', borderRadius: 'var(--radius-sm)' }}>
                <FaArrowUp className="me-1" size={10}/> A Pagar: R$ {formatarNumero(Math.round(kpis.divPos))}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="glass-panel d-flex flex-column justify-content-center p-3" style={{ height: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-aux)', margin: 0, textTransform: 'uppercase' }}>Status Geral (%)</h6>
              <FaChartBar size={14} color={TEMA.textAux} />
            </div>
            
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px', fontWeight: '700' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Conforme</span>
                <span className="tabular-nums" style={{ color: 'var(--text-main)' }}>{pctSemDiv.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ width: `${pctSemDiv}%`, height: '100%', backgroundColor: TEMA.success }} />
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px', fontWeight: '700' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Aceitável</span>
                <span className="tabular-nums" style={{ color: 'var(--text-main)' }}>{pctMargem.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ width: `${pctMargem}%`, height: '100%', backgroundColor: TEMA.warn }} />
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px', fontWeight: '700' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Divergente</span>
                <span className="tabular-nums" style={{ color: 'var(--text-main)' }}>{pctDiv.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ width: `${pctDiv}%`, height: '100%', backgroundColor: TEMA.error }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LINHA 2: GRÁFICOS TEMPORAIS */}
      <div className="row g-3">
        <div className="col-xl-6">
          <div className="glass-panel p-3 d-flex flex-column" style={{ height: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Base Faturada vs Auditada</h6>
              <div className="btn-group btn-group-sm" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button className={`btn ${visaoGrafico === 'moeda' ? 'btn-dark' : 'btn-light'}`} onClick={() => setVisaoGrafico('moeda')} style={{ fontSize: '10px', fontWeight: '700', border: 'none' }}>R$ FRETE</button>
                <button className={`btn ${visaoGrafico === 'volume' ? 'btn-dark' : 'btn-light'}`} onClick={() => setVisaoGrafico('volume')} style={{ fontSize: '10px', fontWeight: '700', border: 'none' }}>VOLUME</button>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={evolucao} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="mes" tick={{fill: TEMA.textAux, fontSize: 11, fontWeight: '700', fontFamily: 'Urbanist'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" hide={true} domain={[0, dataMax => dataMax * 1.3]} />
                  <YAxis yAxisId="right" orientation="right" hide={true} domain={[0, 100]} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '700', fontFamily: 'Urbanist' }} formatter={tooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', color: TEMA.textAux, paddingTop: '10px', fontFamily: 'Urbanist' }} iconType="circle" />
                  
                  <Bar yAxisId="left" name="Faturado" dataKey={visaoGrafico === 'moeda' ? 'faturadoR' : 'faturadoV'} fill={TEMA.chart2} radius={[4, 4, 4, 4]} barSize={12} />
                  <Bar yAxisId="left" name="Auditado" dataKey={visaoGrafico === 'moeda' ? 'auditadoR' : 'auditadoV'} fill={TEMA.chart1} radius={[4, 4, 4, 4]} barSize={12} />
                  
                  <Line yAxisId="right" name="% Auditado" type="monotone" dataKey="pct" stroke={TEMA.textMain} strokeWidth={2} dot={{ r: 3, fill: TEMA.textMain, strokeWidth: 0 }} activeDot={{ r: 5 }}>
                    <LabelList dataKey="pct" position="top" formatter={(val) => `${val}%`} style={{ fontSize: '10px', fontWeight: '700', fill: TEMA.textMain, fontFamily: 'Urbanist' }} offset={8} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="glass-panel p-3 d-flex flex-column" style={{ height: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Composição de Divergências</h6>
            </div>
            <div style={{ flex: 1, minHeight: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxasMensal} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="mes" tick={{fill: TEMA.textAux, fontSize: 11, fontWeight: '700', fontFamily: 'Urbanist'}} axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '700', fontFamily: 'Urbanist' }} formatter={tooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', color: TEMA.textAux, paddingTop: '10px', fontFamily: 'Urbanist' }} iconType="circle" />
                  
                  <Bar dataKey="frete_peso" name="Frete Peso" stackId="a" fill={TEMA.chart1} barSize={20} />
                  <Bar dataKey="pedagio" name="Pedágio" stackId="a" fill={TEMA.chart2} barSize={20} />
                  <Bar dataKey="seccat" name="SEC/CAT" stackId="a" fill={TEMA.chart3} barSize={20} />
                  <Bar dataKey="gris" name="GRIS" stackId="a" fill={TEMA.dark} barSize={20} />
                  <Bar dataKey="advlr" name="Ad Valorem" stackId="a" fill={TEMA.chart4} barSize={20} />
                  <Bar dataKey="tde" name="TDE" stackId="a" fill={TEMA.chart5} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* LINHA 3: TOP 10 E MAPA */}
      <div className="row g-3">
        <div className="col-xl-4">
          <div className="glass-panel p-3" style={{ height: '100%', minHeight: '260px' }}>
            <h6 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '15px' }}>Top Transportadores (Faturamento)</h6>
            <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
              <ResponsiveContainer>
                <BarChart data={dadosTranspStackProntos} layout="vertical" margin={{ top: 0, right: 35, left: 10, bottom: 0 }} barGap={-10}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="transportador" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: TEMA.textMain, fontWeight: '700', fontFamily: 'Urbanist'}} width={90} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', fontFamily: 'Urbanist' }} formatter={tooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '700', color: TEMA.textAux, fontFamily: 'Urbanist' }} iconType="circle" />
                  <Bar dataKey="faturado" name="Faturado" fill={TEMA.chart2} radius={[0, 4, 4, 0]} barSize={10}>
                    <LabelList dataKey="pctAuditado" position="right" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fontWeight: '700', fill: TEMA.textAux, fontFamily: 'Urbanist' }} />
                  </Bar>
                  <Bar dataKey="auditado" name="Auditado" fill={TEMA.chart1} radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="glass-panel p-3" style={{ height: '100%', minHeight: '260px' }}>
            <h6 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '15px' }}>Auditoria por Região (UF)</h6>
            <div style={{ width: '100%', height: 'calc(100% - 30px)', overflow: 'hidden' }}>
              {mapaUF && mapaUF.length > 1 ? (
                <GeoChart chartType="GeoChart" width="100%" height="100%" data={mapaUF} options={{ region: 'BR', resolution: 'provinces', colorAxis: { colors: [TEMA.error, TEMA.warn, TEMA.success] }, backgroundColor: 'transparent', datalessRegionColor: 'rgba(0,0,0,0.05)', defaultColor: 'rgba(0,0,0,0.05)', legend: 'none', tooltip: { textStyle: { fontName: 'Urbanist', fontSize: 12, bold: true } } }} />
              ) : <p className="text-muted text-center mt-5" style={{fontSize: '12px', fontWeight: '600'}}>Aguardando mapa...</p>}
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="glass-panel p-3" style={{ height: '100%', minHeight: '260px' }}>
            <h6 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '15px' }}>Top Rotas (Faturamento)</h6>
            <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
              <ResponsiveContainer>
                <BarChart data={dadosRotaStackProntos} layout="vertical" margin={{ top: 0, right: 35, left: 10, bottom: 0 }} barGap={-10}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="rota" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: TEMA.textMain, fontWeight: '700', fontFamily: 'Urbanist'}} width={90} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', fontFamily: 'Urbanist' }} formatter={tooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '700', color: TEMA.textAux, fontFamily: 'Urbanist' }} iconType="circle" />
                  <Bar dataKey="faturado" name="Faturado" fill={TEMA.chart2} radius={[0, 4, 4, 0]} barSize={10}>
                    <LabelList dataKey="pctAuditado" position="right" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fontWeight: '700', fill: TEMA.textAux, fontFamily: 'Urbanist' }} />
                  </Bar>
                  <Bar dataKey="auditado" name="Auditado" fill={TEMA.chart1} radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE V1: PAINEL AUDITORIA (NOVO UI/UX)
// ============================================================================
function TelaPainelAuditoria({ nomeUsuario, dados }) {
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const { kpis = {}, cardsAuditoria = {}, mensalDiv = [], rotasCidPos = [], rotasCidNeg = [], matrizFarol = [], tabelaAuxiliar = [] } = dados || {};
  
  const TEMA = {
    chart1: '#2A6F9A', chart2: '#8EC3EA', chart3: '#2F9A7E', chart4: '#DF7659', chart5: '#CF9426',
    dark: '#1F4D6A', textMain: '#14202A', textAux: '#5F6D78',
    success: '#22735C', warn: '#85580A', error: '#B1412A'
  };

  const formatarMoeda = (valor) => valor ? valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
  const formatarNumero = (valor) => valor ? valor.toLocaleString('pt-BR') : '0';

  const cards = [
    { titulo: "Frete Total", icon: <FaTruck size={14} color={TEMA.chart1}/>, abs: kpis.divTotal, neg: kpis.divNeg, pos: kpis.divPos },
    { titulo: "Frete Peso", icon: <FaWeightHanging size={14} color={TEMA.chart2}/>, abs: cardsAuditoria.absPeso, neg: cardsAuditoria.negPeso, pos: cardsAuditoria.posPeso },
    { titulo: "Pedágio", icon: <FaRoad size={14} color={TEMA.chart3}/>, abs: cardsAuditoria.absPedagio, neg: cardsAuditoria.negPedagio, pos: cardsAuditoria.posPedagio },
    { titulo: "GRIS", icon: <FaFileInvoiceDollar size={14} color={TEMA.dark}/>, abs: cardsAuditoria.absGris, neg: cardsAuditoria.negGris, pos: cardsAuditoria.posGris },
    { titulo: "Ad Valorem", icon: <FaFileInvoiceDollar size={14} color={TEMA.chart4}/>, abs: cardsAuditoria.absAdvlr, neg: cardsAuditoria.negAdvlr, pos: cardsAuditoria.posAdvlr },
    { titulo: "SEC/CAT", icon: <FaFileInvoiceDollar size={14} color={TEMA.chart5}/>, abs: cardsAuditoria.absSeccat, neg: cardsAuditoria.negSeccat, pos: cardsAuditoria.posSeccat },
    { titulo: "TDE", icon: <FaFileContract size={14} color={TEMA.chart1}/>, abs: cardsAuditoria.absTde, neg: cardsAuditoria.negTde, pos: cardsAuditoria.posTde },
  ];

  const prepararRotas = (arr) => {
    if(!arr) return [];
    return [...arr].sort((a,b) => b.valor - a.valor).slice(0, 10).reverse();
  };
  const topRotasPos = prepararRotas(rotasCidPos).reverse();
  const topRotasNeg = prepararRotas(rotasCidNeg).reverse();

  const CustomTooltipMensal = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const maxDiv = Math.max(data.valor_negativo || 0, data.valor_positivo || 0) || 1;
      const wNeg = ((data.valor_negativo || 0) / maxDiv) * 100;
      const wPos = ((data.valor_positivo || 0) / maxDiv) * 100;

      return (
        <div className="p-3 shadow-lg" style={{ minWidth: '220px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <p className="fw-bold mb-1" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Divergências em {label}</p>
          <div className="mb-2" style={{ fontSize: '10px', color: 'var(--text-aux)', fontWeight: '600' }}>Volume financeiro em CT-es divergentes</div>
          <h4 className="fw-bold mb-3 tabular-nums" style={{ color: 'var(--text-main)' }}>{formatarNumero(data.qtd_divergente)}</h4>
          
          <div className="d-flex align-items-center mb-2">
            <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-aux)', fontWeight: '700' }}>Cobrado Maior</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', height: '10px', borderRadius: 'var(--radius-pill)', marginRight: '8px' }}>
              <div style={{ width: `${wNeg}%`, backgroundColor: TEMA.error, height: '100%', borderRadius: 'var(--radius-pill)' }}></div>
            </div>
            <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: '800', color: TEMA.error }}>R$ {formatarNumero(Math.round(data.valor_negativo))}</span>
          </div>

          <div className="d-flex align-items-center">
            <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-aux)', fontWeight: '700' }}>Cobrado Menor</span>
            <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', height: '10px', borderRadius: 'var(--radius-pill)', marginRight: '8px' }}>
              <div style={{ width: `${wPos}%`, backgroundColor: TEMA.chart1, height: '100%', borderRadius: 'var(--radius-pill)' }}></div>
            </div>
            <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: '800', color: TEMA.chart1 }}>R$ {formatarNumero(Math.round(data.valor_positivo))}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getCellColor = (value, maxVal, type) => {
    if (!value || value === 0) return 'transparent';
    const intensity = 0.1 + (value / maxVal) * 0.7; // Mais suave
    if(type === 'ok') return `rgba(34, 115, 92, ${intensity})`;  // success
    if(type === 'margem') return `rgba(133, 88, 10, ${intensity})`; // warn
    if(type === 'div') return `rgba(177, 65, 42, ${intensity})`;  // error
  };
  const maxOk = Math.max(...matrizFarol.map(r => r.sem_div));
  const maxMg = Math.max(...matrizFarol.map(r => r.aceitavel));
  const maxDv = Math.max(...matrizFarol.map(r => r.divergente));

  return (
    <div className="d-flex flex-column gap-3">
      <div className="px-2 mb-1 mt-2">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Detalhamento Financeiro.</h4>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Análise profunda das taxas logísticas | {dataHoje}</span>
      </div>

      {/* CARDS DE CADA TAXA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {cards.map((c, idx) => (
          <div className="glass-panel d-flex flex-column justify-content-between p-3" key={idx}>
            <div>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <h6 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-aux)', margin: 0, textTransform: 'uppercase', lineHeight: '1.2', width: '80%' }}>{c.titulo}</h6>
                <div style={{ padding: '6px', backgroundColor: 'var(--card-solid)', borderRadius: 'var(--radius-sm)', opacity: 0.8 }}>
                  {c.icon}
                </div>
              </div>
              <div className="fw-bold tabular-nums" style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '4px' }}>R$ {formatarNumero(Math.round(c.abs))}</div>
            </div>
            <div className="d-flex justify-content-between mt-auto tabular-nums" style={{ fontSize: '10px' }}>
              <span className="fw-bold d-flex align-items-center" style={{ color: TEMA.chart1 }}>
                <FaArrowDown className="me-1"/> A Receber: {formatarNumero(Math.round(c.neg))}
              </span>
              <span className="fw-bold d-flex align-items-center" style={{ color: TEMA.error }}>
                <FaArrowUp className="me-1"/> A Pagar: {formatarNumero(Math.round(c.pos))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 4fr', gap: '15px' }}>
        
        {/* COLUNA ESQUERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div className="glass-panel p-3 d-flex flex-column" style={{ height: '32vh' }}>
            <h6 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 15px 0' }}>Evolução de Divergências (CT-es)</h6>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer>
                <ComposedChart data={mensalDiv} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{fill: TEMA.textAux, fontSize: 10, fontWeight: '700', fontFamily: 'Urbanist'}} 
                    angle={-45} 
                    textAnchor="end" 
                    height={40}
                    axisLine={false} 
                    tickLine={false} 
                    interval={0} 
                  />
                  <YAxis hide={true} />
                  <Tooltip content={<CustomTooltipMensal />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="qtd_divergente" 
                    stroke={TEMA.dark} 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: TEMA.dark, strokeWidth: 0 }} 
                    activeDot={{ r: 6 }}
                  >
                    <LabelList dataKey="qtd_divergente" position="top" formatter={(v) => formatarNumero(v)} style={{ fontSize: '10px', fontWeight: '700', fill: TEMA.textAux, fontFamily: 'Urbanist' }} offset={8} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-0 overflow-hidden d-flex flex-column" style={{ flex: 1 }}>
            <div className="p-3 pb-2 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <h6 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Matriz de Risco Financeiro por Taxa</h6>
            </div>
            <table className="table table-sm table-borderless mb-0 text-center align-middle" style={{ fontSize: '12px', backgroundColor: 'transparent' }}>
              <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <tr>
                  <th className="text-start text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Taxa</th>
                  <th style={{ color: TEMA.success, fontSize: '11px', textTransform: 'uppercase' }}>Conforme</th>
                  <th style={{ color: TEMA.warn, fontSize: '11px', textTransform: 'uppercase' }}>Aceitável</th>
                  <th style={{ color: TEMA.error, fontSize: '11px', textTransform: 'uppercase' }}>Divergente</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {matrizFarol.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td className="text-start fw-bold" style={{ color: 'var(--text-secondary)' }}>{r.taxa}</td>
                    <td style={{ backgroundColor: getCellColor(r.sem_div, maxOk, 'ok'), color: r.sem_div > maxOk*0.6 ? '#fff' : 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}>{formatarNumero(Math.round(r.sem_div))}</td>
                    <td style={{ backgroundColor: getCellColor(r.aceitavel, maxMg, 'margem'), color: r.aceitavel > maxMg*0.6 ? '#fff' : 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}>{formatarNumero(Math.round(r.aceitavel))}</td>
                    <td style={{ backgroundColor: getCellColor(r.divergente, maxDv, 'div'), color: r.divergente > maxDv*0.6 ? '#fff' : 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}>{formatarNumero(Math.round(r.divergente))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div className="glass-panel p-3 d-flex flex-column" style={{ height: '32vh' }}>
            <h6 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 15px 0' }}>Rotas com Maior Divergência Absoluta</h6>
            <div className="row g-0 flex-grow-1" style={{ minHeight: 0 }}>
              
              <div className="col-6 pe-2 d-flex flex-column" style={{ borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="text-center fw-bold mb-2" style={{ fontSize: '11px', color: TEMA.error, textTransform: 'uppercase' }}><FaArrowDown className="me-1"/> Cobrado a Maior (-)</div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer>
                    <BarChart data={topRotasNeg} layout="vertical" margin={{top: 0, right: 0, left: 50, bottom: 0}}>
                      <XAxis type="number" reversed hide />
                      <YAxis 
                        type="category" dataKey="rota" orientation="right" axisLine={false} tickLine={false} 
                        tick={{fontSize: 10, fill: TEMA.textMain, fontWeight: '600', fontFamily: 'Urbanist'}} width={130} 
                        tickFormatter={(val) => {
                          if (!val) return '';
                          let texto = val.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          return (texto.length > 22 ? texto.substring(0, 22) + '...' : texto).replace(/ /g, '\u00A0');
                        }}
                      />
                      <Tooltip formatter={(val) => `-R$ ${formatarMoeda(val)}`} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', fontFamily: 'Urbanist' }} />
                      <Bar dataKey="valor" fill={TEMA.error} radius={[0, 4, 4, 0]} barSize={8}>
                        <LabelList dataKey="valor" position="right" formatter={(v) => `-R$ ${formatarNumero(Math.round(v))}`} style={{ fontSize: '9px', fill: TEMA.textAux, fontWeight: '700', fontFamily: 'Urbanist' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-6 ps-2 d-flex flex-column">
                <div className="text-center fw-bold mb-2" style={{ fontSize: '11px', color: TEMA.chart1, textTransform: 'uppercase' }}><FaArrowUp className="me-1"/> Cobrado a Menor (+)</div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer>
                    <BarChart data={topRotasPos} layout="vertical" margin={{top: 0, right: 40, left: 0, bottom: 0}}>
                      <XAxis type="number" hide />
                      <YAxis 
                        type="category" dataKey="rota" orientation="left" axisLine={false} tickLine={false} 
                        tick={{fontSize: 10, fill: TEMA.textMain, fontWeight: '600', fontFamily: 'Urbanist'}} width={130} 
                        tickFormatter={(val) => {
                          if (!val) return '';
                          let texto = val.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          return (texto.length > 22 ? texto.substring(0, 22) + '...' : texto).replace(/ /g, '\u00A0');
                        }}
                      />
                      <Tooltip formatter={(val) => `+R$ ${formatarMoeda(val)}`} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', fontFamily: 'Urbanist' }} />
                      <Bar dataKey="valor" fill={TEMA.chart1} radius={[0, 4, 4, 0]} barSize={8}>
                        <LabelList dataKey="valor" position="right" formatter={(v) => `+R$ ${formatarNumero(Math.round(v))}`} style={{ fontSize: '9px', fill: TEMA.textAux, fontWeight: '700', fontFamily: 'Urbanist' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          <div className="glass-panel p-0 overflow-hidden d-flex flex-column" style={{ flex: 1 }}>
            <div className="p-3 pb-2 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <h6 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Resumo por Transportador e Rota</h6>
            </div>
            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, maxHeight: '26vh' }}>
              <table className="table table-sm table-borderless table-hover mb-0 text-center align-middle" style={{ fontSize: '11px', backgroundColor: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', zIndex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th className="text-start text-muted fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Transportador</th>
                    <th className="text-start text-muted fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Rota</th>
                    <th className="text-muted fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Volume</th>
                    <th className="fw-bold" style={{color: TEMA.error, fontSize: '10px', textTransform: 'uppercase'}}>Qtd Divergente</th>
                    <th className="text-muted fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Bruto</th>
                    <th className="fw-bold" style={{color: TEMA.error, fontSize: '10px', textTransform: 'uppercase'}}>A Maior</th>
                    <th className="fw-bold" style={{color: TEMA.chart1, fontSize: '10px', textTransform: 'uppercase'}}>A Menor</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {tabelaAuxiliar.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                      <td className="text-start fw-bold" style={{ color: TEMA.chart1 }}>{(r.transportador || '').substring(0, 15)}</td>
                      <td className="text-start text-muted fw-bold">{(r.rota || '').substring(0, 40)}</td>
                      <td style={{ color: 'var(--text-main)' }}>{formatarNumero(Math.round(r.qtd_total))}</td>
                      <td className="fw-bold" style={{color: TEMA.error}}>{formatarNumero(Math.round(r.qtd_div))}</td>
                      <td style={{ color: 'var(--text-main)' }}>R$ {formatarNumero(Math.round(r.faturamento))}</td>
                      <td className="fw-bold" style={{ color: TEMA.error }}>R$ {formatarNumero(Math.round(r.div_neg))}</td>
                      <td className="fw-bold" style={{ color: TEMA.chart1 }}>R$ {formatarNumero(Math.round(r.div_pos))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE V2: FILA DE AUDITORIA (NOVO UI/UX)
// ============================================================================
function TelaFilaAuditoria({ nomeUsuario, dados, tratativasGlobais, onSalvarTratativas, onRemoverTratativa }) {
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const mapaTaxasId = {
    'Valor Frete Bruto': 'FRETE_BRUTO', 'ICMS': 'ICMS', 'Frete Peso': 'FRETE_PESO',
    'Pedágio': 'PEDAGIO', 'GRIS': 'GRIS', 'Ad Valorem': 'ADVLR', 'SEC/CAT': 'SECCAT', 'TDE': 'TDE'
  };
  const [modalAberto, setModalAberto] = useState(false);
  const [cteSelecionado, setCteSelecionado] = useState(null);
  
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [itensPorPagina, setItensPorPagina] = useState(50);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Retorna para a página 1 sempre que os filtros forem alterados
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, termoBusca, itensPorPagina]);

  const [decisaoFinal, setDecisaoFinal] = useState('');
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [obsLivre, setObsLivre] = useState('');
  const [obsTaxas, setObsTaxas] = useState({});

  const TEMA = {
    chart1: '#2A6F9A', chart2: '#8EC3EA', chart3: '#2F9A7E', chart4: '#DF7659', chart5: '#CF9426',
    dark: '#1F4D6A', textMain: '#14202A', textAux: '#5F6D78',
    success: '#22735C', warn: '#85580A', error: '#B1412A'
  };

  const formatarMoeda = (valor) => valor ? Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
  const formatarMoeda3 = (valor) => valor ? Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '0,000';
  const formatarNumero = (valor) => valor ? Number(valor).toLocaleString('pt-BR') : '0';
  const formatarPct = (valor, dec = 2) => valor ? (Number(valor) * 100).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + '%' : `0,${'0'.repeat(dec)}%`;

  const { tabela = [] } = dados || {};

  const extrairData = (campoData) => {
    if (!campoData) return 'N/A';
    const strData = typeof campoData === 'object' && campoData.value ? String(campoData.value) : String(campoData);
    return strData.substring(0, 10);
  };

  const filaReal = tabela.map(row => {
    let statusCte = row.diagnostico_cte || row.status_auditoria || 'Pendente';
    
    const diffBruto = Number(row.diff_bruto_tabela || 0); const diffIcms = Number(row.diff_icms || 0);
    const diffPeso = Number(row.diff_frete_peso || 0); const diffPed = Number(row.diff_pedagio || 0);
    const diffGris = Number(row.diff_gris || 0); const diffAdv = Number(row.diff_advlr || 0);
    const diffSec = Number(row.diff_emissao_seccat || 0); const diffTde = Number(row.diff_tde || 0);

    const maxDiff = Math.max(Math.abs(diffBruto), Math.abs(diffIcms), Math.abs(diffPeso), Math.abs(diffPed), Math.abs(diffGris), Math.abs(diffAdv), Math.abs(diffSec), Math.abs(diffTde));

    if (!row.diagnostico_cte) {
      if (maxDiff <= 0.01) statusCte = 'Sem Divergência';
      else if (maxDiff <= 0.50) statusCte = 'Margem Aceitável';
      else statusCte = 'Divergente';
    }

    const trt = Number(row.vlr_tarifa_trt || 0);
    const desFaixaFormatada = row.des_faixa ? String(row.des_faixa).replace(/_/g, ' ').toLowerCase().split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : 'Faixa Indefinida';

    const taxaFretePesoCalc = trt > 0 ? (<>{desFaixaFormatada} <br />(R$ {formatarMoeda(row.vlr_tarifa_frete_peso)} + {(trt * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% 'TRT')</>) : (<>{desFaixaFormatada} <br />(R$ {formatarMoeda(row.vlr_tarifa_frete_peso)})</>);

    let pedagioSufixo = '';
    if (Number(row.pedagio_vlr_fixo_tabela || 0) > 0) pedagioSufixo = ' (Fixo)';
    else if (Number(row.pedagio_fracao_kg_tabela || 0) > 0) pedagioSufixo = ' (Fração 100Kg)';
    else if (Number(row.pedagio_kg_tabela || 0) > 0) pedagioSufixo = ' (Valor Kg)';
    const taxaPedagioCalc = `R$ ${formatarMoeda3(row.vlr_tarifa_pedagio)}${pedagioSufixo}`;

    const taxaSecCatCalc = trt > 0 ? `R$ ${formatarMoeda(row.vlr_tarifa_emissao)} (+ ${(trt * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% de TRT)` : `R$ ${formatarMoeda(row.vlr_tarifa_emissao)}`;

    return {
      chave: row.cod_chave_acesso || 'CHAVE-N/A', transportador: row.grp_transportador || 'N/A',
      rotaUf: row.rota_uf || row.c_rota_uf || '', rota: row.id_rota || 'N/A', emissao: extrairData(row.dt_hr_emissao),
      vlrCobrado: Number(row.vlr_frete_bruto_spend || 0), vlrCalculado: Number(row.vlr_frete_bruto_tabela || 0), diffTotal: diffBruto,
      status: statusCte, serie: row.nr_serie_cte || 'N/A', somaNf: Number(row.vlr_total_notas_fiscais || 0),
      pesoKg: Number(row.qtde_peso_nfs || 0), docAriba: row.documento_ariba_ws || 'N/A',
      vigenciaInicio: extrairData(row.dt_inicio_vigencia), vigenciaFim: extrairData(row.dt_final_vigencia), originalRow: row,
      
      detalhes: { 
        freteBruto: { calcRate: `R$ ${formatarMoeda(row.vlr_frete_bruto_tabela)}`, calcVal: Number(row.vlr_frete_bruto_tabela || 0), cobRate: `R$ ${formatarMoeda(row.vlr_frete_bruto_spend)}`, cobVal: Number(row.vlr_frete_bruto_spend || 0), diff: diffBruto },
        icms: { calcRate: formatarPct(row.vlr_tarifa_icms, 1), calcVal: Number(row.vlr_icms_tabela || 0), cobRate: formatarPct(row.vlr_tarifa_icms, 1), cobVal: Number(row.vlr_icms_spend || 0), diff: diffIcms },
        peso: { calcRate: taxaFretePesoCalc, calcVal: Number(row.vlr_frete_peso_tabela || 0), cobRate: `R$ ${formatarMoeda(row.vlr_tarifa_frete_peso_spend)}`, cobVal: Number(row.vlr_frete_peso_spend || 0), diff: diffPeso }, 
        ped: { calcRate: taxaPedagioCalc, calcVal: Number(row.vlr_pedagio_tabela || 0), cobRate: `R$ ${formatarMoeda3(row.vlr_tarifa_pedagio_spend)}`, cobVal: Number(row.vlr_pedagio_spend || 0), diff: diffPed }, 
        gris: { calcRate: formatarPct(row.vlr_tarifa_gris, 3), calcVal: Number(row.vlr_gris_tabela || 0), cobRate: formatarPct(row.vlr_tarifa_gris_spend, 3), cobVal: Number(row.vlr_gris_spend || 0), diff: diffGris }, 
        adv: { calcRate: formatarPct(row.vlr_tarifa_advlr, 3), calcVal: Number(row.vlr_advlr_tabela || 0), cobRate: formatarPct(row.vlr_tarifa_advlr_spend, 3), cobVal: Number(row.vlr_advlr_spend || 0), diff: diffAdv }, 
        sec: { calcRate: taxaSecCatCalc, calcVal: Number(row.vlr_emissao_seccat_tabela || 0), cobRate: `R$ ${formatarMoeda(row.vlr_tarifa_emissao_seccat_spend)}`, cobVal: Number(row.vlr_emissao_seccat_spend || 0), diff: diffSec }, 
        tde: { calcRate: `R$ ${formatarMoeda(row.vlr_tarifa_tde)}`, calcVal: Number(row.vlr_tde_tabela || 0), cobRate: `R$ ${formatarMoeda(row.vlr_tarifa_tde_spend)}`, cobVal: Number(row.vlr_tde_spend || 0), diff: diffTde } 
      }
    };
  });

  const stats = { semDiv: { q: 0, v: 0 }, margem: { q: 0, v: 0 }, div: { q: 0, v: 0 }, total: { q: filaReal.length, v: 0 } };
  filaReal.forEach(f => {
    stats.total.v += f.vlrCobrado;
    if(f.status === 'Sem Divergência') { stats.semDiv.q++; stats.semDiv.v += f.vlrCobrado; }
    else if(f.status === 'Margem Aceitável') { stats.margem.q++; stats.margem.v += f.vlrCobrado; }
    else { stats.div.q++; stats.div.v += f.vlrCobrado; }
  });

  const agruparDiffs = (campo) => {
    return filaReal.reduce((acc, curr) => {
      const v = Number(curr.originalRow[campo] || 0);
      if (v > 0) acc.pos += v;
      if (v < 0) acc.neg += Math.abs(v);
      return acc;
    }, { pos: 0, neg: 0 });
  };
  const dadosStackedTaxas = [
    { name: 'Bruto', pos: agruparDiffs('diff_bruto_tabela').pos, neg: agruparDiffs('diff_bruto_tabela').neg },
    { name: 'Peso', pos: agruparDiffs('diff_frete_peso').pos, neg: agruparDiffs('diff_frete_peso').neg },
    { name: 'Pedágio', pos: agruparDiffs('diff_pedagio').pos, neg: agruparDiffs('diff_pedagio').neg },
    { name: 'SEC', pos: agruparDiffs('diff_emissao_seccat').pos, neg: agruparDiffs('diff_emissao_seccat').neg },
    { name: 'GRIS', pos: agruparDiffs('diff_gris').pos, neg: agruparDiffs('diff_gris').neg },
    { name: 'AdVal', pos: agruparDiffs('diff_advlr').pos, neg: agruparDiffs('diff_advlr').neg },
    { name: 'TDE', pos: agruparDiffs('diff_tde').pos, neg: agruparDiffs('diff_tde').neg }
  ];

  const faturamentoTransp = filaReal.reduce((acc, curr) => { acc[curr.transportador] = (acc[curr.transportador] || 0) + curr.vlrCobrado; return acc; }, {});
  let transpArray = Object.keys(faturamentoTransp).map(k => ({ name: k, value: faturamentoTransp[k] })).sort((a,b) => b.value - a.value).slice(0, 10);
  let accFat = 0;
  const paretoComPct = transpArray.map(item => {
    accFat += item.value; return { ...item, pct: stats.total.v > 0 ? Math.round((accFat / stats.total.v) * 100) : 0 };
  });

  const abrirModal = (cte) => { setCteSelecionado(cte); setDecisaoFinal(''); setMotivoReprovacao(''); setObsLivre(''); setObsTaxas({}); setModalAberto(true); };
  const fecharModal = () => { setModalAberto(false); setCteSelecionado(null); };

  const handleSelectAll = (e, dadosVisiveis) => { if (e.target.checked) setItensSelecionados(dadosVisiveis.map(c => c.chave)); else setItensSelecionados([]); };
  const handleSelectItem = (chave, isChecked) => { if (isChecked) setItensSelecionados([...itensSelecionados, chave]); else setItensSelecionados(itensSelecionados.filter(i => i !== chave)); };

  const aprovarLote = () => {
    if(itensSelecionados.length === 0) return alert('Selecione ao menos um CT-e da fila.');
    const chavesSelecionadas = filaReal.filter(c => itensSelecionados.includes(c.chave));
    const temDivergente = chavesSelecionadas.some(c => c.status !== 'Sem Divergência');
    if (temDivergente) return alert('Atenção: O lote automático só aprova status "Sem Divergência".');
    alert(`${itensSelecionados.length} CT-es aprovados com sucesso!`);
    setItensSelecionados([]);
  };

  const todasObsTaxasPreenchidas = () => {
    if (!cteSelecionado) return true;
    const todasAsTaxas = [
      { nome: 'Valor Frete Bruto', d: cteSelecionado.detalhes.freteBruto }, { nome: 'ICMS', d: cteSelecionado.detalhes.icms },
      { nome: 'Frete Peso', d: cteSelecionado.detalhes.peso }, { nome: 'Pedágio', d: cteSelecionado.detalhes.ped },
      { nome: 'GRIS', d: cteSelecionado.detalhes.gris }, { nome: 'Ad Valorem', d: cteSelecionado.detalhes.adv },
      { nome: 'SEC/CAT', d: cteSelecionado.detalhes.sec }, { nome: 'TDE', d: cteSelecionado.detalhes.tde }
    ];
    return todasAsTaxas.every(taxa => {
      const isDiff = Math.abs(taxa.d.diff) > 0.01;
      const tratadaMassa = tratativasGlobais[cteSelecionado?.chave]?.[mapaTaxasId[taxa.nome]];
      if (!isDiff || tratadaMassa) return true; 
      return !!obsTaxas[taxa.nome];
    });
  };

  const gravarAuditoriaLocal = () => {
    const tratativasLocais = [];
    Object.keys(obsTaxas).forEach(nomeTaxa => {
       const taxaId = mapaTaxasId[nomeTaxa];
       if (obsTaxas[nomeTaxa]) tratativasLocais.push({ chave: cteSelecionado.chave, taxa: taxaId, status: decisaoFinal, motivo: motivoReprovacao, obs: obsTaxas[nomeTaxa] });
    });
    onSalvarTratativas(tratativasLocais);
    alert('Auditoria individual gravada com sucesso!');
    fecharModal();
  };

  const isBotaoGravarHabilitado = () => {
    if (!decisaoFinal) return false;
    if (decisaoFinal === 'REPROVAR') { if (!motivoReprovacao) return false; if (!todasObsTaxasPreenchidas()) return false; }
    return true;
  };

  // 1. Aplica os filtros na base completa
  const dadosFiltradosBase = filaReal
    .filter(c => filtroStatus === 'Todos' || c.status === filtroStatus)
    .filter(c => c.chave.includes(termoBusca) || c.transportador.toLowerCase().includes(termoBusca.toLowerCase()));

  // 2. Calcula as métricas de paginação
  const totalPaginas = Math.ceil(dadosFiltradosBase.length / itensPorPagina) || 1;
  const dadosPaginados = dadosFiltradosBase.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);  


  const getBadgeStatus = (status) => {
    if (status === 'Sem Divergência') return <span style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-txt)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '800' }}>Conforme</span>;
    if (status === 'Margem Aceitável') return <span style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn-txt)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '800' }}>Margem</span>;
    return <span style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-txt)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '800' }}>Divergente</span>;
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center mt-2 px-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Fila Individual (CT-e)</h4>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Análise e aprovação documento a documento</span>
        </div>
        <div className="input-group input-group-sm rounded shadow-sm overflow-hidden" style={{ width: '320px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'var(--card-glass)', backdropFilter: 'blur(10px)' }}>
          <span className="input-group-text bg-transparent border-0" style={{ color: 'var(--text-aux)' }}><FaSearch/></span>
          <input type="text" className="form-control border-0 shadow-none fw-bold bg-transparent" placeholder="Buscar Chave ou Transportador..." style={{ fontSize: '12px', color: 'var(--text-main)' }} value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
        </div>
      </div>

      <div className="row g-3 align-items-stretch">
        <div className="col-xl-3 d-flex flex-column gap-3">
          <div className="glass-panel p-3 d-flex flex-column justify-content-center" style={{ flex: 1 }}>
            <h6 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-aux)', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Volume Pendente</h6>
            <div className="d-flex align-items-center mb-2">
              <FaClipboardList className="me-2" style={{ color: TEMA.chart1, fontSize: '20px' }} />
              <span className="fw-bold tabular-nums" style={{ fontSize: '26px', color: 'var(--text-main)' }}>{formatarNumero(Math.round(stats.total.q))}</span>
            </div>
            <div className="d-flex align-items-center">
              <FaFileInvoiceDollar className="me-2" style={{ color: TEMA.chart1, fontSize: '20px' }} />
              <span className="fw-bold tabular-nums" style={{ fontSize: '22px', color: 'var(--text-secondary)' }}>R$ {formatarNumero(Math.round(stats.total.v))}</span>
            </div>
          </div>
          
          <div className="glass-panel p-3 d-flex flex-column justify-content-center gap-2" style={{ flex: 1 }}>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '12px', fontWeight: '800', color: TEMA.success }}>Sem Divergência</span>
              <span className="tabular-nums fw-bold" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{formatarNumero(stats.semDiv.q)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '12px', fontWeight: '800', color: TEMA.warn }}>Margem Aceitável</span>
              <span className="tabular-nums fw-bold" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{formatarNumero(stats.margem.q)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '12px', fontWeight: '800', color: TEMA.error }}>Divergente</span>
              <span className="tabular-nums fw-bold" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{formatarNumero(stats.div.q)}</span>
            </div>
          </div>
        </div>
        
        <div className="col-xl-4">
          <div className="glass-panel p-3 d-flex flex-column" style={{ height: '100%', minHeight: '220px' }}>
            <h6 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 15px 0' }}>Divergências por Taxa (R$)</h6>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosStackedTaxas} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: TEMA.textMain, fontWeight: '700', fontFamily: 'Urbanist'}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} formatter={(val) => `R$ ${formatarMoeda(val)}`} contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', fontFamily: 'Urbanist' }} />
                  <Bar dataKey="pos" name="A Menor (+)" fill={TEMA.chart1} stackId="a" barSize={20} />
                  <Bar dataKey="neg" name="A Maior (-)" fill={TEMA.error} stackId="a" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="glass-panel p-3 d-flex flex-column" style={{ height: '100%', minHeight: '220px' }}>
            <h6 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 15px 0' }}>Faturamento por Transportador (Pareto)</h6>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                {paretoComPct.length > 0 ? (
                  <ComposedChart data={paretoComPct} margin={{ top: 15, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: TEMA.textMain, fontWeight: '700', fontFamily: 'Urbanist'}} axisLine={false} tickLine={false} tickFormatter={(v) => v.substring(0, 10)} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide domain={[0, 110]} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} formatter={(v, n) => n === 'pct' ? `${v}%` : `R$ ${formatarMoeda(v)}`} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '700', fontFamily: 'Urbanist' }} />
                    <Bar yAxisId="left" dataKey="value" name="Faturamento" fill={TEMA.chart2} radius={[4, 4, 0, 0]} barSize={20}>
                      <LabelList dataKey="value" position="top" formatter={(v) => formatarNumero(Math.round(v))} style={{ fontSize: '9px', fontWeight: '700', fill: TEMA.textAux, fontFamily: 'Urbanist' }} />
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="pct" name="% Acumulado" stroke={TEMA.dark} strokeWidth={2} dot={{ r: 3, fill: TEMA.dark, strokeWidth:0 }} />
                  </ComposedChart>
                ) : <div className="text-center mt-5" style={{fontSize: '11px', color: 'var(--text-secondary)'}}>Aguardando dados...</div>}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center px-1">
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm glass-panel fw-bold" style={{ width: '180px', fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.6)' }} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="Todos">Todos os Status</option>
            <option value="Sem Divergência">Sem Divergência</option>
            <option value="Margem Aceitável">Margem Aceitável</option>
            <option value="Divergente">Divergente</option>
          </select>
          {/* CORREÇÃO APLICADA AQUI ABAIXO: */}
          <select className="form-select form-select-sm glass-panel fw-bold" style={{ width: '140px', fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit' }} value={itensPorPagina} onChange={e => setItensPorPagina(Number(e.target.value))}>
            <option value={10}>10 CT-es</option>
            <option value={25}>25 CT-es</option>
            <option value={50}>50 CT-es</option>
            <option value={100}>100 CT-es</option>
            <option value={500}>500 CT-es</option>
          </select>
        </div>
        <button className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center" style={{ fontSize: '12px', backgroundColor: 'var(--dark-highlight)', borderRadius: 'var(--radius-md)', padding: '6px 16px' }} onClick={aprovarLote}>
          <FaCheckDouble className="me-2"/> Aprovar Fila ({itensSelecionados.length})
        </button>
      </div>

      <div className="glass-panel p-0 overflow-hidden d-flex flex-column">
        <div className="custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '45vh' }}>
          <table className="table table-borderless table-hover table-sm mb-0 text-center align-middle" style={{ fontSize: '11px', backgroundColor: 'transparent' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', zIndex: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <tr className="text-uppercase" style={{ fontSize: '10px', color: 'var(--text-aux)' }}>
                <th className="ps-3 py-3"><input className="form-check-input" type="checkbox" style={{ borderRadius: '4px' }} onChange={(e) => handleSelectAll(e, dadosPaginados)} checked={dadosPaginados.length > 0 && itensSelecionados.length === dadosPaginados.length}/></th>
                <th className="text-start py-3">Chave CT-e</th>
                <th className="py-3">Transportador</th>
                <th className="py-3">Rota</th>
                <th className="py-3">Emissão</th>
                <th className="py-3">R$ Cobrado</th>
                <th className="py-3">R$ Calculado</th>
                <th className="py-3">Diferença</th>
                <th className="py-3">Status</th>
                <th className="py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {dadosPaginados.map((cte, idx) => (
                <tr key={idx} style={{ backgroundColor: itensSelecionados.includes(cte.chave) ? 'var(--status-success-bg)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                  <td className="ps-3 py-2"><input className="form-check-input" type="checkbox" style={{ borderRadius: '4px' }} checked={itensSelecionados.includes(cte.chave)} onChange={(e) => handleSelectItem(cte.chave, e.target.checked)} /></td>
                  <td className="text-start fw-bold" style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '12px' }}>{cte.chave}</td>
                  <td className="fw-bold text-muted">{cte.transportador}</td>
                  <td><span style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontSize: '10px' }}>{cte.rota}</span></td>
                  <td>{cte.emissao}</td>
                  <td className="fw-bold" style={{ color: 'var(--text-main)' }}>R$ {formatarMoeda(cte.vlrCobrado)}</td>
                  <td className="fw-bold" style={{ color: 'var(--text-secondary)' }}>R$ {formatarMoeda(cte.vlrCalculado)}</td>
                  <td className="fw-bold" style={{ color: cte.diffTotal > 0 ? 'var(--status-error-txt)' : (cte.diffTotal < 0 ? 'var(--status-success-txt)' : 'var(--text-main)') }}>R$ {formatarMoeda(Math.abs(cte.diffTotal))}</td>
                  <td>{getBadgeStatus(cte.status)}</td>
                  <td><button className="btn btn-sm fw-bold shadow-sm" style={{ backgroundColor: 'var(--card-solid)', color: 'var(--primary)', fontSize: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }} onClick={() => abrirModal(cte)}>Auditar</button></td>
                </tr>
              ))}
              {dadosPaginados.length === 0 && (<tr><td colSpan="10" className="text-center py-5 fw-bold" style={{ color: 'var(--text-aux)' }}>Nenhum documento encontrado.</td></tr>)}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ DE PAGINAÇÃO */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            A mostrar {dadosFiltradosBase.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0} a {Math.min(paginaAtual * itensPorPagina, dadosFiltradosBase.length)} de {dadosFiltradosBase.length} CT-es
          </span>
          <div className="btn-group shadow-sm">
            <button className="btn btn-sm btn-light fw-bold" style={{ fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)' }} onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))} disabled={paginaAtual === 1}>
              Anterior
            </button>
            <button className="btn btn-sm btn-light fw-bold" style={{ fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'default' }} disabled>
              Página {paginaAtual} de {totalPaginas}
            </button>
            <button className="btn btn-sm btn-light fw-bold" style={{ fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)' }} onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))} disabled={paginaAtual === totalPaginas}>
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETALHAMENTO INDIVIDUAL COM GLASSMORPHISM */}
      {modalAberto && cteSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 32, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel d-flex flex-column shadow-lg" style={{ width: '1300px', maxWidth: '98vw', maxHeight: '92vh', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--card-solid)', border: '1px solid rgba(255,255,255,0.8)' }}>
            
            {/* CABEÇALHO COM BADGES (Série, Soma NF, Peso) */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <div>
                <h6 className="fw-bold mb-1 text-start" style={{ color: 'var(--text-aux)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auditoria de Documento</h6>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ fontSize: '22px', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '900', letterSpacing: '1px' }}>{cteSelecionado.chave}</div>
                  <span className="badge shadow-sm" style={{ backgroundColor: 'var(--card-blue)', color: 'var(--dark-highlight)', fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>Série: {cteSelecionado.serie}</span>
                  <span className="badge shadow-sm" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)', fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>NFs: R$ {formatarMoeda(cteSelecionado.somaNf)}</span>
                  <span className="badge shadow-sm" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)', fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>Peso: {formatarNumero(cteSelecionado.pesoKg)} kg</span>
                </div>
              </div>
              <button className="btn btn-sm btn-light border-0 shadow-sm" style={{ borderRadius: 'var(--radius-pill)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={fecharModal}><FaTimes className="text-muted"/></button>
            </div>
            
            {/* BARRA DE METADADOS EM FORMATO CÁPSULA */}
            <div className="px-4 pt-3 pb-2" style={{ backgroundColor: '#F8FAFC' }}>
              <div className="d-flex justify-content-between align-items-center px-4 py-2 shadow-sm" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="text-center" style={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-aux)' }}>Data Emissão</div>
                  <div className="fw-bold tabular-nums" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{cteSelecionado.emissao}</div>
                </div>
                <div className="text-center" style={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-aux)' }}>ID Rota</div>
                  <div className="fw-bold" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{cteSelecionado.rota}</div>
                </div>
                <div className="text-center" style={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-aux)' }}>Documento Ariba</div>
                  <div className="fw-bold" style={{ fontSize: '13px', color: 'var(--primary)' }}>{cteSelecionado.docAriba}</div>
                </div>
                <div className="text-center" style={{ flex: 1, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-aux)' }}>Início Vigência</div>
                  <div className="fw-bold tabular-nums" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{cteSelecionado.vigenciaInicio}</div>
                </div>
                <div className="text-center" style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-aux)' }}>Final Vigência</div>
                  <div className="fw-bold tabular-nums" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{cteSelecionado.vigenciaFim}</div>
                </div>
              </div>
            </div>

            {/* TABELA DE TAXAS */}
            <div className="card-body px-4 pb-2 pt-1 custom-scrollbar" style={{ overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
              
              {cteSelecionado.rotaUf === 'BA > SE' && (
                <div className="text-center fw-bold mb-3 shadow-sm" style={{ color: 'var(--status-error-txt)', backgroundColor: 'var(--status-error-bg)', padding: '8px', borderRadius: 'var(--radius-pill)', fontSize: '11px' }}>
                  Para esta Rota o valor do ICMS é aplicado diretamente em cada taxa/composição!
                </div>
              )}
              
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'white' }}>
                <table className="table table-borderless mb-0 text-center align-middle" style={{ fontSize: '11px', tableLayout: 'fixed' }}>
                  <thead style={{ backgroundColor: 'var(--dark-highlight)' }}>
                    <tr className="text-uppercase" style={{ fontSize: '10px', color: 'white' }}>
                      <th className="py-2 px-2 text-start">Descrição</th>
                      <th className="py-2 px-2">Tarifa Calculada</th>
                      <th className="py-2 px-2">Valor Calculado</th>
                      <th className="py-2 px-2">Tarifa Aplicada</th>
                      <th className="py-2 px-2">Valor Cobrado</th>
                      <th className="py-2 px-2">Diferença (R$)</th>
                      <th className="py-2 px-2" style={{ width: '18%' }}>Auditoria Individual</th>
                    </tr>
                  </thead>
                  
                  <tbody className="tabular-nums" style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                    {[
                      { nome: 'Valor Frete Bruto', d: cteSelecionado.detalhes.freteBruto },
                      { nome: 'ICMS', d: cteSelecionado.detalhes.icms }
                    ].map((taxa, idx) => {
                      const diff = taxa.d.diff; const isDiff = Math.abs(diff) > 0.01;
                      const taxaId = mapaTaxasId[taxa.nome]; const tratadaMassa = tratativasGlobais[cteSelecionado?.chave]?.[taxaId];

                      let bgDiff = 'transparent'; let colorDiff = 'var(--text-main)'; let strDiff = `R$ 0,00`;
                      if (diff > 0.01) { bgDiff = 'var(--status-success-bg)'; colorDiff = 'var(--status-success-txt)'; strDiff = `+ R$ ${formatarMoeda(diff)}`; }
                      else if (diff < -0.01) { bgDiff = 'var(--status-error-bg)'; colorDiff = 'var(--status-error-txt)'; strDiff = `- R$ ${formatarMoeda(Math.abs(diff))}`; }

                      return (
                        <tr key={`tot-${idx}`} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <td className="py-2 px-2 text-start fw-bold text-uppercase" style={{ color: 'var(--text-main)' }}>{taxa.nome}</td>
                          <td className="py-2 px-2 fw-bold" style={{ color: 'var(--text-secondary)' }}>{taxa.d.calcRate}</td>
                          <td className="py-2 px-2">R$ {formatarMoeda(taxa.d.calcVal)}</td>
                          <td className="py-2 px-2 fw-bold" style={{ color: 'var(--text-secondary)' }}>{taxa.d.cobRate}</td>
                          <td className="py-2 px-2">R$ {formatarMoeda(taxa.d.cobVal)}</td>
                          <td className="py-2 px-2 fw-bold align-middle">
                            <div style={{ backgroundColor: bgDiff, color: colorDiff, padding: '4px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>{strDiff}</div>
                          </td>
                          <td className="py-2 px-2 align-middle">
                            {tratadaMassa ? (
                              <div className="d-flex align-items-center justify-content-center">
                                <span style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-txt)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '9px', fontWeight: '800' }} title={`Status: ${tratadaMassa.status}`}>TRATADO EM MASSA</span>
                                <button className="btn btn-sm p-0 border-0 ms-1" style={{ color: 'var(--status-error-txt)' }} onClick={() => onRemoverTratativa(cteSelecionado.chave, taxaId)}><FaTimes /></button>
                              </div>
                            ) : isDiff ? (
                              <select className="form-select form-select-sm shadow-sm mx-auto" style={{ fontSize: '10px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: '700', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)', width: '90%' }} value={obsTaxas[taxa.nome] || ''} onChange={(e) => setObsTaxas({ ...obsTaxas, [taxa.nome]: e.target.value })}>
                                <option value="">Ação...</option>
                                <option value="taxa_indevida">TAXA INDEVIDA</option>
                                <option value="erro_cadastro">ERRO DE CADASTRO</option>
                                <option value="erro_vigencia">ERRO DE VIGÊNCIA</option>
                              </select>
                            ) : (<span style={{ color: 'var(--text-aux)', fontSize: '12px' }}>-</span>)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  <tbody className="tabular-nums">
                    {[
                      { nome: 'Frete Peso', d: cteSelecionado.detalhes.peso }, { nome: 'Pedágio', d: cteSelecionado.detalhes.ped },
                      { nome: 'GRIS', d: cteSelecionado.detalhes.gris }, { nome: 'Ad Valorem', d: cteSelecionado.detalhes.adv },
                      { nome: 'SEC/CAT', d: cteSelecionado.detalhes.sec }, { nome: 'TDE', d: cteSelecionado.detalhes.tde }
                    ].map((taxa, idx) => {
                      const diff = taxa.d.diff; const isDiff = Math.abs(diff) > 0.01;
                      const taxaId = mapaTaxasId[taxa.nome]; const tratadaMassa = tratativasGlobais[cteSelecionado?.chave]?.[taxaId];

                      let bgDiff = 'transparent'; let colorDiff = 'var(--text-main)'; let strDiff = `R$ 0,00`;
                      if (diff > 0.01) { bgDiff = 'var(--status-success-bg)'; colorDiff = 'var(--status-success-txt)'; strDiff = `+ R$ ${formatarMoeda(diff)}`; }
                      else if (diff < -0.01) { bgDiff = 'var(--status-error-bg)'; colorDiff = 'var(--status-error-txt)'; strDiff = `- R$ ${formatarMoeda(Math.abs(diff))}`; }

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <td className="py-2 px-2 text-start fw-bold text-uppercase" style={{ color: 'var(--text-main)' }}>{taxa.nome}</td>
                          <td className="py-2 px-2 fw-bold" style={{ color: 'var(--text-secondary)' }}>{taxa.d.calcRate}</td>
                          <td className="py-2 px-2">R$ {formatarMoeda(taxa.d.calcVal)}</td>
                          <td className="py-2 px-2 fw-bold" style={{ color: 'var(--text-secondary)' }}>{taxa.d.cobRate}</td>
                          <td className="py-2 px-2">R$ {formatarMoeda(taxa.d.cobVal)}</td>
                          <td className="py-2 px-2 fw-bold align-middle">
                            <div style={{ backgroundColor: bgDiff, color: colorDiff, padding: '4px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>{strDiff}</div>
                          </td>
                          <td className="py-2 px-2 align-middle">
                            {tratadaMassa ? (
                              <div className="d-flex align-items-center justify-content-center">
                                <span style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-txt)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '9px', fontWeight: '800' }} title={`Status: ${tratadaMassa.status}`}>TRATADO EM MASSA</span>
                                <button className="btn btn-sm p-0 border-0 ms-1" style={{ color: 'var(--status-error-txt)' }} onClick={() => onRemoverTratativa(cteSelecionado.chave, taxaId)}><FaTimes /></button>
                              </div>
                            ) : isDiff ? (
                              <select className="form-select form-select-sm shadow-sm mx-auto" style={{ fontSize: '10px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: '700', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)', width: '90%' }} value={obsTaxas[taxa.nome] || ''} onChange={(e) => setObsTaxas({ ...obsTaxas, [taxa.nome]: e.target.value })}>
                                <option value="">Ação...</option>
                                <option value="taxa_indevida">TAXA INDEVIDA</option>
                                <option value="erro_cadastro">ERRO DE CADASTRO</option>
                                <option value="erro_vigencia">ERRO DE VIGÊNCIA</option>
                              </select>
                            ) : (<span style={{ color: 'var(--text-aux)', fontSize: '12px' }}>-</span>)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RODAPÉ COMPACTO: DECISÃO GERAL E BOTÕES */}
            <div className="p-3 d-flex justify-content-between align-items-center gap-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
              <div className="d-flex gap-3 flex-grow-1 align-items-center">
                <div style={{ minWidth: '150px' }}>
                  <select className="form-select form-select-sm shadow-sm" style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '700', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} value={decisaoFinal} onChange={(e) => { setDecisaoFinal(e.target.value); if (e.target.value !== 'REPROVAR') setMotivoReprovacao(''); }}>
                    <option value="">Decisão Final...</option>
                    <option value="APROVAR">✅ Aprovado</option>
                    <option value="REPROVAR">❌ Reprovado</option>
                  </select>
                </div>
                <div style={{ minWidth: '180px' }}>
                  <select className="form-select form-select-sm shadow-sm" style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '700', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} value={motivoReprovacao} onChange={(e) => setMotivoReprovacao(e.target.value)} disabled={decisaoFinal !== 'REPROVAR'}>
                    <option value="">Motivo da Reprovação...</option>
                    <option value="tabela_errada">Tabela Desatualizada</option>
                    <option value="duplicidade">Duplicidade de Cobrança</option>
                    <option value="taxa_nao_negociada">Taxa Não Negociada</option>
                  </select>
                </div>
                <div className="flex-grow-1">
                  <input type="text" className="form-control form-control-sm shadow-sm" placeholder="Observações e Adendos finais..." style={{ fontSize: '12px', fontWeight: '600', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} value={obsLivre} onChange={(e) => setObsLivre(e.target.value)} />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-sm fw-bold shadow-sm" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', padding: '8px 20px' }} onClick={fecharModal}>Cancelar</button>
                <button 
                  className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center" 
                  style={{ backgroundColor: isBotaoGravarHabilitado() ? 'var(--dark-highlight)' : 'var(--text-aux)', borderRadius: 'var(--radius-md)', padding: '8px 24px', cursor: isBotaoGravarHabilitado() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }} 
                  onClick={gravarAuditoriaLocal} disabled={!isBotaoGravarHabilitado()}
                >
                  <FaCheck className="me-2"/> Salvar Auditoria
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}