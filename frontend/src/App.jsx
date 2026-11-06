import React, { useState, useEffect, Fragment, useMemo } from 'react';
import api from '../services/api';
import { FaClipboardList, FaClock, FaHistory, FaSearch, FaFilter, FaArrowDown, FaArrowUp, FaTimes, FaSignInAlt, FaTruck, FaWeightHanging, FaRoad, FaFileInvoiceDollar, FaFileContract, FaChartLine, FaEye, FaCheck, FaBan, FaExclamationTriangle, FaCheckDouble, FaDownload, FaChartBar, FaLayerGroup, FaHome, FaChevronDown, FaChevronRight, FaCog } from 'react-icons/fa';
import { MdSpaceDashboard } from 'react-icons/md';
import TelaGeracaoTemplate from './pages/TelaGeracaoTemplate';
import TelaCadastroGeneralidades from './pages/TelaCadastroGeneralidades';
import TelaInicial from './pages/TelaInicial';
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
    
    api.post('/api/dados-dashboard', { abaAtiva: 'relatorio_dinamico', ...filtrosRelatorio })
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
    
    const csvContent = "﻿" + [cabecalho, ...linhas].join('
'); 
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

  // Novos Estados de Paginação e Ordenação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(50);
  const [ordenacao, setOrdenacao] = useState({ coluna: 'impacto', direcao: 'desc' });

  const { tabela = [] } = dados || {};

  // Reseta a página ao trocar de taxa, volume de página ou ordenação
  useEffect(() => { setPaginaAtual(1); }, [taxaAtiva, itensPorPagina, ordenacao]);

  const handleSort = (coluna) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

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

    return Object.values(grupos);
  }, [tabela, taxaAtiva]);

  // Aplicação da Ordenação
  const agrupamentoOrdenado = [...agrupamentoReal].sort((a, b) => {
    let valA = a[ordenacao.coluna];
    let valB = b[ordenacao.coluna];
    
    // CORREÇÃO: Removido o Math.abs() para permitir a ordenação numérica contínua (negativos para positivos)
    if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
    if (valA < valB) return ordenacao.direcao === 'asc' ? -1 : 1;
    if (valA > valB) return ordenacao.direcao === 'asc' ? 1 : -1;
    return 0;
  });

  // Fatiamento da Paginação
  const totalPaginas = Math.ceil(agrupamentoOrdenado.length / itensPorPagina) || 1;
  const dadosPaginados = agrupamentoOrdenado.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

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
    const csvContent = "﻿" + [cabecalho, ...linhas].join('
'); 
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
              <tr className="text-uppercase" style={{ fontSize: '10px', color: 'var(--text-aux)', cursor: 'pointer' }}>
                <th className="px-3 py-3 text-start" onClick={() => handleSort('transportador')}>
                  Transportador {ordenacao.coluna === 'transportador' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3" onClick={() => handleSort('tabelaAriba')}>
                  Tabela Ariba {ordenacao.coluna === 'tabelaAriba' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3" onClick={() => handleSort('rota')}>
                  Rota (UF) {ordenacao.coluna === 'rota' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3" onClick={() => handleSort('tarifaNegociada')}>
                  Tarifa Negociada {ordenacao.coluna === 'tarifaNegociada' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3" onClick={() => handleSort('divergenciaPct')}>
                  Divergência (%) {ordenacao.coluna === 'divergenciaPct' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3" onClick={() => handleSort('qtd')}>
                  Volume {ordenacao.coluna === 'qtd' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3" onClick={() => handleSort('impacto')}>
                  Impacto (R$) {ordenacao.coluna === 'impacto' && (ordenacao.direcao === 'asc' ? <FaArrowUp/> : <FaArrowDown/>)}
                </th>
                <th className="px-3 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {dadosPaginados.map((row) => (
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
              {dadosPaginados.length === 0 && (<tr><td colSpan="8" className="text-center py-5 fw-bold" style={{ color: 'var(--text-aux)' }}>Nenhuma divergência encontrada.</td></tr>)}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ DE PAGINAÇÃO - TELA AUDITAR TAXA */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <div className="d-flex align-items-center gap-3">
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              A mostrar {agrupamentoOrdenado.length > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0} a {Math.min(paginaAtual * itensPorPagina, agrupamentoOrdenado.length)} de {agrupamentoOrdenado.length} Agrupamentos
            </span>
            <select className="form-select form-select-sm shadow-sm fw-bold" style={{ width: '130px', fontSize: '12px', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)' }} value={itensPorPagina} onChange={e => setItensPorPagina(Number(e.target.value))}>
              <option value={10}>10 por pág.</option>
              <option value={25}>25 por pág.</option>
              <option value={50}>50 por pág.</option>
              <option value={100}>100 por pág.</option>
            </select>
          </div>
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
// COMPONENTE: TELA DE CONFIGURAÇÕES (Perfil e Cadastro Dinâmico)
// ============================================================================
function TelaConfiguracoes({ usuarioLogado, onAtualizarUsuario }) {
  // O estado agora inicia lendo as informações reais do usuário logado
  const [perfilForm, setPerfilForm] = useState({ 
    nome: usuarioLogado?.nome || '',
    email: usuarioLogado?.email || '',
    funcao: usuarioLogado?.funcao || 'Especialista', 
    departamento: usuarioLogado?.departamento || 'Transportes',
    slack: usuarioLogado?.slack_id || ('@' + (usuarioLogado?.nome ? usuarioLogado.nome.toLowerCase().replace(/\s+/g, '.') : 'usuario')),
    senhaAtual: '',
    novaSenha: '', 
    confirmaSenha: '' 
  });

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Sincroniza caso o usuário logado mude em background
  useEffect(() => {
    if (usuarioLogado) {
      setPerfilForm(prev => ({
        ...prev,
        nome: usuarioLogado.nome || '',
        email: usuarioLogado.email || '',
        funcao: usuarioLogado.funcao || prev.funcao,
        departamento: usuarioLogado.departamento || prev.departamento,
        slack: usuarioLogado.slack_id || prev.slack
      }));
    }
  }, [usuarioLogado]);

  const getIniciais = (nome) => {
    if (!nome) return 'GB';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const handleSalvar = async () => {
    // Validação básica de senha
    if (perfilForm.novaSenha && perfilForm.novaSenha !== perfilForm.confirmaSenha) {
      setMensagem({ texto: 'A nova senha e a confirmação não conferem.', tipo: 'danger' });
      return;
    }

    setCarregando(true);
    setMensagem({ texto: '', tipo: '' });

    // [FUTURO - INTEGRAÇÃO COM BACKEND]
    /*
    try {
      const payload = {
        id: usuarioLogado.id,
        funcao: perfilForm.funcao,
        departamento: perfilForm.departamento,
        slack_id: perfilForm.slack,
        // Só envia senhas se o usuário quiser alterar (e deve exigir a atual no backend)
        senhaAtual: perfilForm.senhaAtual,
        novaSenha: perfilForm.novaSenha
      };
      
      const response = await api.put('/api/usuarios/perfil', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'success' });
      // Atualiza o estado global no App.jsx se a função for provida
      if(onAtualizarUsuario) onAtualizarUsuario(response.data.usuario);
      
      // Limpa os campos de senha
      setPerfilForm(prev => ({ ...prev, senhaAtual: '', novaSenha: '', confirmaSenha: '' }));

    } catch (error) {
      setMensagem({ texto: error.response?.data?.erro || 'Erro ao atualizar perfil.', tipo: 'danger' });
    } finally {
      setCarregando(false);
    }
    */

    // [PRESENTE - MOCK]
    setTimeout(() => {
      setMensagem({ texto: 'Perfil atualizado com sucesso (Mock)!', tipo: 'success' });
      setCarregando(false);
      setPerfilForm(prev => ({ ...prev, senhaAtual: '', novaSenha: '', confirmaSenha: '' }));
      if(onAtualizarUsuario) onAtualizarUsuario({ ...usuarioLogado, ...perfilForm });
    }, 800);
  };

  return (
    <div className="d-flex flex-column gap-3 h-100 mx-auto" style={{ maxWidth: '900px', width: '100%' }}>
      <div className="px-2 mt-2 mb-2 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Configurações de Perfil</h4>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Gerencie suas informações, cargo e credenciais de acesso.</span>
        </div>
        {usuarioLogado?.role === 'ADMIN' && (
          <span className="badge bg-danger shadow-sm px-3 py-2" style={{borderRadius: 'var(--radius-pill)'}}>Perfil Administrador</span>
        )}
      </div>

      <div className="glass-panel p-4 d-flex flex-column custom-scrollbar shadow-sm flex-grow-1" style={{ overflowY: 'auto' }}>
        <div className="d-flex flex-column align-items-center mb-4 pb-4 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <div className="position-relative mb-3">
            <div className="user-avatar shadow-sm d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--card-blue)', color: 'var(--primary)', fontSize: '32px', fontWeight: '800', border: '4px solid var(--card-solid)' }}>
              {getIniciais(perfilForm.nome)}
            </div>
          </div>
          <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{perfilForm.nome}</h5>
          <span className="text-muted" style={{ fontSize: '12px', fontWeight: '600' }}>{perfilForm.email}</span>
        </div>

        {mensagem.texto && (
          <div className={`alert alert-${mensagem.tipo} py-2 px-3 fw-bold text-center`} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)' }}>
            {mensagem.texto}
          </div>
        )}

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Nome Completo (SSO)</label>
            <input type="text" className="form-control form-control-sm fw-bold shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8f9fa' }} value={perfilForm.nome} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Email Corporativo (SSO)</label>
            <input type="text" className="form-control form-control-sm fw-bold shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8f9fa' }} value={perfilForm.email} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Função</label>
            <input type="text" className="form-control form-control-sm fw-bold shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-main)' }} value={perfilForm.funcao} onChange={(e) => setPerfilForm({...perfilForm, funcao: e.target.value})} />
          </div>
          <div className="col-md-4">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Departamento</label>
            <input type="text" className="form-control form-control-sm fw-bold shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-main)' }} value={perfilForm.departamento} onChange={(e) => setPerfilForm({...perfilForm, departamento: e.target.value})} />
          </div>
          <div className="col-md-4">
            <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Usuário Slack</label>
            <input type="text" className="form-control form-control-sm fw-bold shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-main)' }} value={perfilForm.slack} onChange={(e) => setPerfilForm({...perfilForm, slack: e.target.value})} />
          </div>
        </div>

        {/* SEÇÃO DE SEGURANÇA - SÓ EXIBE SE O USUÁRIO FOR LOCAL (NÃO SSO) */}
        {!usuarioLogado?.sso_provider && (
          <div className="p-4 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h6 className="fw-bold mb-3" style={{ fontSize: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Segurança & Acesso (Login Local)</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Senha Atual</label>
                <input type="password" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="Obrigatório para alterar" value={perfilForm.senhaAtual} onChange={(e) => setPerfilForm({...perfilForm, senhaAtual: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Nova Senha</label>
                <input type="password" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="••••••••" value={perfilForm.novaSenha} onChange={(e) => setPerfilForm({...perfilForm, novaSenha: e.target.value})} disabled={!perfilForm.senhaAtual} />
              </div>
              <div className="col-md-4">
                <label className="form-label mb-1" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Confirmar Nova Senha</label>
                <input type="password" className="form-control form-control-sm shadow-sm" style={{ fontSize: '13px', padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="••••••••" value={perfilForm.confirmaSenha} onChange={(e) => setPerfilForm({...perfilForm, confirmaSenha: e.target.value})} disabled={!perfilForm.senhaAtual} />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-auto d-flex justify-content-end">
          <button 
            className="btn text-white fw-bold shadow-sm d-flex align-items-center px-4 py-2" 
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-pill)', fontSize: '13px' }} 
            onClick={handleSalvar}
            disabled={carregando}
          >
            {carregando ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaCheck className="me-2"/>}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL (Orquestrador)
// ============================================================================
export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('home');
  const [carregando, setCarregando] = useState(false);
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  // Controle de expansão do Menu Lateral Dropdown
  const [menuExpansivel, setMenuExpansivel] = useState({ acompanhamento: false, auditoria: false, gerenciar: false, relatorios: false });
  const toggleMenu = (menu) => setMenuExpansivel(prev => ({ ...prev, [menu]: !prev[menu] }));

  // NOVO: Estado Global de Tratativas para sincronizar decisões entre as telas
  const [tratativasGlobais, setTratativasGlobais] = useState({});

  // ESTADO GLOBAL: Compartilha as Generalidades cadastradas entre as telas (Inicia vazio)
  const [historicoGeneralidades, setHistoricoGeneralidades] = useState([]);

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
  
  // CORREÇÃO: Adicionado dadosAba.analiseMassa para garantir que as opções carreguem na Auditar Taxas
  const filtrosOpcoes = dadosAba.visaoGeral?.filtrosOpcoes || dadosAba.painelAuditoria?.filtrosOpcoes || dadosAba.auditoria?.filtrosOpcoes || dadosAba.analiseMassa?.filtrosOpcoes || dadosAba.relatorio?.filtrosOpcoes || {};

  const atualizarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [telaAtiva]: { ...prev[telaAtiva], [campo]: valor }
    }));
  };

  const limparFiltros = () => {
    setFiltros(prev => ({ ...prev, [telaAtiva]: { ...filtrosPadrao } }));
    carregarDados(filtrosPadrao);
  };

  const carregarDados = (filtrosOverride = null) => {
    if (!['visaoGeral', 'painelAuditoria', 'auditoria', 'relatorio', 'analiseMassa'].includes(telaAtiva)) return;
    
    setCarregando(true);
    const payload = { ...(filtrosOverride || filtros[telaAtiva]), abaAtiva: telaAtiva };
    
    api.post('/api/dados-dashboard', payload)
      .then(response => { 
        setDadosAba(prev => ({ ...prev, [telaAtiva]: response.data })); 
        setCarregando(false); 
      })
      .catch(error => { console.error("Erro BQ:", error); setCarregando(false); });
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
    <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: 'var(--bg-page)', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* MENU LATERAL FULL-HEIGHT */}
      <aside className="d-flex flex-column" style={{ backgroundColor: 'var(--dark-highlight)', width: '260px', minWidth: '260px', height: '100vh', boxShadow: '2px 0 10px rgba(0,0,0,0.15)', zIndex: 100, flexShrink: 0 }}>
        
        {/* LOGO E ÁREA DE TRANSPORTES */}
        <div className="d-flex flex-column align-items-center py-4 mb-2 hover-scale" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setTelaAtiva('home')}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '45px', height: '45px', backgroundColor: 'var(--card-solid)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0px rgba(0,0,0,0.05)' }}>
              <img src="/logo.png" alt="Logo GB" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <h6 className="fw-bold text-white mb-0" style={{ fontSize: '18px', letterSpacing: '0.5px' }}>Transportes GB</h6>
          </div>
          <span className="mt-2 fw-bold" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Auditoria de Fretes</span>
        </div>
        
        <div className="sidebar-menu custom-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '0 10px' }}>
          
          <button className={`menu-item ${telaAtiva === 'home' ? 'active' : ''}`} onClick={() => setTelaAtiva('home')} style={{ borderRadius: 'var(--radius-md)' }}>
            <FaHome className="menu-icon"/> Home
          </button>

          {/* SESSÃO: ACOMPANHAMENTO */}
          <div className="d-flex flex-column mt-2">
            <button className="menu-item justify-content-between" onClick={() => toggleMenu('acompanhamento')} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="d-flex align-items-center"><MdSpaceDashboard className="menu-icon"/> Acompanhamento</div>
              {menuExpansivel.acompanhamento ? <FaChevronDown size={10}/> : <FaChevronRight size={10}/>}
            </button>
            {menuExpansivel.acompanhamento && (
              <div className="d-flex flex-column ms-4 mt-1 gap-1 border-start border-secondary ps-2">
                <button className={`menu-item py-2 ${telaAtiva === 'visaoGeral' ? 'active' : ''}`} onClick={() => setTelaAtiva('visaoGeral')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Painel Geral</button>
                <button className={`menu-item py-2 ${telaAtiva === 'painelAuditoria' ? 'active' : ''}`} onClick={() => setTelaAtiva('painelAuditoria')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Painel Auditoria</button>
              </div>
            )}
          </div>

          {/* SESSÃO: AUDITORIA */}
          <div className="d-flex flex-column mt-2">
            <button className="menu-item justify-content-between" onClick={() => toggleMenu('auditoria')} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="d-flex align-items-center"><FaClipboardList className="menu-icon"/> Auditoria</div>
              {menuExpansivel.auditoria ? <FaChevronDown size={10}/> : <FaChevronRight size={10}/>}
            </button>
            {menuExpansivel.auditoria && (
              <div className="d-flex flex-column ms-4 mt-1 gap-1 border-start border-secondary ps-2">
                <button className={`menu-item py-2 ${telaAtiva === 'auditoria' ? 'active' : ''}`} onClick={() => setTelaAtiva('auditoria')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Auditar CT-e</button>
                <button className={`menu-item py-2 ${telaAtiva === 'analiseMassa' ? 'active' : ''}`} onClick={() => setTelaAtiva('analiseMassa')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Auditar Taxas</button>
              </div>
            )}
          </div>

          {/* SESSÃO: GERENCIAR */}
          <div className="d-flex flex-column mt-2">
            <button className="menu-item justify-content-between" onClick={() => toggleMenu('gerenciar')} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="d-flex align-items-center"><FaFileContract className="menu-icon"/> Gerenciar</div>
              {menuExpansivel.gerenciar ? <FaChevronDown size={10}/> : <FaChevronRight size={10}/>}
            </button>
            {menuExpansivel.gerenciar && (
              <div className="d-flex flex-column ms-4 mt-1 gap-1 border-start border-secondary ps-2">
                <button className={`menu-item py-2 ${telaAtiva === 'geracaoTemplate' ? 'active' : ''}`} onClick={() => setTelaAtiva('geracaoTemplate')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Central de Tabelas de Frete</button>
                <button className={`menu-item py-2 ${telaAtiva === 'cadastroGeneralidades' ? 'active' : ''}`} onClick={() => setTelaAtiva('cadastroGeneralidades')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Central de Generalidades</button>
              </div>
            )}
          </div>

          {/* SESSÃO: RELATÓRIOS */}
          <div className="d-flex flex-column mt-2">
            <button className="menu-item justify-content-between" onClick={() => toggleMenu('relatorios')} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="d-flex align-items-center"><FaHistory className="menu-icon"/> Relatórios</div>
              {menuExpansivel.relatorios ? <FaChevronDown size={10}/> : <FaChevronRight size={10}/>}
            </button>
            {menuExpansivel.relatorios && (
              <div className="d-flex flex-column ms-4 mt-1 gap-1 border-start border-secondary ps-2">
                <button className={`menu-item py-2 ${telaAtiva === 'relatorio' ? 'active' : ''}`} onClick={() => setTelaAtiva('relatorio')} style={{ fontSize: '11px', borderRadius: 'var(--radius-md)' }}>Relatórios Gerais</button>
              </div>
            )}
          </div>
        </div>

        {/* RODAPÉ DO MENU LATERAL */}
        <div className="mt-auto px-3 pb-3 pt-3 d-flex flex-column gap-2" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <button className={`menu-item ${telaAtiva === 'configuracoes' ? 'active' : ''}`} onClick={() => setTelaAtiva('configuracoes')} style={{ borderRadius: 'var(--radius-md)' }}>
            <FaCog className="menu-icon"/> Configurações
          </button>
          
          <div className="d-flex align-items-center p-2 hover-scale mt-1" style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={() => setTelaAtiva('configuracoes')} title={`Meu Perfil (${usuarioLogado.nome})`}>
            <div className="user-avatar shadow-sm flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--card-blue)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
              {getIniciais(usuarioLogado.nome)}
            </div>
            <div className="ms-3 d-flex flex-column overflow-hidden text-truncate">
              <span className="text-white fw-bold" style={{ fontSize: '12px' }}>{usuarioLogado.nome}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Ver Perfil</span>
            </div>
          </div>

          <button className="menu-item mt-1 d-flex align-items-center" onClick={() => setUsuarioLogado(null)} style={{ borderRadius: 'var(--radius-md)', fontSize: '11px', color: '#F1948A', padding: '8px 15px' }}>
            <FaSignInAlt className="menu-icon" style={{ transform: 'rotate(180deg)', fontSize: '13px', color: '#F1948A' }}/> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: '20px 24px 20px 24px' }}>
        
        <header className="d-flex justify-content-between align-items-center" style={{ padding: '0 10px 20px 10px' }}>
          <div className="fw-bold" style={{ fontSize: '17px', color: 'var(--text-main)' }}>{getBreadcrumb()}</div>
          
          <div className="d-flex gap-3 align-items-center">
            {['visaoGeral', 'painelAuditoria', 'auditoria', 'analiseMassa'].includes(telaAtiva) && (
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
          </div>
        </header>

        {/* CONTAINER DINÂMICO DE ECRÃS */}
        <div className="content-wrapper custom-scrollbar d-flex flex-column" style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px 10px', borderRadius: 'var(--radius-xl)' }}>
          {/* NOVA TELA INICIAL (DASHBOARD/HOME COM ASSISTENTE) */}
          {telaAtiva === 'home' && <TelaInicial setMenuAtivo={setTelaAtiva} />}

          {/* DEMAIS TELAS DO SISTEMA */}
          {telaAtiva === 'visaoGeral' && dadosAtuais && <TelaVisaoGeral nomeUsuario={usuarioLogado.nome} dados={dadosAtuais} />}
          {telaAtiva === 'painelAuditoria' && dadosAtuais && <TelaPainelAuditoria nomeUsuario={usuarioLogado.nome} dados={dadosAtuais} />}
          
          {telaAtiva === 'auditoria' && dadosAtuais && <TelaFilaAuditoria nomeUsuario={usuarioLogado.nome} dados={dadosAtuais} tratativasGlobais={tratativasGlobais} onSalvarTratativas={handleSalvarTratativas} onRemoverTratativa={handleRemoverTratativa} />}
          
          {telaAtiva === 'relatorio' && <TelaRelatorio filtrosOpcoes={filtrosOpcoes} />}
          {telaAtiva === 'analiseMassa' && dadosAtuais && <TelaAnaliseMassa dados={dadosAtuais} onSalvarTratativas={handleSalvarTratativas} />}
          
          {telaAtiva === 'geracaoTemplate' && <TelaGeracaoTemplate />}
          {telaAtiva === 'repositorioTabelas' && <TelaEmDesenvolvimento titulo="Repositório de Tabelas e Contratos" />}
          {telaAtiva === 'cadastroGeneralidades' && <TelaCadastroGeneralidades />}
          {telaAtiva === 'configuracoes' && <TelaConfiguracoes usuarioLogado={usuarioLogado} />}
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
            <button className="btn w-100 fw-bold shadow-sm" style={{ backgroundColor: 'var(--dark-highlight)', color: 'white', borderRadius: 'var(--radius-md)', padding: '10px' }} onClick={() => { setPainelFiltrosAberto(false); carregarDados(filtros[telaAtiva]); }}>Aplicar Filtros</button>
          </div>
        </div>
      </main>
    </div>
  );
}
