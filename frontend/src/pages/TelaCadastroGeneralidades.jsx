// ============================================================================
// ARQUIVO: src/pages/TelaCadastroGeneralidades.jsx
// Módulo SaaS: Cadastro de Taxas Acessórias e Generalidades (TRT, TDE, TDA, Agendamento)
// ============================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FaCheck, FaArrowRight, FaMapMarkedAlt, FaMoneyBillWave, 
  FaPlus, FaBuilding, FaTimes, FaUpload, FaChartPie, FaSearch,
  FaEdit, FaTrash
} from 'react-icons/fa';
import api from '../services/api';
import { PARAMETROS_LOGISTICOS } from '../data/mockFrete';

// ================= FUNÇÕES UTILITÁRIAS =================
const formatarMoeda = (valor) => {
  if (!valor) return '0,00';
  const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
  if (isNaN(numero)) return '0,00';
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatarCNPJ = (cnpj) => {
  const v = cnpj.replace(/\D/g, '');
  if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

// Checkbox customizado com rolagem
const CheckboxList = ({ options, selected, onChange, height = '140px' }) => (
  <div className="border shadow-sm custom-scrollbar bg-white" style={{ height, overflowY: 'auto', borderRadius: 'var(--radius-md)', borderColor: 'rgba(0,0,0,0.05)' }}>
    {options.length === 0 ? (
      <div className="p-3 text-muted text-center fw-bold" style={{fontSize: '12px'}}>Nenhum dado para exibir...</div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', padding: '8px' }}>
        {options.map(opt => (
          <div className="form-check m-0 px-2 py-1 d-flex align-items-center rounded transition-all hover-bg-light" style={{ cursor: 'pointer' }} key={opt}>
            <input className="form-check-input flex-shrink-0 m-0 shadow-sm" type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px' }} checked={selected.includes(opt)} onChange={(e) => { if(e.target.checked) onChange([...selected, opt]); else onChange(selected.filter(item => item !== opt)); }} />
            <label className="form-check-label flex-grow-1 text-start ms-2 m-0 text-truncate fw-bold" style={{ fontSize: '11px', cursor: 'pointer', color: 'var(--text-main)', userSelect: 'none' }} onClick={() => { if(selected.includes(opt)) onChange(selected.filter(item => item !== opt)); else onChange([...selected, opt]); }}>{opt}</label>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function TelaCadastroGeneralidades({ usuarioLogado }) {
  const [passo, setPasso] = useState(0); 
  const [tipoCadastro, setTipoCadastro] = useState(null); 
  const [dadosIbge, setDadosIbge] = useState([]);
  const [alerta, setAlerta] = useState({ visivel: false, mensagem: '' });
  const [menuTiposAberto, setMenuTiposAberto] = useState(false);
  const fileInputRef = useRef(null);

  // Estados Histórico em Memória (Fila atual da sessão)
  const [historicoCadastros, setHistoricoCadastros] = useState([]);
  
  // Modal de Detalhes
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);
  const [cadastroSelecionado, setCadastroSelecionado] = useState(null);

  // ================= INTEGRAÇÕES (PRESENTE/FUTURO) =================
  useEffect(() => {
    api.get('/api/rotas-ibge')
      .then(res => setDadosIbge(res.data))
      .catch(err => console.error("Erro IBGE:", err));

    // [FUTURO] Buscar do PostgreSQL na AWS
    /*
    axios.get('http://localhost:3000/api/generalidades')
      .then(res => setHistoricoCadastros(res.data))
      .catch(err => console.error("Erro Backend:", err));
    */
  }, []);

  // Cálculo Dinâmico de KPIs
  const kpis = useMemo(() => {
    let calcCidadesTRT = 0, calcClientesAgendamento = 0, calcTaxaMaxTDE = 0;
    
    historicoCadastros.forEach(cad => {
      // Ignora itens com Soft Delete
      if (cad.status === 'Excluído') return;

      if (cad.tipo === 'TRT') calcCidadesTRT += (cad.abrangenciaDestino === 'Todas' ? (cad.ufsDestino?.length || 1) * 20 : (cad.detalheDestino?.length || 0));
      if (cad.tipo === 'AGENDAMENTO') calcClientesAgendamento += cad.cnpjsCliente?.length || 0;
      if (cad.tipo === 'TDE') {
        const valFixo = parseFloat(cad.valorFixo) || 0;
        if (valFixo > calcTaxaMaxTDE) calcTaxaMaxTDE = valFixo;
      }
    });
    return { cidadesTRT: calcCidadesTRT, clientesAgendamento: calcClientesAgendamento, taxaMaxTDE: formatarMoeda(calcTaxaMaxTDE), reajuste: '0.0' };
  }, [historicoCadastros]);

  const formInicial = { 
    id: null, docAriba: '', dataNegociacao: '', dataInicio: '', dataFim: '', transportador: '', 
    ufsDestino: [], abrangenciaDestino: 'Fixo', detalheDestino: [], 
    cnpjsCliente: [], valorFixo: '', valorPercentual: '', valorMinimo: '', aplicacaoTRT: [] 
  };
  
  const [form, setForm] = useState(formInicial);
  const [buscaCidade, setBuscaCidade] = useState('');
  const [currentCnpj, setCurrentCnpj] = useState('');
  
  const opcoesAplicacaoTRT = ['Frete Peso', 'Sec/Cat', 'Pedágio', 'Gris', 'Ad Valorem', 'ICMS', 'Valor Nota Fiscal'];

  const getUFsUnicas = () => [...new Set(dadosIbge.map(d => d.slg_uf).filter(Boolean))].sort();
  const getCidadesPorUFs = (ufsArray) => [...new Set(dadosIbge.filter(d => ufsArray.includes(d.slg_uf)).map(d => d.nome_cidade).filter(Boolean))].sort();
  const getMesorregioesPorUFs = (ufsArray) => [...new Set(dadosIbge.filter(d => ufsArray.includes(d.slg_uf)).map(d => `${d.mesorregiao} (${d.slg_uf})`).filter(Boolean))].sort();

  useEffect(() => {
    if (form.ufsDestino.length > 1 && form.abrangenciaDestino === 'Fixo') setForm(prev => ({ ...prev, abrangenciaDestino: 'Varias', detalheDestino: [] }));
    else if (form.ufsDestino.length === 0) setForm(prev => ({ ...prev, abrangenciaDestino: 'Fixo', detalheDestino: [] }));
    else setForm(prev => ({ ...prev, detalheDestino: [] }));
    setBuscaCidade('');
  }, [form.ufsDestino, form.abrangenciaDestino]);

  const iniciarCadastro = (tipo) => { setTipoCadastro(tipo); setForm(formInicial); setPasso(1); setMenuTiposAberto(false); };
  const handleBlurMoeda = (e, campo) => { const val = e.target.value; if (val) setForm({ ...form, [campo]: parseFloat(val).toFixed(2) }); };
  
  const validarESalvar = () => { 
    if (form.id) {
      setHistoricoCadastros(prev => prev.map(c => c.id === form.id ? { ...form, tipo: tipoCadastro, status: 'Ativo' } : c));
    } else {
      const novoCadastro = { ...form, id: Date.now(), docAriba: form.docAriba || 'NOVO DOC', tipo: tipoCadastro, status: 'Ativo', dataHoraCadastro: new Date().toLocaleDateString('pt-BR') };
      setHistoricoCadastros(prev => [novoCadastro, ...prev]);
    }
    
    // [FUTURO] - Integrar com AWS PostgreSQL aqui
    setAlerta({ visivel: true, mensagem: `Generalidade (${tipoCadastro}) processada e salva com sucesso!` }); 
    setPasso(0); 
    setTipoCadastro(null); 
  };

  const abrirDetalhe = (item) => { setCadastroSelecionado(item); setModalDetalheAberto(true); };
  const fecharDetalhe = () => { setCadastroSelecionado(null); setModalDetalheAberto(false); };

  const editarCadastro = () => {
    setForm({ ...formInicial, ...cadastroSelecionado });
    setTipoCadastro(cadastroSelecionado.tipo);
    setPasso(1);
    setModalDetalheAberto(false);
    setCadastroSelecionado(null);
  };

  const excluirCadastro = () => {
    // Soft Delete na memória
    setHistoricoCadastros(prev => prev.map(c => 
      c.id === cadastroSelecionado.id ? { ...c, status: 'Excluído' } : c
    ));
    setModalDetalheAberto(false);
    setCadastroSelecionado(null);
    setAlerta({ visivel: true, mensagem: 'Generalidade inativada/excluída com sucesso!' });
  };

  const handleUpload = (e) => {
    if(e.target.files.length > 0) setAlerta({ visivel: true, mensagem: `Arquivo ${e.target.files[0].name} processado! Dados importados em lote para o Banco de Dados.` });
  };

  const addCnpj = () => {
    const limpo = currentCnpj.replace(/\D/g, '');
    if (limpo.length === 11 || limpo.length === 14) {
      if (!form.cnpjsCliente.includes(limpo)) setForm(prev => ({ ...prev, cnpjsCliente: [...prev.cnpjsCliente, limpo] }));
      setCurrentCnpj('');
    }
  };

  const RenderizarDetalheRota = () => {
    const ufs = form.ufsDestino;
    const abragencia = form.abrangenciaDestino;
    const selecionados = form.detalheDestino;
    const setDetalhe = (val) => setForm({...form, detalheDestino: val});
    const filtradas = ufs.length > 0 ? getCidadesPorUFs(ufs).filter(c => c.toLowerCase().includes(buscaCidade.toLowerCase())) : [];

    if (ufs.length === 0) return <div className="text-muted p-3 text-center" style={{fontSize: '12px', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)'}}>Selecione uma UF...</div>;
    if (abragencia === 'Todas') return <div className="p-3 text-center text-success fw-bold shadow-sm bg-white" style={{fontSize: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.05)'}}>TODAS AS CIDADES (UFs SELECIONADAS)</div>;
    if (abragencia === 'Fixo') return (
      <select className="form-select shadow-sm py-2 fw-bold" style={{fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'white'}} value={selecionados[0] || ''} onChange={(e) => setDetalhe([e.target.value])}>
        <option value="">Selecione 1 cidade...</option>
        {getCidadesPorUFs(ufs).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    );
    if (abragencia === 'Mesorregiao') return <CheckboxList options={getMesorregioesPorUFs(ufs)} selected={selecionados} onChange={setDetalhe} height="135px" />;
    if (abragencia === 'Varias') return (
      <>
        <div className="input-group input-group-sm mb-2 shadow-sm">
          <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch/></span>
          <input type="text" className="form-control border-start-0 fw-bold" placeholder="Buscar cidade específica..." value={buscaCidade} onChange={e=>setBuscaCidade(e.target.value)} style={{fontSize: '11px', boxShadow: 'none'}}/>
        </div>
        <CheckboxList options={filtradas} selected={selecionados} onChange={setDetalhe} height="100px" />
      </>
    );
  };

  // ================= PASSO 0: DASHBOARD =================
  if (passo === 0) {
    return (
      <div className="d-flex flex-column gap-4 h-100 mx-auto animate-fade-in flex-grow-1" style={{ maxWidth: '1200px', width: '100%', minHeight: 'min-content' }}>
        
        {/* CABEÇALHO HERO */}
        <div className="p-4 rounded-4 shadow-sm position-relative overflow-hidden d-flex align-items-center" style={{ background: 'linear-gradient(135deg, rgba(42, 111, 154, 0.9), rgba(31, 77, 106, 0.9))', border: '1px solid rgba(255,255,255,0.2)', minHeight: '140px' }}>
          <div className="row w-100 align-items-center">
            <div className="col-12 text-white text-start">
              <h3 className="fw-bold mb-2" style={{ letterSpacing: '-0.5px' }}>Central de Generalidades</h3>
              <p className="mb-0" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Gerencie taxas acessórias, agendamentos e regras de restrição de trânsito.</p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end align-items-center position-relative">
          <button className="btn text-white fw-bold shadow-sm d-flex align-items-center gap-2 hover-scale px-4 py-2" style={{ backgroundColor: '#DF7659', borderRadius: 'var(--radius-pill)', fontSize: '13px', border: 'none' }} onClick={() => setMenuTiposAberto(!menuTiposAberto)}>
            <FaPlus /> Nova Parametrização
          </button>
          
          {menuTiposAberto && (
            <div className="position-absolute top-100 end-0 mt-2 bg-white border shadow-lg p-2 animate-fade-in d-flex flex-column gap-1" style={{ borderRadius: 'var(--radius-md)', zIndex: 100, width: '220px' }}>
              <button className="btn btn-sm btn-light fw-bold text-start px-3 py-2" style={{ fontSize: '12px', border: 'none' }} onClick={() => iniciarCadastro('TRT')}>Cadastro de TRT</button>
              <button className="btn btn-sm btn-light fw-bold text-start px-3 py-2" style={{ fontSize: '12px', border: 'none' }} onClick={() => iniciarCadastro('TDE')}>Cadastro de TDE</button>
              <button className="btn btn-sm btn-light fw-bold text-start px-3 py-2" style={{ fontSize: '12px', border: 'none' }} onClick={() => iniciarCadastro('TDA')}>Cadastro de TDA</button>
              <button className="btn btn-sm btn-light fw-bold text-start px-3 py-2" style={{ fontSize: '12px', border: 'none' }} onClick={() => iniciarCadastro('AGENDAMENTO')}>Cadastro de Agendamento</button>
            </div>
          )}
        </div>

        {/* CARDS GLASSMORPHISM */}
        <div className="row g-3">
          <div className="col-md-3">
            <div className="p-4 d-flex flex-column shadow-sm hover-scale" style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '45px', height: '45px', backgroundColor: 'rgba(42, 111, 154, 0.1)', color: '#2A6F9A' }}><FaMapMarkedAlt size={20} /></div>
              <h3 className="mb-1 fw-bold tabular-nums" style={{ color: 'var(--text-main)', fontSize: '28px' }}>{kpis.cidadesTRT.toLocaleString('pt-BR')}</h3>
              <span className="text-muted fw-bold" style={{ fontSize: '12px' }}>Cidades com TRT</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 d-flex flex-column shadow-sm hover-scale" style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '45px', height: '45px', backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659' }}><FaBuilding size={20} /></div>
              <h3 className="mb-1 fw-bold tabular-nums" style={{ color: 'var(--text-main)', fontSize: '28px' }}>{kpis.clientesAgendamento.toLocaleString('pt-BR')}</h3>
              <span className="text-muted fw-bold" style={{ fontSize: '12px' }}>Clientes c/ Agendamento</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 d-flex flex-column shadow-sm hover-scale" style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '45px', height: '45px', backgroundColor: 'rgba(47, 154, 126, 0.1)', color: '#2F9A7E' }}><FaMoneyBillWave size={20} /></div>
              <h3 className="mb-1 fw-bold tabular-nums" style={{ color: 'var(--text-main)', fontSize: '28px' }}>R$ {kpis.taxaMaxTDE}</h3>
              <span className="text-muted fw-bold" style={{ fontSize: '12px' }}>Taxa Máxima TDE Base</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 d-flex flex-column shadow-sm hover-scale" style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '45px', height: '45px', backgroundColor: 'rgba(207, 148, 38, 0.1)', color: '#CF9426' }}><FaChartPie size={20} /></div>
              <h3 className="mb-1 fw-bold tabular-nums" style={{ color: 'var(--text-main)', fontSize: '28px' }}>+{kpis.reajuste}%</h3>
              <span className="text-muted fw-bold" style={{ fontSize: '12px' }}>Reajuste Médio Acumulado</span>
            </div>
          </div>
        </div>

        {/* TABELA HISTÓRICO */}
        <div className="glass-panel p-4 d-flex flex-column shadow-sm flex-grow-1 mb-4" style={{ borderRadius: '20px' }}>
          <h6 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--text-main)', textTransform: 'uppercase', fontSize: '13px' }}>Últimas Generalidades Cadastradas</h6>
          <div className="custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '350px' }}>
            <table className="table table-hover table-borderless align-middle mb-0 text-center" style={{ fontSize: '12px' }}>
              <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <tr className="text-uppercase text-muted" style={{ fontSize: '10px' }}>
                  <th className="px-3 py-2 text-start">Transportador</th>
                  <th className="py-2 text-start">Documento</th>
                  <th className="py-2">Início Vigência</th>
                  <th className="py-2">Fim Vigência</th>
                  <th className="py-2">Taxa</th>
                  <th className="py-2">Valor Base</th>
                  <th className="text-end px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {historicoCadastros.map((item) => {
                  const valorDisplay = Number(item.valorFixo) > 0 ? `R$ ${formatarMoeda(item.valorFixo)}` : `${formatarMoeda(item.valorPercentual)}%`;
                  return (
                    <tr key={item.id} className="border-bottom hover-bg-light" style={{ cursor: 'pointer', opacity: item.status === 'Excluído' ? 0.4 : 1 }} onClick={() => item.status !== 'Excluído' && abrirDetalhe(item)}>
                      <td className="px-3 py-2 text-start">
                        <div className="d-flex align-items-center gap-2">
                          {item.transportador && (
                            <img src={`/${item.transportador.toLowerCase().replace(/\s+/g, '')}.png`} alt={item.transportador} style={{ maxHeight: '25px', maxWidth: '50px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                          <span className="fw-bold" style={{ color: 'var(--text-main)' }}>{item.transportador || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-2 text-start fw-bold text-primary">{item.docAriba}</td>
                      <td className="py-2 text-muted">{item.dataInicio ? new Date(item.dataInicio).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="py-2 text-muted">{item.dataFim ? new Date(item.dataFim).toLocaleDateString('pt-BR') : 'Indet.'}</td>
                      <td className="py-2"><span className="badge bg-light text-dark border shadow-sm">{item.tipo}</span></td>
                      <td className="py-2 fw-bold tabular-nums" style={{ color: 'var(--text-main)' }}>{valorDisplay}</td>
                      <td className="text-end px-3 py-2">
                        <span className={`badge ${item.status === 'Excluído' ? 'bg-danger' : 'bg-success'}`}>{item.status}</span>
                      </td>
                    </tr>
                  );
                })}
                {historicoCadastros.length === 0 && (
                  <tr><td colSpan="7" className="text-center py-5 text-muted fw-bold">Nenhum cadastro realizado no momento.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DETALHE DO CADASTRO (VIEW / EDIT / DELETE) */}
        {modalDetalheAberto && cadastroSelecionado && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 32, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel d-flex flex-column shadow-lg animate-fade-in" style={{ width: '800px', maxWidth: '95vw', borderRadius: 'var(--radius-xl)', overflow: 'hidden', backgroundColor: 'var(--card-solid)', border: '1px solid rgba(255,255,255,0.8)' }}>
              
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                <div>
                  <span className="badge shadow-sm mb-2" style={{ backgroundColor: '#DF7659', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>CADASTRO DE {cadastroSelecionado.tipo}</span>
                  <h4 className="fw-bold mb-0 text-uppercase" style={{ color: '#2A6F9A' }}>{cadastroSelecionado.docAriba}</h4>
                </div>
                <div className="text-end d-flex flex-column align-items-end">
                  {cadastroSelecionado.transportador && <img src={`/${cadastroSelecionado.transportador.toLowerCase().replace(/\s+/g, '')}.png`} alt={cadastroSelecionado.transportador} style={{ maxHeight: '40px', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                  <button className="btn btn-sm btn-light border-0 shadow-sm" style={{ borderRadius: 'var(--radius-pill)' }} onClick={fecharDetalhe}><FaTimes className="text-muted"/></button>
                </div>
              </div>
              
              <div className="p-4 custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '60vh', backgroundColor: '#F8FAFC' }}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3 pb-2 border-bottom text-center" style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Configuração Logística</h6>
                    <ul className="list-group list-group-flush border rounded shadow-sm" style={{ fontSize: '12px' }}>
                      <li className="list-group-item d-flex justify-content-between px-3 py-3">
                        <span className="fw-bold text-muted">Vigência</span>
                        <span className="fw-bold">{cadastroSelecionado.dataInicio ? new Date(cadastroSelecionado.dataInicio).toLocaleDateString('pt-BR') : '-'} a {cadastroSelecionado.dataFim ? new Date(cadastroSelecionado.dataFim).toLocaleDateString('pt-BR') : 'Indeterminada'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between px-3 py-3">
                        <span className="fw-bold text-muted">Região (UFs)</span>
                        <span className="fw-bold">{cadastroSelecionado.ufsDestino?.join(', ') || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between px-3 py-3">
                        <span className="fw-bold text-muted">Cidades Atendidas</span>
                        <span className="fw-bold text-primary">{cadastroSelecionado.cidadesDestino?.length || 0} Cidade(s)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3 pb-2 border-bottom text-center" style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Valores Cadastrados</h6>
                    <ul className="list-group list-group-flush border rounded shadow-sm" style={{ fontSize: '12px' }}>
                      <li className="list-group-item d-flex justify-content-between px-3 py-3">
                        <span className="fw-bold text-muted">Valor Fixo</span>
                        <span className="fw-bold tabular-nums" style={{color:'#2A6F9A'}}>R$ {formatarMoeda(cadastroSelecionado.valorFixo)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between px-3 py-3">
                        <span className="fw-bold text-muted">Percentual (%)</span>
                        <span className="fw-bold tabular-nums" style={{color:'#2A6F9A'}}>{formatarMoeda(cadastroSelecionado.valorPercentual)}%</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between px-3 py-3">
                        <span className="fw-bold text-muted">Valor Mínimo</span>
                        <span className="fw-bold tabular-nums" style={{color:'#2A6F9A'}}>R$ {formatarMoeda(cadastroSelecionado.valorMinimo)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Z-INDEX CORRIGIDO PARA GARANTIR O CLIQUE DOS BOTÕES DE AÇÃO */}
              <div className="p-4 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'var(--card-solid)', position: 'relative', zIndex: 1060 }}>
                <button className="btn btn-sm btn-outline-danger fw-bold shadow-sm d-flex align-items-center px-4 py-2 hover-scale cursor-pointer" style={{ borderRadius: 'var(--radius-pill)' }} onClick={(e) => { e.stopPropagation(); excluirCadastro(); }}>
                  <FaTrash className="me-2"/> Excluir
                </button>
                <button className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center px-5 py-2 hover-scale cursor-pointer" style={{ backgroundColor: 'var(--dark-highlight)', borderRadius: 'var(--radius-pill)' }} onClick={(e) => { e.stopPropagation(); editarCadastro(); }}>
                  <FaEdit className="me-2"/> Editar Cadastro
                </button>
              </div>
            </div>
          </div>
        )}

        {alerta.visivel && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 32, 42, 0.4)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel p-4 d-flex flex-column align-items-center shadow-lg" style={{ width: '400px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--card-solid)', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-txt)' }}><FaCheck size={30} /></div>
              <h5 className="fw-bold mb-2 text-center" style={{ color: 'var(--text-main)' }}>Sucesso!</h5>
              <p className="text-center fw-bold" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{alerta.mensagem}</p>
              <button className="btn text-white fw-bold shadow-sm w-100 mt-3 py-2" style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-pill)' }} onClick={() => setAlerta({ visivel: false, mensagem: '' })}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= PASSO 1 E 2: WIZARD DE CADASTRO =================
  return (
    <div className="d-flex flex-column gap-3 h-auto mx-auto animate-fade-in custom-scrollbar flex-grow-1" style={{ maxWidth: '1200px', width: '100%', overflowY: 'auto' }}>
      
      <div className="d-flex justify-content-between align-items-center mt-2 mb-2 flex-shrink-0">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Cadastro de {tipoCadastro}</h4>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Preenchimento unificado das regras.</span>
        </div>
        <div className="d-flex gap-3 align-items-center">
          {passo === 1 && (
            <>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .csv, .txt" onChange={handleUpload} />
              <button className="btn btn-sm btn-outline-primary fw-bold shadow-sm d-flex align-items-center gap-2" style={{ borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255,255,255,0.5)' }} onClick={() => fileInputRef.current.click()}>
                <FaUpload /> Importar Lote
              </button>
            </>
          )}
          <button className="btn btn-sm btn-light fw-bold shadow-sm" style={{ borderRadius: 'var(--radius-pill)', border: '1px solid rgba(0,0,0,0.1)' }} onClick={() => setPasso(0)}><FaTimes className="me-1"/> Cancelar</button>
        </div>
      </div>

      <div className="glass-panel p-4 d-flex flex-column shadow-sm mb-3 h-100">
        
        {passo === 1 && (
          <div className="d-flex flex-column animate-fade-in h-100">
            <h6 className="fw-bold mb-3 pb-2" style={{ color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>1. Contrato & Transportador</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Doc Ariba (WS)</label>
                <input type="text" className="form-control form-control-sm fw-bold shadow-sm text-center" value={form.docAriba} onChange={e => setForm({...form, docAriba: e.target.value})} style={{ fontSize: '12px' }} />
              </div>
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Negociação</label>
                <input type="date" className="form-control form-control-sm shadow-sm text-muted fw-bold text-center" value={form.dataNegociacao} onChange={e => setForm({...form, dataNegociacao: e.target.value})} style={{ fontSize: '12px' }} />
              </div>
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Início Vigência</label>
                <input type="date" className="form-control form-control-sm shadow-sm text-muted fw-bold text-center" value={form.dataInicio} onChange={e => setForm({...form, dataInicio: e.target.value})} style={{ fontSize: '12px' }} />
              </div>
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Fim Vigência</label>
                <input type="date" className="form-control form-control-sm shadow-sm text-muted fw-bold text-center" value={form.dataFim} onChange={e => setForm({...form, dataFim: e.target.value})} style={{ fontSize: '12px' }} />
              </div>
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Transportador</label>
                <select className="form-select form-select-sm shadow-sm fw-bold" value={form.transportador} onChange={e => setForm({...form, transportador: e.target.value})} style={{ fontSize: '12px' }}>
                  <option value="">Selecione...</option>
                  {PARAMETROS_LOGISTICOS.transportadores.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <h6 className="fw-bold mb-3 pb-2" style={{ color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>2. Localidade & Aplicação</h6>
            <div className="row g-4 mb-4">
              
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>UFs Destino</label>
                <CheckboxList options={getUFsUnicas()} selected={form.ufsDestino} onChange={(val) => setForm({...form, ufsDestino: val})} height="175px" />
              </div>
              
              <div className={tipoCadastro === 'TRT' ? 'col-md-10' : 'col-md-7'}>
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Abrangência & Cidades ({form.detalheDestino.length})</label>
                <select className="form-select form-select-sm shadow-sm fw-bold mb-2" style={{fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.6)'}} value={form.abrangenciaDestino} onChange={e => setForm({...form, abrangenciaDestino: e.target.value})} disabled={form.ufsDestino.length === 0}>
                  {form.ufsDestino.length <= 1 && <option value="Fixo">Apenas Uma Cidade (Fixo)</option>}
                  <option value="Mesorregiao">Selecionar por Mesorregião</option>
                  <option value="Varias">Selecionar Várias Cidades</option>
                  <option value="Todas">Todas as Cidades das UFs Selecionadas</option>
                </select>
                {RenderizarDetalheRota()}
              </div>

              {tipoCadastro !== 'TRT' && (
                <div className="col-md-3">
                  <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--status-warn-txt)', textTransform: 'uppercase' }}>CNPJs Destino ({form.cnpjsCliente.length})</label>
                  <div className="input-group input-group-sm shadow-sm mb-2">
                    <input type="text" className="form-control fw-bold" placeholder="00.000.000/0000-00" value={formatarCNPJ(currentCnpj)} onChange={e => setCurrentCnpj(e.target.value)} maxLength={18} style={{ fontSize: '12px', backgroundColor: 'var(--status-warn-bg)' }} onKeyPress={e => e.key === 'Enter' && addCnpj()} />
                    <button className="btn btn-warning fw-bold text-dark px-3" onClick={addCnpj}><FaPlus/></button>
                  </div>
                  <div className="border shadow-sm p-2 custom-scrollbar bg-white" style={{ height: '135px', overflowY: 'auto', borderRadius: 'var(--radius-md)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    {form.cnpjsCliente.length === 0 ? (
                       <div className="text-muted text-center pt-4" style={{fontSize: '11px'}}>Nenhum CNPJ adicionado.</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-1">
                        {form.cnpjsCliente.map(cnpj => (
                          <span key={cnpj} className="badge bg-light text-dark border d-flex align-items-center p-2 shadow-sm" style={{fontSize: '10px', width: '100%', justifyContent: 'space-between'}}>
                            {formatarCNPJ(cnpj)}
                            <button className="btn btn-sm p-0 ms-2 text-danger border-0" onClick={() => setForm(prev => ({...prev, cnpjsCliente: prev.cnpjsCliente.filter(c => c !== cnpj)}))}><FaTimes/></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <h6 className="fw-bold mb-3 pb-2" style={{ color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>3. Precificação</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Valor Fixo</label>
                <div className="input-group input-group-sm shadow-sm">
                  <span className="input-group-text fw-bold border-0" style={{backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span>
                  <input type="number" step="0.01" className="form-control text-end fw-bold tabular-nums" value={form.valorFixo} onChange={e => setForm({...form, valorFixo: e.target.value})} onBlur={e => handleBlurMoeda(e, 'valorFixo')} style={{ fontSize: '12px' }} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Percentual</label>
                <div className="input-group input-group-sm shadow-sm">
                  <span className="input-group-text fw-bold border-0" style={{backgroundColor: 'rgba(42, 111, 154, 0.1)', color: '#2A6F9A'}}>%</span>
                  <input type="number" step="0.01" className="form-control text-end fw-bold tabular-nums" value={form.valorPercentual} onChange={e => setForm({...form, valorPercentual: e.target.value})} onBlur={e => handleBlurMoeda(e, 'valorPercentual')} style={{ fontSize: '12px' }} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Valor Mínimo</label>
                <div className="input-group input-group-sm shadow-sm">
                  <span className="input-group-text fw-bold border-0" style={{backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span>
                  <input type="number" step="0.01" className="form-control text-end fw-bold tabular-nums" value={form.valorMinimo} onChange={e => setForm({...form, valorMinimo: e.target.value})} onBlur={e => handleBlurMoeda(e, 'valorMinimo')} style={{ fontSize: '12px' }} />
                </div>
              </div>
            </div>

            {tipoCadastro === 'TRT' && (
              <div className="mb-2 mt-2">
                <h6 className="fw-bold mb-3 pb-2 text-center" style={{ color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>Bases de Aplicação do TRT</h6>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {opcoesAplicacaoTRT.map(opt => {
                    const isSelected = form.aplicacaoTRT.includes(opt);
                    return (
                      <button 
                        key={opt} className="btn btn-sm fw-bold shadow-sm"
                        style={{ width: '130px', borderRadius: 'var(--radius-pill)', border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.1)', backgroundColor: isSelected ? 'var(--dark-highlight)' : 'var(--card-solid)', color: isSelected ? 'white' : 'var(--text-main)', fontSize: '11px' }}
                        onClick={() => { if(isSelected) setForm({...form, aplicacaoTRT: form.aplicacaoTRT.filter(i => i !== opt)}); else setForm({...form, aplicacaoTRT: [...form.aplicacaoTRT, opt]}); }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end mt-auto pt-4 border-top">
              <button className="btn text-white fw-bold shadow-sm d-flex align-items-center px-5 py-2" style={{ backgroundColor: 'var(--dark-highlight)', borderRadius: 'var(--radius-pill)', fontSize: '13px' }} onClick={() => setPasso(2)}>
                Próximo Passo (Resumo) <FaArrowRight className="ms-2"/>
              </button>
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="d-flex flex-column h-auto animate-fade-in flex-grow-1">
            <div className="p-4 border shadow-sm flex-grow-1 d-flex flex-column" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.05)' }}>
              
              {/* HEADER DO RESUMO */}
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="text-start">
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <span className="badge shadow-sm" style={{ backgroundColor: '#DF7659', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>CADASTRO DE {tipoCadastro}</span>
                  </div>
                  <h3 className="fw-bold mb-0 text-uppercase" style={{ color: '#2A6F9A' }}>{form.docAriba || 'Documento Não Informado'}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-aux)' }}>Resumo de parametrização sistêmica</span>
                </div>
                
                <div className="text-end d-flex flex-column align-items-end justify-content-center">
                  {form.transportador ? (
                    <img src={`/${form.transportador.toLowerCase().replace(/\s+/g, '')}.png`} alt={form.transportador} style={{ maxHeight: '45px', objectFit: 'contain', marginBottom: '5px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                  ) : <div style={{ height: '45px' }}></div>}
                  <div className="fw-bold text-uppercase" style={{ fontSize: '16px', color: '#5F6D78', display: 'none' }}>{form.transportador || 'Transportadora'}</div>
                </div>
              </div>

              {/* DADOS LADO A LADO */}
              <div className="row g-4 mb-4 flex-grow-1">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3 pb-2 border-bottom text-center" style={{ fontSize: '12px', color: '#DF7659', textTransform: 'uppercase' }}>Configuração Logística</h6>
                  <ul className="list-group list-group-flush border rounded shadow-sm" style={{ fontSize: '12px' }}>
                    <li className="list-group-item d-flex justify-content-between px-3 py-3" style={{ height: '50px' }}>
                      <span className="fw-bold text-muted">Vigência</span>
                      <span className="fw-bold">{form.dataInicio ? new Date(form.dataInicio).toLocaleDateString('pt-BR') : '-'} a {form.dataFim ? new Date(form.dataFim).toLocaleDateString('pt-BR') : 'Indeterminada'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-3 py-3" style={{ height: '50px' }}>
                      <span className="fw-bold text-muted">Região (UFs)</span>
                      <span className="fw-bold text-truncate" style={{maxWidth: '180px'}}>{form.ufsDestino.join(', ') || 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-3 py-3" style={{ height: '50px' }}>
                      <span className="fw-bold text-muted">Cidades Atendidas</span>
                      <span className="fw-bold text-primary">{form.detalheDestino.length > 0 ? form.detalheDestino.length : (form.abrangenciaDestino === 'Todas' ? 'Todas' : '0')} Cidade(s)</span>
                    </li>
                    {tipoCadastro === 'TRT' && (
                      <li className="list-group-item d-flex justify-content-between px-3 py-3 bg-light" style={{ minHeight: '50px' }}>
                        <span className="fw-bold text-muted">Bases (TRT)</span>
                        <span className="fw-bold text-primary text-end">{form.aplicacaoTRT.join(', ') || 'Nenhuma'}</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3 pb-2 border-bottom text-center" style={{ fontSize: '12px', color: '#DF7659', textTransform: 'uppercase' }}>Valores e Atribuições</h6>
                  <ul className="list-group list-group-flush border rounded shadow-sm" style={{ fontSize: '12px' }}>
                    <li className="list-group-item d-flex justify-content-between px-3 py-3" style={{ height: '50px' }}>
                      <span className="fw-bold text-muted">Valor Fixo</span>
                      <span className="fw-bold tabular-nums" style={{color:'#2A6F9A'}}>R$ {formatarMoeda(form.valorFixo)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-3 py-3" style={{ height: '50px' }}>
                      <span className="fw-bold text-muted">Percentual (%)</span>
                      <span className="fw-bold tabular-nums" style={{color:'#2A6F9A'}}>{formatarMoeda(form.valorPercentual)}%</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-3 py-3" style={{ height: '50px' }}>
                      <span className="fw-bold text-muted">Valor Mínimo</span>
                      <span className="fw-bold tabular-nums" style={{color:'#2A6F9A'}}>R$ {formatarMoeda(form.valorMinimo)}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* LISTAGEM DETALHADA DESVINCULADA */}
              <div className="row g-4 mt-2">
                <div className="col-12 border-top pt-4">
                  <h6 className="fw-bold text-center mb-4" style={{ fontSize: '13px', color: '#2A6F9A', textTransform: 'uppercase' }}>Detalhamento de Aplicação</h6>
                </div>
                
                <div className={tipoCadastro === 'TRT' ? "col-md-12 d-flex flex-column" : "col-md-6 d-flex flex-column"}>
                  <h6 className="fw-bold text-muted text-uppercase mb-2 text-center" style={{ fontSize: '10px' }}>Cidades Parametrizadas ({form.detalheDestino.length})</h6>
                  <div className="border rounded shadow-sm p-3 bg-light custom-scrollbar" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                    {form.abrangenciaDestino === 'Todas' ? (
                      <div className="text-success fw-bold text-center mt-4">Aplicado para todas as cidades de {form.ufsDestino.join(', ')}</div>
                    ) : form.detalheDestino.length === 0 ? (
                      <div className="text-muted fst-italic text-center mt-4">Nenhuma cidade selecionada.</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                        {form.detalheDestino.map(c => <span key={c} className="badge border text-dark" style={{backgroundColor: 'white', fontSize: '10px'}}>{c}</span>)}
                      </div>
                    )}
                  </div>
                </div>

                {tipoCadastro !== 'TRT' && (
                  <div className="col-md-6 d-flex flex-column">
                    <h6 className="fw-bold text-muted text-uppercase mb-2 text-center" style={{ fontSize: '10px' }}>Documentos CNPJ/CPF ({form.cnpjsCliente.length})</h6>
                    <div className="border rounded shadow-sm p-3 bg-light custom-scrollbar" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                      {form.cnpjsCliente.length === 0 ? (
                        <div className="text-muted fst-italic text-center mt-4">Nenhum CNPJ informado.</div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          {form.cnpjsCliente.map(c => <span key={c} className="badge border px-3 py-2" style={{backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn-txt)', fontSize: '11px'}}>{formatarCNPJ(c)}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <button className="btn btn-light fw-bold px-4 shadow-sm" style={{ borderRadius: 'var(--radius-pill)', fontSize: '13px' }} onClick={() => setPasso(1)}>Voltar e Editar</button>
              <button className="btn text-white fw-bold shadow-sm d-flex align-items-center px-5 py-2 hover-scale" style={{ backgroundColor: 'var(--status-success-txt)', borderRadius: 'var(--radius-pill)', fontSize: '13px' }} onClick={validarESalvar}>
                <FaCheck className="me-2"/> Salvar Cadastro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}