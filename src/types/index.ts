export type TaxRegime = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface OfficeTenant {
  id: string;
  name: string;
  cnpj: string;
  crcResponsavel: string;
  responsavelNome: string;
  email: string;
  phone: string;
}

export interface Company {
  id: string;
  tenantId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string;
  uf: string;
  cidade: string;
  regimeTributario: TaxRegime;
  cnae: string;
  atividadePrincipal: string;
  anexoSimples?: 'ANEXO_I' | 'ANEXO_II' | 'ANEXO_III' | 'ANEXO_IV' | 'ANEXO_V';
  rbt12: number; // Receita Bruta Acumulada 12 meses
  sujeitoFatorR?: boolean; // Se a atividade permite/exige aplicação do Fator R
  folha12Meses?: number; // Total de gastos com folha e encargos nos últimos 12 meses
  ativo: boolean;
}

export interface Competence {
  id: string;
  companyId: string;
  year: number;
  month: number; // 1-12
  status: 'ABERTA' | 'FECHADA' | 'EM_APURACAO';
  dataFechamento?: string;
  fechadoPor?: string;
}

export type FiscalDocType = 'NFE' | 'NFCE' | 'CTE';
export type FiscalDocOperation = 'ENTRADA' | 'SAIDA';
export type FiscalDocStatus = 'NORMAL' | 'CANCELADO' | 'DENEGADO' | 'INUTILIZADO';

export interface FiscalTaxBreakdown {
  baseIcms: number;
  valorIcms: number;
  baseIcmsSt: number;
  valorIcmsSt: number;
  baseIpi: number;
  valorIpi: number;
  basePis: number;
  valorPis: number;
  baseCofins: number;
  valorCofins: number;
  valorIss?: number;
}

export interface FiscalItem {
  id: string;
  numeroItem: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  cstIcms: string;
  baseIcms: number;
  aliquotaIcms: number;
  valorIcms: number;
  cstPis: string;
  basePis: number;
  aliquotaPis: number;
  valorPis: number;
  cstCofins: string;
  baseCofins: number;
  aliquotaCofins: number;
  valorCofins: number;
  contabilizado?: boolean;
}

export interface FiscalDocument {
  id: string;
  tenantId: string;
  companyId: string;
  competencia: string; // MM/YYYY
  chaveAcesso: string; // 44 digitos
  tipoDoc: FiscalDocType;
  modelo: string; // '55', '65', '57'
  serie: string;
  numero: string;
  dataEmissao: string;
  dataEntradaSaida: string;
  naturezaOperacao: string;
  tipoOperacao: FiscalDocOperation;
  status: FiscalDocStatus;
  
  // Emitente
  emitenteCnpj: string;
  emitenteRazao: string;
  emitenteUf: string;
  
  // Destinatario
  destinatarioCnpj: string;
  destinatarioRazao: string;
  destinatarioUf: string;
  
  // Valores
  valorTotalProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  valorDesconto: number;
  valorOutrasDespesas: number;
  valorTotalNota: number;
  
  impostos: FiscalTaxBreakdown;
  itens: FiscalItem[];
  
  // Rastreabilidade e Auditoria
  importadoEm: string;
  arquivoOriginalNome: string;
  statusContabilizacao: 'PENDENTE' | 'CONTABILIZADO';
  xmlRaw?: string;
}

export interface TaxAssessment {
  id: string;
  companyId: string;
  competencia: string; // MM/YYYY
  regime: TaxRegime;
  dataApuracao: string;
  status: 'PREVIA' | 'APURADO' | 'TRANSMITIDO';
  faturamentoTotal: number;
  faturamentoEntradas: number;
  
  // Simples Nacional
  simples?: {
    anexo: string;
    rbt12: number;
    aliquotaNominal: number;
    parcelaDeduzir: number;
    aliquotaEfetiva: number;
    valorDevido: number;
    partilhaTributos: {
      irpj: number;
      csll: number;
      cofins: number;
      pis: number;
      cpp: number;
      icms: number;
      iss: number;
    };
    fatorR?: {
      sujeitoFatorR: boolean;
      folha12Meses: number;
      rbt12: number;
      fatorPercentual: number; // ex: 30%
      atingiuLimite28: boolean; // se >= 28%
      anexoAplicado: string;
      economiaMensalEstimada?: number;
      recomendacao: string;
    };
  };
  
