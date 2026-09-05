import { FiscalDocument, FiscalItem, FiscalTaxBreakdown } from '../types';

export interface ParseXmlResult {
  success: boolean;
  document?: FiscalDocument;
  error?: string;
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
        error: `Estrutura XML inválida: ${parserError.textContent?.slice(0, 120)}`
      };
    }

    // Try finding NFe or CTe
    const infNFe = xmlDoc.querySelector('infNFe');
    const infCte = xmlDoc.querySelector('infCte');

    if (!infNFe && !infCte) {
      return {
        success: false,
        error: 'Arquivo XML não contém tag raiz <infNFe> ou <infCte> reconhecida pelo padrão SEFAZ.'
      };
    }

    if (infNFe) {
      const idAttr = infNFe.getAttribute('Id') || '';
      const rawChave = idAttr.replace(/^NFe/, '').trim();
      const chaveAcesso = rawChave || `3526${Date.now()}${Math.floor(Math.random() * 1000000000000000)}`;

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

      // Total values
      const total = infNFe.querySelector('total ICMSTot');
      const vNF = parseFloat(total?.querySelector('vNF')?.textContent || '0');
      const vProd = parseFloat(total?.querySelector('vProd')?.textContent || '0');
      const vFrete = parseFloat(total?.querySelector('vFrete')?.textContent || '0');
      const vSeg = parseFloat(total?.querySelector('vSeg')?.textContent || '0');
      const vDesc = parseFloat(total?.querySelector('vDesc')?.textContent || '0');
      const vOutro = parseFloat(total?.querySelector('vOutro')?.textContent || '0');

      // Impostos Totais
      const vBC = parseFloat(total?.querySelector('vBC')?.textContent || '0');
      const vICMS = parseFloat(total?.querySelector('vICMS')?.textContent || '0');
      const vBCST = parseFloat(total?.querySelector('vBCST')?.textContent || '0');
      const vST = parseFloat(total?.querySelector('vST')?.textContent || '0');
      const vIPI = parseFloat(total?.querySelector('vIPI')?.textContent || '0');
      const vPIS = parseFloat(total?.querySelector('vPIS')?.textContent || '0');
      const vCOFINS = parseFloat(total?.querySelector('vCOFINS')?.textContent || '0');

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
        const qCom = parseFloat(prod?.querySelector('qCom')?.textContent || '1');
        const vUnCom = parseFloat(prod?.querySelector('vUnCom')?.textContent || '0');
        const vProdItem = parseFloat(prod?.querySelector('vProd')?.textContent || '0');

        // Imposto do Item
        const icmsNode = det.querySelector('imposto ICMS');
        const firstIcmsChild = icmsNode?.firstElementChild;
        const cstIcms = firstIcmsChild?.querySelector('CST')?.textContent || firstIcmsChild?.querySelector('CSOSN')?.textContent || '00';
        const itemVBC = parseFloat(firstIcmsChild?.querySelector('vBC')?.textContent || '0');
        const itemPICMS = parseFloat(firstIcmsChild?.querySelector('pICMS')?.textContent || '0');
        const itemVICMS = parseFloat(firstIcmsChild?.querySelector('vICMS')?.textContent || '0');

        const pisNode = det.querySelector('imposto PIS');
        const firstPisChild = pisNode?.firstElementChild;
        const cstPis = firstPisChild?.querySelector('CST')?.textContent || '01';
        const itemVBCPis = parseFloat(firstPisChild?.querySelector('vBC')?.textContent || String(vProdItem));
        const itemPPIS = parseFloat(firstPisChild?.querySelector('pPIS')?.textContent || '0.65');
        const itemVPIS = parseFloat(firstPisChild?.querySelector('vPIS')?.textContent || '0');

        const cofinsNode = det.querySelector('imposto COFINS');
        const firstCofinsChild = cofinsNode?.firstElementChild;
        const cstCofins = firstCofinsChild?.querySelector('CST')?.textContent || '01';
        const itemVBCCofins = parseFloat(firstCofinsChild?.querySelector('vBC')?.textContent || String(vProdItem));
        const itemPCOFINS = parseFloat(firstCofinsChild?.querySelector('pCOFINS')?.textContent || '3.00');
        const itemVCOFINS = parseFloat(firstCofinsChild?.querySelector('vCOFINS')?.textContent || '0');

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
