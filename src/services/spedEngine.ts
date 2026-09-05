import { Company, FiscalDocument } from '../types';

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
