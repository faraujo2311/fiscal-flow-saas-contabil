import { 
  OfficeTenant, 
  Company, 
  Competence, 
  FiscalDocument, 
  AccountingAccount, 
  AccountingEntry, 
  PostingRule, 
  Employee, 
  Partner,
  ProfitDistributionRecord,
  TaxObligation, 
  GovSubmission, 
  DigitalCertificate, 
  AuditLogEntry,
  AccountingParameters,
  SystemCustomization,
  SystemUser,
  UserActivityBacklog
} from '../types';

export const initialOffice: OfficeTenant = {
  id: 'office-1',
  name: 'Audicon Contabilidade & Compliance Tributário S/S',
  cnpj: '09.876.543/0001-21',
  crcResponsavel: 'CRC/SP 1SP234567/O-8',
  responsavelNome: 'Carlos Eduardo Silva',
  email: 'contato@audicon.cnt.br',
  phone: '(11) 3456-7890',
};

export const initialCompanies: Company[] = [
  {
    id: 'comp-1',
    tenantId: 'office-1',
    razaoSocial: 'Alpha Distribuidora e Logística de Alimentos Ltda',
    nomeFantasia: 'Alpha Alimentos Distribuidora',
    cnpj: '12.345.678/0001-90',
    ie: '109.876.543.110',
    uf: 'SP',
    cidade: 'São Paulo',
    regimeTributario: 'LUCRO_PRESUMIDO',
    cnae: '46.39-7-01 - Comércio atacadista de produtos alimentícios em geral',
    atividadePrincipal: 'Distribuição Atacadista de Alimentos e Bebidas',
    rbt12: 4850000.00,
    ativo: true,
  },
  {
    id: 'comp-2',
    tenantId: 'office-1',
    razaoSocial: 'TechSoft Soluções e Tecnologia da Informação Ltda',
    nomeFantasia: 'TechSoft Cloud',
    cnpj: '45.678.910/0001-23',
    ie: 'ISENTO',
    uf: 'SP',
    cidade: 'Campinas',
    regimeTributario: 'SIMPLES_NACIONAL',
    cnae: '62.01-5-01 - Desenvolvimento de programas de computador sob encomenda',
    atividadePrincipal: 'Desenvolvimento e Licenciamento de Software SaaS',
    anexoSimples: 'ANEXO_III',
    rbt12: 1250000.00,
    sujeitoFatorR: true,
    folha12Meses: 375000.00, // 30% do RBT12 -> Enquadra no Anexo III (alíquotas a partir de 6%)
    ativo: true,
  },
  {
    id: 'comp-3',
    tenantId: 'office-1',
    razaoSocial: 'Moda Brasil Confecções e Varejo de Vestuário Ltda',
    nomeFantasia: 'Moda Brasil Boutique',
    cnpj: '98.765.432/0001-11',
    ie: '234.567.890.115',
    uf: 'MG',
    cidade: 'Belo Horizonte',
    regimeTributario: 'SIMPLES_NACIONAL',
    cnae: '47.81-4-00 - Comércio varejista de artigos do vestuário e acessórios',
    atividadePrincipal: 'Comércio Varejista de Roupas e Acessórios',
    anexoSimples: 'ANEXO_I',
    rbt12: 680000.00,
    ativo: true,
  },
];

export const initialCompetences: Competence[] = [
  {
    id: 'comp-1-082026',
    companyId: 'comp-1',
    year: 2026,
    month: 8,
    status: 'FECHADA',
    dataFechamento: '2026-09-01T18:00:00Z',
    fechadoPor: 'Carlos Eduardo Silva',
  },
  {
    id: 'comp-1-092026',
    companyId: 'comp-1',
    year: 2026,
    month: 9,
    status: 'ABERTA',
  },
  {
    id: 'comp-2-092026',
    companyId: 'comp-2',
    year: 2026,
    month: 9,
    status: 'ABERTA',
  },
  {
    id: 'comp-3-092026',
    companyId: 'comp-3',
    year: 2026,
    month: 9,
    status: 'ABERTA',
  },
];

