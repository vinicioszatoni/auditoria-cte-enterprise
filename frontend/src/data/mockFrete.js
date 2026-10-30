// ============================================================================
// ARQUIVO: src/data/mockFrete.js
// Simulação das Views do GCP (BigQuery) e Tabelas de Domínio
// ============================================================================

export const PARAMETROS_LOGISTICOS = {
  tiposNegociacao: [
    'BID/Concorrência', 
    'Cotação Spot', 
    'Mudança de Perfil de Carga', 
    'Nova Rota', 
    'Novo Parceiro', 
    'Reajuste Anual', 
    'Reajuste de Combustível', 
    'Reajuste de Taxas', 
    'Reajuste SLA', 
    'Sazonalidade', 
    'Tabela Emergêncial'
  ].sort(),
  
  modelosContratacao: [
    'FTL (Dedicado)', 
    'FTL (Viagem)', 
    'LTL (Faixa de Cubagem)', 
    'LTL (Faixa de Peso Cubado)', 
    'LTL (Faixa Peso)', 
    'LTL (KM Rodado)', 
    'LTL (Quantidade de Volumes)'
  ].sort(),

  etapas: [
    'First Mile', 
    'Middle Mile', 
    'Last Mile'
  ].sort(),
  
  fluxosPorEtapa: {
    'First Mile': ['Inbound'].sort(),
    'Middle Mile': ['Compras', 'Distribuição', 'Vendas Intercompany'].sort(),
    'Last Mile': ['Delivery', 'Exportação', 'Vendas'].sort()
  },

  transportadores: [
    'ALFA TRANSPORTES', 
    'ALPES', 
    'ALT TRANSPORTES', 
    'APK TRANSPORTES', 
    'ATIVA', 
    'AXON', 
    'BERTOLINI', 
    'BRIX', 
    'CF LOG', 
    'COOPERCARGA', 
    'CRUZEIRO DO SUL', 
    'EAGLE', 
    'MCP TRANSPORTES', 
    'MODULAR', 
    'MOTA LOGISTICA', 
    'PATRUS', 
    'PIZZATTO', 
    'PRINCESA DOS CAMPOS', 
    'REITER', 
    'RR MUNARETTO', 
    'SULISTA', 
    'TRAGETTA', 
    'TRANSETE', 
    'WBLOG'
  ].sort(),

  veiculos: [
    'Bitrem', 
    'Carreta', 
    'Carro', 
    'Fiorino', 
    'Moto', 
    'Toco', 
    'Truck', 
    'Van', 
    'Veiculo 3/4', 
    'VUC'
  ].sort(),

  carrocerias: [
    'Bau', 
    'Double Deck', 
    'Sider', 
    'Tanque'
  ].sort(),

  combustiveis: [
    'Autonomo', 
    'Diesel', 
    'Eletrico', 
    'GNV', 
    'Hibrido'
  ].sort(),

  fatorCubagem: [
    '167 kg/m³', 
    '300 kg/m³', 
    'Não Aplica'
  ].sort(),

  faixasPeso: [
    '10 Kg', 
    '20 Kg', 
    '30 Kg', 
    '50 Kg', 
    '70 Kg', 
    '100 Kg', 
    '500 Kg', 
    '3000 Kg', 
    '5000 Kg', 
    'Excedente Kg'
  ]
};

