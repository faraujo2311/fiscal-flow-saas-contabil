import { Company, FiscalDocument, TaxAssessment, TaxGuide } from '../types';

// Tabelas Oficiais do Simples Nacional (Lei Complementar 123/2006 atualizada)
interface SimplesFaixa {
  limiteSuperior: number;
  aliquotaNominal: number; // Ex: 0.04 = 4%
  parcelaDeduzir: number;
  partilha: {
    irpj: number;
    csll: number;
    cofins: number;
    pis: number;
    cpp: number;
    icms?: number;
    iss?: number;
  };
}

// Anexo I - Comércio
const TABELA_ANEXO_I: SimplesFaixa[] = [
  { limiteSuperior: 180000, aliquotaNominal: 0.040, parcelaDeduzir: 0, partilha: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.4150, icms: 0.3400 } },
  { limiteSuperior: 360000, aliquotaNominal: 0.073, parcelaDeduzir: 5940, partilha: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.4150, icms: 0.3400 } },
  { limiteSuperior: 720000, aliquotaNominal: 0.095, parcelaDeduzir: 13860, partilha: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.4200, icms: 0.3350 } },
  { limiteSuperior: 1800000, aliquotaNominal: 0.107, parcelaDeduzir: 22500, partilha: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.4200, icms: 0.3350 } },
  { limiteSuperior: 3600000, aliquotaNominal: 0.143, parcelaDeduzir: 87300, partilha: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.4200, icms: 0.3350 } },
  { limiteSuperior: 4800000, aliquotaNominal: 0.190, parcelaDeduzir: 378000, partilha: { irpj: 0.135, csll: 0.100, cofins: 0.2827, pis: 0.0613, cpp: 0.4210 } }, // Acima de 3.6m ICMS é por fora
];

// Anexo III - Serviços (Desenvolvimento de Software, Consultorias)
const TABELA_ANEXO_III: SimplesFaixa[] = [
  { limiteSuperior: 180000, aliquotaNominal: 0.060, parcelaDeduzir: 0, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 360000, aliquotaNominal: 0.112, parcelaDeduzir: 9360, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 720000, aliquotaNominal: 0.135, parcelaDeduzir: 17640, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 1800000, aliquotaNominal: 0.160, parcelaDeduzir: 35640, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 3600000, aliquotaNominal: 0.210, parcelaDeduzir: 125640, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 4800000, aliquotaNominal: 0.330, parcelaDeduzir: 648000, partilha: { irpj: 0.350, csll: 0.150, cofins: 0.1600, pis: 0.0350, cpp: 0.3050 } },
];