  // Lucro Presumido / Real
  icms?: {
    totalDebitos: number;
    totalCreditos: number;
    saldoAnterior: number;
    saldoApurado: number; // positivo = a recolher, negativo = credor
  };
  pis?: {
    baseCalculo: number;
    aliquota: number;
    valorApurado: number;
  };
  cofins?: {
    baseCalculo: number;
    aliquota: number;
    valorApurado: number;
  };
  irpj?: {
    baseCalculo: number;
    percentualPresuncao: number;
    baseTributavel: number;
    aliquota: number;
    valorApurado: number;
    adicional10: number;
    valorTotalDevido: number;
  };
  csll?: {
    baseCalculo: number;
    percentualPresuncao: number;
    baseTributavel: number;
    aliquota: number;
    valorApurado: number;
  };
  iss?: {
    baseCalculo: number;
    aliquota: number;
    valorApurado: number;
  };
  retencoes?: {
    baseCalculo: number;
    crfRetido: number; // 4.65% (PIS, COFINS, CSLL)
    irrfRetido: number; // 1.5%
    totalRetido: number;
  };
  
  // Guias geradas
  guias: TaxGuide[];
}

// Configurações do Processo de Cálculo Calima (mlf/calcularImpostoProcessView)
export interface CalimaProcessConfig {
  selectedTaxes: string[]; // 'DAS', 'ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'RETENCOES'
  recalculateDocs: boolean;
  validateConsistencies: boolean;
  considerPreviousCredit: boolean;
  generateAccountingJournal: boolean;
  updateCompetenceStatus: boolean;
  saldoCredorIcmsAnterior: number;
}

export type TabId = 
  | 'dashboard' 
  | 'fiscal' 
  | 'apuracao' 
  | 'contabil' 
  | 'folha' 
  | 'socios' 
  | 'sped' 
  | 'gov' 
  | 'certificados' 
  | 'auditoria' 
  | 'supabase'
  | 'parametros'
  | 'personalizacao'
  | 'usuarios';

// Módulos Arquiteturais do Sistema (MLF, MLC, MLP, Governança)
export type SystemModuleId = 'ALL' | 'FISCAL' | 'CONTABIL' | 'FOLHA' | 'GESTAO';

export interface SystemModuleInfo {
  id: SystemModuleId;
  code: string;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  allowedTabs: TabId[];
}

export const SYSTEM_MODULES: SystemModuleInfo[] = [
  {
    id: 'ALL',
    code: 'GERAL',
    name: 'Todos os Módulos',
    shortName: 'Geral',
    description: 'Visão integrada de todos os processos do escritório',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
    allowedTabs: [
      'dashboard', 'fiscal', 'apuracao', 'contabil', 'folha', 'socios',
      'sped', 'gov', 'certificados', 'auditoria', 'supabase',
      'parametros', 'personalizacao', 'usuarios'
    ],
  },
  {
    id: 'FISCAL',
    code: 'MLF',
    name: 'Módulo Fiscal (MLF)',
    shortName: 'Fiscal (MLF)',
    description: 'Cálculo de impostos, escrituração de NF-e/NFC-e e SPED Fiscal',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    allowedTabs: ['apuracao', 'fiscal', 'sped'],
  },
  {
    id: 'CONTABIL',
    code: 'MLC',
    name: 'Módulo Contábil (MLC)',
    shortName: 'Contábil (MLC)',
    description: 'Plano de contas, partidas dobradas, razão, diário e balancetes',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    allowedTabs: ['contabil', 'parametros'],
  },
  {
    id: 'FOLHA',
    code: 'MLP',
    name: 'Folha de Pagamento (MLP)',
    shortName: 'Folha (MLP)',
    description: 'Holerites, encargos INSS/FGTS, eSocial e pró-labore com Fator R',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    allowedTabs: ['folha', 'socios'],
  },
  {
    id: 'GESTAO',
    code: 'ADM',
    name: 'Governança & Gestão',
    shortName: 'Governança',
    description: 'Painel gerencial, auditoria, transmissão GOV, certificados e usuários',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    allowedTabs: ['dashboard', 'gov', 'certificados', 'auditoria', 'supabase', 'personalizacao', 'usuarios'],
  },
];

export interface TaxGuide {
  id: string;
  tipo: 'DAS' | 'DARF' | 'GNRE';
  codigoReceita: string;
  descricao: string;
  competencia: string;
  dataVencimento: string;
  valorPrincipal: number;
  multa: number;
  juros: number;
  valorTotal: number;
  codigoBarras: string;
  linhaDigitavel: string;
  status: 'A_VENCER' | 'PAGO' | 'VENCIDO';
  ambiente?: 'HOMOLOGACAO_SIMULACAO' | 'PRODUCAO';
  avisoLegal?: string;
}

