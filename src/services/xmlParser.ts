import { FiscalDocument, FiscalItem, FiscalTaxBreakdown } from '../types';

export interface ParseXmlResult {
  success: boolean;
  document?: FiscalDocument;
  error?: string;
}

/**
 * Calcula o Dígito Verificador (DV) da chave de acesso da NF-e (44º dígito)
 * através do algoritmo oficial da SEFAZ (Módulo 11, pesos de 2 a 9 da direita para a esquerda).
 */
export function calcularDvNFe(chave43: string): number {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let pesoIdx = 0;

  for (let i = chave43.length - 1; i >= 0; i--) {
    const digito = parseInt(chave43[i], 10);
    soma += digito * pesos[pesoIdx];
    pesoIdx = (pesoIdx + 1) % pesos.length;
  }

  const resto = soma % 11;
  return (resto === 0 || resto === 1) ? 0 : 11 - resto;
}

/**
 * Valida se a chave de acesso possui 44 dígitos numéricos e se o DV confere com o Módulo 11.
 */
export function validarChaveAcessoNFe(chave: string): { valido: boolean; motivo?: string; dvCalculado?: number; dvInformado?: number } {
  const clean = chave.replace(/\D/g, '');
  if (clean.length !== 44) {
    return {
      valido: false,
      motivo: `Chave possui ${clean.length} dígitos numéricos. O padrão SEFAZ exige exatamente 44 dígitos.`
    };
  }

  const chave43 = clean.slice(0, 43);
  const dvInformado = parseInt(clean[43], 10);
  const dvCalculado = calcularDvNFe(chave43);

  if (dvInformado !== dvCalculado) {
    return {
      valido: false,
      motivo: `Dígito Verificador inconsistente: informado [${dvInformado}], calculado pelo Módulo 11 [${dvCalculado}].`,
      dvCalculado,
      dvInformado
    };
  }

  return { valido: true, dvCalculado, dvInformado };
}

/**
 * Conversão segura de valores monetários com arredondamento preciso de centavos (2 casas decimais)
 * prevenindo imperfeições de ponto flutuante binário (IEEE 754).
 */
