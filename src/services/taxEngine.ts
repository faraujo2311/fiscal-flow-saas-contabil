import { Company, FiscalDocument, TaxAssessment, TaxGuide, CalimaProcessConfig } from '../types';

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

// Anexo III - Serviços (Desenvolvimento de Software, Consultorias com Fator R >= 28%)
const TABELA_ANEXO_III: SimplesFaixa[] = [
  { limiteSuperior: 180000, aliquotaNominal: 0.060, parcelaDeduzir: 0, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 360000, aliquotaNominal: 0.112, parcelaDeduzir: 9360, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 720000, aliquotaNominal: 0.135, parcelaDeduzir: 17640, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 1800000, aliquotaNominal: 0.160, parcelaDeduzir: 35640, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 3600000, aliquotaNominal: 0.210, parcelaDeduzir: 125640, partilha: { irpj: 0.040, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.4340, iss: 0.3350 } },
  { limiteSuperior: 4800000, aliquotaNominal: 0.330, parcelaDeduzir: 648000, partilha: { irpj: 0.350, csll: 0.150, cofins: 0.1600, pis: 0.0350, cpp: 0.3050 } },
];

// Anexo V - Serviços com Fator R < 28% (Alíquotas majoradas da LC 123/2006)
const TABELA_ANEXO_V: SimplesFaixa[] = [
  { limiteSuperior: 180000, aliquotaNominal: 0.155, parcelaDeduzir: 0, partilha: { irpj: 0.250, csll: 0.150, cofins: 0.1410, pis: 0.0305, cpp: 0.2885, iss: 0.1400 } },
  { limiteSuperior: 360000, aliquotaNominal: 0.180, parcelaDeduzir: 4500, partilha: { irpj: 0.230, csll: 0.150, cofins: 0.1410, pis: 0.0305, cpp: 0.2785, iss: 0.1700 } },
  { limiteSuperior: 720000, aliquotaNominal: 0.195, parcelaDeduzir: 9900, partilha: { irpj: 0.240, csll: 0.150, cofins: 0.1410, pis: 0.0305, cpp: 0.2385, iss: 0.2000 } },
  { limiteSuperior: 1800000, aliquotaNominal: 0.205, parcelaDeduzir: 17100, partilha: { irpj: 0.210, csll: 0.150, cofins: 0.1410, pis: 0.0305, cpp: 0.2385, iss: 0.2300 } },
  { limiteSuperior: 3600000, aliquotaNominal: 0.230, parcelaDeduzir: 62100, partilha: { irpj: 0.230, csll: 0.125, cofins: 0.1410, pis: 0.0305, cpp: 0.2385, iss: 0.2350 } },
  { limiteSuperior: 4800000, aliquotaNominal: 0.305, parcelaDeduzir: 540000, partilha: { irpj: 0.350, csll: 0.155, cofins: 0.1610, pis: 0.0350, cpp: 0.2990 } },
];