// Módulo Contábil
export type AccountType = 'SINTETICA' | 'ANALITICA';
export type AccountNature = 'DEVEDORA' | 'CREDORA';
export type AccountCategory = 'ATIVO' | 'PASSIVO' | 'PATRIMONIO_LIQUIDO' | 'RECEITAS' | 'DESPESAS' | 'CUSTOS';

export interface AccountingAccount {
  id: string;
  companyId: string;
  codigo: string; // ex: 1.1.01.01.001
  codigoReduzido: string; // ex: 104
  nome: string;
  tipo: AccountType;
  natureza: AccountNature;
  categoria: AccountCategory;
  contaPaiCodigo?: string;
  nivel: number;
  saldoInicial: number;
  saldoAtual: number;
  codigoReferencialECD?: string;
}

export interface AccountingEntryLine {
  id: string;
  contaCodigo: string;
  contaNome: string;
  tipo: 'DEBITO' | 'CREDITO';
  valor: number;
}

export interface AccountingEntry {
  id: string;
  companyId: string;
  competencia: string;
  numero: number;
  data: string;
  origemTipo: 'MANUAL' | 'FISCAL' | 'FOLHA' | 'ENCERRAMENTO';
  origemId?: string;
  documentoRef?: string;
  historicoPadrao: string;
  linhas: AccountingEntryLine[];
  totalDebito: number;
  totalCredito: number;
  balanceado: boolean;
  criadoEm: string;
  criadoPor: string;
}

// Relatório do Balanço Patrimonial Oficial
export interface BalanceSheetItem {
  codigo: string;
  nome: string;
  saldo: number;
  tipo: 'SINTETICA' | 'ANALITICA';
  nivel: number;
}

export interface BalanceSheetReport {
  ativoCirculante: BalanceSheetItem[];
  subtotalAtivoCirculante: number;
  ativoNaoCirculante: BalanceSheetItem[];
  subtotalAtivoNaoCirculante: number;
  totalAtivo: number;
  
  passivoCirculante: BalanceSheetItem[];
  subtotalPassivoCirculante: number;
  passivoNaoCirculante: BalanceSheetItem[];
  subtotalPassivoNaoCirculante: number;
  patrimonioLiquido: BalanceSheetItem[];
  subtotalPatrimonioLiquido: number;
  totalPassivoEPatrimonioLiquido: number;
  
  equilibrado: boolean;
  diferenca: number;
  resultadoExercicioApurado: number;
}

// Relatório do Livro Razão Analítico
export interface GeneralLedgerLine {
  data: string;
  entryId: string;
  entryNumero: number;
  origemTipo: string;
  documentoRef?: string;
  historico: string;
  debito: number;
  credito: number;
  saldoResultante: number;
}

export interface GeneralLedgerReport {
  contaCodigo: string;
  contaNome: string;
  natureza: 'DEVEDORA' | 'CREDORA';
  saldoInicial: number;
  totalDebitos: number;
  totalCreditos: number;
  saldoFinal: number;
  linhas: GeneralLedgerLine[];
}

export interface PostingRule {
  id: string;
  companyId: string;
  evento: 'VENDA_MERCADORIA' | 'COMPRA_MERCADORIA' | 'APURACAO_ICMS' | 'APURACAO_SIMPLES' | 'FOLHA_PAGAMENTO';
  descricao: string;
  cfopFiltro?: string;
  contaDebitoCodigo: string;
  contaCreditoCodigo: string;
  historicoModelo: string;
  ativo: boolean;
}

// Módulo Folha / DP
export interface Employee {
  id: string;
  companyId: string;
  nome: string;
  cpf: string;
  pis: string;
  ctps: string;
  cargo: string;
  cbo: string;
  departamento: string;
  dataAdmissao: string;
  salarioBase: number;
  dependentesIrrf: number;
  valeTransporte: boolean;
  descontoVtPercent: number;
  status: 'ATIVO' | 'AFASTADO' | 'FERIAS' | 'DEMITIDO';
  matriculaESocial?: string;
}

export interface PayrollEvent {
  codigo: string;
  nome: string;
  tipo: 'PROVENTO' | 'DESCONTO';
  referencia: string;
  valor: number;
}

export interface PayrollPayslip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCpf: string;
  cargo: string;
  cbo: string;
  competencia: string;
  salarioBase: number;
  eventos: PayrollEvent[];
  totalProventos: number;
  totalDescontos: number;
  salarioLiquido: number;
  baseInss: number;
  valorInss: number;
  baseIrrf: number;
  valorIrrf: number;
  baseFgts: number;
  valorFgts: number;
}