export function calculateTaxAssessment(
  company: Company,
  competencia: string,
  documents: FiscalDocument[]
): TaxAssessment {
  // Filtrar notas da empresa e competência
  const docs = documents.filter(d => d.companyId === company.id && d.status === 'NORMAL');
  
  const saidas = docs.filter(d => d.tipoOperacao === 'SAIDA');
  const entradas = docs.filter(d => d.tipoOperacao === 'ENTRADA');

  const faturamentoTotal = saidas.reduce((acc, curr) => acc + curr.valorTotalNota, 0);
  const faturamentoEntradas = entradas.reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const guias: TaxGuide[] = [];
  const assessmentId = `assess-${company.id}-${competencia.replace('/', '')}`;

  if (company.regimeTributario === 'SIMPLES_NACIONAL') {
    const anexo = company.anexoSimples || 'ANEXO_I';
    const tabela = anexo === 'ANEXO_III' ? TABELA_ANEXO_III : TABELA_ANEXO_I;
    const rbt12 = company.rbt12 || 300000;

    // Encontrar faixa
    let faixa = tabela[0];
    for (const f of tabela) {
      if (rbt12 <= f.limiteSuperior) {
        faixa = f;
        break;
      }
      faixa = f; // se maior que o teto, fica na última
    }

    // Fórmula Alíquota Efetiva: (RBT12 × Alíq. Nominal - Parcela a Deduzir) / RBT12
    const aliqEfetivaCalculada = rbt12 > 0 
      ? ((rbt12 * faixa.aliquotaNominal) - faixa.parcelaDeduzir) / rbt12 
      : faixa.aliquotaNominal;
    
    const aliqEfetiva = Math.max(0.04, Math.min(aliqEfetivaCalculada, 0.33));
    const valorDevido = Math.round(faturamentoTotal * aliqEfetiva * 100) / 100;

    // Partilha dos tributos
    const partilha = {
      irpj: Math.round(valorDevido * (faixa.partilha.irpj || 0) * 100) / 100,
      csll: Math.round(valorDevido * (faixa.partilha.csll || 0) * 100) / 100,
      cofins: Math.round(valorDevido * (faixa.partilha.cofins || 0) * 100) / 100,
      pis: Math.round(valorDevido * (faixa.partilha.pis || 0) * 100) / 100,
      cpp: Math.round(valorDevido * (faixa.partilha.cpp || 0) * 100) / 100,
      icms: Math.round(valorDevido * (faixa.partilha.icms || 0) * 100) / 100,
      iss: Math.round(valorDevido * (faixa.partilha.iss || 0) * 100) / 100,
    };

    // Guia DAS
    if (valorDevido > 0) {
      guias.push({
        id: `guia-das-${competencia.replace('/', '')}`,
        tipo: 'DAS',
        codigoReceita: 'DAS-SIMPLES',
        descricao: `Documento de Arrecadação do Simples Nacional - Comp. ${competencia}`,
        competencia,
        dataVencimento: getNextDueDay(competencia, 20),
        valorPrincipal: valorDevido,
        multa: 0,
        juros: 0,
        valorTotal: valorDevido,
        codigoBarras: generateMockBarcode('DAS', valorDevido),
        linhaDigitavel: generateMockDigitableLine('DAS', valorDevido),
        status: 'A_VENCER',
      });
    }

    return {
      id: assessmentId,
      companyId: company.id,
      competencia,
      regime: company.regimeTributario,
      dataApuracao: new Date().toISOString(),
      status: 'APURADO',
      faturamentoTotal,
      faturamentoEntradas,
      simples: {
        anexo,
        rbt12,
        aliquotaNominal: faixa.aliquotaNominal * 100,
        parcelaDeduzir: faixa.parcelaDeduzir,
        aliquotaEfetiva: Math.round(aliqEfetiva * 10000) / 100,
        valorDevido,
        partilhaTributos: partilha,
      },
      guias,
    };
  } else {
    // Lucro Presumido ou Real
    // ICMS: Débitos das saídas menos créditos das entradas
    const totalDebitosIcms = saidas.reduce((acc, curr) => acc + curr.impostos.valorIcms, 0);
    const totalCreditosIcms = entradas.reduce((acc, curr) => acc + curr.impostos.valorIcms, 0);
    const saldoApuradoIcms = Math.round((totalDebitosIcms - totalCreditosIcms) * 100) / 100;

    // PIS e COFINS (Lucro Presumido cumulativo: PIS 0.65%, COFINS 3.00%)
    const basePisCofins = faturamentoTotal;
    const valorPis = Math.round(basePisCofins * 0.0065 * 100) / 100;
    const valorCofins = Math.round(basePisCofins * 0.0300 * 100) / 100;

    // Guias Lucro Presumido
    if (saldoApuradoIcms > 0) {
      guias.push({
        id: `guia-icms-${competencia.replace('/', '')}`,
        tipo: 'GNRE',
        codigoReceita: 'ICMS-046-2',
        descricao: `ICMS Operações Próprias - SEFAZ/SP - Comp. ${competencia}`,
        competencia,
        dataVencimento: getNextDueDay(competencia, 20),
        valorPrincipal: saldoApuradoIcms,
        multa: 0,
        juros: 0,
        valorTotal: saldoApuradoIcms,
        codigoBarras: generateMockBarcode('ICMS', saldoApuradoIcms),
        linhaDigitavel: generateMockDigitableLine('ICMS', saldoApuradoIcms),
        status: 'A_VENCER',
      });
    }

    if (valorPis > 0) {
      guias.push({
        id: `guia-pis-${competencia.replace('/', '')}`,
        tipo: 'DARF',
        codigoReceita: '8109',
        descricao: `DARF PIS Faturamento Cumulativo - Cód 8109 - Comp. ${competencia}`,
        competencia,
        dataVencimento: getNextDueDay(competencia, 25),
        valorPrincipal: valorPis,
        multa: 0,
        juros: 0,
        valorTotal: valorPis,
        codigoBarras: generateMockBarcode('DARF', valorPis),
        linhaDigitavel: generateMockDigitableLine('DARF', valorPis),
        status: 'A_VENCER',
      });
    }

    if (valorCofins > 0) {
      guias.push({
        id: `guia-cofins-${competencia.replace('/', '')}`,
        tipo: 'DARF',
        codigoReceita: '2172',
        descricao: `DARF COFINS Faturamento Cumulativo - Cód 2172 - Comp. ${competencia}`,
        competencia,
        dataVencimento: getNextDueDay(competencia, 25),
        valorPrincipal: valorCofins,
        multa: 0,
        juros: 0,
        valorTotal: valorCofins,
        codigoBarras: generateMockBarcode('DARF', valorCofins),
        linhaDigitavel: generateMockDigitableLine('DARF', valorCofins),
        status: 'A_VENCER',
      });
    }

    return {
      id: assessmentId,
      companyId: company.id,
      competencia,
      regime: company.regimeTributario,
      dataApuracao: new Date().toISOString(),
      status: 'APURADO',
      faturamentoTotal,
      faturamentoEntradas,
      icms: {
        totalDebitos: totalDebitosIcms,
        totalCreditos: totalCreditosIcms,
        saldoAnterior: 0,
        saldoApurado: saldoApuradoIcms,
      },
      pis: {
        baseCalculo: basePisCofins,
        aliquota: 0.65,
        valorApurado: valorPis,
      },
      cofins: {
        baseCalculo: basePisCofins,
        aliquota: 3.00,
        valorApurado: valorCofins,
      },
      guias,
    };
  }
}

function getNextDueDay(competencia: string, day: number): string {
  const [monthStr, yearStr] = competencia.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  // Due in following month
  let dueMonth = month + 1;
  let dueYear = year;
  if (dueMonth > 12) {
    dueMonth = 1;
    dueYear += 1;
  }
  const formattedDay = day < 10 ? `0${day}` : `${day}`;
  const formattedMonth = dueMonth < 10 ? `0${dueMonth}` : `${dueMonth}`;
  return `${formattedDay}/${formattedMonth}/${dueYear}`;
}

function generateMockBarcode(tipo: string, valor: number): string {
  const vlr = Math.round(valor * 100).toString().padStart(10, '0');
  const rand = Math.floor(1000000000 + Math.random() * 9000000000);
  return `858${rand}${vlr}`;
}

function generateMockDigitableLine(tipo: string, valor: number): string {
  const vlr = Math.round(valor * 100).toString().padStart(10, '0');
  return `85890.00014 92837.194827 81920.394819 1 ${vlr}`;
}