export const initialChartOfAccounts: AccountingAccount[] = [
  // 1. ATIVO
  { id: 'acc-1', companyId: 'comp-1', codigo: '1', codigoReduzido: '1', nome: 'ATIVO TOTAL', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'ATIVO', nivel: 1, saldoInicial: 1250000, saldoAtual: 1390450, codigoReferencialECD: '1' },
  { id: 'acc-2', companyId: 'comp-1', codigo: '1.1', codigoReduzido: '10', nome: 'ATIVO CIRCULANTE', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1', nivel: 2, saldoInicial: 850000, saldoAtual: 980450, codigoReferencialECD: '1.01' },
  { id: 'acc-3', companyId: 'comp-1', codigo: '1.1.01', codigoReduzido: '100', nome: 'Disponibilidades', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1', nivel: 3, saldoInicial: 320000, saldoAtual: 395450, codigoReferencialECD: '1.01.01' },
  { id: 'acc-4', companyId: 'comp-1', codigo: '1.1.01.01.001', codigoReduzido: '101', nome: 'Caixa Geral', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1.01', nivel: 4, saldoInicial: 15000, saldoAtual: 18500, codigoReferencialECD: '1.01.01.01.01' },
  { id: 'acc-5', companyId: 'comp-1', codigo: '1.1.01.02.001', codigoReduzido: '102', nome: 'Banco Itaú Unibanco S/A c/c', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1.01', nivel: 4, saldoInicial: 205000, saldoAtual: 276950, codigoReferencialECD: '1.01.01.02.01' },
  { id: 'acc-6', companyId: 'comp-1', codigo: '1.1.01.02.002', codigoReduzido: '103', nome: 'Banco Bradesco S/A c/c', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1.01', nivel: 4, saldoInicial: 100000, saldoAtual: 100000, codigoReferencialECD: '1.01.01.02.01' },
  
  { id: 'acc-7', companyId: 'comp-1', codigo: '1.1.02', codigoReduzido: '110', nome: 'Clientes e Contas a Receber', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1', nivel: 3, saldoInicial: 280000, saldoAtual: 335000, codigoReferencialECD: '1.01.02' },
  { id: 'acc-8', companyId: 'comp-1', codigo: '1.1.02.01.001', codigoReduzido: '111', nome: 'Duplicatas a Receber - Clientes Mercado Interno', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1.02', nivel: 4, saldoInicial: 280000, saldoAtual: 335000, codigoReferencialECD: '1.01.02.01.01' },
  
  { id: 'acc-9', companyId: 'comp-1', codigo: '1.1.03', codigoReduzido: '120', nome: 'Estoques de Mercadorias', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1', nivel: 3, saldoInicial: 250000, saldoAtual: 250000, codigoReferencialECD: '1.01.04' },
  { id: 'acc-10', companyId: 'comp-1', codigo: '1.1.03.01.001', codigoReduzido: '121', nome: 'Estoque de Mercadorias para Revenda', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.1.03', nivel: 4, saldoInicial: 250000, saldoAtual: 250000, codigoReferencialECD: '1.01.04.01.01' },

  // 1.2 ATIVO NÃO CIRCULANTE
  { id: 'acc-11', companyId: 'comp-1', codigo: '1.2', codigoReduzido: '150', nome: 'ATIVO NÃO CIRCULANTE', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1', nivel: 2, saldoInicial: 400000, saldoAtual: 410000, codigoReferencialECD: '1.02' },
  { id: 'acc-12', companyId: 'comp-1', codigo: '1.2.03.01.001', codigoReduzido: '151', nome: 'Veículos de Transporte e Entregas', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'ATIVO', contaPaiCodigo: '1.2', nivel: 4, saldoInicial: 400000, saldoAtual: 410000, codigoReferencialECD: '1.02.01.04.01' },

  // 2. PASSIVO
  { id: 'acc-13', companyId: 'comp-1', codigo: '2', codigoReduzido: '2', nome: 'PASSIVO E PATRIMÔNIO LÍQUIDO', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'PASSIVO', nivel: 1, saldoInicial: 1250000, saldoAtual: 1390450, codigoReferencialECD: '2' },
  { id: 'acc-14', companyId: 'comp-1', codigo: '2.1', codigoReduzido: '20', nome: 'PASSIVO CIRCULANTE', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2', nivel: 2, saldoInicial: 350000, saldoAtual: 440450, codigoReferencialECD: '2.01' },
  { id: 'acc-15', companyId: 'comp-1', codigo: '2.1.01', codigoReduzido: '200', nome: 'Fornecedores Nacionais', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1', nivel: 3, saldoInicial: 180000, saldoAtual: 225000, codigoReferencialECD: '2.01.01' },
  { id: 'acc-16', companyId: 'comp-1', codigo: '2.1.01.01.001', codigoReduzido: '201', nome: 'Fornecedores de Mercadorias para Revenda', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.01', nivel: 4, saldoInicial: 180000, saldoAtual: 225000, codigoReferencialECD: '2.01.01.01.01' },
  
  { id: 'acc-17', companyId: 'comp-1', codigo: '2.1.02', codigoReduzido: '210', nome: 'Obrigações Trabalhistas e Previdenciárias', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1', nivel: 3, saldoInicial: 75000, saldoAtual: 86450, codigoReferencialECD: '2.01.02' },
  { id: 'acc-18', companyId: 'comp-1', codigo: '2.1.02.01.001', codigoReduzido: '211', nome: 'Salários e Ordenados a Pagar', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.02', nivel: 4, saldoInicial: 52000, saldoAtual: 60200, codigoReferencialECD: '2.01.02.01.01' },
  { id: 'acc-19', companyId: 'comp-1', codigo: '2.1.02.02.001', codigoReduzido: '212', nome: 'INSS a Recolher', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.02', nivel: 4, saldoInicial: 14000, saldoAtual: 16800, codigoReferencialECD: '2.01.02.02.01' },
  { id: 'acc-20', companyId: 'comp-1', codigo: '2.1.02.03.001', codigoReduzido: '213', nome: 'FGTS a Recolher', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.02', nivel: 4, saldoInicial: 9000, saldoAtual: 9450, codigoReferencialECD: '2.01.02.03.01' },

  { id: 'acc-21', companyId: 'comp-1', codigo: '2.1.03', codigoReduzido: '220', nome: 'Obrigações Tributárias Fiscais', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1', nivel: 3, saldoInicial: 95000, saldoAtual: 129000, codigoReferencialECD: '2.01.03' },
  { id: 'acc-22', companyId: 'comp-1', codigo: '2.1.03.01.001', codigoReduzido: '221', nome: 'ICMS a Recolher', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.03', nivel: 4, saldoInicial: 42000, saldoAtual: 58500, codigoReferencialECD: '2.01.03.01.01' },
  { id: 'acc-23', companyId: 'comp-1', codigo: '2.1.03.02.001', codigoReduzido: '222', nome: 'PIS a Recolher', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.03', nivel: 4, saldoInicial: 8500, saldoAtual: 11200, codigoReferencialECD: '2.01.03.02.01' },
  { id: 'acc-24', companyId: 'comp-1', codigo: '2.1.03.03.001', codigoReduzido: '223', nome: 'COFINS a Recolher', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.03', nivel: 4, saldoInicial: 39000, saldoAtual: 51800, codigoReferencialECD: '2.01.03.03.01' },
  { id: 'acc-25', companyId: 'comp-1', codigo: '2.1.03.04.001', codigoReduzido: '224', nome: 'Simples Nacional a Recolher (DAS)', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PASSIVO', contaPaiCodigo: '2.1.03', nivel: 4, saldoInicial: 0, saldoAtual: 7500, codigoReferencialECD: '2.01.03.04.01' },

  // 2.3 PATRIMÔNIO LÍQUIDO
  { id: 'acc-26', companyId: 'comp-1', codigo: '2.3', codigoReduzido: '250', nome: 'PATRIMÔNIO LÍQUIDO', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'PATRIMONIO_LIQUIDO', contaPaiCodigo: '2', nivel: 2, saldoInicial: 900000, saldoAtual: 950000, codigoReferencialECD: '2.03' },
  { id: 'acc-27', companyId: 'comp-1', codigo: '2.3.01.01.001', codigoReduzido: '251', nome: 'Capital Social Subscrito e Integralizado', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PATRIMONIO_LIQUIDO', contaPaiCodigo: '2.3', nivel: 4, saldoInicial: 500000, saldoAtual: 500000, codigoReferencialECD: '2.03.01.01.01' },
  { id: 'acc-28', companyId: 'comp-1', codigo: '2.3.02.01.001', codigoReduzido: '252', nome: 'Lucros ou Prejuízos Acumulados', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'PATRIMONIO_LIQUIDO', contaPaiCodigo: '2.3', nivel: 4, saldoInicial: 400000, saldoAtual: 450000, codigoReferencialECD: '2.03.02.01.01' },

  // 3. DESPESAS E CUSTOS
  { id: 'acc-29', companyId: 'comp-1', codigo: '3', codigoReduzido: '3', nome: 'CUSTOS E DESPESAS OPERACIONAIS', tipo: 'SINTETICA', natureza: 'DEVEDORA', categoria: 'DESPESAS', nivel: 1, saldoInicial: 0, saldoAtual: 312400, codigoReferencialECD: '3' },
  { id: 'acc-30', companyId: 'comp-1', codigo: '3.1.01.01.001', codigoReduzido: '301', nome: 'Custo das Mercadorias Vendidas (CMV)', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'CUSTOS', nivel: 4, saldoInicial: 0, saldoAtual: 185000, codigoReferencialECD: '3.01.01.01.01' },
  { id: 'acc-31', companyId: 'comp-1', codigo: '3.2.01.01.001', codigoReduzido: '311', nome: 'Salários e Encargos Sociais do Pessoal', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'DESPESAS', nivel: 4, saldoInicial: 0, saldoAtual: 78400, codigoReferencialECD: '3.02.01.01.01' },
  { id: 'acc-32', companyId: 'comp-1', codigo: '3.2.02.01.001', codigoReduzido: '321', nome: 'Despesas com Aluguel e Instalações', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'DESPESAS', nivel: 4, saldoInicial: 0, saldoAtual: 18000, codigoReferencialECD: '3.02.01.02.01' },
  { id: 'acc-33', companyId: 'comp-1', codigo: '3.2.03.01.001', codigoReduzido: '331', nome: 'Impostos e Contribuições Incidentes s/ Vendas', tipo: 'ANALITICA', natureza: 'DEVEDORA', categoria: 'DESPESAS', nivel: 4, saldoInicial: 0, saldoAtual: 31000, codigoReferencialECD: '3.02.02.01.01' },
  { id: 'acc-are', companyId: 'comp-1', codigo: '3.9.01.01.001', codigoReduzido: '399', nome: 'Resultado do Exercício em Apuração (ARE)', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'DESPESAS', nivel: 4, saldoInicial: 0, saldoAtual: 0, codigoReferencialECD: '3.09.01.01.01' },

  // 4. RECEITAS
  { id: 'acc-34', companyId: 'comp-1', codigo: '4', codigoReduzido: '4', nome: 'RECEITAS OPERACIONAIS', tipo: 'SINTETICA', natureza: 'CREDORA', categoria: 'RECEITAS', nivel: 1, saldoInicial: 0, saldoAtual: 452400, codigoReferencialECD: '4' },
  { id: 'acc-35', companyId: 'comp-1', codigo: '4.1.01.01.001', codigoReduzido: '401', nome: 'Receita Bruta de Vendas de Mercadorias', tipo: 'ANALITICA', natureza: 'CREDORA', categoria: 'RECEITAS', nivel: 4, saldoInicial: 0, saldoAtual: 452400, codigoReferencialECD: '4.01.01.01.01' },
];

export const initialPostingRules: PostingRule[] = [
  {
    id: 'rule-1',
    companyId: 'comp-1',
    evento: 'VENDA_MERCADORIA',
    descricao: 'Contabilização de Venda de Mercadorias (CFOP 5102 / 6102)',
    cfopFiltro: '5102',
    contaDebitoCodigo: '1.1.02.01.001', // Clientes a Receber
    contaCreditoCodigo: '4.1.01.01.001', // Receita de Vendas
    historicoModelo: 'Vlr. ref. venda mercadoria conf. NF-e nº {NUMERO}',
    ativo: true,
  },
  {
    id: 'rule-2',
    companyId: 'comp-1',
    evento: 'COMPRA_MERCADORIA',
    descricao: 'Contabilização de Compra de Mercadorias p/ Revenda (CFOP 1102 / 2102)',
    cfopFiltro: '1102',
    contaDebitoCodigo: '1.1.03.01.001', // Estoque de Mercadorias
    contaCreditoCodigo: '2.1.01.01.001', // Fornecedores a Pagar
    historicoModelo: 'Vlr. ref. compra p/ revenda conf. NF-e nº {NUMERO} - {FORNECEDOR}',
    ativo: true,
  },
  {
    id: 'rule-3',
    companyId: 'comp-1',
    evento: 'APURACAO_ICMS',
    descricao: 'Provisão de ICMS a Recolher sobre Faturamento',
    contaDebitoCodigo: '3.2.03.01.001', // Despesa c/ Impostos
    contaCreditoCodigo: '2.1.03.01.001', // ICMS a Recolher
    historicoModelo: 'Vlr. provisão ICMS a recolher apurado na competência {COMPETENCIA}',
    ativo: true,
  },
  {
    id: 'rule-4',
    companyId: 'comp-1',
    evento: 'FOLHA_PAGAMENTO',
    descricao: 'Apropriação da Folha de Pagamento Salários',
    contaDebitoCodigo: '3.2.01.01.001', // Despesa com Pessoal
    contaCreditoCodigo: '2.1.02.01.001', // Salários a Pagar
    historicoModelo: 'Vlr. ref. folha de pagamento competência {COMPETENCIA}',
    ativo: true,
  },
];

export const sampleFiscalXmls = [
  {
    nome: 'NFe_35260912345678000190550010000492811837482918.xml',
    chave: '35260912345678000190550010000492811837482918',
    descricao: 'NF-e Saída Venda de Mercadoria (Alpha -> Supermercados São Bento)',
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35260912345678000190550010000492811837482918" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>08374829</cNF>
        <natOp>VENDA DE MERCADORIA ADQ. DE TERCEIROS</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>49281</nNF>
        <dhEmi>2026-09-02T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>ALPHA DISTRIBUIDORA E LOGISTICA DE ALIMENTOS LTDA</xNome>
        <xFant>ALPHA ALIMENTOS</xFant>
        <enderEmit>
          <xLgr>AVENIDA DOS BANDEIRANTES</xLgr>
          <nro>4500</nro>
          <xBairro>VILA OLIMPIA</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>04553900</CEP>
        </enderEmit>
        <IE>109876543110</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>20987123000188</CNPJ>
        <xNome>SUPERMERCADOS SAO BENTO DO BRASIL LTDA</xNome>
        <enderDest>
          <xLgr>RUA DAS PALMEIRAS</xLgr>
          <nro>310</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>01020000</CEP>
        </enderDest>
        <IE>112233445566</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>ALIM-001</cProd>
          <cEAN>7891000123456</cEAN>
          <xProd>AZEITE DE OLIVA EXTRA VIRGEM 500ML</xProd>
          <NCM>15091000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>200.0000</qCom>
          <vUnCom>28.5000</vUnCom>
          <vProd>5700.00</vProd>
          <cEANTrib>7891000123456</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>200.0000</qTrib>
          <vUnTrib>28.5000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>5700.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>1026.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>5700.00</vBC>
              <pPIS>0.65</pPIS>
              <vPIS>37.05</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>5700.00</vBC>
              <pCOFINS>3.00</pCOFINS>
              <vCOFINS>171.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <det nItem="2">
        <prod>
          <cProd>ALIM-002</cProd>
          <cEAN>7891000654321</cEAN>
          <xProd>CAFE GOURMET MOIDO PACOTE 500G</xProd>
          <NCM>09012100</NCM>
          <CFOP>5102</CFOP>
          <uCom>FD</uCom>
          <qCom>100.0000</qCom>
          <vUnCom>45.0000</vUnCom>
          <vProd>4500.00</vProd>
          <cEANTrib>7891000654321</cEANTrib>
          <uTrib>FD</uTrib>
          <qTrib>100.0000</qTrib>
          <vUnTrib>45.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>4500.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>810.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>4500.00</vBC>
              <pPIS>0.65</pPIS>
              <vPIS>29.25</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>4500.00</vBC>
              <pCOFINS>3.00</pCOFINS>
              <vCOFINS>135.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>10200.00</vBC>
          <vICMS>1836.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>10200.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>66.30</vPIS>
          <vCOFINS>306.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>10200.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`
  },
  {
    nome: 'NFe_35260987654321000105550010000184921938271049.xml',
    chave: '35260987654321000105550010000184921938271049',
    descricao: 'NF-e Entrada Compra de Fornecedor (AgroFoods Indústria -> Alpha)',
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35260987654321000105550010000184921938271049" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>19382710</cNF>
        <natOp>COMPRA PARA INDUSTRIALIZACAO OU REVENDA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>18492</nNF>
        <dhEmi>2026-09-01T08:15:00-03:00</dhEmi>
        <tpNF>0</tpNF>
        <idDest>1</idDest>
      </ide>
      <emit>
        <CNPJ>87654321000105</CNPJ>
        <xNome>AGROFOODS INDUSTRIA E COMERCIO DE CEREAIS S/A</xNome>
        <xFant>AGROFOODS BRASIL</xFant>
        <enderEmit>
          <xLgr>RODOVIA ANHANGUERA KM 145</xLgr>
          <nro>SN</nro>
          <xBairro>DISTRITO INDUSTRIAL</xBairro>
          <cMun>3526902</cMun>
          <xMun>LIMEIRA</xMun>
          <UF>SP</UF>
        </enderEmit>
        <IE>417987654321</IE>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>ALPHA DISTRIBUIDORA E LOGISTICA DE ALIMENTOS LTDA</xNome>
        <IE>109876543110</IE>
        <UF>SP</UF>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>GRAO-05</cProd>
          <xProd>ARROZ TIPO 1 ESPECIAL FARDO 30KG</xProd>
          <NCM>10063021</NCM>
          <CFOP>1102</CFOP>
          <uCom>FD</uCom>
          <qCom>150.0000</qCom>
          <vUnCom>80.0000</vUnCom>
          <vProd>12000.00</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <CST>00</CST>
              <vBC>12000.00</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>1440.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>12000.00</vBC>
              <pPIS>0.65</pPIS>
              <vPIS>78.00</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>12000.00</vBC>
              <pCOFINS>3.00</pCOFINS>
              <vCOFINS>360.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>12000.00</vBC>
          <vICMS>1440.00</vICMS>
          <vProd>12000.00</vProd>
          <vFrete>0.00</vFrete>
          <vPIS>78.00</vPIS>
          <vCOFINS>360.00</vCOFINS>
          <vNF>12000.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`
  }
];

export const initialFiscalDocuments: FiscalDocument[] = [
  {
    id: 'fdoc-1',
    tenantId: 'office-1',
    companyId: 'comp-1',
    competencia: '09/2026',
    chaveAcesso: '35260912345678000190550010000492801837482910',
    tipoDoc: 'NFE',
    modelo: '55',
    serie: '1',
    numero: '49280',
    dataEmissao: '2026-09-01T14:20:00-03:00',
    dataEntradaSaida: '2026-09-01T14:20:00-03:00',
    naturezaOperacao: 'VENDA DE MERCADORIAS ADQ. TERCEIROS',
    tipoOperacao: 'SAIDA',
    status: 'NORMAL',
    emitenteCnpj: '12.345.678/0001-90',
    emitenteRazao: 'Alpha Distribuidora e Logística de Alimentos Ltda',
    emitenteUf: 'SP',
    destinatarioCnpj: '33.444.555/0001-66',
    destinatarioRazao: 'Rede Varejista Bom Preço S/A',
    destinatarioUf: 'SP',
    valorTotalProdutos: 24500.00,
    valorFrete: 350.00,
    valorSeguro: 0,
    valorDesconto: 0,
    valorOutrasDespesas: 0,
    valorTotalNota: 24850.00,
    impostos: {
      baseIcms: 24850.00,
      valorIcms: 4473.00, // 18%
      baseIcmsSt: 0,
      valorIcmsSt: 0,
      baseIpi: 0,
      valorIpi: 0,
      basePis: 24850.00,
      valorPis: 161.53, // 0.65%
      baseCofins: 24850.00,
      valorCofins: 745.50, // 3%
    },
    itens: [
      {
        id: 'item-1-1',
        numeroItem: 1,
        codigoProduto: 'PROD-010',
        descricao: 'Leite Integral UHT Caixa com 12 Litros',
        ncm: '04012010',
        cfop: '5102',
        unidade: 'CX',
        quantidade: 350,
        valorUnitario: 50.00,
        valorTotal: 17500.00,
        cstIcms: '00',
        baseIcms: 17500.00,
        aliquotaIcms: 18.00,
        valorIcms: 3150.00,
        cstPis: '01',
        basePis: 17500.00,
        aliquotaPis: 0.65,
        valorPis: 113.75,
        cstCofins: '01',
        baseCofins: 17500.00,
        aliquotaCofins: 3.00,
        valorCofins: 525.00,
        contabilizado: true,
      },
      {
        id: 'item-1-2',
        numeroItem: 2,
        codigoProduto: 'PROD-020',
        descricao: 'Farinha de Trigo Especial Fardo 10x1kg',
        ncm: '11010010',
        cfop: '5102',
        unidade: 'FD',
        quantidade: 200,
        valorUnitario: 35.00,
        valorTotal: 7000.00,
        cstIcms: '00',
        baseIcms: 7000.00,
        aliquotaIcms: 18.00,
        valorIcms: 1260.00,
        cstPis: '01',
        basePis: 7000.00,
        aliquotaPis: 0.65,
        valorPis: 45.50,
        cstCofins: '01',
        baseCofins: 7000.00,
        aliquotaCofins: 3.00,
        valorCofins: 210.00,
        contabilizado: true,
      }
    ],
    importadoEm: '2026-09-02T09:12:00Z',
    arquivoOriginalNome: 'NFe_35260912345678000190550010000492801837482910.xml',
    statusContabilizacao: 'CONTABILIZADO',
  }
];

export const initialAccountingEntries: AccountingEntry[] = [
  {
    id: 'entry-1',
    companyId: 'comp-1',
    competencia: '09/2026',
    numero: 1001,
    data: '2026-09-01',
    origemTipo: 'FISCAL',
    origemId: 'fdoc-1',
    documentoRef: 'NF-e 49280',
    historicoPadrao: 'Vlr. ref. venda mercadoria conf. NF-e nº 49280 - Rede Varejista Bom Preço S/A',
    linhas: [
      {
        id: 'line-1',
        contaCodigo: '1.1.02.01.001',
        contaNome: 'Duplicatas a Receber - Clientes Mercado Interno',
        tipo: 'DEBITO',
        valor: 24850.00,
      },
      {
        id: 'line-2',
        contaCodigo: '4.1.01.01.001',
        contaNome: 'Receita Bruta de Vendas de Mercadorias',
        tipo: 'CREDITO',
        valor: 24850.00,
      }
    ],
    totalDebito: 24850.00,
    totalCredito: 24850.00,
    balanceado: true,
    criadoEm: '2026-09-02T10:00:00Z',
    criadoPor: 'Motor de Contabilização Fiscal',
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    companyId: 'comp-1',
    nome: 'Roberto Antunes de Souza',
    cpf: '123.456.789-00',
    pis: '120.34567.89-1',
    ctps: '48291/001-SP',
    cargo: 'Gerente Operacional de Logística',
    cbo: '1414-10',
    departamento: 'Logística',
    dataAdmissao: '2022-03-15',
    salarioBase: 5800.00,
    dependentesIrrf: 2,
    valeTransporte: false,
    descontoVtPercent: 0,
    status: 'ATIVO',
  },
  {
    id: 'emp-2',
    companyId: 'comp-1',
    nome: 'Fernanda Lima Ribeiro',
    cpf: '234.567.890-11',
    pis: '121.98765.43-2',
    ctps: '91823/002-SP',
    cargo: 'Assistente Administrativo Pleno',
    cbo: '4110-10',
    departamento: 'Administração',
    dataAdmissao: '2023-08-01',
    salarioBase: 2950.00,
    dependentesIrrf: 0,
    valeTransporte: true,
    descontoVtPercent: 6,
    status: 'ATIVO',
  },
  {
    id: 'emp-3',
    companyId: 'comp-1',
    nome: 'Lucas Gabriel Pereira',
    cpf: '345.678.901-22',
    pis: '123.45678.90-3',
    ctps: '38192/003-SP',
    cargo: 'Conferente de Carga e Expedição',
    cbo: '4141-05',
    departamento: 'Expedição',
    dataAdmissao: '2024-01-10',
    salarioBase: 2200.00,
    dependentesIrrf: 1,
    valeTransporte: true,
    descontoVtPercent: 6,
    status: 'ATIVO',
  },
];

export const initialPartners: Partner[] = [
  {
    id: 'part-1',
    companyId: 'comp-1',
    nome: 'Marcos Vinicius Andrade',
    cpf: '123.456.789-01',
    qualificacao: 'SOCIO_ADMINISTRADOR',
    participacaoCapitalPercent: 60,
    valorProlaboreMensal: 6500.00,
    dependentesIrrf: 1,
    inssRetidoProlabore: 715.00,
    irrfRetidoProlabore: 546.50,
    prolaboreLiquido: 5238.50,
    chavePix: '123.456.789-01',
    bancoNome: 'Banco Itaú Unibanco',
  },
  {
    id: 'part-2',
    companyId: 'comp-1',
    nome: 'Juliana Beatriz Santos',
    cpf: '987.654.321-02',
    qualificacao: 'SOCIO_COTISTA',
    participacaoCapitalPercent: 40,
    valorProlaboreMensal: 3500.00,
    dependentesIrrf: 0,
    inssRetidoProlabore: 385.00,
    irrfRetidoProlabore: 104.75,
    prolaboreLiquido: 3010.25,
    chavePix: 'juliana.santos@email.com',
    bancoNome: 'Banco Bradesco',
  },
];

export const initialProfitDistributions: ProfitDistributionRecord[] = [
  {
    id: 'dist-1',
    companyId: 'comp-1',
    competencia: '09/2026',
    dataDistribuicao: '2026-09-05',
    partnerId: 'part-1',
    partnerNome: 'Marcos Vinicius Andrade',
    partnerCpf: '123.456.789-01',
    valorDistribuido: 25000.00,
    saldoLucrosDisponivelAntes: 450000.00,
    saldoLucrosDisponivelDepois: 425000.00,
    isencaoLegalArtigo: 'Art. 10 da Lei nº 9.249/1995',
    statusContabilizacao: 'CONTABILIZADO',
    reciboNumero: 'REC-LUC-202609-001',
  },
  {
    id: 'dist-2',
    companyId: 'comp-1',
    competencia: '09/2026',
    dataDistribuicao: '2026-09-05',
    partnerId: 'part-2',
    partnerNome: 'Juliana Beatriz Santos',
    partnerCpf: '987.654.321-02',
    valorDistribuido: 15000.00,
    saldoLucrosDisponivelAntes: 425000.00,
    saldoLucrosDisponivelDepois: 410000.00,
    isencaoLegalArtigo: 'Art. 10 da Lei nº 9.249/1995',
    statusContabilizacao: 'CONTABILIZADO',
    reciboNumero: 'REC-LUC-202609-002',
  },
];

export const initialObligations: TaxObligation[] = [
  {
    id: 'obl-ecd',
    codigo: 'SPED_ECD',
    nome: 'SPED Contábil (ECD - Livro Diário Geral)',
    orgao: 'RFB',
    esfera: 'FEDERAL',
    periodicidade: 'ANUAL',
    diaVencimento: 30,
    competencia: '2026',
    status: 'GERADO',
  },
  {
    id: 'obl-1',
    codigo: 'EFD_ICMS',
    nome: 'EFD ICMS/IPI (SPED Fiscal)',
    orgao: 'SEFAZ',
    esfera: 'ESTADUAL',
    periodicidade: 'MENSAL',
    diaVencimento: 20,
    competencia: '09/2026',
    status: 'PENDENTE',
  },
  {
    id: 'obl-2',
    codigo: 'EFD_CONTRIB',
    nome: 'EFD-Contribuições (PIS/COFINS)',
    orgao: 'RFB',
    esfera: 'FEDERAL',
    periodicidade: 'MENSAL',
    diaVencimento: 15,
    competencia: '09/2026',
    status: 'PENDENTE',
  },
  {
    id: 'obl-3',
    codigo: 'DCTFWEB',
    nome: 'DCTFWeb (Previdenciária e Retenções)',
    orgao: 'RFB',
    esfera: 'FEDERAL',
    periodicidade: 'MENSAL',
    diaVencimento: 15,
    competencia: '09/2026',
    status: 'PENDENTE',
  },
  {
    id: 'obl-4',
    codigo: 'ESOCIAL_1299',
    nome: 'eSocial - Fechamento Folha Mensal (S-1299)',
    orgao: 'MTE',
    esfera: 'TRABALHISTA',
    periodicidade: 'MENSAL',
    diaVencimento: 15,
    competencia: '09/2026',
    status: 'PENDENTE',
  },
  {
    id: 'obl-5',
    codigo: 'REINF_4099',
    nome: 'EFD-Reinf - Fechamento Periódico (R-4099 / R-2099)',
    orgao: 'RFB',
    esfera: 'FEDERAL',
    periodicidade: 'MENSAL',
    diaVencimento: 15,
    competencia: '09/2026',
    status: 'PENDENTE',
  },
  {
    id: 'obl-6',
    codigo: 'ECD',
    nome: 'ECD - Escrituração Contábil Digital (SPED Contábil)',
    orgao: 'RFB',
    esfera: 'FEDERAL',
    periodicidade: 'ANUAL',
    diaVencimento: 30,
    competencia: '2025',
    status: 'TRANSMITIDO',
    protocoloRecibo: 'ECD.SP.2026.0094819-2',
    dataTransmissao: '2026-05-28T16:45:10Z',
  }
];

export const initialCertificates: DigitalCertificate[] = [
  {
    id: 'cert-1',
    companyId: 'comp-1',
    tipo: 'A1',
    razaoSocial: 'ALPHA DISTRIBUIDORA E LOGISTICA DE ALIMENTOS LTDA',
    cnpj: '12.345.678/0001-90',
    emissor: 'AC SERASA RFB v5 (ICP-Brasil)',
    validoDe: '2025-11-10T00:00:00Z',
    validoAte: '2026-11-10T23:59:59Z',
    diasParaVencer: 66,
    status: 'VALIDO',
  },
  {
    id: 'cert-2',
    companyId: 'comp-2',
    tipo: 'A1',
    razaoSocial: 'TECHSOFT SOLUCOES E TECNOLOGIA DA INFORMACAO LTDA',
    cnpj: '45.678.910/0001-23',
    emissor: 'AC CERTISIGN RFB v5 (ICP-Brasil)',
    validoDe: '2025-09-25T00:00:00Z',
    validoAte: '2026-09-25T23:59:59Z',
    diasParaVencer: 20,
    status: 'A_VENCER',
  },
  {
    id: 'cert-3',
    companyId: 'comp-3',
    tipo: 'A1',
    razaoSocial: 'MODA BRASIL CONFECCOES E VAREJO DE VESTUARIO LTDA',
    cnpj: '98.765.432/0001-11',
    emissor: 'AC VALID RFB v5 (ICP-Brasil)',
    validoDe: '2026-01-15T00:00:00Z',
    validoAte: '2027-01-15T23:59:59Z',
    diasParaVencer: 132,
    status: 'VALIDO',
  }
];

export const initialSubmissions: GovSubmission[] = [
  {
    id: 'sub-1',
    companyId: 'comp-1',
    sistema: 'ESOCIAL',
    evento: 'S-1000 - Informações do Empregador',
    competencia: '09/2026',
    estado: 'AUTORIZADO',
    tentativas: 1,
    idempotencyKey: 'esocial-s1000-comp1-2026',
    protocolo: '1.2.202609.00049281-9',
    recibo: 'REC-ESOCIAL-SP-9841289410',
    codigoResposta: '201',
    mensagemResposta: 'Sucesso. Lote de eventos processado com êxito pelo ambiente nacional.',
    criadoEm: '2026-09-01T10:00:00Z',
    atualizadoEm: '2026-09-01T10:01:25Z',
  },
  {
    id: 'sub-2',
    companyId: 'comp-1',
    sistema: 'REINF',
    evento: 'R-1000 - Informações do Contribuinte',
    competencia: '09/2026',
    estado: 'AUTORIZADO',
    tentativas: 1,
    idempotencyKey: 'reinf-r1000-comp1-2026',
    protocolo: '2.1.202609.00083172-1',
    recibo: 'REC-REINF-SP-7839120481',
    codigoResposta: '0000',
    mensagemResposta: 'Evento R-1000 recepcionado e validado com sucesso.',
    criadoEm: '2026-09-01T10:05:00Z',
    atualizadoEm: '2026-09-01T10:06:10Z',
  }
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-02T10:00:00Z',
    usuario: 'Carlos Eduardo Silva',
    companyId: 'comp-1',
    entidade: 'LANCAMENTO_CONTABIL',
    acao: 'INTEGRAR',
    detalhes: 'Lançamento contábil nº 1001 gerado automaticamente a partir da NF-e 49280 no valor de R$ 24.850,00.',
  },
  {
    id: 'log-2',
    timestamp: '2026-09-02T09:12:00Z',
    usuario: 'Mariana Costa (Analista Fiscal)',
    companyId: 'comp-1',
    entidade: 'DOCUMENTO_FISCAL',
    acao: 'IMPORTAR_XML',
    detalhes: 'Importação com sucesso do XML NF-e nº 49280 Chave: 35260912345678000190550010000492801837482910.',
  },
  {
    id: 'log-3',
    timestamp: '2026-09-01T18:00:00Z',
    usuario: 'Carlos Eduardo Silva',
    companyId: 'comp-1',
    entidade: 'COMPETENCIA',
    acao: 'FECHAR',
    detalhes: 'Fechamento oficial da competência 08/2026 para a empresa Alpha Distribuidora.',
  },
];

// ==================== FASE 3: DADOS INICIAIS ====================

export const initialAccountingParameters: AccountingParameters = {
  contaVendasMercadorias: '3.1.01.001',
  contaPrestacaoServicos: '3.1.01.002',
  contaClientes: '1.1.02.001',
  contaFornecedores: '2.1.01.001',
  contaEstoqueMercadorias: '1.1.03.001',
  contaCmv: '4.1.01.001',
  contaSalariosAPagar: '2.1.02.001',
  contaDespesaSalarios: '4.1.02.001',
  contaInssAPagar: '2.1.02.002',
  contaFgtsAPagar: '2.1.02.003',
  contaProlaboreAPagar: '2.1.02.005',
  contaDespesaProlabore: '4.1.02.002',
  contaLucrosAcumulados: '2.3.02.001',
  contaImpostosSimples: '2.1.03.001',
  contaPisAPagar: '2.1.03.002',
  contaCofinsAPagar: '2.1.03.003',
  contaIrpjAPagar: '2.1.03.004',
  contaCsllAPagar: '2.1.03.005',

  percentualPresuncaoComercio: 8.0,
  percentualPresuncaoServico: 32.0,
  aliquotaIrpjBase: 15.0,
  adicionalIrpjLimiteMensal: 20000.0,
  aliquotaAdicionalIrpj: 10.0,
  aliquotaCsllBase: 9.0,
  aliquotaPisCumulativo: 0.65,
  aliquotaCofinsCumulativo: 3.0,

  fatorRLimitePercent: 28.0,

  bloquearLancamentosRetroativos: true,
  exigirPartidasDobradasEstritas: true,

  planoReferencialRFB: 'PJ_GERAL',
  versaoLeiauteECD: '9.00',
  versaoLeiauteEFD: '017',
  qualificacaoSignatario: '900 - Contador',
  crcContadorResponsavel: 'CRC/SP 1SP234567/O-8',
  nomeContadorResponsavel: 'Carlos Eduardo Silva',
};

export const initialCustomization: SystemCustomization = {
  systemName: 'Lumen Contábil',
  systemTagline: 'Plataforma Integrada de Inteligência Fiscal, Contábil e SPED',
  shortName: 'Lumen',
  officeDisplayName: 'Audicon Contabilidade & Compliance Tributário S/S',
  cnpj: '09.876.543/0001-21',
  crc: 'CRC/SP 1SP234567/O-8',
  primaryThemeColor: 'blue',
  supportEmail: 'contato@audicon.cnt.br',
  supportPhone: '(11) 3456-7890',
  landingPage: {
    heroBadge: 'Tecnologia Contábil 2026 • SPED, Fator R & Supabase Cloud',
    heroTitle: 'Contabilidade Consultiva & Automação Fiscal de Alta Fidelidade',
    heroSubtitle: 'Importação em lote de XMLs, cálculo inteligente do Fator R, escrituração contábil em partidas dobradas e persistência relacional em nuvem.',
    ctaPrimaryText: 'Acessar Painel do Escritório',
    ctaSecondaryText: 'Ver Demonstração dos Módulos',
    stat1Number: '100%',
    stat1Label: 'Conformidade Fiscal',
    stat2Number: '9 Tabelas',
    stat2Label: 'Sincronizadas em Nuvem',
    stat3Number: '< 3 seg',
    stat3Label: 'Geração EFD & ECD',
    stat4Number: 'R$ 0,00',
    stat4Label: 'Risco de Inconsistência',
    whatsappContact: '11987654321',
  },
};
export const initialSystemCustomization = initialCustomization;

export const initialSystemUsers: SystemUser[] = [
  {
    id: 'user-1',
    name: 'Carlos Eduardo Silva',
    email: 'carlos.silva@audicon.cnt.br',
    role: 'ADMINISTRADOR',
    department: 'Diretoria Técnica & Contábil',
    active: true,
    avatarColor: 'bg-blue-600',
    lastLogin: '2026-09-05T19:45:00Z',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Mariana Costa',
    email: 'mariana.costa@audicon.cnt.br',
    role: 'ANALISTA',
    department: 'Depto Fiscal & Tributário',
    active: true,
    avatarColor: 'bg-emerald-600',
    lastLogin: '2026-09-05T18:30:00Z',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Roberto Mendes',
    email: 'roberto.mendes@audicon.cnt.br',
    role: 'ANALISTA',
    department: 'Depto Contábil & SPED',
    active: true,
    avatarColor: 'bg-indigo-600',
    lastLogin: '2026-09-05T17:15:00Z',
    createdAt: '2026-02-15T08:30:00Z',
  },
  {
    id: 'user-4',
    name: 'Juliana Paes',
    email: 'juliana.paes@audicon.cnt.br',
    role: 'OPERADOR',
    department: 'Processamento & Folha',
    active: true,
    avatarColor: 'bg-amber-600',
    lastLogin: '2026-09-05T16:00:00Z',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Felipe Alencar',
    email: 'felipe.alencar@audicon.cnt.br',
    role: 'OPERADOR',
    department: 'Recepção de Documentos',
    active: false,
    avatarColor: 'bg-slate-600',
    lastLogin: '2026-08-20T11:00:00Z',
    createdAt: '2026-04-10T14:00:00Z',
  },
];

export const initialActivityBacklog: UserActivityBacklog[] = [
  {
    id: 'backlog-1',
    timestamp: '2026-09-05T20:02:10Z',
    userId: 'user-1',
    userName: 'Carlos Eduardo Silva',
    userRole: 'ADMINISTRADOR',
    module: 'SUPABASE',
    action: 'Sincronização Nuvem PostgreSQL',
    description: 'Sincronização de 9 tabelas relacionais concluída com sucesso (3 empresas, 35 contas contábeis, 6 obrigações).',
    ip: '189.120.45.12',
    status: 'SUCESSO',
  },
  {
    id: 'backlog-2',
    timestamp: '2026-09-05T19:25:34Z',
    userId: 'user-2',
    userName: 'Mariana Costa',
    userRole: 'ANALISTA',
    module: 'FISCAL',
    action: 'Importação de XML NF-e',
    description: 'NF-e 49280 importada e contabilizada em partidas dobradas no Diário Geral.',
    ip: '189.120.45.14',
    status: 'SUCESSO',
  },
  {
    id: 'backlog-3',
    timestamp: '2026-09-05T18:10:00Z',
    userId: 'user-3',
    userName: 'Roberto Mendes',
    userRole: 'ANALISTA',
    module: 'CONTABIL',
    action: 'Geração de Balancete de Verificação',
    description: 'Balancete analítico de 4 níveis gerado com Ativo = Passivo + PL perfeitamente balanceado.',
    ip: '189.120.45.15',
    status: 'SUCESSO',
  },
  {
    id: 'backlog-4',
    timestamp: '2026-09-05T16:45:22Z',
    userId: 'user-4',
    userName: 'Juliana Paes',
    userRole: 'OPERADOR',
    module: 'FOLHA',
    action: 'Cálculo de Folha eSocial',
    description: 'Processamento de holerites e cálculo das tabelas progressivas de INSS e IRRF 2026.',
    ip: '189.120.45.18',
    status: 'SUCESSO',
  },
  {
    id: 'backlog-5',
    timestamp: '2026-09-05T15:30:10Z',
    userId: 'user-4',
    userName: 'Juliana Paes',
    userRole: 'OPERADOR',
    module: 'CONFIGURACOES',
    action: 'Tentativa de Alteração de Parâmetro Fiscal',
    description: 'Ação bloqueada pelo controle de acesso (RBAC): Operador tentou modificar alíquota do Fator R.',
    ip: '189.120.45.18',
    status: 'BLOQUEADO',
  },
];
export const initialUserActivityBacklog = initialActivityBacklog;
