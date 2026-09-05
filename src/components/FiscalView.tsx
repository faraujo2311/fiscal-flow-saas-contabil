import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Check, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Info,
  Search,
  Filter
} from 'lucide-react';
import { FiscalDocument, Company } from '../types';
import { parseFiscalXml } from '../services/xmlParser';
import { sampleFiscalXmls } from '../data/initialData';

interface FiscalViewProps {
  company: Company;
  competencia: string;
  documents: FiscalDocument[];
  onImportDocument: (doc: FiscalDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onJournalizeDocument: (doc: FiscalDocument) => void;
}

export const FiscalView: React.FC<FiscalViewProps> = ({
  company,
  competencia,
  documents,
  onImportDocument,
  onDeleteDocument,
  onJournalizeDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<FiscalDocument | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });
  const [filterOp, setFilterOp] = useState<'ALL' | 'SAIDA' | 'ENTRADA'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compDocs = documents.filter(d => d.companyId === company.id);
  const existingKeys = compDocs.map(d => d.chaveAcesso);

  // Filtragem
  const filteredDocs = compDocs.filter(d => {
    if (filterOp !== 'ALL' && d.tipoOperacao !== filterOp) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchNumber = d.numero.toLowerCase().includes(term);
      const matchKey = d.chaveAcesso.toLowerCase().includes(term);
      const matchEmit = d.emitenteRazao.toLowerCase().includes(term);
      const matchDest = d.destinatarioRazao.toLowerCase().includes(term);
      if (!matchNumber && !matchKey && !matchEmit && !matchDest) return false;
    }
    return true;
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let importedCount = 0;
    let errors: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const res = parseFiscalXml(content, company.tenantId, company.id, competencia, existingKeys);
          if (res.success && res.document) {
            onImportDocument(res.document);
            importedCount++;
            setImportStatus({
              type: 'success',
              message: `Arquivo ${file.name} importado e normalizado com sucesso! (Chave: ${res.document.chaveAcesso.slice(0, 16)}...)`
            });
          } else {
            errors.push(`${file.name}: ${res.error}`);
            setImportStatus({
              type: 'error',
              message: errors.join(' | ')
            });
          }
        }
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = (sample: typeof sampleFiscalXmls[0]) => {
    const res = parseFiscalXml(sample.xmlContent, company.tenantId, company.id, competencia, existingKeys);
    if (res.success && res.document) {
      onImportDocument(res.document);
      setImportStatus({
        type: 'success',
        message: `Amostra oficial carregada com sucesso! NF-e nº ${res.document.numero} (${res.document.tipoOperacao})`
      });
    } else {
      setImportStatus({
        type: 'error',
        message: res.error || 'Falha ao carregar amostra'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo Fiscal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Módulo Fiscal: Recepção, Validação e Normalização de XMLs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suporte oficial a NF-e (mod 55), NFC-e (mod 65) e CT-e. Deduplicação automática de chaves e extração estruturada de impostos.
          </p>
        </div>

        {/* Botão de Upload */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            accept=".xml"
            multiple
            className="hidden"
            id="xml-file-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload XML (Unitário ou Lote)
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Importação */}
      {importStatus.type !== 'idle' && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all shadow-xs ${
          importStatus.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{importStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportStatus({ type: 'idle', message: '' })}
            className="text-xs underline font-semibold opacity-80 hover:opacity-100 ml-3 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Área de Drag and Drop & Amostras de Teste Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zona de Arraste de Arquivos */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="lg:col-span-2 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-xs group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-sm font-bold text-slate-800">
            Arraste arquivos XML aqui ou clique para selecionar
          </div>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md leading-relaxed">
            Importação em lote suportada. O sistema analisa tags de produtos, CFOP, CST, bases e alíquotas de ICMS, PIS e COFINS automaticamente.
          </p>
        </div>

        {/* Painel de Amostras para Demonstração Imediata */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-blue-600" />
              Amostras Oficiais para Teste
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Teste o fluxo instantaneamente com NF-es padrão SEFAZ preparadas:
            </p>
            <div className="space-y-2.5">
              {sampleFiscalXmls.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(s)}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-xs transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>{idx === 0 ? 'NF-e Saída (Venda)' : 'NF-e Entrada (Compra)'}</span>
                    <span className="text-[10px] bg-blue-100/70 text-blue-800 font-semibold px-2 py-0.5 rounded-full">1-clique</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">
                    {s.descricao}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-4 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Deduplicação ativada: rejeita notas já existentes nesta empresa.
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por número, razão ou chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterOp('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterOp === 'ALL' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({compDocs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterOp('SAIDA')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filterOp === 'SAIDA' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              Saídas
            </button>
            <button
              type="button"
              onClick={() => setFilterOp('ENTRADA')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filterOp === 'ENTRADA' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3 text-blue-600" />
              Entradas
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-auto font-medium">
          Exibindo <strong className="text-slate-800">{filteredDocs.length}</strong> de <strong className="text-slate-800">{compDocs.length}</strong> documentos
        </div>
      </div>

      {/* Tabela de Documentos Fiscais */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Nenhum documento encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-3 px-4">Operação / Nº</th>
                  <th className="py-3 px-4">Chave de Acesso</th>
                  <th className="py-3 px-4">Emissão</th>
                  <th className="py-3 px-4">Participante</th>
                  <th className="py-3 px-4 text-right">Vlr. Produtos</th>
                  <th className="py-3 px-4 text-right">ICMS</th>
                  <th className="py-3 px-4 text-right">PIS/COFINS</th>
                  <th className="py-3 px-4 text-right">Valor Total NF</th>
                  <th className="py-3 px-4 text-center">Status Contábil</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredDocs.map((doc) => {
                  const isSaida = doc.tipoOperacao === 'SAIDA';
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-bold">
                          {isSaida ? (
                            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div>
                            <span className="text-slate-800">{doc.tipoDoc} {doc.numero}</span>
                            <div className="text-[10px] text-slate-400 font-normal">Série {doc.serie}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span title={doc.chaveAcesso}>
                            {doc.chaveAcesso.slice(0, 6)}...{doc.chaveAcesso.slice(-6)}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(doc.chaveAcesso)}
                            title="Copiar chave de acesso"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {copiedKey === doc.chaveAcesso ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate" title={isSaida ? doc.destinatarioRazao : doc.emitenteRazao}>
                        <div className="font-semibold text-slate-800 truncate">
                          {isSaida ? doc.destinatarioRazao : doc.emitenteRazao}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {isSaida ? doc.destinatarioCnpj : doc.emitenteCnpj}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600">
                        {doc.valorTotalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        {doc.impostos.valorIcms > 0 ? (
                          <span>{doc.impostos.valorIcms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        {(doc.impostos.valorPis + doc.impostos.valorCofins) > 0 ? (
                          <span>{(doc.impostos.valorPis + doc.impostos.valorCofins).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {doc.valorTotalNota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.statusContabilizacao === 'CONTABILIZADO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {doc.statusContabilizacao}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(doc)}
                            title="Ver detalhes da nota e itens"
                            className="p-1.5 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {doc.statusContabilizacao === 'PENDENTE' && (
                            <button
                              type="button"
                              onClick={() => onJournalizeDocument(doc)}
                              title="Contabilizar via partidas dobradas"
                              className="p-1.5 text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 rounded-md transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            title="Excluir documento fiscal"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Drawer de Detalhes da NF-e */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedDoc.tipoDoc} nº {selectedDoc.numero} - Série {selectedDoc.serie}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedDoc.tipoOperacao === 'SAIDA'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {selectedDoc.tipoOperacao}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Chave: {selectedDoc.chaveAcesso}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Emitente & Destinatário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Emitente</div>
                <div className="font-bold text-slate-800 text-sm mt-1">{selectedDoc.emitenteRazao}</div>
                <div className="text-slate-500 mt-1 font-mono">CNPJ: {selectedDoc.emitenteCnpj} • UF: {selectedDoc.emitenteUf}</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Destinatário</div>
                <div className="font-bold text-slate-800 text-sm mt-1">{selectedDoc.destinatarioRazao}</div>
                <div className="text-slate-500 mt-1 font-mono">CNPJ/CPF: {selectedDoc.destinatarioCnpj} • UF: {selectedDoc.destinatarioUf}</div>
              </div>
            </div>

            {/* Totais e Memória Fiscal */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Produtos</div>
                <div className="font-bold text-slate-800 mt-1">
                  {selectedDoc.valorTotalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Base ICMS</div>
                <div className="font-bold text-slate-800 mt-1">
                  {selectedDoc.impostos.baseIcms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Valor ICMS</div>
                <div className="font-bold text-blue-600 mt-1">
                  {selectedDoc.impostos.valorIcms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">PIS + COFINS</div>
                <div className="font-bold text-slate-800 mt-1">
                  {(selectedDoc.impostos.valorPis + selectedDoc.impostos.valorCofins).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-blue-700 font-bold uppercase">Total da Nota</div>
                <div className="font-bold text-blue-900 text-sm mt-1">
                  {selectedDoc.valorTotalNota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            {/* Tabela de Itens */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Itens e Classificação Tributária (CFOP / CST / NCM)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Descrição</th>
                      <th className="py-2.5 px-3">NCM</th>
                      <th className="py-2.5 px-3">CFOP</th>
                      <th className="py-2.5 px-3 text-right">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Unitário</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center">CST ICMS</th>
                      <th className="py-2.5 px-3 text-right">ICMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedDoc.itens.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{it.numeroItem}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{it.descricao}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{it.ncm}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-600">{it.cfop}</td>
                        <td className="py-2.5 px-3 text-right">{it.quantidade} {it.unidade}</td>
                        <td className="py-2.5 px-3 text-right">
                          {it.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {it.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{it.cstIcms}</td>
                        <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">
                          {it.valorIcms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({it.aliquotaIcms}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* XML Bruto com botão de download */}
            {selectedDoc.xmlRaw && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    XML Original SEFAZ
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([selectedDoc.xmlRaw || ''], { type: 'application/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `NFe_${selectedDoc.chaveAcesso}.xml`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Arquivo XML
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedDoc.xmlRaw}
                </pre>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Fechar
              </button>
              {selectedDoc.statusContabilizacao === 'PENDENTE' && (
                <button
                  type="button"
                  onClick={() => {
                    onJournalizeDocument(selectedDoc);
                    setSelectedDoc(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-blue-200 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Contabilizar Lançamento Agora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
