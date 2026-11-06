import React, { useState } from 'react';
import { 
  FaSearchDollar, FaMoneyCheckAlt, FaFileSignature, FaChartLine, FaChartPie, 
  FaFileDownload, FaRobot, FaPaperPlane, FaMagic, FaArrowRight, FaTruckLoading, 
  FaBoxOpen, FaGlobeAmericas, FaTimes
} from 'react-icons/fa';

export default function TelaInicial({ setMenuAtivo }) {
  // Controle do Assistente de IA Flutuante
  const [chatAberto, setChatAberto] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState([
    { tipo: 'bot', texto: 'Olá! Sou o Assistente IA do Grupo Boticário. Como posso agilizar a sua auditoria hoje?' }
  ]);

  const atalhos = [
    { id: 'visaoGeral', titulo: 'Analisar Faturamento', desc: 'Visão geral e volumetria.', icone: <FaChartPie size={20} />, corTexto: '#DF7659', corFundo: 'rgba(223, 118, 89, 0.1)' },
    { id: 'painelAuditoria', titulo: 'Fretes Auditados', desc: 'Dashboard de divergências.', icone: <FaChartLine size={20} />, corTexto: '#2F9A7E', corFundo: 'rgba(47, 154, 126, 0.1)' },
    { id: 'auditoria', titulo: 'Auditar um CT-e', desc: 'Análise individual por chave.', icone: <FaSearchDollar size={20} />, corTexto: '#2A6F9A', corFundo: 'rgba(42, 111, 154, 0.1)' },
    { id: 'analiseMassa', titulo: 'Auditar uma Tarifa', desc: 'Análise consolidada por taxa.', icone: <FaMoneyCheckAlt size={20} />, corTexto: '#85580A', corFundo: 'rgba(133, 88, 10, 0.1)' },
    { id: 'geracaoTemplate', titulo: 'Cadastrar Tabela', desc: 'Digitalizador de matrizes.', icone: <FaFileSignature size={20} />, corTexto: '#6f42c1', corFundo: 'rgba(111, 66, 193, 0.1)' },
    { id: 'relatorio', titulo: 'Baixar Relatórios', desc: 'Extração de dados brutos.', icone: <FaFileDownload size={20} />, corTexto: '#14202A', corFundo: 'rgba(20, 32, 42, 0.1)' }
  ];

  const sugestoes = [
    "Qual o frete auditado?",
    "Total de divergência?",
    "Rotas mais críticas?"
  ];

  const enviarPergunta = (texto) => {
    if (!texto.trim()) return;
    setMensagens([...mensagens, { tipo: 'user', texto }]);
    setPergunta('');
    
    setTimeout(() => {
      setMensagens(prev => [...prev, { 
        tipo: 'bot', 
        texto: 'Estou a consultar a base do BigQuery para lhe trazer essa informação. Em breve, a integração trará a resposta em tempo real!' 
      }]);
    }, 1000);
  };

  return (
    <div className="d-flex flex-column h-100 position-relative" style={{ fontFamily: "'Poppins', sans-serif", padding: '10px' }}>
      
      {/* IMPORTAÇÃO DA FONTE POPPINS & ANIMAÇÕES */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          
          .nav-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
          }
          
          .nav-card .arrow-icon {
            transition: transform 0.3s;
          }
          
          .nav-card:hover .arrow-icon {
            transform: translateX(5px);
          }

          .hero-pattern {
            background-color: #1a2530;
            background-image: radial-gradient(circle at 10% 20%, rgba(42, 111, 154, 0.4) 0%, transparent 40%),
                              radial-gradient(circle at 90% 80%, rgba(223, 118, 89, 0.2) 0%, transparent 40%);
          }
        `}
      </style>

      {/* HERO BANNER (Estilo Landing Page Moderno) */}
      <div className="hero-pattern rounded-4 p-4 p-md-5 mb-4 shadow-sm position-relative overflow-hidden d-flex align-items-center" style={{ minHeight: '320px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div className="row w-100 align-items-center position-relative" style={{ zIndex: 2 }}>
          {/* Lado Esquerdo: Tipografia Grande */}
          <div className="col-lg-7 text-white text-start">
            <h1 className="fw-bolder mb-3" style={{ fontSize: '3rem', lineHeight: '1.1', letterSpacing: '-1px', color: 'rgba(255,255,255,0.7)' }}>
              Auditoria financeira de fretes! <br/>
              <span style={{ color: '#F1948A', borderBottom: '4px solid #DF7659' }}>Transportes GB</span>
            </h1>
            <p className="mb-4" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '90%', fontWeight: '400' }}>
              A plataforma central para analisar faturamentos, digitalizar tabelas complexas e garantir a acuracidade de 100% dos CT-es logísticos.
            </p>
            <button 
              className="btn fw-bold px-4 py-2 hover-scale" 
              style={{ backgroundColor: '#DF7659', color: 'white', borderRadius: '30px', border: 'none', fontSize: '15px' }}
              onClick={() => setMenuAtivo('visaoGeral')}
            >
              Acessar Painel Geral
            </button>
          </div>

          <div className="col-lg-5 d-none d-lg-block position-relative h-100">
            <div className="position-absolute" style={{ top: '-40px', right: '50px' }}>
              <div className="glass-panel p-4 rounded-4 shadow-lg d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <FaTruckLoading size={50} color="#8EC3EA" />
              </div>
            </div>
            <div className="position-absolute" style={{ top: '60px', right: '-20px' }}>
              <div className="glass-panel p-4 rounded-4 shadow-lg d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px', backgroundColor: 'rgba(223, 118, 89, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <FaGlobeAmericas size={70} color="#F1948A" />
              </div>
            </div>
            <div className="position-absolute" style={{ top: '100px', right: '120px' }}>
              <div className="glass-panel p-3 rounded-4 shadow-lg d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', backgroundColor: 'rgba(47, 154, 126, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <FaBoxOpen size={45} color="#7DCEA0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRELHA DE NAVEGAÇÃO EXPANDIDA (3 Colunas) */}
      <div className="row g-4 flex-grow-1 mb-4">
        {atalhos.map((item, idx) => (
          <div className="col-md-6 col-lg-4" key={idx}>
            <div 
              className="nav-card bg-white p-4 h-100 d-flex flex-column align-items-start justify-content-between position-relative shadow-sm"
              style={{ cursor: 'pointer', borderRadius: '20px', transition: 'all 0.3s ease', border: '1px solid rgba(0,0,0,0.05)' }}
              onClick={() => setMenuAtivo(item.id)}
            >
              <div className="w-100 d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '55px', height: '55px', backgroundColor: item.corFundo, color: item.corTexto }}>
                  {item.icone}
                </div>
              </div>
              <div>
                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>{item.titulo}</h5>
                <p className="text-muted mb-0" style={{ fontSize: '13px', fontWeight: '500' }}>{item.desc}</p>
              </div>
              <div className="position-absolute bottom-0 end-0 p-4">
                <FaArrowRight className="arrow-icon" style={{ color: 'rgba(0,0,0,0.2)', fontSize: '18px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÃO FLUTUANTE DO ASSISTENTE IA */}
      {!chatAberto && (
        <button 
          className="btn position-fixed shadow-lg hover-scale animate-bounce" 
          style={{ bottom: '40px', right: '40px', width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#2A6F9A', color: 'white', zIndex: 1050, border: '4px solid rgba(255,255,255,0.8)' }}
          onClick={() => setChatAberto(true)}
        >
          <FaRobot size={28} />
        </button>
      )}

      {/* JANELA DO CHAT FLUTUANTE */}
      {chatAberto && (
        <div className="position-fixed shadow-lg d-flex flex-column animate-fade-in" style={{ bottom: '40px', right: '40px', width: '380px', height: '550px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', zIndex: 1100, overflow: 'hidden' }}>
          
          {/* Cabeçalho do Chat */}
          <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#2A6F9A', color: 'white', width: '30px', height: '30px' }}><FaMagic size={14}/></div>
              <span className="fw-bold" style={{ color: '#2A6F9A', fontSize: '15px' }}>Assistente IA</span>
            </div>
            <button className="btn btn-sm text-muted shadow-none p-1" onClick={() => setChatAberto(false)}><FaTimes size={18} /></button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-grow-1 p-3 custom-scrollbar d-flex flex-column gap-3" style={{ overflowY: 'auto', backgroundColor: '#fff' }}>
            {mensagens.map((msg, i) => (
              <div key={i} className={`d-flex ${msg.tipo === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className="p-3 shadow-sm" style={{ 
                  maxWidth: '90%', fontSize: '13px', fontWeight: '500',
                  backgroundColor: msg.tipo === 'user' ? '#2A6F9A' : '#F8FAFC', 
                  color: msg.tipo === 'user' ? 'white' : '#1a2530',
                  borderRadius: msg.tipo === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  border: msg.tipo === 'bot' ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}>
                  {msg.texto}
                </div>
              </div>
            ))}
          </div>

          {/* Input e Sugestões */}
          <div className="p-3 border-top bg-white">
            {mensagens.length === 1 && (
              <div className="d-flex flex-wrap gap-2 mb-3 justify-content-center">
                {sugestoes.map((sug, i) => (
                  <button key={i} className="btn btn-sm btn-light fw-bold text-start" style={{ fontSize: '11px', color: '#DF7659', borderRadius: '8px', border: '1px solid rgba(223, 118, 89, 0.2)' }} onClick={() => enviarPergunta(sug)}>
                    {sug}
                  </button>
                ))}
              </div>
            )}
            
            <div className="input-group" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <input 
                type="text" 
                className="form-control border-0 bg-light" 
                placeholder="Faça uma pergunta..." 
                value={pergunta} 
                onChange={e => setPergunta(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && enviarPergunta(pergunta)}
                style={{ fontSize: '13px', boxShadow: 'none', padding: '12px 15px', fontWeight: '500' }}
              />
              <button className="btn border-0" style={{ backgroundColor: '#2A6F9A', color: 'white', padding: '0 20px' }} onClick={() => enviarPergunta(pergunta)}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}