// Sócios, Pró-labore e Distribuição de Lucros (Fase 2)
export interface Partner {
  id: string;
  companyId: string;
  nome: string;
  cpf: string;
  qualificacao: 'SOCIO_ADMINISTRADOR' | 'SOCIO_COTISTA' | 'TITULAR';
  participacaoCapitalPercent: number; // ex: 60%
  valorProlaboreMensal: number; // ex: 5000.00
  dependentesIrrf: number;
  inssRetidoProlabore: number; // 11% (teto max 908.86)
  irrfRetidoProlabore: number;
  prolaboreLiquido: number;
  chavePix?: string;
  bancoNome?: string;
}

export interface ProfitDistributionRecord {
  id: string;
  companyId: string;
  competencia: string;
  dataDistribuicao: string;
  partnerId: string;
  partnerNome: string;
  partnerCpf: string;
  valorDistribuido: number;
  saldoLucrosDisponivelAntes: number;
  saldoLucrosDisponivelDepois: number;
  isencaoLegalArtigo: string; // 'Art. 10 da Lei nº 9.249/1995'
  statusContabilizacao: 'PENDENTE' | 'CONTABILIZADO';
  reciboNumero: string;
  documentoRef?: string;
}

export interface DctfWebSummary {
  competencia: string;
  companyId: string;
  inssSegurados: number;
  inssPatronal: number;
  ratFap: number;
  terceirosOutrasEntidades: number;
  deducoesSalarioFamiliaMaternidade: number;
  totalDarfPrevidenciario: number;
  dataVencimento: string;
  codigoReceita: string; // ex: 1082-01 ou 0588
  statusTransmissao: 'PENDENTE' | 'TRANSMITIDO' | 'GUIA_EMITIDA';
  protocoloEntrega?: string;
  linhaDigitavel?: string;
}

// Módulo Obrigações e SPED
export type SpedFileType = 'EFD_ICMS_IPI' | 'ECD_CONTABIL';
export interface TaxObligation {
  id: string;
  codigo: string;
  nome: string;
  orgao: 'RFB' | 'SEFAZ' | 'MTE' | 'CAIXA';
  esfera: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL' | 'TRABALHISTA';
  periodicidade: 'MENSAL' | 'ANUAL' | 'EVENTUAL';
  diaVencimento: number;
  competencia: string;
  status: 'PENDENTE' | 'GERADO' | 'VALIDADO' | 'TRANSMITIDO' | 'ATRASADO';
  protocoloRecibo?: string;
  protocolo?: string;
  dataTransmissao?: string;
}

export interface SpedRegister {
  reg: string;
  fields: (string | number)[];
}

// Módulo GOV Transmissão
export interface GovSubmission {
  id: string;
  companyId: string;
  sistema: 'ESOCIAL' | 'REINF' | 'SEFAZ';
  evento: string; // e.g., 'S-1200', 'R-2010', 'NFe-4.00'
  competencia: string;
  estado: 'CRIADO' | 'ASSINADO' | 'ENVIADO' | 'PROCESSANDO' | 'AUTORIZADO' | 'REJEITADO';
  tentativas: number;
  idempotencyKey: string;
  protocolo?: string;
  recibo?: string;
  codigoResposta?: string;
  mensagemResposta?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Certificados Digitais
export interface DigitalCertificate {
  id: string;
  companyId: string;
  tipo: 'A1';
  razaoSocial: string;
  cnpj: string;
  emissor: string;
  validoDe: string;
  validoAte: string;
  diasParaVencer: number;
  status: 'VALIDO' | 'A_VENCER' | 'EXPIRADO';
  alias?: string;
  numeroSerie?: string;
  subjectCnpj?: string;
}

// Auditoria
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  companyId?: string;
  entidade: 'DOCUMENTO_FISCAL' | 'APURACAO' | 'LANCAMENTO_CONTABIL' | 'FOLHA' | 'SPED' | 'TRANSMISSAO' | 'COMPETENCIA' | 'PARAMETROS' | 'SISTEMA' | 'SEGURANCA';
  acao: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'IMPORTAR_XML' | 'APURAR' | 'INTEGRAR' | 'TRANSMITIR' | 'FECHAR' | 'PARAMETRIZACAO' | 'CRIAR_USUARIO' | 'ATUALIZAR_USUARIO' | 'ALTERAR_PERFIL';
  detalhes: string;
}

