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
  
  // Guias geradas
  guias: TaxGuide[];
}

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
  origemTipo: 'MANUAL' | 'FISCAL' | 'FOLHA';
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

// Módulo Obrigações e SPED
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
  entidade: 'DOCUMENTO_FISCAL' | 'APURACAO' | 'LANCAMENTO_CONTABIL' | 'FOLHA' | 'SPED' | 'TRANSMISSAO' | 'COMPETENCIA';
  acao: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'IMPORTAR_XML' | 'APURAR' | 'INTEGRAR' | 'TRANSMITIR' | 'FECHAR';
  detalhes: string;
}

export type AuditLog = AuditLogEntry;