function parseCurrency(val: string | null | undefined): number {
  if (!val) return 0;
  const num = parseFloat(val.trim());
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function parseFiscalXml(
  xmlContent: string, 
  tenantId: string, 
  companyId: string, 
  competencia: string,
  existingKeys: string[] = []
): ParseXmlResult {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parse errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        error: `Estrutura XML corrompida ou inválida: ${parserError.textContent?.slice(0, 120)}`
      };
    }

    // Try finding NFe or CTe
    const infNFe = xmlDoc.querySelector('infNFe');
    const infCte = xmlDoc.querySelector('infCte');

    if (!infNFe && !infCte) {
      return {
        success: false,
        error: 'Arquivo XML rejeitado: Não contém a tag raiz <infNFe> ou <infCte> preconizada pelo manual da SEFAZ.'
      };
    }

    if (infNFe) {
      const idAttr = infNFe.getAttribute('Id') || '';
      const rawChave = idAttr.replace(/^NFe/, '').trim();

      // NUNCA inventar chave de acesso: exigir chave real de 44 dígitos
      if (!rawChave) {
        return {
          success: false,
          error: 'Arquivo XML rejeitado: Atributo "Id" ausente ou vazio na tag <infNFe>. Chaves de acesso não podem ser inventadas arbitrariamente.'
        };
      }

      const validacaoChave = validarChaveAcessoNFe(rawChave);
      if (!validacaoChave.valido) {
        return {
          success: false,
          error: `Arquivo XML rejeitado: Chave de acesso inválida (${rawChave}). ${validacaoChave.motivo}`
        };
      }

      const chaveAcesso = rawChave;

      // Deduplication check
      if (existingKeys.includes(chaveAcesso)) {
        return {
          success: false,
          error: `Deduplicação: Chave de acesso [${chaveAcesso}] já importada para esta empresa!`
        };
      }

      // Identification
      const ide = infNFe.querySelector('ide');
      const mod = ide?.querySelector('mod')?.textContent?.trim() || '55';
      const serie = ide?.querySelector('serie')?.textContent?.trim() || '1';
      const nNF = ide?.querySelector('nNF')?.textContent?.trim() || '0000';
      const dhEmi = ide?.querySelector('dhEmi')?.textContent?.trim() || new Date().toISOString();
      const natOp = ide?.querySelector('natOp')?.textContent?.trim() || 'OPERAÇÃO COMERCIAL';
      const tpNF = ide?.querySelector('tpNF')?.textContent?.trim() || '1'; // 0=Entrada, 1=Saída

      // Emitente
      const emit = infNFe.querySelector('emit');
      const emitCnpj = emit?.querySelector('CNPJ')?.textContent?.trim() || emit?.querySelector('CPF')?.textContent?.trim() || '00.000.000/0000-00';
      const emitRazao = emit?.querySelector('xNome')?.textContent?.trim() || 'EMITENTE NÃO INFORMADO';
      const emitUf = emit?.querySelector('enderEmit UF')?.textContent?.trim() || 'SP';

      // Destinatario
      const dest = infNFe.querySelector('dest');
      const destCnpj = dest?.querySelector('CNPJ')?.textContent?.trim() || dest?.querySelector('CPF')?.textContent?.trim() || 'CONSUMIDOR FINAL';
      const destRazao = dest?.querySelector('xNome')?.textContent?.trim() || 'CONSUMIDOR / DESTINATÁRIO';
      const destUf = dest?.querySelector('enderDest UF')?.textContent?.trim() || 'SP';

      // Total values com arredondamento monetário preciso
      const total = infNFe.querySelector('total ICMSTot');
      const vNF = parseCurrency(total?.querySelector('vNF')?.textContent);
      const vProd = parseCurrency(total?.querySelector('vProd')?.textContent);
      const vFrete = parseCurrency(total?.querySelector('vFrete')?.textContent);
      const vSeg = parseCurrency(total?.querySelector('vSeg')?.textContent);
      const vDesc = parseCurrency(total?.querySelector('vDesc')?.textContent);
      const vOutro = parseCurrency(total?.querySelector('vOutro')?.textContent);

      // Impostos Totais
      const vBC = parseCurrency(total?.querySelector('vBC')?.textContent);
      const vICMS = parseCurrency(total?.querySelector('vICMS')?.textContent);
      const vBCST = parseCurrency(total?.querySelector('vBCST')?.textContent);
      const vST = parseCurrency(total?.querySelector('vST')?.textContent);
      const vIPI = parseCurrency(total?.querySelector('vIPI')?.textContent);
      const vPIS = parseCurrency(total?.querySelector('vPIS')?.textContent);
      const vCOFINS = parseCurrency(total?.querySelector('vCOFINS')?.textContent);

      const impostos: FiscalTaxBreakdown = {
        baseIcms: vBC,
        valorIcms: vICMS,
        baseIcmsSt: vBCST,
        valorIcmsSt: vST,
        baseIpi: 0,
        valorIpi: vIPI,
        basePis: vBC > 0 ? vBC : vProd,
        valorPis: vPIS,
        baseCofins: vBC > 0 ? vBC : vProd,
        valorCofins: vCOFINS,
      };

      // Detalhes dos Itens
      const detElements = infNFe.querySelectorAll('det');
      const itens: FiscalItem[] = [];

      detElements.forEach((det, idx) => {
        const nItem = parseInt(det.getAttribute('nItem') || String(idx + 1), 10);
        const prod = det.querySelector('prod');
        const cProd = prod?.querySelector('cProd')?.textContent?.trim() || `ITEM-${nItem}`;
        const xProd = prod?.querySelector('xProd')?.textContent?.trim() || 'Produto / Mercadoria';
        const ncm = prod?.querySelector('NCM')?.textContent?.trim() || '00000000';
        const cfop = prod?.querySelector('CFOP')?.textContent?.trim() || (tpNF === '1' ? '5102' : '1102');
        const uCom = prod?.querySelector('uCom')?.textContent?.trim() || 'UN';
        const qCom = parseCurrency(prod?.querySelector('qCom')?.textContent) || 1;
        const vUnCom = parseCurrency(prod?.querySelector('vUnCom')?.textContent);
        const vProdItem = parseCurrency(prod?.querySelector('vProd')?.textContent);

        // Imposto do Item
        const icmsNode = det.querySelector('imposto ICMS');
        const firstIcmsChild = icmsNode?.firstElementChild;
        const cstIcms = firstIcmsChild?.querySelector('CST')?.textContent || firstIcmsChild?.querySelector('CSOSN')?.textContent || '00';
        const itemVBC = parseCurrency(firstIcmsChild?.querySelector('vBC')?.textContent);
        const itemPICMS = parseCurrency(firstIcmsChild?.querySelector('pICMS')?.textContent);
        const itemVICMS = parseCurrency(firstIcmsChild?.querySelector('vICMS')?.textContent);

        const pisNode = det.querySelector('imposto PIS');
        const firstPisChild = pisNode?.firstElementChild;
        const cstPis = firstPisChild?.querySelector('CST')?.textContent || '01';
        const itemVBCPis = parseCurrency(firstPisChild?.querySelector('vBC')?.textContent) || vProdItem;
        const itemPPIS = parseCurrency(firstPisChild?.querySelector('pPIS')?.textContent) || 0.65;
        const itemVPIS = parseCurrency(firstPisChild?.querySelector('vPIS')?.textContent);

        const cofinsNode = det.querySelector('imposto COFINS');
        const firstCofinsChild = cofinsNode?.firstElementChild;
        const cstCofins = firstCofinsChild?.querySelector('CST')?.textContent || '01';
        const itemVBCCofins = parseCurrency(firstCofinsChild?.querySelector('vBC')?.textContent) || vProdItem;
        const itemPCOFINS = parseCurrency(firstCofinsChild?.querySelector('pCOFINS')?.textContent) || 3.00;
        const itemVCOFINS = parseCurrency(firstCofinsChild?.querySelector('vCOFINS')?.textContent);

        itens.push({
          id: `item-${Date.now()}-${idx}`,
          numeroItem: nItem,
          codigoProduto: cProd,
          descricao: xProd,
          ncm,
          cfop,
          unidade: uCom,
          quantidade: qCom,
          valorUnitario: vUnCom,
          valorTotal: vProdItem,
          cstIcms,
          baseIcms: itemVBC,
          aliquotaIcms: itemPICMS,
          valorIcms: itemVICMS,
          cstPis,
          basePis: itemVBCPis,
          aliquotaPis: itemPPIS,
          valorPis: itemVPIS,
          cstCofins,
          baseCofins: itemVBCCofins,
          aliquotaCofins: itemPCOFINS,
          valorCofins: itemVCOFINS,
          contabilizado: false,
        });
      });

      const fiscalDoc: FiscalDocument = {
        id: `fdoc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenantId,
        companyId,
        competencia,
        chaveAcesso,
        tipoDoc: mod === '65' ? 'NFCE' : 'NFE',
        modelo: mod,
        serie,
        numero: nNF,
        dataEmissao: dhEmi,
        dataEntradaSaida: dhEmi,
        naturezaOperacao: natOp,
        tipoOperacao: tpNF === '1' ? 'SAIDA' : 'ENTRADA',
        status: 'NORMAL',
        emitenteCnpj: formatCnpjCpf(emitCnpj),
        emitenteRazao: emitRazao,
        emitenteUf: emitUf,
        destinatarioCnpj: formatCnpjCpf(destCnpj),
        destinatarioRazao: destRazao,
        destinatarioUf: destUf,
        valorTotalProdutos: vProd || vNF,
        valorFrete: vFrete,
        valorSeguro: vSeg,
        valorDesconto: vDesc,
        valorOutrasDespesas: vOutro,
        valorTotalNota: vNF || vProd,
        impostos,
        itens,
        importadoEm: new Date().toISOString(),
        arquivoOriginalNome: `NFe_${chaveAcesso}.xml`,
        statusContabilizacao: 'PENDENTE',
        xmlRaw: xmlContent,
      };

      return {
        success: true,
        document: fiscalDoc
      };
    }

    return {
      success: false,
      error: 'Formato de XML não suportado (apenas NF-e e NFC-e no momento).'
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Falha ao processar arquivo XML: ${err?.message || err}`
    };
  }
}

function formatCnpjCpf(val: string): string {
  const clean = val.replace(/\D/g, '');
  if (clean.length === 14) {
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (clean.length === 11) {
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return val;
}
