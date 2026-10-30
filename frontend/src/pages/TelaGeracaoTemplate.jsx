// ============================================================================
// ARQUIVO: src/pages/TelaGeracaoTemplate.jsx
// Módulo SaaS: Motor Digitalizador e Gerador de Tabelas de Frete
// ============================================================================
import React, { useState, useEffect } from 'react';
import { 
  FaDownload, FaCheck, FaArrowRight, FaCog, FaMoneyBillWave, FaTable, FaFileSignature, 
  FaMapMarkedAlt, FaTruck, FaTruckMoving, FaTrailer, FaCar, FaMotorcycle, FaShuttleVan, 
  FaBox, FaTint, FaGasPump, FaBolt, FaFire, FaRecycle, FaLayerGroup, FaAlignJustify,
  FaFilePdf, FaTimes, FaShareAlt, FaWhatsapp, FaSlack, FaEnvelope, FaCalendarAlt // <--- ADICIONADO AQUI
} from 'react-icons/fa';
import { PARAMETROS_LOGISTICOS } from '../data/mockFrete';
import axios from 'axios';

// MAPA DE ÍCONES (Silhuetas Pretas Padrão DNIT/CNT)
const getIconeSilhueta = (nome) => {
  const mapa = {
    'Bitrem': <FaTrailer />, 'Bitruck': <FaTruckMoving />, 'Carreta': <FaTrailer />,
    'Carro': <FaCar />, 'Fiorino': <FaShuttleVan />, 'Moto': <FaMotorcycle />,
    'Toco': <FaTruck />, 'Truck': <FaTruck />, 'Van': <FaShuttleVan />,
    'Veiculo 3/4': <FaTruckMoving />, 'VUC': <FaTruck />,
    'Bau': <FaBox />, 'Double Deck': <FaLayerGroup />, 'Sider': <FaAlignJustify />, 'Tanque': <FaTint />,
    'Autonomo': <FaGasPump />, 'Diesel': <FaGasPump />, 'Eletrico': <FaBolt />, 'GNV': <FaFire />, 'Hibrido': <FaRecycle />
  };
  return mapa[nome] || null;
};

// COMPONENTE AUXILIAR: Multi-Select com Checkboxes
const CheckboxList = ({ options, selected, onChange, disabled, exibeIcones = false }) => (
  <div className="border shadow-sm custom-scrollbar" style={{ height: '160px', overflowY: 'auto', borderRadius: 'var(--radius-md)', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto', backgroundColor: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.05)' }}>
    {options.length === 0 ? (
      <div className="p-3 text-muted text-center" style={{fontSize: '12px'}}>Nenhum item...</div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', padding: '8px' }}>
        {options.map(opt => (
          <div className="form-check m-0 px-2 py-1 d-flex align-items-center rounded transition-all hover-bg-light" style={{ cursor: 'pointer' }} key={opt}>
            <input 
              className="form-check-input flex-shrink-0 m-0 shadow-sm" 
              type="checkbox" 
              style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
              checked={selected.includes(opt)} 
              onChange={(e) => {
                if(e.target.checked) onChange([...selected, opt]);
                else onChange(selected.filter(item => item !== opt));
              }} 
            />
            <label 
              className="form-check-label flex-grow-1 text-start ms-2 m-0 text-truncate d-flex align-items-center" 
              style={{ fontSize: '11px', cursor: 'pointer', fontWeight: '600', color: 'var(--text-main)', userSelect: 'none' }} 
              title={opt}
              onClick={() => {
                if(selected.includes(opt)) onChange(selected.filter(item => item !== opt));
                else onChange([...selected, opt]);
              }}
            >
              {exibeIcones && getIconeSilhueta(opt) && (
                <span className="me-2 d-flex align-items-center" style={{ color: '#333', fontSize: '13px' }}>
                  {getIconeSilhueta(opt)}
                </span>
              )}
              {opt}
            </label>
          </div>
        ))}
      </div>
    )}
  </div>
);