export function calculateTaxAssessment(
  company: Company,
  competencia: string,
  documents: FiscalDocument[],
  calimaConfig?: Partial<CalimaProcessConfig>
): TaxAssessment {
  // Filtrar notas da empresa e competência
  const docs = documents.filter(d => d.companyId === company.id && d.status === 'NORMAL');
  
  const saidas = docs.filter(d => d.tipoOperacao === 'SAIDA');
  const entradas = docs.filter(d => d.tipoOperacao === 'ENTRADA');

  const faturamentoTotal = saidas.reduce((acc, curr) => acc + curr.valorTotalNota, 0);
  const faturamentoEntradas = entradas.reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const guias: TaxGuide[] = [];
  const assessmentId = `assess-${company.id}-${competencia.replace('/', '')}`;
  const selectedTaxes = calimaConfig?.selectedTaxes || [
    'DAS', 'ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'RETENCOES'
  ];

  if (company.regimeTributario === 'SIMPLES_NACIONAL') {
    let anexo = company.anexoSimples || 'ANEXO_I';
    const rbt12 = company.rbt12 || 300000;
    let fatorRDetails: TaxAssessment['simples'] extends { fatorR?: infer R } ? R : never;

    // Regra do Fator R (Art. 18, §§ 5º-J e 5º-M da Lei Complementar 123/2006)
    if (company.sujeitoFatorR || anexo === 'ANEXO_III' || anexo === 'ANEXO_V') {
      const folha12 = company.folha12Meses || 0;
      const fatorRatio = rbt12 > 0 ? (folha12 / rbt12) : 0;
      const fatorPercentual = Math.round(fatorRatio * 10000) / 100;
      const atingiuLimite28 = fatorPercentual >= 28.0;

      // Se Fator R >= 28%, tributa pelo Anexo III. Se < 28%, tributa pelo Anexo V.
      anexo = atingiuLimite28 ? 'ANEXO_III' : 'ANEXO_V';

      const valorMinimoPara28 = Math.round(rbt12 * 0.28 * 100) / 100;
      const deficitFolha = Math.max(0, valorMinimoPara28 - folha12);

      let recomendacao = '';
      if (atingiuLimite28) {
        recomendacao = `Fator R apurado em ${fatorPercentual}% (meta >= 28%). Enquadramento assegurado no Anexo III, garantindo tributação a partir de 6%.`;
      } else {
        recomendacao = `Fator R apurado em ${fatorPercentual}% (abaixo do teto de 28%). Enquadrado compulsoriamente no Anexo V (alíquota a partir de 15,5%). Recomenda-se avaliar acréscimo de pró-labore de R$ ${deficitFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} nos próximos meses para atingir a meta.`;
      }

      fatorRDetails = {
        sujeitoFatorR: true,
        folha12Meses: folha12,
        rbt12,
        fatorPercentual,
        atingiuLimite28,
        anexoAplicado: anexo,
        recomendacao,
      };
    }

    let tabela = TABELA_ANEXO_I;
    if (anexo === 'ANEXO_III') {
      tabela = TABELA_ANEXO_III;
    } else if (anexo === 'ANEXO_V') {
      tabela = TABELA_ANEXO_V;
    }

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
    if (selectedTaxes.includes('DAS') && valorDevido > 0) {
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
        codigoBarras: generateSimulationBarcode('DAS', valorDevido),
        linhaDigitavel: generateSimulationDigitableLine('DAS', valorDevido),
        status: 'A_VENCER',
        ambiente: 'HOMOLOGACAO_SIMULACAO',
        avisoLegal: 'DOCUMENTO DEMONSTRATIVO DE MEMÓRIA FISCAL - NÃO REGISTRADO NA CIP/FEBRABAN - NÃO EFETUAR PAGAMENTO',
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
        fatorR: fatorRDetails,
      },
      guias,
    };
  } else {
    // Lucro Presumido ou Real (MLF Calima Engine)
    // ICMS: Débitos das saídas menos créditos das entradas e saldo credor anterior
    const totalDebitosIcms = saidas.reduce((acc, curr) => acc + curr.impostos.valorIcms, 0);
    const totalCreditosIcms = entradas.reduce((acc, curr) => acc + curr.impostos.valorIcms, 0);
    const saldoAnterior = calimaConfig?.considerPreviousCredit ? (calimaConfig.saldoCredorIcmsAnterior || 0) : 0;
    const saldoApuradoIcms = Math.round((totalDebitosIcms - totalCreditosIcms - saldoAnterior) * 100) / 100;

    // PIS e COFINS (Lucro Presumido cumulativo: PIS 0.65%, COFINS 3.00%)
    const basePisCofins = faturamentoTotal;
    const valorPis = Math.round(basePisCofins * 0.0065 * 100) / 100;
    const valorCofins = Math.round(basePisCofins * 0.0300 * 100) / 100;

    // IRPJ e CSLL (Lucro Presumido: presunção de 8% comércio ou 32% serviços)
    const isServico = company.atividadePrincipal?.toLowerCase().includes('serviço') || company.cnae?.startsWith('62') || company.cnae?.startsWith('69');
    const percentualPresuncaoIrpj = isServico ? 32 : 8;
    const baseTributavelIrpj = Math.round(faturamentoTotal * (percentualPresuncaoIrpj / 100) * 100) / 100;
    const valorIrpjBase = Math.round(baseTributavelIrpj * 0.15 * 100) / 100;
    const adicional10 = baseTributavelIrpj > 20000 ? Math.round((baseTributavelIrpj - 20000) * 0.10 * 100) / 100 : 0;
    const valorTotalIrpj = Math.round((valorIrpjBase + adicional10) * 100) / 100;

    const percentualPresuncaoCsll = isServico ? 32 : 12;
    const baseTributavelCsll = Math.round(faturamentoTotal * (percentualPresuncaoCsll / 100) * 100) / 100;
    const valorCsll = Math.round(baseTributavelCsll * 0.09 * 100) / 100;

    const valorIss = isServico ? Math.round(faturamentoTotal * 0.03 * 100) / 100 : 0;
    const crfRetido = isServico ? Math.round(faturamentoTotal * 0.0465 * 100) / 100 : 0;
    const irrfRetido = isServico ? Math.round(faturamentoTotal * 0.015 * 100) / 100 : 0;
    const totalRetido = Math.round((crfRetido + irrfRetido) * 100) / 100;

    // Guias Lucro Presumido
    if (selectedTaxes.includes('ICMS') && saldoApuradoIcms > 0) {
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
        codigoBarras: generateSimulationBarcode('ICMS', saldoApuradoIcms),
        linhaDigitavel: generateSimulationDigitableLine('ICMS', saldoApuradoIcms),
        status: 'A_VENCER',
        ambiente: 'HOMOLOGACAO_SIMULACAO',
        avisoLegal: 'DOCUMENTO DEMONSTRATIVO DE MEMÓRIA FISCAL - NÃO REGISTRADO NA CIP/FEBRABAN - NÃO EFETUAR PAGAMENTO',
      });
    }

    if (selectedTaxes.includes('PIS') && valorPis > 0) {
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
        codigoBarras: generateSimulationBarcode('DARF', valorPis),
        linhaDigitavel: generateSimulationDigitableLine('DARF', valorPis),
        status: 'A_VENCER',
        ambiente: 'HOMOLOGACAO_SIMULACAO',
        avisoLegal: 'DOCUMENTO DEMONSTRATIVO DE MEMÓRIA FISCAL - NÃO REGISTRADO NA CIP/FEBRABAN - NÃO EFETUAR PAGAMENTO',
      });
    }

    if (selectedTaxes.includes('COFINS') && valorCofins > 0) {
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
        codigoBarras: generateSimulationBarcode('DARF', valorCofins),
        linhaDigitavel: generateSimulationDigitableLine('DARF', valorCofins),
        status: 'A_VENCER',
        ambiente: 'HOMOLOGACAO_SIMULACAO',
        avisoLegal: 'DOCUMENTO DEMONSTRATIVO DE MEMÓRIA FISCAL - NÃO REGISTRADO NA CIP/FEBRABAN - NÃO EFETUAR PAGAMENTO',
      });
    }

    if (selectedTaxes.includes('IRPJ') && valorTotalIrpj > 0) {
      guias.push({
        id: `guia-irpj-${competencia.replace('/', '')}`,
        tipo: 'DARF',
        codigoReceita: '2089',
        descricao: `DARF IRPJ Lucro Presumido - Cód 2089 - Comp. ${competencia}`,
        competencia,
        dataVencimento: getNextDueDay(competencia, 30),
        valorPrincipal: valorTotalIrpj,
        multa: 0,
        juros: 0,
        valorTotal: valorTotalIrpj,
        codigoBarras: generateSimulationBarcode('DARF-IRPJ', valorTotalIrpj),
        linhaDigitavel: generateSimulationDigitableLine('DARF-IRPJ', valorTotalIrpj),
        status: 'A_VENCER',
        ambiente: 'HOMOLOGACAO_SIMULACAO',
        avisoLegal: 'DOCUMENTO DEMONSTRATIVO DE MEMÓRIA FISCAL - NÃO REGISTRADO NA CIP/FEBRABAN - NÃO EFETUAR PAGAMENTO',
      });
    }

    if (selectedTaxes.includes('CSLL') && valorCsll > 0) {
      guias.push({
        id: `guia-csll-${competencia.replace('/', '')}`,
        tipo: 'DARF',
        codigoReceita: '2372',
        descricao: `DARF CSLL Lucro Presumido - Cód 2372 - Comp. ${competencia}`,
        competencia,
        dataVencimento: getNextDueDay(competencia, 30),
        valorPrincipal: valorCsll,
        multa: 0,
        juros: 0,
        valorTotal: valorCsll,
        codigoBarras: generateSimulationBarcode('DARF-CSLL', valorCsll),
        linhaDigitavel: generateSimulationDigitableLine('DARF-CSLL', valorCsll),
        status: 'A_VENCER',
        ambiente: 'HOMOLOGACAO_SIMULACAO',
        avisoLegal: 'DOCUMENTO DEMONSTRATIVO DE MEMÓRIA FISCAL - NÃO REGISTRADO NA CIP/FEBRABAN - NÃO EFETUAR PAGAMENTO',
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
        saldoAnterior,
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
      irpj: {
        baseCalculo: faturamentoTotal,
        percentualPresuncao: percentualPresuncaoIrpj,
        baseTributavel: baseTributavelIrpj,
        aliquota: 15,
        valorApurado: valorIrpjBase,
        adicional10,
        valorTotalDevido: valorTotalIrpj,
      },
      csll: {
        baseCalculo: faturamentoTotal,
        percentualPresuncao: percentualPresuncaoCsll,
        baseTributavel: baseTributavelCsll,
        aliquota: 9,
        valorApurado: valorCsll,
      },
      iss: valorIss > 0 ? {
        baseCalculo: faturamentoTotal,
        aliquota: 3,
        valorApurado: valorIss,
      } : undefined,
      retencoes: totalRetido > 0 ? {
        baseCalculo: faturamentoTotal,
        crfRetido,
        irrfRetido,
        totalRetido,
      } : undefined,
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

/**
 * Gera representação de código de barras para ambiente de teste/demonstração.
 * Explicitamente demarcado para prevenir qualquer tentativa de leitura ou pagamento.
 */
function generateSimulationBarcode(tipo: string, valor: number): string {
  const vlr = Math.round(valor * 100).toString().padStart(10, '0');
  return `00000.SIMULACAO.DEMO.${tipo}.${vlr}`;
}

/**
 * Gera representação de linha digitável demarcada para simulação de homologação.
 * Deixa evidente em qualquer leitor ou conferência que o documento não é passível de liquidação financeira.
 */
function generateSimulationDigitableLine(tipo: string, valor: number): string {
  const vlr = Math.round(valor * 100).toString().padStart(10, '0');
  return `[SIMULACAO] ${tipo} DEMO-HOMOLOGACAO VLR: ${vlr} (NAO PAGAR)`;
}