export type AuditLog = AuditLogEntry;

// ==================== FASE 3: TIPOS ESPECIAIS ====================

// 1. Configurações do Especialista Contábil (Parâmetros Fiscais & Contábeis)
export interface AccountingParameters {
  // Contas Padrão para Contabilização Automática
  contaVendasMercadorias: string;
  contaPrestacaoServicos: string;
  contaClientes: string;
  contaFornecedores: string;
  contaEstoqueMercadorias: string;
  contaCmv: string;
  contaSalariosAPagar: string;
  contaDespesaSalarios: string;
  contaInssAPagar: string;
  contaFgtsAPagar: string;
  contaProlaboreAPagar: string;
  contaDespesaProlabore: string;
  contaLucrosAcumulados: string;
  contaImpostosSimples: string;
  contaPisAPagar: string;
  contaCofinsAPagar: string;
  contaIrpjAPagar: string;
  contaCsllAPagar: string;

  // Parâmetros Tributários & Presunção
  percentualPresuncaoComercio: number; // ex: 8
  percentualPresuncaoServico: number;  // ex: 32
  aliquotaIrpjBase: number;            // ex: 15
  adicionalIrpjLimiteMensal: number;   // ex: 20000
  aliquotaAdicionalIrpj: number;       // ex: 10
  aliquotaCsllBase: number;            // ex: 9
  aliquotaPisCumulativo: number;       // ex: 0.65
  aliquotaCofinsCumulativo: number;    // ex: 3.00

  // Simples Nacional & Fator R
  fatorRLimitePercent: number;         // ex: 28

  // Segurança e Fechamento
  bloquearLancamentosRetroativos: boolean;
  exigirPartidasDobradasEstritas: boolean;

  // Parâmetros SPED / ECD
  planoReferencialRFB: 'PJ_GERAL' | 'PJ_LUCRO_PRESUMIDO' | 'FINANCEIRAS' | 'IMUNES_ISENTAS';
  versaoLeiauteECD: string;            // ex: '9.00'
  versaoLeiauteEFD: string;            // ex: '017'
  qualificacaoSignatario: string;      // ex: '900 - Contador'
  crcContadorResponsavel: string;
  nomeContadorResponsavel: string;
}

// 2. Personalização do Sistema (White-Label & Landing Page)
export interface LandingPageConfig {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  stat1Number: string;
  stat1Label: string;
  stat2Number: string;
  stat2Label: string;
  stat3Number: string;
  stat3Label: string;
  stat4Number: string;
  stat4Label: string;
  whatsappContact: string;
}

export interface SystemCustomization {
  systemName: string;
  systemTagline: string;
  shortName: string;
  officeDisplayName: string;
  accountantName?: string; // Nome do Contador / Auditor Responsável (exibido no topo)
  cnpj: string;
  crc: string;
  primaryThemeColor: 'blue' | 'emerald' | 'indigo' | 'slate' | 'violet';
  supportEmail: string;
  supportPhone: string;
  sessionTimeoutMinutes?: number; // Tempo limite de sessão em minutos (padrão: 30)
  landingPage: LandingPageConfig;
}

// 3. Perfis e Gerenciamento de Usuários (RBAC & Backlog)
export type SystemRole = 'ADMINISTRADOR' | 'ANALISTA' | 'OPERADOR';

export type TabModuleId = 
  | 'dashboard' 
  | 'fiscal' 
  | 'apuracao' 
  | 'contabil' 
  | 'folha' 
  | 'socios' 
  | 'sped' 
  | 'gov' 
  | 'certificados' 
  | 'auditoria' 
  | 'supabase'
  | 'parametros'
  | 'personalizacao'
  | 'usuarios';

export interface RolePermissionConfig {
  role: SystemRole;
  roleName: string;
  description: string;
  badgeColor: string;
  allowedTabs: TabModuleId[];
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  active: boolean;
  avatarColor: string;
  password?: string; // Senha de autenticação
  mustChangePassword?: boolean; // Forçar troca de senha no primeiro acesso
  lastLogin: string;
  createdAt: string;
}

export interface UserActivityBacklog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: SystemRole;
  module: 'FISCAL' | 'CONTABIL' | 'FOLHA' | 'SOCIOS' | 'SPED' | 'SUPABASE' | 'CONFIGURACOES' | 'USUARIOS';
  action: string;
  description: string;
  ip: string;
  status: 'SUCESSO' | 'ALERTA' | 'BLOQUEADO';
}