// COMPONENTE AUXILIAR: Dropdown Customizado com Checkbox Múltiplo
const DropdownCheckRotas = ({ label, options, selected, onChange }) => {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="position-relative">
      <button className="btn form-control d-flex justify-content-between align-items-center bg-white shadow-sm px-2" style={{fontSize: '11px', color: '#5F6D78', height: '32px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)'}} onClick={() => setAberto(!aberto)}>
        <span className="text-truncate fw-bold">{selected.length === 0 ? label : selected.join(', ')}</span>
        <span className="ms-2" style={{fontSize: '10px', color: '#5F6D78', opacity: 0.7}}>▼</span>
      </button>
      {aberto && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{zIndex: 99}} onClick={() => setAberto(false)}></div>
          <div className="position-absolute bg-white border shadow-sm w-100 mt-1 custom-scrollbar" style={{zIndex: 100, maxHeight: '200px', overflowY:'auto', borderRadius: '3px'}}>
            {options.length === 0 ? <div className="p-2 text-muted text-center" style={{fontSize: '11px'}}>Selecione as UFs no Passo 2...</div> : options.map(o => (
              <div className="form-check m-0 px-2 py-1 border-bottom hover-bg-light d-flex align-items-center" key={o}>
                <input className="form-check-input m-0 shadow-sm flex-shrink-0" type="checkbox" checked={selected.includes(o)} style={{width: '14px', height: '14px', cursor: 'pointer'}} onChange={(e) => {
                  if(e.target.checked) onChange([...selected, o]);
                  else onChange(selected.filter(x => x !== o));
                }}/>
                <label className="form-check-label ms-2 fw-bold text-truncate w-100" style={{fontSize: '11px', color: '#5F6D78', cursor: 'pointer'}} onClick={() => {
                  if(selected.includes(o)) onChange(selected.filter(x => x !== o));
                  else onChange([...selected, o]);
                }}>{o}</label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
};

// COMPONENTE AUXILIAR: Input de Taxa Composta
const TaxaComposta = ({ label, prefix, state, setState, isAdValorem = false }) => {
  const stepPct = isAdValorem ? "0.0001" : "0.01";
  return (
    <div className="d-flex align-items-center mb-1 pb-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
      <div className="text-truncate pe-1" style={{ width: '120px', fontSize: '12px', fontWeight: 'normal', color: '#8EC3EA', textTransform: 'capitalize' }} title={label}>{label}</div>
      <div className="d-flex gap-1 flex-grow-1">
        <div className="input-group input-group-sm shadow-sm" style={{flex: 1}}>
          <span className="input-group-text fw-bold px-1 border-0" style={{backgroundColor: 'rgba(42, 111, 154, 0.1)', color: '#2A6F9A', fontSize: '11px', width: '28px', justifyContent: 'center'}}>%</span>
          <input type="number" step={stepPct} className="form-control text-end fw-bold tabular-nums px-1" placeholder="0.00" value={state[`${prefix}Pct`]} onChange={e => setState({...state, [`${prefix}Pct`]: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} />
        </div>
        <div className="input-group input-group-sm shadow-sm" style={{flex: 1}}>
          <span className="input-group-text fw-bold px-1 border-0" style={{backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659', fontSize: '11px', width: '28px', justifyContent: 'center'}}>R$</span>
          <input type="number" step="0.01" className="form-control text-end fw-bold tabular-nums px-1" placeholder="Fixo" value={state[`${prefix}Fixo`]} onChange={e => setState({...state, [`${prefix}Fixo`]: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} />
        </div>
        <div className="input-group input-group-sm shadow-sm" style={{flex: 1}}>
          <span className="input-group-text fw-bold px-1 border-0" style={{backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659', fontSize: '11px', width: '28px', justifyContent: 'center'}}>R$</span>
          <input type="number" step="0.01" className="form-control text-end fw-bold tabular-nums px-1" placeholder="Mín" value={state[`${prefix}Min`]} onChange={e => setState({...state, [`${prefix}Min`]: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} />
        </div>
      </div>
    </div>
  );
};

// COMPONENTE AUXILIAR: Input Simples
const InputSimples = ({ label, isPct, stateKey, state, setState, placeholder="0.00" }) => {
  const bgAdorn = isPct ? 'rgba(42, 111, 154, 0.1)' : 'rgba(223, 118, 89, 0.1)';
  const colorAdorn = isPct ? '#2A6F9A' : '#DF7659';
  const prefix = isPct ? '%' : 'R$';
  return (
    <div className="d-flex align-items-center mb-1">
      <div className="flex-grow-1 text-truncate pe-1" style={{ fontSize: '12px', fontWeight: 'normal', color: '#8EC3EA', textTransform: 'capitalize' }} title={label}>{label}</div>
      <div className="input-group input-group-sm shadow-sm" style={{ width: '130px' }}>
        <span className="input-group-text fw-bold px-1 border-0" style={{backgroundColor: bgAdorn, color: colorAdorn, fontSize: '11px', width: '28px', justifyContent: 'center'}}>{prefix}</span>
        <input type="number" step="0.01" className="form-control text-end fw-bold tabular-nums px-1" placeholder={placeholder} value={state[stateKey]} onChange={e => setState({...state, [stateKey]: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} />
      </div>
    </div>
  );
};

// COMPONENTE AUXILIAR: Input de Prazo / SLA (Com Sufixo)
const InputPrazo = ({ label, suffix, stateKey, state, setState, placeholder="0" }) => (
  <div className="d-flex align-items-center mb-1">
    <div className="flex-grow-1 text-truncate pe-1" style={{ fontSize: '12px', fontWeight: 'normal', color: '#8EC3EA', textTransform: 'capitalize' }} title={label}>{label}</div>
    <div className="input-group input-group-sm shadow-sm" style={{ width: '130px' }}>
      <input type="number" step="1" className="form-control text-end fw-bold tabular-nums px-1" placeholder={placeholder} value={state[stateKey]} onChange={e => setState({...state, [stateKey]: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} />
      <span className="input-group-text fw-bold px-1 border-0" style={{backgroundColor: 'rgba(0,0,0,0.05)', color: '#5F6D78', fontSize: '10px', width: '38px', justifyContent: 'center'}}>{suffix}</span>
    </div>
  </div>
);

export default function TelaGeracaoTemplate() {
  const [passo, setPasso] = useState(1);
  const [gerando, setGerando] = useState(false);
  
  // DADOS DA API
  const [dadosIbge, setDadosIbge] = useState([]);
  const [carregandoMalha, setCarregandoMalha] = useState(true);

  // WIZARD STATES
  const [negociacao, setNegociacao] = useState({ docAriba: '', dataAbertura: '', dataInicio: '', dataFinal: '', incoterm: 'CIF', tipoNegociacao: '', modeloContratacao: '' });
  const [parametros, setParametros] = useState({ etapa: '', fluxo: '', transportador: '', fatorCubagem: '', cargaPerigosa: 'Não', seguroCarga: 'Próprio', veiculos: [], carrocerias: [], combustiveis: [] });
  const [rotas, setRotas] = useState({ ufsOrigem: [], abrangenciaOrigem: 'Fixo', detalheOrigem: [], ufsDestino: [], abrangenciaDestino: 'Fixo', detalheDestino: [] });

  const [rotasEmEdicao, setRotasEmEdicao] = useState([]);
  const [regiaoEmEdicao, setRegiaoEmEdicao] = useState('Capital');
  const [tarifasSalvas, setTarifasSalvas] = useState({});

  const rotasRequeridas = rotas.ufsOrigem.flatMap(origem => 
    rotas.ufsDestino.map(destino => `${origem} ➔ ${destino}`)
  );

  const estadoTarifasInicial = {
    freteLotacao: '', faixasAtivas: [], faixasValores: {},
    grisPct: '', grisFixo: '', grisMin: '', advlrPct: '', advlrFixo: '', advlrMin: '',
    pedagioFixo: '', pedagioFracao: '', pedagioKg: '',
    trtPct: '', trtFixo: '', trtMin: '', tdePct: '', tdeFixo: '', tdeMin: '',
    tdaPct: '', tdaFixo: '', tdaMin: '', tsoPct: '', tsoFixo: '', tsoMin: '',
    emexPct: '', emexFixo: '', emexMin: '', segFluvialPct: '', segFluvialFixo: '', segFluvialMin: '',
    suframa: '', emissaoCte: '', agendamento: '', armazenagem: '', paletizacao: '', diaria: '', cargaDescarga: '',
    reentregaPct: '', devolucaoPct: '',
    freeTime: '', prazoPagamento: '', prazoEntrega: '' // <-- NOVOS CAMPOS AQUI
  };

  const [tarifas, setTarifas] = useState(estadoTarifasInicial);
  const [linhasGeradas, setLinhasGeradas] = useState([]);

  // ESTADOS DO RESUMO EXECUTIVO (GLASSMORPHISM) E PARTILHA
  const [modalResumoAberto, setModalResumoAberto] = useState(false);
  const [menuCompartilharAberto, setMenuCompartilharAberto] = useState(false);

  // Inteligência para analisar Capital e Interior
  const obterResumoEstruturado = () => {
    if (rotasRequeridas.length === 0) return null;
    const rotaAlvo = rotasRequeridas[0]; 
    const cap = tarifasSalvas[`${rotaAlvo}-Capital`] || null;
    const int = tarifasSalvas[`${rotaAlvo}-Interior`] || null;
    
    // Captura as faixas ativas (combina ambas caso sejam diferentes, embora no fluxo atual sejam iguais)
    const faixas = [...new Set([...(cap?.faixasAtivas || []), ...(int?.faixasAtivas || [])])];
    
    return { cap, int, faixas };
  };

  // EXPORTAÇÃO CSV: PADRÃO EXATO DO ARQUIVO .CSV DO GB
  const exportarCSV = () => {
    const cabecalho = [
      "ID Rota", "Documento Ariba (WS)", "Data Abertura Negociação", "Data Inicio Vigência", "Data Final Vigência", 
      "Modelo de Contratação", "Tipo de Negociação", "Etapa Logística", "Fluxo Logistico", "Free Time (Hrs)", 
      "Prazo de Entrega (Dias)", "Prazo de Pagamento (Dias)", "Transportador", "Tipo de Veículo", "Carroceria", 
      "Combustível", "Incoterm", "Carga Perigosa?", "Seguro Carga", "UF Origem", "Cidade Origem", "CEP Origem", 
      "UF Destino", "Cidade Destino", "CEP Destino Inicial", "CEP Destino Final", "Mesorregião Destino", 
      "Fator Conversão Peso Cubado", "Valor Frete Lotação", "Valor Frete 10Kg", "Valor Frete 20Kg", "Valor Frete 30Kg", 
      "Valor Frete 50Kg", "Valor Frete 70Kg", "Valor Frete 100Kg", "Valor Frete 500Kg", "Valor Frete 3000Kg", 
      "Valor Frete 5000Kg", "Valor Frete Acima 5000Kg", "Excedente Kg", "GRIS(%)", "ADVLR(%)", "TRT(%)", "TRT VALOR FIXO", 
      "TRT VALOR MINIMO", "TDE(%)", "TDE VALOR FIXO", "TDE VALOR MINIMO", "TDA(%)", "TDA VALOR FIXO", "TDA VALOR MINIMO", 
      "TSO(%)", "TSO VALOR FIXO", "TSO VALOR MINIMO", "SUFRAMA VALOR FIXO", "SEGURO FLUVIAL(%)", "SEGURO FLUVIAL VALOR FIXO", 
      "SEGURO FLUVIAL VALOR MINIMO", "PEDÁGIO VALOR FIXO", "PEDÁGIO FRAÇÃO A CADA x KG", "PEDÁGIO KG", "EMEX(%)", 
      "EMEX VALOR FIXO", "EMEX VALOR MINIMO", "EMISSAO CTE (SEC/CAT) VALOR FIXO", "TX AGENDAMENTO VALOR FIXO", 
      "TX ARMAZENAGEM VALOR FIXO", "TX PALETIZAÇÃO VALOR FIXO", "REENTREGA(%)", "DEVOLUÇÃO(%)", "DIARIA VALOR FIXO", 
      "CARGA E DESCARGA VALOR FIXO", "cod_chave"
    ];

    const getF = (t, f) => t.faixasValores && t.faixasValores[f] ? t.faixasValores[f] : '';
    
    const linhas = linhasGeradas.map(l => {
      const t = tarifasSalvas[`${l.ufOrigem} ➔ ${l.ufDestino}-Capital`] || tarifasSalvas[`${l.ufOrigem} ➔ ${l.ufDestino}-Interior`] || {};
      const chave = `${negociacao.dataAbertura}_${parametros.transportador}_${parametros.fluxo}_${negociacao.docAriba}_${l.ufOrigem}_${l.ufDestino}`.replace(/\s+/g, '_');
      
      return [
        l.idRota, negociacao.docAriba, negociacao.dataAbertura, negociacao.dataInicio, negociacao.dataFinal,
        negociacao.modeloContratacao, negociacao.tipoNegociacao, parametros.etapa, parametros.fluxo, 
        t.freeTime || '', t.prazoEntrega || '', t.prazoPagamento || '',
        parametros.transportador, l.veiculo, parametros.carrocerias.join('/'), parametros.combustiveis.join('/'),
        negociacao.incoterm, parametros.cargaPerigosa, parametros.seguroCarga, l.ufOrigem, l.cidOrigem, l.cepIniO,
        l.ufDestino, l.cidDestino, l.cepIniD, l.cepFimD, l.mesoDestino, parametros.fatorCubagem, t.freteLotacao || '',
        getF(t,'10 Kg'), getF(t,'20 Kg'), getF(t,'30 Kg'), getF(t,'50 Kg'), getF(t,'70 Kg'), getF(t,'100 Kg'), 
        getF(t,'500 Kg'), getF(t,'3000 Kg'), getF(t,'5000 Kg'), getF(t,'Excedente Kg'), getF(t,'Excedente Kg'), // Duplicado propositalmente para cobrir as duas colunas
        t.grisPct||'', t.advlrPct||'', t.trtPct||'', t.trtFixo||'', t.trtMin||'', t.tdePct||'', t.tdeFixo||'', t.tdeMin||'',
        t.tdaPct||'', t.tdaFixo||'', t.tdaMin||'', t.tsoPct||'', t.tsoFixo||'', t.tsoMin||'', t.suframa||'',
        t.segFluvialPct||'', t.segFluvialFixo||'', t.segFluvialMin||'', t.pedagioFixo||'', t.pedagioFracao||'', t.pedagioKg||'',
        t.emexPct||'', t.emexFixo||'', t.emexMin||'', t.emissaoCte||'', t.agendamento||'', t.armazenagem||'',
        t.paletizacao||'', t.reentregaPct||'', t.devolucaoPct||'', t.diaria||'', t.cargaDescarga||'', chave
      ].join(';');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [cabecalho.join(';'), ...linhas].join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Tabela_Frete_${parametros.transportador}_${negociacao.docAriba}.csv`;
    link.click();
  };

  // REQUISIÇÃO API REAL
  useEffect(() => {
    const buscarMalhaGeografica = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/rotas-ibge');
        setDadosIbge(response.data);
      } catch (error) {
        console.error("Erro ao carregar malha do BigQuery:", error);
      } finally {
        setCarregandoMalha(false);
      }
    };
    buscarMalhaGeografica();
  }, []);

  const getUFsUnicas = () => [...new Set(dadosIbge.map(d => d.slg_uf))].sort();
  const getCidadesPorUFs = (ufsArray) => [...new Set(dadosIbge.filter(d => ufsArray.includes(d.slg_uf)).map(d => d.nome_cidade))].sort();
  const getMesorregioesPorUFs = (ufsArray) => [...new Set(dadosIbge.filter(d => ufsArray.includes(d.slg_uf)).map(d => `${d.mesorregiao} (${d.slg_uf})`))].sort();

  useEffect(() => { setParametros(prev => ({ ...prev, fluxo: '' })); }, [parametros.etapa]);

  useEffect(() => {
    if (rotas.ufsOrigem.length > 1 && rotas.abrangenciaOrigem === 'Fixo') setRotas(prev => ({ ...prev, abrangenciaOrigem: 'Varias', detalheOrigem: [] }));
    else if (rotas.ufsOrigem.length === 0) setRotas(prev => ({ ...prev, abrangenciaOrigem: 'Fixo', detalheOrigem: [] }));
    else setRotas(prev => ({ ...prev, detalheOrigem: [] }));
  }, [rotas.ufsOrigem, rotas.abrangenciaOrigem]);

  useEffect(() => {
    if (rotas.ufsDestino.length > 1 && rotas.abrangenciaDestino === 'Fixo') setRotas(prev => ({ ...prev, abrangenciaDestino: 'Varias', detalheDestino: [] }));
    else if (rotas.ufsDestino.length === 0) setRotas(prev => ({ ...prev, abrangenciaDestino: 'Fixo', detalheDestino: [] }));
    else setRotas(prev => ({ ...prev, detalheDestino: [] }));
  }, [rotas.ufsDestino, rotas.abrangenciaDestino]);

  const executarMotor = () => {
    setGerando(true);
    setTimeout(() => {
      const matrizResultado = [];
      const origens = dadosIbge.filter(d => rotas.ufsOrigem.includes(d.slg_uf) && (rotas.abrangenciaOrigem === 'Todas' || (rotas.abrangenciaOrigem === 'Fixo' && rotas.detalheOrigem.includes(d.nome_cidade)) || (rotas.abrangenciaOrigem === 'Varias' && rotas.detalheOrigem.includes(d.nome_cidade)) || (rotas.abrangenciaOrigem === 'Mesorregiao' && rotas.detalheOrigem.includes(`${d.mesorregiao} (${d.slg_uf})`))));
      const destinos = dadosIbge.filter(d => rotas.ufsDestino.includes(d.slg_uf) && (rotas.abrangenciaDestino === 'Todas' || (rotas.abrangenciaDestino === 'Fixo' && rotas.detalheDestino.includes(d.nome_cidade)) || (rotas.abrangenciaDestino === 'Varias' && rotas.detalheDestino.includes(d.nome_cidade)) || (rotas.abrangenciaDestino === 'Mesorregiao' && rotas.detalheDestino.includes(`${d.mesorregiao} (${d.slg_uf})`))));

      origens.forEach(o => {
        destinos.forEach(d => {
          const frota = parametros.veiculos.length > 0 ? parametros.veiculos : ['N/A'];
          frota.forEach(v => {
            matrizResultado.push({ 
              idRota: `${o.slg_uf} - ${d.slg_uf} | ${o.cod_cidade} - ${d.cod_cidade}`, 
              transportador: parametros.transportador || 'N/A', 
              veiculo: v, ufOrigem: o.slg_uf, cidOrigem: o.nome_cidade, cepIniO: o.cep_inicial, cepFimO: o.cep_final,
              ufDestino: d.slg_uf, cidDestino: d.nome_cidade, mesoDestino: d.mesorregiao, cepIniD: d.cep_inicial, cepFimD: d.cep_final
            });
          });
        });
      });
      
      setLinhasGeradas(matrizResultado);
      setGerando(false);
      setPasso(4);
    }, 1000); 
  };

  const RenderizarDetalheRota = (tipo) => {
    const ufs = tipo === 'Origem' ? rotas.ufsOrigem : rotas.ufsDestino;
    const abragencia = tipo === 'Origem' ? rotas.abrangenciaOrigem : rotas.abrangenciaDestino;
    const selecionados = tipo === 'Origem' ? rotas.detalheOrigem : rotas.detalheDestino;
    const setDetalhe = (val) => setRotas({...rotas, [`detalhe${tipo}`]: val});

    if (ufs.length === 0) return <div className="text-muted p-3 text-center" style={{fontSize: '12px', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)'}}>Selecione uma UF primeiro...</div>;
    if (abragencia === 'Todas') return <div className="p-3 text-center text-success fw-bold shadow-sm" style={{fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)'}}>TODAS AS CIDADES DAS UFs SELECIONADAS</div>;
    if (abragencia === 'Fixo') return (
      <select className="form-select shadow-sm py-2 fw-bold" style={{fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)'}} value={selecionados[0] || ''} onChange={(e) => setDetalhe([e.target.value])}>
        <option value="">Selecione 1 cidade...</option>
        {getCidadesPorUFs(ufs).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    );
    if (abragencia === 'Mesorregiao') return <CheckboxList options={getMesorregioesPorUFs(ufs)} selected={selecionados} onChange={setDetalhe} />;
    if (abragencia === 'Varias') return <CheckboxList options={getCidadesPorUFs(ufs)} selected={selecionados} onChange={setDetalhe} />;
  };

  const salvarPrecosDaRota = () => {
    if(rotasEmEdicao.length === 0) return alert('Selecione pelo menos uma rota no cabeçalho!');
    const novoBackup = { ...tarifasSalvas };
    
    rotasEmEdicao.forEach(r => {
      if(regiaoEmEdicao === 'Ambas') {
        novoBackup[`${r}-Capital`] = { ...tarifas };
        novoBackup[`${r}-Interior`] = { ...tarifas };
      } else {
        novoBackup[`${r}-${regiaoEmEdicao}`] = { ...tarifas };
      }
    });
    
    setTarifasSalvas(novoBackup);
    alert('Preços gravados na memória para a(s) rota(s) selecionada(s)!');
    setRotasEmEdicao([]);
    setTarifas(estadoTarifasInicial);
  };

  const todasAsRotasPreenchidas = () => {
    if(rotasRequeridas.length === 0) return false;
    let preenchido = true;
    rotasRequeridas.forEach(r => {
      if(!tarifasSalvas[`${r}-Capital`] && !tarifasSalvas[`${r}-Interior`]) preenchido = false;
    });
    return preenchido;
  };

  return (
    <div className="d-flex flex-column gap-3 h-100 mx-auto" style={{ maxWidth: '1400px', width: '100%' }}>
      <div className="text-center mt-2 mb-2">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gerador & Digitalizador de Tabelas</h4>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Setup de negociação, parâmetros e malha rodoviária.</span>
      </div>

      <div className="glass-panel p-3 d-flex justify-content-center align-items-center mb-2 mx-auto shadow-sm" style={{ width: '90%', borderRadius: 'var(--radius-pill)' }}>
        <div className="d-flex gap-2 align-items-center w-100 justify-content-between px-4">
          {[ { n: 1, t: 'Parâmetros', i: <FaFileSignature/> }, { n: 2, t: 'Malha / Rotas', i: <FaMapMarkedAlt/> }, { n: 3, t: 'Precificação', i: <FaMoneyBillWave/> }, { n: 4, t: 'Validação', i: <FaTable/> } ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="d-flex align-items-center gap-2" style={{ opacity: passo >= s.n ? 1 : 0.4 }}>
                <div className="shadow-sm" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: passo >= s.n ? 'var(--primary)' : 'var(--text-aux)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>{s.i}</div>
                <span className="fw-bold text-uppercase d-none d-lg-block" style={{ fontSize: '11px', color: 'var(--text-main)', letterSpacing: '0.5px' }}>{s.n}. {s.t}</span>
              </div>
              {idx < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: passo > s.n ? 'var(--primary)' : 'var(--text-aux)', opacity: 0.2, margin: '0 10px' }}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="glass-panel flex-grow-1 p-4 d-flex flex-column custom-scrollbar shadow-sm" style={{ overflowY: 'auto' }}>

        {/* PASSO 1 */}
        {passo === 1 && (
          <div className="animate-fade-in d-flex flex-column h-100">
            <h6 className="fw-bold text-center mb-4" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>1º Parâmetros de Negociação</h6>
            <h6 className="fw-bold mb-3 pb-2" style={{ color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>1ª Dados de Negociação</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Doc Ariba (WS)</label>
                <input type="text" className="form-control form-control-sm fw-bold shadow-sm py-2 text-center" placeholder="Ex: WS12345" value={negociacao.docAriba} onChange={e => setNegociacao({...negociacao, docAriba: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }} />
              </div>
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Abertura</label>
                <input type="date" className="form-control form-control-sm shadow-sm py-2 text-muted fw-bold text-center" value={negociacao.dataAbertura} onChange={e => setNegociacao({...negociacao, dataAbertura: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }} />
              </div>
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Início Vigência</label>
                <input type="date" className="form-control form-control-sm shadow-sm py-2 text-muted fw-bold text-center" value={negociacao.dataInicio} onChange={e => setNegociacao({...negociacao, dataInicio: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }} />
              </div>
              <div className="col-md-2">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Final Vigência</label>
                <input type="date" className="form-control form-control-sm shadow-sm py-2 text-muted fw-bold text-center" value={negociacao.dataFinal} onChange={e => setNegociacao({...negociacao, dataFinal: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }} />
              </div>
              <div className="col-md-4 d-flex flex-column align-items-center">
                <label className="form-label text-center w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Incoterm</label>
                <div className="d-flex justify-content-center align-items-center gap-4 mt-2 w-100">
                  <div className="form-check m-0 d-flex align-items-center">
                    <input className="form-check-input m-0 shadow-sm" type="radio" name="incoterm" id="cif" value="CIF" checked={negociacao.incoterm === 'CIF'} onChange={e => setNegociacao({...negociacao, incoterm: e.target.value})} style={{cursor: 'pointer'}} />
                    <label className="form-check-label ms-2 fw-bold" htmlFor="cif" style={{fontSize: '12px', cursor: 'pointer', color: 'var(--text-main)'}}>CIF</label>
                  </div>
                  <div className="form-check m-0 d-flex align-items-center">
                    <input className="form-check-input m-0 shadow-sm" type="radio" name="incoterm" id="fob" value="FOB" checked={negociacao.incoterm === 'FOB'} onChange={e => setNegociacao({...negociacao, incoterm: e.target.value})} style={{cursor: 'pointer'}} />
                    <label className="form-check-label ms-2 fw-bold" htmlFor="fob" style={{fontSize: '12px', cursor: 'pointer', color: 'var(--text-main)'}}>FOB</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Tipo de Negociação</label>
                <select className="form-select form-select-sm shadow-sm fw-bold py-2" value={negociacao.tipoNegociacao} onChange={e => setNegociacao({...negociacao, tipoNegociacao: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <option value="">Selecione...</option>
                  {PARAMETROS_LOGISTICOS.tiposNegociacao.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Modelo de Contratação</label>
                <select className="form-select form-select-sm shadow-sm fw-bold py-2" value={negociacao.modeloContratacao} onChange={e => setNegociacao({...negociacao, modeloContratacao: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <option value="">Selecione...</option>
                  {PARAMETROS_LOGISTICOS.modelosContratacao.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <h6 className="fw-bold mb-3 pb-2 mt-2" style={{ color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>2ª Dados Logísticos</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Etapa Logística</label>
                <select className="form-select form-select-sm shadow-sm fw-bold py-2" value={parametros.etapa} onChange={e => setParametros({...parametros, etapa: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <option value="">Selecione...</option>
                  {PARAMETROS_LOGISTICOS.etapas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Fluxo Logístico</label>
                <select className="form-select form-select-sm shadow-sm fw-bold py-2" value={parametros.fluxo} onChange={e => setParametros({...parametros, fluxo: e.target.value})} disabled={!parametros.etapa} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <option value="">Selecione...</option>
                  {parametros.etapa && PARAMETROS_LOGISTICOS.fluxosPorEtapa[parametros.etapa].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="col-md-3 d-flex flex-column align-items-center">
                <label className="form-label text-center w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Carga Perigosa?</label>
                <div className="d-flex justify-content-center align-items-center gap-4 mt-2 w-100">
                  <div className="form-check m-0 d-flex align-items-center">
                    <input className="form-check-input m-0 shadow-sm" type="radio" name="perigosa" id="perigSim" value="Sim" checked={parametros.cargaPerigosa === 'Sim'} onChange={e => setParametros({...parametros, cargaPerigosa: e.target.value})} style={{cursor: 'pointer'}} />
                    <label className="form-check-label ms-2 fw-bold" htmlFor="perigSim" style={{fontSize: '12px', cursor: 'pointer', color: 'var(--text-main)'}}>Sim</label>
                  </div>
                  <div className="form-check m-0 d-flex align-items-center">
                    <input className="form-check-input m-0 shadow-sm" type="radio" name="perigosa" id="perigNao" value="Não" checked={parametros.cargaPerigosa === 'Não'} onChange={e => setParametros({...parametros, cargaPerigosa: e.target.value})} style={{cursor: 'pointer'}} />
                    <label className="form-check-label ms-2 fw-bold" htmlFor="perigNao" style={{fontSize: '12px', cursor: 'pointer', color: 'var(--text-main)'}}>Não</label>
                  </div>
                </div>
              </div>
              <div className="col-md-3 d-flex flex-column align-items-center">
                <label className="form-label text-center w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Seguro da Carga</label>
                <div className="d-flex justify-content-center align-items-center gap-4 mt-2 w-100">
                  <div className="form-check m-0 d-flex align-items-center">
                    <input className="form-check-input m-0 shadow-sm" type="radio" name="seguro" id="segProprio" value="Próprio" checked={parametros.seguroCarga === 'Próprio'} onChange={e => setParametros({...parametros, seguroCarga: e.target.value})} style={{cursor: 'pointer'}} />
                    <label className="form-check-label ms-2 fw-bold" htmlFor="segProprio" style={{fontSize: '12px', cursor: 'pointer', color: 'var(--text-main)'}}>Próprio</label>
                  </div>
                  <div className="form-check m-0 d-flex align-items-center">
                    <input className="form-check-input m-0 shadow-sm" type="radio" name="seguro" id="segTerceiro" value="Terceiro" checked={parametros.seguroCarga === 'Terceiro'} onChange={e => setParametros({...parametros, seguroCarga: e.target.value})} style={{cursor: 'pointer'}} />
                    <label className="form-check-label ms-2 fw-bold" htmlFor="segTerceiro" style={{fontSize: '12px', cursor: 'pointer', color: 'var(--text-main)'}}>Terceiro</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Transportador</label>
                <select className="form-select form-select-sm shadow-sm fw-bold py-2" value={parametros.transportador} onChange={e => setParametros({...parametros, transportador: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <option value="">Selecione...</option>
                  {PARAMETROS_LOGISTICOS.transportadores.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Fator de Cubagem</label>
                <select className="form-select form-select-sm shadow-sm fw-bold py-2" value={parametros.fatorCubagem} onChange={e => setParametros({...parametros, fatorCubagem: e.target.value})} style={{ fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <option value="">Selecione...</option>
                  {PARAMETROS_LOGISTICOS.fatorCubagem.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Veículo <span className="text-primary">(Múltiplo)</span></label>
                <CheckboxList options={PARAMETROS_LOGISTICOS.veiculos} selected={parametros.veiculos} onChange={(val) => setParametros({...parametros, veiculos: val})} exibeIcones={true} />
              </div>
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Carroceria <span className="text-primary">(Múltiplo)</span></label>
                <CheckboxList options={PARAMETROS_LOGISTICOS.carrocerias} selected={parametros.carrocerias} onChange={(val) => setParametros({...parametros, carrocerias: val})} exibeIcones={true} />
              </div>
              <div className="col-md-4">
                <label className="form-label w-100 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-aux)', textTransform: 'uppercase' }}>Combustível <span className="text-primary">(Múltiplo)</span></label>
                <CheckboxList options={PARAMETROS_LOGISTICOS.combustiveis} selected={parametros.combustiveis} onChange={(val) => setParametros({...parametros, combustiveis: val})} exibeIcones={true} />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-auto pt-3 border-top">
              <button className="btn text-white fw-bold shadow-sm d-flex align-items-center px-4 py-2" style={{ backgroundColor: 'var(--dark-highlight)', borderRadius: 'var(--radius-pill)', fontSize: '13px' }} onClick={() => setPasso(2)}>
                Próximo Passo: Rotas <FaArrowRight className="ms-2"/>
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2 */}
        {passo === 2 && (
          <div className="animate-fade-in d-flex flex-column h-100">
            <h6 className="fw-bold text-center mb-4" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>2º Configuração Geográfica da Malha</h6>
            {carregandoMalha ? (
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Carregando Malha...</span></div>
                <span className="ms-3 fw-bold text-muted">Conectando ao BigQuery...</span>
              </div>
            ) : (
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="p-4 border rounded h-100 d-flex flex-column gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <h6 className="fw-bold text-center border-bottom pb-3 mb-0" style={{ color: 'var(--text-main)' }}>📍 PARÂMETROS DE ORIGEM</h6>
                    <div>
                      <label className="form-label text-center w-100 mb-2" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)' }}>UF ORIGEM <span className="text-primary">(Múltiplo)</span></label>
                      <CheckboxList options={getUFsUnicas()} selected={rotas.ufsOrigem} onChange={(val) => setRotas({...rotas, ufsOrigem: val})} />
                    </div>
                    <div>
                      <label className="form-label text-center w-100 mb-2 mt-2" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)' }}>ABRANGÊNCIA DA(S) UF(S)</label>
                      <select className="form-select shadow-sm fw-bold py-2 text-center" style={{fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)'}} value={rotas.abrangenciaOrigem} onChange={e => setRotas({...rotas, abrangenciaOrigem: e.target.value})} disabled={rotas.ufsOrigem.length === 0}>
                        {rotas.ufsOrigem.length <= 1 && <option value="Fixo">Apenas Uma Cidade (Fixo)</option>}
                        <option value="Mesorregiao">Selecionar por Mesorregião</option>
                        <option value="Varias">Selecionar Várias Cidades</option>
                        <option value="Todas">Todas as Cidades das UFs Selecionadas</option>
                      </select>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label text-center w-100 mb-2 mt-2" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)' }}>DETALHAMENTO DA ORIGEM</label>
                      {RenderizarDetalheRota('Origem')}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 border rounded h-100 d-flex flex-column gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <h6 className="fw-bold text-center border-bottom pb-3 mb-0" style={{ color: 'var(--text-main)' }}>🏁 PARÂMETROS DE DESTINO</h6>
                    <div>
                      <label className="form-label text-center w-100 mb-2" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)' }}>UF DESTINO <span className="text-primary">(Múltiplo)</span></label>
                      <CheckboxList options={getUFsUnicas()} selected={rotas.ufsDestino} onChange={(val) => setRotas({...rotas, ufsDestino: val})} />
                    </div>
                    <div>
                      <label className="form-label text-center w-100 mb-2 mt-2" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)' }}>ABRANGÊNCIA DA(S) UF(S)</label>
                      <select className="form-select shadow-sm fw-bold py-2 text-center" style={{fontSize: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)'}} value={rotas.abrangenciaDestino} onChange={e => setRotas({...rotas, abrangenciaDestino: e.target.value})} disabled={rotas.ufsDestino.length === 0}>
                        {rotas.ufsDestino.length <= 1 && <option value="Fixo">Apenas Uma Cidade (Fixo)</option>}
                        <option value="Mesorregiao">Selecionar por Mesorregião</option>
                        <option value="Varias">Selecionar Várias Cidades</option>
                        <option value="Todas">Todas as Cidades das UFs Selecionadas</option>
                      </select>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label text-center w-100 mb-2 mt-2" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-aux)' }}>DETALHAMENTO DO DESTINO</label>
                      {RenderizarDetalheRota('Destino')}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="d-flex justify-content-between mt-auto pt-3 border-top">
              <button className="btn btn-light fw-bold px-4 shadow-sm" style={{ borderRadius: 'var(--radius-pill)', fontSize: '13px' }} onClick={() => setPasso(1)}>Voltar</button>
              <button className="btn text-white fw-bold shadow-sm d-flex align-items-center px-4 py-2" style={{ backgroundColor: 'var(--dark-highlight)', borderRadius: 'var(--radius-pill)', fontSize: '13px' }} onClick={() => setPasso(3)}>
                Finalizar Setup e Precificar <FaArrowRight className="ms-2"/>
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3 */}
        {passo === 3 && (
          <div className="animate-fade-in d-flex flex-column h-100" style={{ minHeight: 0 }}>
            <h6 className="fw-bold text-center mb-1 flex-shrink-0" style={{ color: 'var(--status-success-txt)', textTransform: 'uppercase', letterSpacing: '1px' }}>3º Matriz de Precificação</h6>
            <div className="p-2 mb-2 border shadow-sm d-flex gap-2 mx-auto flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.8)', width: 'fit-content', borderRadius: '3px' }}>
              <div style={{width: '240px'}}>
                <label className="mb-1 w-100 text-center" style={{fontSize: '10px', color: '#5F6D78', fontWeight: 'normal', textTransform: 'uppercase'}}>1. Rota(s) a Preencher</label>
                <DropdownCheckRotas label="Selecione..." options={rotasRequeridas} selected={rotasEmEdicao} onChange={setRotasEmEdicao} />
              </div>
              <div style={{width: '240px'}}>
                <label className="mb-1 w-100 text-center" style={{fontSize: '10px', color: '#5F6D78', fontWeight: 'normal', textTransform: 'uppercase'}}>2. Região Destino</label>
                <select className="form-select bg-white shadow-sm fw-bold px-2" value={regiaoEmEdicao} onChange={e=>setRegiaoEmEdicao(e.target.value)} style={{fontSize: '11px', color: '#5F6D78', height: '32px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)'}}>
                  <option value="Capital">Apenas Capital</option>
                  <option value="Interior">Apenas Interior</option>
                  <option value="Ambas">Ambas (Copiar Valores)</option>
                </select>
              </div>
            </div>
            
            <div className="flex-grow-1 custom-scrollbar pe-1" style={{ overflowY: 'auto', minHeight: 0 }}>
              <div className="d-flex w-100 align-items-stretch" style={{ gap: '2px', opacity: rotasEmEdicao.length > 0 ? 1 : 0.4, pointerEvents: rotasEmEdicao.length > 0 ? 'auto' : 'none' }}>
                <div className="d-flex flex-column" style={{ width: '27%', gap: '2px' }}>
                  <div className="p-2 border shadow-sm bg-white d-flex flex-column justify-content-center" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)', height: '105px' }}>
                    <h6 className="fw-bold text-center mb-2 pb-1 border-bottom" style={{ fontSize: '14px', color: '#2A6F9A', textTransform: 'uppercase' }}>Frete Principal</h6>
                    <div className="d-flex align-items-center px-1 mt-1">
                      <label className="form-label mb-0 flex-grow-1 text-start text-truncate" style={{ fontSize: '12px', color: '#8EC3EA' }}>Valor Frete Lotação</label>
                      <div className="input-group input-group-sm shadow-sm" style={{width: '100px'}}>
                        <span className="input-group-text fw-bold border-0 px-1" style={{fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span>
                        <input type="number" step="0.01" className="form-control fw-bold tabular-nums text-end px-1" value={tarifas.freteLotacao} onChange={e => setTarifas({...tarifas, freteLotacao: e.target.value})} placeholder="0.00" style={{color: '#5F6D78', fontSize: '12px'}} />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border shadow-sm bg-white flex-grow-1 d-flex flex-column" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)', minHeight: '300px' }}>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-1 px-1">
                      <h6 className="fw-bold mb-0 flex-grow-1" style={{ fontSize: '14px', color: '#2A6F9A', textTransform: 'uppercase' }}>Faixas de Peso</h6>
                      <span className="badge bg-secondary" style={{fontSize: '9px'}}>{tarifas.faixasAtivas.length} ativas</span>
                    </div>
                    <div className="px-1 py-1 custom-scrollbar flex-grow-1" style={{ overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.02)', minHeight: 0 }}>
                      {PARAMETROS_LOGISTICOS.faixasPeso.map(faixa => {
                        const isAtiva = tarifas.faixasAtivas.includes(faixa);
                        return (
                          <div className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }} key={faixa}>
                            <div className="form-check m-0 d-flex align-items-center">
                              <input className="form-check-input m-0 me-2 shadow-sm" type="checkbox" checked={isAtiva} onChange={(e) => {
                                if(e.target.checked) setTarifas({...tarifas, faixasAtivas: [...tarifas.faixasAtivas, faixa]});
                                else {
                                  const novasAtivas = tarifas.faixasAtivas.filter(f => f !== faixa);
                                  const novosValores = {...tarifas.faixasValores}; delete novosValores[faixa];
                                  setTarifas({...tarifas, faixasAtivas: novasAtivas, faixasValores: novosValores});
                                }
                              }} style={{cursor: 'pointer'}} />
                              <label className="form-check-label text-truncate" style={{fontSize: '11px', cursor: 'pointer', fontWeight: 'normal', color: isAtiva ? '#5F6D78' : 'rgba(95, 109, 120, 0.5)'}}>{faixa}</label>
                            </div>
                            {isAtiva && (
                              <div className="input-group input-group-sm shadow-sm" style={{width: '90px'}}>
                                 <span className="input-group-text fw-bold border-0 px-1" style={{fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span>
                                 <input type="number" step="0.01" className="form-control form-control-sm text-end fw-bold tabular-nums px-1" style={{ fontSize: '11px', height: '24px', color: '#5F6D78' }} placeholder="0.00" value={tarifas.faixasValores[faixa] || ''} onChange={e => setTarifas({...tarifas, faixasValores: {...tarifas.faixasValores, [faixa]: e.target.value}})} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column" style={{ width: '48%', gap: '2px' }}>
                  <div className="p-2 px-3 border shadow-sm bg-white d-flex flex-column justify-content-center" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)', height: '105px' }}>
                    <h6 className="fw-bold text-center mb-1 pb-1 border-bottom" style={{ fontSize: '14px', color: '#2A6F9A', textTransform: 'uppercase' }}>Ad Valorem e GRIS</h6>
                    <TaxaComposta label="GRIS" prefix="gris" state={tarifas} setState={setTarifas} isAdValorem={true} />
                    <TaxaComposta label="Ad Valorem" prefix="advlr" state={tarifas} setState={setTarifas} isAdValorem={true} />
                  </div>
                  <div className="p-2 px-3 border shadow-sm bg-white" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)' }}>
                    <h6 className="fw-bold text-center mb-2 pb-1 border-bottom" style={{ fontSize: '14px', color: '#2A6F9A', textTransform: 'uppercase' }}>Pedágio</h6>
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1"><label className="form-label text-center mb-0 text-truncate w-100" style={{ fontSize: '11px', color: '#8EC3EA' }}>Valor Fixo</label><div className="input-group input-group-sm shadow-sm"><span className="input-group-text border-0 px-1" style={{fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span><input type="number" step="0.01" className="form-control text-end fw-bold px-1" placeholder="0.00" value={tarifas.pedagioFixo} onChange={e => setTarifas({...tarifas, pedagioFixo: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} /></div></div>
                      <div className="flex-grow-1"><label className="form-label text-center mb-0 text-truncate w-100" style={{ fontSize: '11px', color: '#8EC3EA' }}>Fração a Cada X Kg</label><div className="input-group input-group-sm shadow-sm"><span className="input-group-text border-0 px-1" style={{fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span><input type="number" step="0.01" className="form-control text-end fw-bold px-1" placeholder="0.00" value={tarifas.pedagioFracao} onChange={e => setTarifas({...tarifas, pedagioFracao: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} /></div></div>
                      <div className="flex-grow-1"><label className="form-label text-center mb-0 text-truncate w-100" style={{ fontSize: '11px', color: '#8EC3EA' }}>Por Kg</label><div className="input-group input-group-sm shadow-sm"><span className="input-group-text border-0 px-1" style={{fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.1)', color: '#DF7659'}}>R$</span><input type="number" step="0.01" className="form-control text-end fw-bold px-1" placeholder="0.00" value={tarifas.pedagioKg} onChange={e => setTarifas({...tarifas, pedagioKg: e.target.value})} style={{fontSize: '11px', color: '#5F6D78'}} /></div></div>
                    </div>
                  </div>
                  <div className="p-2 px-3 border shadow-sm bg-white flex-grow-1" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)', minHeight: 0 }}>
                    <h6 className="fw-bold text-center mb-2 pb-1 border-bottom" style={{ fontSize: '14px', color: '#2A6F9A', textTransform: 'uppercase' }}>Taxas Compostas e Acessórias</h6>
                    <div className="d-flex align-items-center mb-1 px-1 text-muted" style={{fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px'}}>
                      <div style={{width: '120px'}} className="text-center">COMPOSIÇÃO</div>
                      <div className="d-flex flex-grow-1 text-center gap-2">
                        <div style={{flex: 1}}>PCT (%)</div><div style={{flex: 1}}>FIXO (R$)</div><div style={{flex: 1}}>MÍNIMO (R$)</div>
                      </div>
                    </div>
                    <TaxaComposta label="TRT" prefix="trt" state={tarifas} setState={setTarifas} />
                    <TaxaComposta label="TDE" prefix="tde" state={tarifas} setState={setTarifas} />
                    <TaxaComposta label="TDA" prefix="tda" state={tarifas} setState={setTarifas} />
                    <TaxaComposta label="TSO" prefix="tso" state={tarifas} setState={setTarifas} />
                    <TaxaComposta label="EMEX" prefix="emex" state={tarifas} setState={setTarifas} />
                    <TaxaComposta label="Seg. Fluvial" prefix="segFluvial" state={tarifas} setState={setTarifas} />
                  </div>
                </div>

                <div className="d-flex flex-column" style={{ width: '25%', gap: '2px' }}>
                  <div className="p-2 px-3 border shadow-sm bg-white d-flex flex-column flex-grow-1" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)', overflowY: 'auto' }}>
                    <h6 className="fw-bold text-center mb-3 pb-1 border-bottom" style={{ fontSize: '14px', color: '#2A6F9A', textTransform: 'uppercase' }}>Fixas Operacionais</h6>
                    <InputSimples label="Suframa" isPct={false} stateKey="suframa" state={tarifas} setState={setTarifas} />
                    <InputSimples label="SEC/CAT" isPct={false} stateKey="emissaoCte" state={tarifas} setState={setTarifas} />
                    <InputSimples label="Agendamento" isPct={false} stateKey="agendamento" state={tarifas} setState={setTarifas} />
                    <InputSimples label="Armazenagem" isPct={false} stateKey="armazenagem" state={tarifas} setState={setTarifas} />
                    <InputSimples label="Paletização" isPct={false} stateKey="paletizacao" state={tarifas} setState={setTarifas} />
                    <InputSimples label="Diária" isPct={false} stateKey="diaria" state={tarifas} setState={setTarifas} />
                    <InputSimples label="Carga / Desc" isPct={false} stateKey="cargaDescarga" state={tarifas} setState={setTarifas} />

                    <h6 className="fw-bold text-center mt-3 mb-2 pb-1 border-bottom" style={{ fontSize: '14px', color: '#8EC3EA', textTransform: 'uppercase' }}>SLA & Prazos</h6>
                    <InputPrazo label="Pgto (Dias)" suffix="Dias" stateKey="prazoPagamento" state={tarifas} setState={setTarifas} />
                    <InputPrazo label="Entrega (Dias)" suffix="Dias" stateKey="prazoEntrega" state={tarifas} setState={setTarifas} />
                    <InputPrazo label="Free Time" suffix="Hrs" stateKey="freeTime" state={tarifas} setState={setTarifas} />

                    <h6 className="fw-bold text-center mt-auto mb-3 pb-1 pt-3 border-bottom" style={{ fontSize: '14px', color: '#DF7659', textTransform: 'uppercase' }}>Logística Reversa</h6>
                    <InputSimples label="Reentrega" isPct={true} stateKey="reentregaPct" state={tarifas} setState={setTarifas} />
                    <InputSimples label="Devolução" isPct={true} stateKey="devolucaoPct" state={tarifas} setState={setTarifas} />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between pt-2 mt-2 flex-shrink-0" style={{ borderTop: '2px solid rgba(0,0,0,0.05)' }}>
              <button className="btn btn-light fw-bold px-4 shadow-sm" style={{ borderRadius: '20px', fontSize: '13px', color: '#5F6D78', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)' }} onClick={() => setPasso(2)}>Voltar às Rotas</button>
              
              <div className="d-flex gap-3">
                <button className="btn text-white fw-bold shadow-sm d-flex align-items-center px-4 py-2" style={{ backgroundColor: '#2A6F9A', borderRadius: '20px', fontSize: '13px' }} onClick={salvarPrecosDaRota}>
                  Salvar Tarifas
                </button>
                <button 
                  className="btn text-white fw-bold shadow-sm d-flex align-items-center px-4 py-2" 
                  style={{ backgroundColor: todasAsRotasPreenchidas() ? '#8F9B9A' : 'var(--text-aux)', borderRadius: '20px', fontSize: '13px' }} 
                  onClick={executarMotor}
                  disabled={!todasAsRotasPreenchidas() || gerando}
                >
                  {gerando ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaCog className="me-2"/>}
                  {todasAsRotasPreenchidas() ? (gerando ? 'Cruzando Malha...' : 'Validar & Exportar Tabela (Passo 4)') : 'Preencha as Tarifas para Avançar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: MESA DE VALIDAÇÃO FINAL E RESUMO EXECUTIVO */}
        {passo === 4 && (
          <div className="animate-fade-in d-flex flex-column h-100" style={{ minHeight: 0, position: 'relative' }}>
            
            <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
              <h6 className="fw-bold mb-0" style={{ color: 'var(--status-success-txt)', textTransform: 'uppercase', letterSpacing: '1px' }}>4º Validação e Exportação da Tabela</h6>
              <button 
                className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center gap-2 px-3 py-2 hover-scale" 
                style={{ borderRadius: 'var(--radius-pill)', backgroundColor: '#DF7659', border: 'none', transition: 'all 0.2s' }} 
                onClick={() => setModalResumoAberto(true)}
              >
                <FaFilePdf size={16}/> Resumo Executivo da Tabela
              </button>
            </div>
            
            <div className="d-flex gap-3 mb-3 flex-shrink-0">
              <div className="p-3 border shadow-sm bg-white d-flex align-items-center justify-content-between flex-grow-1" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)' }}>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#2A6F9A', fontSize: '13px', textTransform: 'uppercase' }}>Volume Gerado</h6>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Total de Linhas Únicas</span>
                </div>
                <h3 className="mb-0 fw-bold tabular-nums" style={{ color: '#DF7659' }}>{linhasGeradas.length.toLocaleString('pt-BR')} <span style={{fontSize: '12px', color: '#5F6D78'}}>linhas</span></h3>
              </div>
              <div className="p-3 border shadow-sm bg-white d-flex align-items-center justify-content-between flex-grow-1" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)' }}>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#2A6F9A', fontSize: '13px', textTransform: 'uppercase' }}>Parceiro Logístico</h6>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Transportador Homologado</span>
                </div>
                <img 
                  src={`/${parametros.transportador ? parametros.transportador.toLowerCase().replace(/\s+/g, '') : 'default'}.png`} 
                  alt={parametros.transportador} 
                  style={{ maxHeight: '35px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <h4 className="mb-0 fw-bold" style={{ color: '#8EC3EA', display: 'none' }}>{parametros.transportador || 'N/A'}</h4>
              </div>
              <div className="p-3 border shadow-sm bg-white d-flex align-items-center justify-content-between flex-grow-1" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)' }}>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#2A6F9A', fontSize: '13px', textTransform: 'uppercase' }}>Documento Ariba</h6>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Referência Contratual (WS)</span>
                </div>
                <h4 className="mb-0 fw-bold text-uppercase" style={{ color: '#5F6D78' }}>{negociacao.docAriba || 'N/A'}</h4>
              </div>
            </div>

            {/* TABELA GRID SUPER EXPANDIDA (TODOS OS CAMPOS) */}
            <div className="flex-grow-1 border shadow-sm bg-white d-flex flex-column" style={{ borderRadius: '3px', borderColor: 'rgba(0,0,0,0.05)', minHeight: 0, overflow: 'hidden', position: 'relative' }}>
              <div className="p-2 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <span className="fw-bold d-flex align-items-center" style={{ fontSize: '12px', color: '#2A6F9A', textTransform: 'uppercase' }}>
                  <FaTable className="me-2" /> Pré-visualização da Base de Dados de Frete Completa
                </span>
                {/* BOTÃO CSV CONECTADO */}
                <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 fw-bold" style={{ fontSize: '11px', borderRadius: '3px' }} onClick={exportarCSV}>
                  <FaDownload /> Baixar Base de Dados (CSV)
                </button>
              </div>
              
              <div className="flex-grow-1 custom-scrollbar" style={{ overflow: 'auto' }}>
                <table className="table table-sm table-hover table-bordered mb-0 align-middle" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8f9fa', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <tr>
                      {/* DADOS LOGÍSTICOS E CONTRATUAIS */}
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>ID Rota Única</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Origem</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Destino</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>CEP Origem</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>CEP Destino</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Veículo</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Carroceria(s)</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Combustível</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Tipo Negociação</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Modelo</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Fluxo</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Incoterm</th>
                      <th className="text-uppercase text-muted py-2 px-3" style={{ fontSize: '10px', backgroundColor: '#f8f9fa' }}>Cubagem</th>
                      
                      {/* PRECIFICAÇÃO PRINCIPAL */}
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(42, 111, 154, 0.05)' }}>Frete Lotação (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(42, 111, 154, 0.05)' }}>Pedágio Fixo (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(42, 111, 154, 0.05)' }}>Ped/Kg (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(42, 111, 154, 0.05)' }}>Ped. Fração (R$)</th>
                      
                      {/* FAIXAS DE PESO (TODAS PARAMETRIZADAS) */}
                      {PARAMETROS_LOGISTICOS.faixasPeso.map(f => (
                         <th key={f} className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.02)' }}>{f} (R$)</th>
                      ))}

                      {/* TAXAS COMPOSTAS E OPERACIONAIS */}
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.05)' }}>GRIS (%)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.05)' }}>GRIS Mín (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.05)' }}>Ad Valorem (%)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px', backgroundColor: 'rgba(223, 118, 89, 0.05)' }}>ADV Mín (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>TRT (%)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>TDE (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>TDA (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>TSO (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>EMEX (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Seg. Fluvial (%)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>CT-e (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Suframa (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Agendamento (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Armazenagem (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Paletização (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Diária (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Carga/Desc (R$)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Devolução (%)</th>
                      <th className="text-uppercase text-muted py-2 px-3 text-end" style={{ fontSize: '10px' }}>Reentrega (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasGeradas.slice(0, 100).map((linha, idx) => {
                      const chaveRota = `${linha.ufOrigem} ➔ ${linha.ufDestino}`;
                      const tarifasAplicadas = tarifasSalvas[`${chaveRota}-Capital`] || tarifasSalvas[`${chaveRota}-Interior`] || {};
                      const getFaixa = (f) => tarifasAplicadas.faixasValores && tarifasAplicadas.faixasValores[f] ? tarifasAplicadas.faixasValores[f] : '-';
                      
                      return (
                        <tr key={idx} style={{ cursor: 'default' }}>
                          <td className="fw-bold px-3" style={{ color: '#8EC3EA' }}>{linha.idRota}</td>
                          <td className="px-3" style={{ color: '#5F6D78' }}><span className="fw-bold me-1">{linha.ufOrigem}</span>- {linha.cidOrigem}</td>
                          <td className="px-3" style={{ color: '#5F6D78' }}><span className="fw-bold me-1">{linha.ufDestino}</span>- {linha.cidDestino}</td>
                          <td className="px-3 text-muted">{linha.cepIniO}</td>
                          <td className="px-3 text-muted">{linha.cepIniD}</td>
                          <td className="px-3 fw-bold" style={{ color: '#5F6D78' }}>{linha.veiculo}</td>
                          <td className="px-3 text-muted">{parametros.carrocerias.join(', ') || '-'}</td>
                          <td className="px-3 text-muted">{parametros.combustiveis.join(', ') || '-'}</td>
                          <td className="px-3 text-muted">{negociacao.tipoNegociacao}</td>
                          <td className="px-3 text-muted">{negociacao.modeloContratacao}</td>
                          <td className="px-3 text-muted">{parametros.fluxo}</td>
                          <td className="px-3 text-muted">{negociacao.incoterm}</td>
                          <td className="px-3 text-muted">{parametros.fatorCubagem}</td>
                          
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#2A6F9A', backgroundColor: 'rgba(42, 111, 154, 0.02)' }}>{tarifasAplicadas.freteLotacao || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#5F6D78', backgroundColor: 'rgba(42, 111, 154, 0.02)' }}>{tarifasAplicadas.pedagioFixo || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#5F6D78', backgroundColor: 'rgba(42, 111, 154, 0.02)' }}>{tarifasAplicadas.pedagioKg || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#5F6D78', backgroundColor: 'rgba(42, 111, 154, 0.02)' }}>{tarifasAplicadas.pedagioFracao || '0.00'}</td>
                          
                          {/* DADOS DAS FAIXAS DE PESO NAS COLUNAS */}
                          {PARAMETROS_LOGISTICOS.faixasPeso.map(f => (
                             <td key={f} className="text-end px-3 fw-bold tabular-nums text-muted">{getFaixa(f)}</td>
                          ))}

                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#DF7659', backgroundColor: 'rgba(223, 118, 89, 0.02)' }}>{tarifasAplicadas.grisPct || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#5F6D78', backgroundColor: 'rgba(223, 118, 89, 0.02)' }}>{tarifasAplicadas.grisMin || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#DF7659', backgroundColor: 'rgba(223, 118, 89, 0.02)' }}>{tarifasAplicadas.advlrPct || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums" style={{ color: '#5F6D78', backgroundColor: 'rgba(223, 118, 89, 0.02)' }}>{tarifasAplicadas.advlrMin || '0.00'}</td>
                          
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.trtPct || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.tdeFixo || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.tdaFixo || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.tsoFixo || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.emexFixo || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.segFluvialPct || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.emissaoCte || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.suframa || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.agendamento || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.armazenagem || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.paletizacao || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.diaria || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.cargaDescarga || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.devolucaoPct || '0.00'}</td>
                          <td className="text-end px-3 fw-bold tabular-nums text-muted">{tarifasAplicadas.reentregaPct || '0.00'}</td>
                        </tr>
                      );
                    })}
                    {linhasGeradas.length === 0 && (
                      <tr><td colSpan="36" className="text-center py-5 text-muted fw-bold">Nenhuma rota foi gerada no passo anterior.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="d-flex justify-content-between pt-3 mt-3 flex-shrink-0" style={{ borderTop: '2px solid rgba(0,0,0,0.05)' }}>
              <button className="btn btn-light fw-bold px-4 shadow-sm" style={{ borderRadius: '20px', fontSize: '13px', color: '#5F6D78', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)' }} onClick={() => setPasso(3)}>Voltar para Precificação</button>
              <button className="btn text-white fw-bold shadow-sm d-flex align-items-center px-5 py-2" style={{ backgroundColor: 'var(--status-success-txt)', borderRadius: '20px', fontSize: '13px' }} onClick={() => { alert('Sucesso! Pacote de dados pronto para o BigQuery.'); setPasso(1); }}>
                <FaCheck className="me-2"/> Concluir e Salvar no Banco
              </button>
            </div>

            {/* MODAL: RESUMO EXECUTIVO (FORMATO IMPRESSÃO A4) */}
            {modalResumoAberto && (
              <div className="position-fixed top-0 start-0 w-100 h-100 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, overflowY: 'auto', padding: '3rem 0' }}>
                
                {/* CSS PARA IMPRESSÃO E SALVAMENTO EM PDF */}
                <style>
                  {`
                    @media print {
                      /* A4 em retrato, com 200 mm de largura útil. */
                      @page {
                        size: A4 portrait;
                        margin: 5mm;
                      }

                      html,
                      body {
                        width: 100% !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: #fff !important;
                      }

                      body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }

                      /* Remove os elementos externos ao documento. */
                      body *:not(:has(#modal-documento-a4)):not(#modal-documento-a4):not(#modal-documento-a4 *) {
                        display: none !important;
                      }

                      /* Remove restrições dos contêineres do modal. */
                      body *:has(#modal-documento-a4) {
                        display: block !important;
                        position: static !important;
                        width: auto !important;
                        min-width: 0 !important;
                        max-width: none !important;
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        transform: none !important;
                        filter: none !important;
                        perspective: none !important;
                        contain: none !important;
                        content-visibility: visible !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                      }

                      #modal-documento-a4,
                      #modal-documento-a4 * {
                        visibility: visible !important;
                        box-sizing: border-box !important;
                      }

                      /* Documento: ocupa a largura disponível sem altura fixa. */
                      #modal-documento-a4 {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        min-width: 0 !important;
                        max-width: none !important;
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        transform: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        background: #fff !important;
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                        break-before: auto !important;
                        break-after: auto !important;
                        break-inside: auto !important;
                      }

                      /* Compacta os espaços dos textos. */
                      #modal-documento-a4 p { margin-top: 0 !important; margin-bottom: 4px !important; }
                      #modal-documento-a4 h1, #modal-documento-a4 h2, #modal-documento-a4 h3, #modal-documento-a4 h4 {
                        margin-top: 0 !important; margin-bottom: 6px !important; break-after: avoid; page-break-after: avoid;
                      }

                      /* Tabelas ajustadas à largura da página. */
                      #modal-documento-a4 table {
                        width: 100% !important;
                        min-width: 0 !important;
                        max-width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 9pt !important;
                        line-height: 1.15 !important;
                        break-inside: auto !important;
                      }

                      #modal-documento-a4 th, #modal-documento-a4 td {
                        padding: 3px 5px !important;
                        white-space: normal !important;
                        overflow-wrap: anywhere;
                        vertical-align: middle !important;
                      }

                      #modal-documento-a4 thead { display: table-header-group; }
                      #modal-documento-a4 tr { break-inside: avoid !important; page-break-inside: avoid !important; }

                      /* Evita imagens maiores que a largura disponível. */
                      #modal-documento-a4 img { max-width: 100% !important; height: auto !important; }

                      /* Mantém todos os dados do rodapé juntos. */
                      #modal-documento-a4 .rodape-documento {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        margin: 10px 0 0 !important;
                        padding: 10px 0 0 !important;
                        font-size: 9pt !important;
                        line-height: 1.15 !important;
                        overflow: visible !important;
                        break-before: auto !important;
                        break-after: auto !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                      }

                      /* Oculta botões e controles, inclusive dentro do modal. */
                      .d-print-none, #modal-documento-a4 .d-print-none { display: none !important; }
                    }
                  `}
                </style>

                {/* CONTAINER TIPO PAPEL A4 (Cresce verticalmente sem scroll interno) */}
                <div id="modal-documento-a4" className="bg-white shadow-lg mx-auto d-flex flex-column" style={{ width: '1050px', minHeight: '1485px', borderRadius: '4px', position: 'relative' }}>
                  
                  <div className="p-4 p-md-5 d-flex flex-column flex-grow-1">
                    
                    {/* CABEÇALHO DO DOCUMENTO */}
                    <div className="d-flex justify-content-between align-items-start mb-3 pb-2" style={{ borderBottom: '2px solid #2A6F9A' }}>
                      
                      {/* LADO ESQUERDO: Transportador (Logo Dinâmica) e Documento */}
                      <div className="text-start d-flex flex-column justify-content-end" style={{ height: '70px' }}>
                        <div className="mb-1">
                          <img 
                            src={`/${parametros.transportador ? parametros.transportador.toLowerCase().replace(/\s+/g, '') : 'default'}.png`} 
                            alt={parametros.transportador} 
                            style={{ maxHeight: '40px', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                          <div className="fw-bold text-uppercase" style={{ fontSize: '28px', color: '#2A6F9A', letterSpacing: '1px', display: 'none' }}>
                            {parametros.transportador || 'TRANSPORTADORA'}
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', color: '#5F6D78', fontWeight: 'normal' }}>
                          {negociacao.docAriba ? negociacao.docAriba.charAt(0).toUpperCase() + negociacao.docAriba.slice(1) : 'Novo Documento'}
                        </span>
                      </div>
                      
                      {/* LADO DIREITO: Botões de Ação e Parâmetros */}
                      <div className="text-end d-flex flex-column align-items-end">
                        
                        {/* BOTÕES DE AÇÃO */}
                        <div className="d-flex gap-2 position-relative mb-3 mt-1 d-print-none">
                          <button className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-2 px-3 shadow-sm hover-scale" style={{ borderRadius: 'var(--radius-pill)', borderColor: '#2A6F9A', color: '#2A6F9A' }} onClick={() => window.print()}>
                            <FaDownload /> Salvar PDF
                          </button>
                          <button 
                            className="btn btn-sm text-white fw-bold d-flex align-items-center gap-2 px-3 shadow-sm hover-scale" 
                            style={{ backgroundColor: '#2A6F9A', borderRadius: 'var(--radius-pill)' }} 
                            onClick={() => setMenuCompartilharAberto(!menuCompartilharAberto)}
                          >
                            <FaShareAlt /> Compartilhar
                          </button>
                          
                          {/* MENU SOCIAL FLUTUANTE (Apenas Ícones Lado a Lado) */}
                          {menuCompartilharAberto && (
                            <div className="position-absolute top-100 end-0 mt-2 bg-white border shadow-sm p-2 animate-fade-in d-flex gap-2 justify-content-center" style={{ borderRadius: 'var(--radius-md)', zIndex: 100 }}>
                              <button className="btn btn-sm text-white rounded-circle shadow-sm hover-scale d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#E4405F' }} title="E-mail"><FaEnvelope size={18}/></button>
                              <button className="btn btn-sm text-white rounded-circle shadow-sm hover-scale d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#25D366' }} title="WhatsApp"><FaWhatsapp size={18}/></button>
                              <button className="btn btn-sm text-white rounded-circle shadow-sm hover-scale d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#4A154B' }} title="Slack"><FaSlack size={18}/></button>
                            </div>
                          )}
                          
                          <button className="btn btn-sm text-danger ms-2 shadow-none hover-scale" onClick={() => { setModalResumoAberto(false); setMenuCompartilharAberto(false); }}>
                            <FaTimes size={24}/>
                          </button>
                        </div>
                        
                        {/* INFORMAÇÕES LOGÍSTICAS E DATAS */}
                        <div style={{ fontSize: '11px', color: '#5F6D78' }}>
                          <div className="d-flex justify-content-end gap-3 mb-1">
                            <span><FaCalendarAlt color="#DF7659" className="me-1"/> <span className="fw-bold text-dark">Negociação:</span> {negociacao.dataAbertura ? new Date(negociacao.dataAbertura).toLocaleDateString('pt-BR') : '-'}</span>
                            <span><FaCalendarAlt color="#2A6F9A" className="me-1"/> <span className="fw-bold text-dark">Início Vigência:</span> {negociacao.dataInicio ? new Date(negociacao.dataInicio).toLocaleDateString('pt-BR') : '-'}</span>
                            <span><FaCalendarAlt color="#DF7659" className="me-1"/> <span className="fw-bold text-dark">Fim Vigência:</span> {negociacao.dataFinal ? new Date(negociacao.dataFinal).toLocaleDateString('pt-BR') : 'Indeterminada'}</span>
                          </div>
                          <div className="d-flex justify-content-end gap-3">
                            <span><span className="fw-bold text-dark">Fluxo:</span> {parametros.fluxo || 'N/A'}</span>
                            <span><span className="fw-bold text-dark">Tipo:</span> {negociacao.tipoNegociacao || 'N/A'}</span>
                            <span><span className="fw-bold text-dark">Incoterm:</span> {negociacao.incoterm || 'N/A'}</span>
                            <span><span className="fw-bold text-dark">Pagamento:</span> {obterResumoEstruturado()?.cap?.prazoPagamento || obterResumoEstruturado()?.int?.prazoPagamento || '-'} dias</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CORPO DE TABELAS E ASSINATURAS */}
                    {(() => {
                      const analise = obterResumoEstruturado();
                      if (!analise || (!analise.cap && !analise.int)) return <div className="text-center p-5 text-muted fw-bold d-print-none">Por favor, salve as tarifas no Passo 3 para visualizar.</div>;
                      const veiculosStr = parametros.veiculos.join(', ') || '-';

                      return (
                        <div className="d-flex flex-column gap-2 h-100 conteudo-impressao">
                          
                          {/* MATRIZ DE FRETES E FAIXAS DE PESO */}
                          <div>
                            <h6 className="fw-bold mb-1 text-center text-uppercase" style={{ color: '#2A6F9A', fontSize: '13px' }}>Matriz de Frete e Faixas de Peso</h6>
                            <table className="table table-bordered text-center align-middle mb-0" style={{ fontSize: '11px', borderColor: 'rgba(0,0,0,0.1)', tableLayout: 'fixed' }}>
                              <thead style={{ backgroundColor: 'rgba(42, 111, 154, 0.05)' }}>
                                <tr>
                                  <th style={{ height: '35px', width: '10%' }}>Região</th>
                                  <th style={{ height: '35px', width: '12%' }}>Veículo(s)</th>
                                  {analise.faixas.map((f, i) => <th key={i} style={{ height: '35px' }}>{f}</th>)}
                                  <th style={{ height: '35px', width: '9%' }}>Tx SEC/CAT</th>
                                  <th style={{ height: '35px', width: '9%' }}>Prazo Entr.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analise.cap && (
                                  <tr>
                                    <td className="fw-bold text-uppercase" style={{ height: '35px', color: '#5F6D78' }}>Capital</td>
                                    <td className="text-muted" style={{ height: '35px' }}>{veiculosStr}</td>
                                    {analise.faixas.map((f, i) => (
                                      <td key={i} className="fw-bold tabular-nums" style={{ height: '35px', color: '#2A6F9A' }}>R$ {analise.cap.faixasValores[f] || '0.00'}</td>
                                    ))}
                                    <td className="fw-bold tabular-nums" style={{ height: '35px', color: '#DF7659' }}>R$ {analise.cap.emissaoCte || '0.00'}</td>
                                    <td className="fw-bold tabular-nums text-muted" style={{ height: '35px' }}>{analise.cap.prazoEntrega ? analise.cap.prazoEntrega + ' d' : '-'}</td>
                                  </tr>
                                )}
                                {analise.int && (
                                  <tr>
                                    <td className="fw-bold text-uppercase" style={{ height: '35px', color: '#5F6D78' }}>Interior</td>
                                    <td className="text-muted" style={{ height: '35px' }}>{veiculosStr}</td>
                                    {analise.faixas.map((f, i) => (
                                      <td key={i} className="fw-bold tabular-nums" style={{ height: '35px', color: '#2A6F9A' }}>R$ {analise.int.faixasValores[f] || '0.00'}</td>
                                    ))}
                                    <td className="fw-bold tabular-nums" style={{ height: '35px', color: '#DF7659' }}>R$ {analise.int.emissaoCte || '0.00'}</td>
                                    <td className="fw-bold tabular-nums text-muted" style={{ height: '35px' }}>{analise.int.prazoEntrega ? analise.int.prazoEntrega + ' d' : '-'}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* GENERALIDADES E TAXAS (9 LINHAS ALINHADAS DE 45PX) */}
                          <div className="row g-4 mt-0 flex-grow-1">
                            
                            {/* COLUNA ESQUERDA: TAXAS COMPOSTAS & SEGUROS */}
                            <div className="col-6">
                              <h6 className="fw-bold mb-1 text-center text-uppercase" style={{ color: '#DF7659', fontSize: '12px' }}>Taxas Compostas & Seguros</h6>
                              <ul className="list-group list-group-flush border rounded shadow-sm" style={{ fontSize: '11px' }}>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">GRIS</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.grisPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Mín: R$ {analise.cap?.grisMin || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Ad Valorem</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.advlrPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Mín: R$ {analise.cap?.advlrMin || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Pedágio Adicional</span>
                                  <span className="text-end fw-bold">R$ {analise.cap?.pedagioFixo || '0.00'} <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(ou R$ {analise.cap?.pedagioKg || '0.00'}/Kg)</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">TRT</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.trtPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Mín: R$ {analise.cap?.trtMin || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">TDE (Entr. Difícil)</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.tdePct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Fixo: R$ {analise.cap?.tdeFixo || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">TDA</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.tdaPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Fixo: R$ {analise.cap?.tdaFixo || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">TSO</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.tsoPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Fixo: R$ {analise.cap?.tsoFixo || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">EMEX</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.emexPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Fixo: R$ {analise.cap?.emexFixo || '0.00'})</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Seguro Fluvial</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.segFluvialPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(Mín: R$ {analise.cap?.segFluvialMin || '0.00'})</span></span>
                                </li>
                              </ul>
                            </div>
                            
                            {/* COLUNA DIREITA: FIXAS OPERACIONAIS & REVERSA */}
                            <div className="col-6">
                              <h6 className="fw-bold mb-1 text-center text-uppercase" style={{ color: '#DF7659', fontSize: '12px' }}>Fixas Operacionais & Reversa</h6>
                              <ul className="list-group list-group-flush border rounded shadow-sm" style={{ fontSize: '11px' }}>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Suframa</span><span className="text-end">R$ {analise.cap?.suframa || '0.00'} fixo</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Agendamento</span><span className="text-end">R$ {analise.cap?.agendamento || '0.00'} fixo</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Armazenagem</span><span className="text-end">R$ {analise.cap?.armazenagem || '0.00'} fixo</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Paletização</span><span className="text-end">R$ {analise.cap?.paletizacao || '0.00'} fixo</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Diária</span><span className="text-end">R$ {analise.cap?.diaria || '0.00'} fixo</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px' }}>
                                  <span className="fw-bold text-dark">Carga / Descarga</span><span className="text-end">R$ {analise.cap?.cargaDescarga || '0.00'} fixo</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px', backgroundColor: 'rgba(223, 118, 89, 0.05)' }}>
                                  <span className="fw-bold text-dark">Reentrega</span>
                                  <span className="text-end fw-bold" style={{color:'#DF7659'}}>{analise.cap?.reentregaPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(frete original)</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px', backgroundColor: 'rgba(223, 118, 89, 0.05)' }}>
                                  <span className="fw-bold text-dark">Devolução</span>
                                  <span className="text-end fw-bold" style={{color:'#DF7659'}}>{analise.cap?.devolucaoPct || '0.00'}% <span className="text-muted fw-normal ms-1" style={{fontSize:'9px'}}>(frete original)</span></span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-3" style={{ height: '45px', backgroundColor: 'rgba(42, 111, 154, 0.05)' }}>
                                  <span className="fw-bold text-dark">Free Time (Descarga)</span>
                                  <span className="text-end fw-bold" style={{color:'#2A6F9A'}}>{analise.cap?.freeTime || '0'} horas</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {/* BLOCO DE ASSINATURAS NO RODAPÉ - Colado no final do documento A4 */}
                          <div className="mt-auto rodape-documento" style={{ paddingTop: '150px', paddingBottom: '20px' }}>
                            <div className="row text-center align-items-end" style={{ minHeight: '300px' }}>
                              
                              {/* LADO ESQUERDO: GRUPO O BOTICÁRIO */}
                              <div className="col-6 d-flex flex-column align-items-center justify-content-end h-100">
                                <div style={{ width: '60%', borderBottom: '1px solid #000', marginBottom: '20px' }}></div>
                                <span className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>Grupo O Boticário</span>
                                <img 
                                  src="/logo-boticario.png" 
                                  alt="Grupo O Boticário" 
                                  style={{ maxHeight: '55px', objectFit: 'contain' }} 
                                  onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                              </div>
                              
                              {/* LADO DIREITO: TRANSPORTADORA */}
                              <div className="col-6 d-flex flex-column align-items-center justify-content-end h-100">
                                <div style={{ width: '60%', borderBottom: '1px solid #000', marginBottom: '20px' }}></div>
                                <span className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>{parametros.transportador || 'Transportadora'}</span>
                                <img 
                                  src={`/${parametros.transportador ? parametros.transportador.toLowerCase().replace(/\s+/g, '') : 'default'}.png`} 
                                  alt={parametros.transportador} 
                                  style={{ maxHeight: '55px', objectFit: 'contain' }} 
                                  onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                              </div>
                              
                            </div>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}