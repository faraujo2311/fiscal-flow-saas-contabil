import { Company, FiscalDocument, AccountingAccount, AccountingEntry, BalanceSheetReport } from '../types';
import { DreItem } from './accountingEngine';

export interface SpedValidationResult {
  valid: boolean;
  totalLines: number;
  warnings: string[];
  errors: string[];
  hash: string;
}

export function generateSpedEfdIcmsIpi(
  company: Company,
  competencia: string,
  documents: FiscalDocument[],
  contadorNome: string = 'Carlos Eduardo Silva',
  contadorCrc: string = 'CRC/SP 1SP234567/O-8'
): {
  txtContent: string;
  validation: SpedValidationResult;
} {
  const [mes, ano] = competencia.split('/');
  const dtIni = `01${mes}${ano}`;
  // Último dia do mês
  const lastDay = new Date(parseInt(ano, 10), parseInt(mes, 10), 0).getDate();
  const dtFin = `${lastDay < 10 ? '0' : ''}${lastDay}${mes}${ano}`;

  const cleanCnpj = company.cnpj.replace(/\D/g, '');
  const lines: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Bloco 0 - Abertura e Identificação
  // |0000|COD_VER|COD_FIN|DT_INI|DT_FIN|NOME|CNPJ|CPF|UF|IE|COD_MUN|IM|SUFRAMA|IND_PERFIL|IND_ATIV|
  lines.push(`|0000|018|0|${dtIni}|${dtFin}|${company.razaoSocial.toUpperCase()}|${cleanCnpj}||${company.uf}|${company.ie.replace(/\D/g, '') || ''}|3550308|||A|1|`);
  lines.push(`|0001|0|`); // Abertura do Bloco 0 (com dados)
  
  // |0100|Dados do Contabilista
  lines.push(`|0100|${contadorNome.toUpperCase()}|12345678900|${contadorCrc.replace(/\s+/g, '')}|12345678000190|04553900|AVENIDA DOS BANDEIRANTES|4500||VILA OLIMPIA|1134567890||contato@audicon.cnt.br|3550308|`);

  // Participantes únicos (Emitentes e Destinatários)
  const participantesMap = new Map<string, { cnpj: string; nome: string; uf: string; ie: string }>();
  for (const doc of documents) {
    if (doc.tipoOperacao === 'SAIDA') {
      participantesMap.set(doc.destinatarioCnpj, {
        cnpj: doc.destinatarioCnpj.replace(/\D/g, ''),
        nome: doc.destinatarioRazao,
        uf: doc.destinatarioUf,
        ie: '',
      });
    } else {
      participantesMap.set(doc.emitenteCnpj, {
        cnpj: doc.emitenteCnpj.replace(/\D/g, ''),
        nome: doc.emitenteRazao,
        uf: doc.emitenteUf,
        ie: '',
      });
    }
  }

  let partCod = 1;
  for (const [_, part] of participantesMap.entries()) {
    lines.push(`|0150|CLI_${partCod++}|${part.nome.toUpperCase()}|1058|${part.cnpj}||${part.ie}|3550308||RUA COMERCIAL|100||CENTRO|`);
  }

  lines.push(`|0990|${lines.length + 1}|`); // Encerramento Bloco 0

  // Bloco C - Documentos Fiscais I - Mercadorias (ICMS/IPI)
  const blocoCStartIdx = lines.length;
  lines.push(`|C001|0|`); // Abertura do Bloco C

  let totalDocsValidos = 0;
  for (const doc of documents) {
    if (doc.status !== 'NORMAL') continue;
    totalDocsValidos++;

    const indOper = doc.tipoOperacao === 'ENTRADA' ? '0' : '1';
    const indEmit = doc.tipoOperacao === 'ENTRADA' ? '1' : '0'; // 0=emissão própria, 1=terceiros
    const dtEmiClean = doc.dataEmissao.slice(0, 10).replace(/-/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$3$2$1');

    // |C100|IND_OPER|IND_EMIT|COD_PART|COD_MOD|COD_SIT|SER|NUM_DOC|CHV_NFE|DT_DOC|DT_E_S|VL_DOC|IND_PGTO|VL_DESC|VL_ABAT_NT|VL_MERC|IND_FRT|VL_FRT|VL_SEG|VL_OUT_DA|VL_BC_ICMS|VL_ICMS|VL_BC_ICMS_ST|VL_ICMS_ST|VL_IPI|VL_PIS|VL_COFINS|VL_PIS_ST|VL_COFINS_ST|
    const vlDoc = doc.valorTotalNota.toFixed(2).replace('.', ',');
    const vlMerc = doc.valorTotalProdutos.toFixed(2).replace('.', ',');
    const vlBcIcms = doc.impostos.baseIcms.toFixed(2).replace('.', ',');
    const vlIcms = doc.impostos.valorIcms.toFixed(2).replace('.', ',');
    const vlPis = doc.impostos.valorPis.toFixed(2).replace('.', ',');
    const vlCofins = doc.impostos.valorCofins.toFixed(2).replace('.', ',');

    lines.push(
      `|C100|${indOper}|${indEmit}|CLI_1|55|00|${doc.serie}|${doc.numero}|${doc.chaveAcesso}|${dtEmiClean}|${dtEmiClean}|${vlDoc}|0|0,00||${vlMerc}|0|0,00|0,00|0,00|${vlBcIcms}|${vlIcms}|0,00|0,00|0,00|${vlPis}|${vlCofins}|0,00|0,00|`
    );

    // Registro C190 - Consolidação da NF por CST/CFOP/Alíquota
    for (const item of doc.itens) {
      const itVl = item.valorTotal.toFixed(2).replace('.', ',');
      const itBcIcms = item.baseIcms.toFixed(2).replace('.', ',');
      const itIcms = item.valorIcms.toFixed(2).replace('.', ',');
      const itAliq = item.aliquotaIcms.toFixed(2).replace('.', ',');

      lines.push(
        `|C190|${item.cstIcms.padStart(3, '0')}|${item.cfop}|${itAliq}|${itVl}|${itBcIcms}|${itIcms}|0,00|0,00|0,00|0,00||`
      );
    }
  }

  const blocoCLength = lines.length - blocoCStartIdx + 1;
  lines.push(`|C990|${blocoCLength}|`);

  // Bloco 9 - Controle e Encerramento do Arquivo Digital
  const bloco9Start = lines.length;
  lines.push(`|9001|0|`);
  
  // Totalizadores de registros 9900
  lines.push(`|9900|0000|1|`);
  lines.push(`|9900|0001|1|`);
  lines.push(`|9900|0100|1|`);
  lines.push(`|9900|0150|${participantesMap.size}|`);
  lines.push(`|9900|0990|1|`);
  lines.push(`|9900|C001|1|`);
  lines.push(`|9900|C100|${totalDocsValidos}|`);
  lines.push(`|9900|C190|${documents.reduce((acc, d) => acc + d.itens.length, 0)}|`);
  lines.push(`|9900|C990|1|`);
  lines.push(`|9900|9001|1|`);
  lines.push(`|9900|9900|13|`);
  lines.push(`|9900|9990|1|`);
  lines.push(`|9900|9999|1|`);
  lines.push(`|9990|15|`);
  
  const totalGeralLinhas = lines.length + 1;
  lines.push(`|9999|${totalGeralLinhas}|`);

  const txtContent = lines.join('\r\n') + '\r\n';

  // Validação
  if (totalDocsValidos === 0) {
    warnings.push('Nenhum documento fiscal válido encontrado para a competência selecionada.');
  }

  const hash = `SPED-${cleanCnpj.slice(0, 8)}-${ano}${mes}-${Math.abs(hashString(txtContent)).toString(16).toUpperCase()}`;

  return {
    txtContent,
    validation: {
      valid: errors.length === 0,
      totalLines: totalGeralLinhas,
      warnings,
      errors,
      hash,
    }
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Fase 2: Gerador Oficial do SPED Contábil (ECD - Escrituração Contábil Digital)
 * Conforme Manual de Orientação do Leiaute da ECD (Leiaute 9.00 / Bloco 0, I, J e 9)
 */
export function generateSpedEcd(
  company: Company,
  competencia: string,
  accounts: AccountingAccount[],
  entries: AccountingEntry[],
  balanceSheet?: BalanceSheetReport,
  dreRows?: DreItem[],
  contadorNome: string = 'Carlos Eduardo Silva',
  contadorCrc: string = 'CRC/SP 1SP234567/O-8'
): {
  txtContent: string;
  validation: SpedValidationResult;
} {
  const [mes, ano] = competencia.split('/');
  const dtIni = `0101${ano}`; // Exercício fiscal anual ou fracionado
  const lastDay = new Date(parseInt(ano, 10), parseInt(mes, 10), 0).getDate();
  const dtFin = `${lastDay < 10 ? '0' : ''}${lastDay}${mes}${ano}`;

  const cleanCnpj = company.cnpj.replace(/\D/g, '');
  const lines: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const regCounts: Record<string, number> = {};

  const addLine = (reg: string, content: string) => {
    lines.push(content);
    regCounts[reg] = (regCounts[reg] || 0) + 1;
  };

  // ==========================================
  // BLOCO 0: Abertura, Identificação e Referências
  // ==========================================
  const b0Start = lines.length;
  // |0000|LECD|DT_INI|DT_FIN|NOME_EMPR|CNPJ|UF|IE|COD_MUN|IM|IND_SIT_ESP|IND_SIT_INI_PER|IND_EXIST_CART|IND_EMP_GRD_PRT|IND_MODALIDADE|
  addLine('0000', `|0000|LECD|${dtIni}|${dtFin}|${company.razaoSocial.toUpperCase()}|${cleanCnpj}|${company.uf}|${company.ie.replace(/\D/g, '') || ''}|3550308||0|0|0|0|0|||`);
  addLine('0001', `|0001|0|`);
  addLine('0007', `|0007|00|`);

  // Participantes dos lançamentos
  addLine('0150', `|0150|PART_001|AUDICON CONTABILIDADE ESTRATEGICA LTDA|1058|12345678000190||SP||3550308||AV DOS BANDEIRANTES|4500|`);
  addLine('0990', `|0990|${lines.length - b0Start + 1}|`);

  // ==========================================
  // BLOCO I: Lançamentos Contábeis (Diário Geral)
  // ==========================================
  const biStart = lines.length;
  addLine('I001', `|I001|0|`);
  addLine('I010', `|I010|G|9.00|`); // Livro G (Diário Geral), Leiaute 9.00
  addLine('I030', `|I030|TERMO DE ABERTURA|1|LIVRO DIÁRIO GERAL|1000|${company.razaoSocial.toUpperCase()}|35299999999|${cleanCnpj}|${dtIni}||${company.cidade.toUpperCase()}|${dtIni}|`);

  // I050: Plano de Contas Completo
  const sortedAccounts = [...accounts].sort((a, b) => a.codigo.localeCompare(b.codigo));
  for (const acc of sortedAccounts) {
    let codNat = '04';
    if (acc.categoria === 'ATIVO') codNat = '01';
    else if (acc.categoria === 'PASSIVO') codNat = '02';
    else if (acc.categoria === 'PATRIMONIO_LIQUIDO') codNat = '03';

    const indCta = acc.tipo === 'SINTETICA' ? 'S' : 'A';
    const codSup = acc.contaPaiCodigo || '';
    addLine('I050', `|I050|${dtIni}|${codNat}|${indCta}|${acc.nivel}|${acc.codigo}|${codSup}|${acc.nome.toUpperCase()}|`);

    // I051: Mapeamento com Plano de Contas Referencial RFB
    if (acc.codigoReferencialECD && acc.tipo === 'ANALITICA') {
      addLine('I051', `|I051|10||${acc.codigoReferencialECD}|`);
    }
  }

  // I150 e I155: Saldos Periódicos e Balancete
  addLine('I150', `|I150|${dtIni}|${dtFin}|`);
  for (const acc of sortedAccounts) {
    if (acc.tipo === 'ANALITICA') {
      const indDcIni = acc.natureza === 'DEVEDORA' ? 'D' : 'C';
      const sldIni = acc.saldoInicial.toFixed(2).replace('.', ',');
      const sldFin = acc.saldoAtual.toFixed(2).replace('.', ',');
      addLine('I155', `|I155|${acc.codigo}||${sldIni}|${indDcIni}|0,00|0,00|${sldFin}|${indDcIni}|`);
    }
  }

  // I200 e I250: Lançamentos em Partidas Dobradas
  const compEntries = entries.filter(e => e.competencia === competencia || entries.length <= 10);
  let totalDebitosI200 = 0;
  let totalCreditosI200 = 0;

  for (const entry of compEntries) {
    const dtLcto = entry.data.replace(/-/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$3$2$1');
    const vlLcto = entry.totalDebito.toFixed(2).replace('.', ',');
    const indLcto = entry.origemTipo === 'ENCERRAMENTO' ? 'E' : 'N';

    addLine('I200', `|I200|${entry.numero}|${dtLcto}|${vlLcto}|${indLcto}|`);

    for (const line of entry.linhas) {
      const vlDc = line.valor.toFixed(2).replace('.', ',');
      const indDc = line.tipo === 'DEBITO' ? 'D' : 'C';
      if (line.tipo === 'DEBITO') totalDebitosI200 += line.valor;
      else totalCreditosI200 += line.valor;

      addLine('I250', `|I250|${line.contaCodigo}||${vlDc}|${indDc}|||${entry.historicoPadrao.slice(0, 100)}||`);
    }
  }

  addLine('I990', `|I990|${lines.length - biStart + 1}|`);

  // ==========================================
  // BLOCO J: Demonstrações Contábeis Oficiais
  // ==========================================
  const bjStart = lines.length;
  addLine('J001', `|J001|0|`);
  addLine('J005', `|J005|${dtIni}|${dtFin}|1|BALANÇO PATRIMONIAL E DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO|`);

  // J100: Balanço Patrimonial (Linhas do Ativo, Passivo e PL)
  if (balanceSheet) {
    // Ativo
    addLine('J100', `|J100|1|S|1||ATIVO TOTAL|${balanceSheet.totalAtivo.toFixed(2).replace('.', ',')}|D|`);
    addLine('J100', `|J100|1.1|S|2|1|ATIVO CIRCULANTE|${balanceSheet.subtotalAtivoCirculante.toFixed(2).replace('.', ',')}|D|`);
    for (const item of balanceSheet.ativoCirculante) {
      addLine('J100', `|J100|${item.codigo}|${item.tipo === 'SINTETICA' ? 'S' : 'A'}|${item.nivel}|1.1|${item.nome.toUpperCase()}|${item.saldo.toFixed(2).replace('.', ',')}|D|`);
    }
    addLine('J100', `|J100|1.2|S|2|1|ATIVO NÃO CIRCULANTE|${balanceSheet.subtotalAtivoNaoCirculante.toFixed(2).replace('.', ',')}|D|`);
    for (const item of balanceSheet.ativoNaoCirculante) {
      addLine('J100', `|J100|${item.codigo}|${item.tipo === 'SINTETICA' ? 'S' : 'A'}|${item.nivel}|1.2|${item.nome.toUpperCase()}|${item.saldo.toFixed(2).replace('.', ',')}|D|`);
    }

    // Passivo e PL
    addLine('J100', `|J100|2|S|1||PASSIVO E PATRIMÔNIO LÍQUIDO|${balanceSheet.totalPassivoEPatrimonioLiquido.toFixed(2).replace('.', ',')}|C|`);
    addLine('J100', `|J100|2.1|S|2|2|PASSIVO CIRCULANTE|${balanceSheet.subtotalPassivoCirculante.toFixed(2).replace('.', ',')}|C|`);
    for (const item of balanceSheet.passivoCirculante) {
      addLine('J100', `|J100|${item.codigo}|${item.tipo === 'SINTETICA' ? 'S' : 'A'}|${item.nivel}|2.1|${item.nome.toUpperCase()}|${item.saldo.toFixed(2).replace('.', ',')}|C|`);
    }
    addLine('J100', `|J100|2.3|S|2|2|PATRIMÔNIO LÍQUIDO|${balanceSheet.subtotalPatrimonioLiquido.toFixed(2).replace('.', ',')}|C|`);
    for (const item of balanceSheet.patrimonioLiquido) {
      addLine('J100', `|J100|${item.codigo}|${item.tipo === 'SINTETICA' ? 'S' : 'A'}|${item.nivel}|2.3|${item.nome.toUpperCase()}|${item.saldo.toFixed(2).replace('.', ',')}|C|`);
    }
  }

  // J150: Demonstração do Resultado do Exercício (DRE)
  if (dreRows && dreRows.length > 0) {
    let nuOrdem = 1;
    for (const row of dreRows) {
      const indVl = row.valor >= 0 ? 'P' : 'N';
      addLine('J150', `|J150|${nuOrdem++}|${row.id}|S|${row.nivel}||${row.descricao.toUpperCase()}|${Math.abs(row.valor).toFixed(2).replace('.', ',')}|${indVl}|`);
    }
  }

  // J900 e J930: Termo de Encerramento e Signatários
  addLine('J900', `|J900|TERMO DE ENCERRAMENTO|1|LIVRO DIÁRIO GERAL|${company.razaoSocial.toUpperCase()}|35299999999|${cleanCnpj}|${dtIni}|${dtFin}|`);
  // Signatário 1: Diretor da Empresa
  addLine('J930', `|J930|MARCOS VINICIUS ANDRADE|12345678901|DIRETOR ADMINISTRATIVO|206||diretoria@${company.razaoSocial.toLowerCase().replace(/\s+/g, '')}.com.br|1133334444||||`);
  // Signatário 2: Contabilista Responsável
  addLine('J930', `|J930|${contadorNome.toUpperCase()}|98765432100|CONTADOR|900|${contadorCrc.replace(/\s+/g, '')}|crc@audicon.cnt.br|1134567890|SP|001234|${dtIni}|`);
  addLine('J990', `|J990|${lines.length - bjStart + 1}|`);

  // ==========================================
  // BLOCO 9: Controle e Encerramento do Arquivo
  // ==========================================
  const b9Start = lines.length;
  addLine('9001', `|9001|0|`);

  // Registrar todos os blocos no 9900
  // Note: 9900 will also count itself and 9990 and 9999
  const uniqueTags = Object.keys(regCounts);
  uniqueTags.push('9900');
  uniqueTags.push('9990');
  uniqueTags.push('9999');

  for (const tag of Object.keys(regCounts)) {
    addLine('9900', `|9900|${tag}|${regCounts[tag]}|`);
  }
  // Total of 9900 records is uniqueTags.length
  addLine('9900', `|9900|9900|${uniqueTags.length}|`);
  addLine('9900', `|9900|9990|1|`);
  addLine('9900', `|9900|9999|1|`);
  addLine('9990', `|9990|${lines.length - b9Start + 2}|`);

  const totalGeralLinhas = lines.length + 1;
  addLine('9999', `|9999|${totalGeralLinhas}|`);

  const txtContent = lines.join('\r\n') + '\r\n';

  // Auditoria e Validações Regulatórias
  if (Math.abs(totalDebitosI200 - totalCreditosI200) > 0.05) {
    errors.push(`Desbalanceamento detectado nos lançamentos contábeis I200/I250: Total Débitos (R$ ${totalDebitosI200.toFixed(2)}) ≠ Total Créditos (R$ ${totalCreditosI200.toFixed(2)}).`);
  }

  if (balanceSheet && !balanceSheet.equilibrado) {
    errors.push(`Balanço Patrimonial J100 desbalanceado: Ativo Total ≠ Passivo + PL (Diferença: R$ ${balanceSheet.diferenca.toFixed(2)}).`);
  }

  if (compEntries.length === 0) {
    warnings.push('Nenhum lançamento contábil processado na competência.');
  }

  const hash = `ECD-${cleanCnpj.slice(0, 8)}-${ano}${mes}-${Math.abs(hashString(txtContent)).toString(16).toUpperCase()}`;

  return {
    txtContent,
    validation: {
      valid: errors.length === 0,
      totalLines: totalGeralLinhas,
      warnings,
      errors,
      hash,
    }
  };
}
