import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  FileText,
  Copy,
  ExternalLink,
  Code,
  BookOpen,
  Send
} from 'lucide-react';
import { 
  Company, 
  FiscalDocument, 
  TaxObligation, 
  AccountingAccount, 
  AccountingEntry,
  SpedFileType
} from '../types';
import { 
  generateSpedEfdIcmsIpi, 
  generateSpedEcd, 
  SpedValidationResult 
} from '../services/spedEngine';
import { 
  generateBalanceSheet, 
  generateDreStatement 
} from '../services/accountingEngine';

interface SpedObligationsViewProps {
  company: Company;
  competencia: string;
  documents: FiscalDocument[];
  obligations: TaxObligation[];
  accounts?: AccountingAccount[];
  entries?: AccountingEntry[];
  onMarkObligationDelivered: (id: string, protocol: string) => void;
}

export const SpedObligationsView: React.FC<SpedObligationsViewProps> = ({
  company,
  competencia,
  documents,
  obligations,
  accounts = [],
  entries = [],
  onMarkObligationDelivered,
}) => {
  const [selectedFileType, setSelectedFileType] = useState<SpedFileType>('EFD_ICMS_IPI');
  
  const [spedOutput, setSpedOutput] = useState<{
    fileType: SpedFileType;
    txtContent: string;
    validation: SpedValidationResult;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const compDocs = documents.filter(d => d.companyId === company.id);

  const handleGenerateSped = () => {
    if (selectedFileType === 'EFD_ICMS_IPI') {
      const res = generateSpedEfdIcmsIpi(company, competencia, compDocs);
      setSpedOutput({
        fileType: 'EFD_ICMS_IPI',
        txtContent: res.txtContent,
        validation: res.validation,
      });
    } else {
      // SPED Contábil ECD
      const bReport = generateBalanceSheet(accounts, entries);
      const dreReport = generateDreStatement(accounts, entries);
      const res = generateSpedEcd(company, competencia, accounts, entries, bReport, dreReport.items);
      setSpedOutput({
        fileType: 'ECD_CONTABIL',
        txtContent: res.txtContent,
        validation: res.validation,
      });
    }
  };

  const handleDownloadTxt = () => {
    if (!spedOutput) return;
    const [mes, ano] = competencia.split('/');
    const prefix = spedOutput.fileType === 'EFD_ICMS_IPI' ? 'SPED_EFD_FISCAL' : 'SPED_ECD_CONTABIL';
    const filename = `${prefix}_${company.cnpj.replace(/\D/g, '')}_${ano}${mes}.txt`;
    const blob = new Blob([spedOutput.txtContent], { type: 'text/plain;charset=latin1' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySpedSnippet = () => {
    if (!spedOutput) return;
    navigator.clipboard.writeText(spedOutput.txtContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Sistema Público de Escrituração Digital (SPED Fiscal & ECD)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geração de arquivos magnéticos oficiais em pipes (|...|) auditados para o Validador PVA da Receita Federal e SEFAZ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Tipo de SPED */}
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedFileType('EFD_ICMS_IPI')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedFileType === 'EFD_ICMS_IPI'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              EFD ICMS/IPI
            </button>
            <button
              type="button"
              onClick={() => setSelectedFileType('ECD_CONTABIL')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedFileType === 'ECD_CONTABIL'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              SPED Contábil (ECD)
            </button>
          </div>

          <button
            type="button"
            onClick={handleGenerateSped}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            Gerar {selectedFileType === 'EFD_ICMS_IPI' ? 'SPED Fiscal EFD' : 'SPED Contábil ECD'}
          </button>
        </div>
      </div>

      {/* Matriz de Obrigações Acessórias */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Quadro de Obrigações e Prazos Regulatórios - Competência {competencia}
          </h2>
          <span className="text-xs text-slate-500">
            RFB / SEFAZ / MTE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {obligations.map((obl) => (
            <div 
              key={obl.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{obl.nome}</span>
                  <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {obl.orgao}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Vencimento: <strong className="text-slate-700 font-medium">dia {obl.diaVencimento} do mês subsequente</strong>
                </div>
                {obl.protocolo && (
                  <div className="text-[10px] text-emerald-600 font-mono mt-0.5 font-medium">
                    Protocolo: {obl.protocolo}
                  </div>
                )}
              </div>

              <div>
                {obl.status === 'TRANSMITIDO' ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Transmitido
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const prot = `REC-OBL-${Math.floor(100000 + Math.random() * 900000)}`;
                      onMarkObligationDelivered(obl.id, prot);
                    }}
                    className="px-2.5 py-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg font-semibold text-xs transition-colors shadow-xs"
                  >
                    Marcar Entregue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resultados do Gerador SPED (EFD ou ECD) */}
      {spedOutput && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {spedOutput.fileType === 'EFD_ICMS_IPI'
                    ? 'Arquivo Digital SPED EFD ICMS/IPI Gerado com Sucesso'
                    : 'Arquivo Digital SPED Contábil (ECD - Livro Diário Geral "G") Gerado com Sucesso'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {spedOutput.fileType === 'EFD_ICMS_IPI' ? 'Layout 018 (Vigente)' : 'Layout 9.00 (ECD Diário Geral)'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Hash: <strong className="text-slate-800 font-semibold">{spedOutput.validation.hash}</strong> • Total de Registros: {spedOutput.validation.totalLines} linhas
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copySpedSnippet}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar Texto'}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Arquivo .TXT para PVA
              </button>
            </div>
          </div>

          {/* Validação de Integridade do SPED */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Status de Validação</div>
              <div className="font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                {spedOutput.validation.valid ? 'Aprovado na Pré-Validação' : 'Avisos Encontrados'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Estrutura de Blocos</div>
              <div className="font-bold text-slate-800 mt-1">
                {spedOutput.fileType === 'EFD_ICMS_IPI'
                  ? 'Bloco 0 (Abertura), C (Notas), 9 (Totais)'
                  : 'Bloco 0 (Cadastral), I (Diário/Lançamentos), J (Balanço/DRE), 9 (Totais)'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Validador Oficial PVA</div>
              <div className="font-bold text-blue-600 mt-1">
                Receita Federal / Sped Contábil (ECD)
              </div>
            </div>
          </div>

          {/* Avisos ou Erros se houver */}
          {spedOutput.validation.errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Erros de Validação:
              </div>
              {spedOutput.validation.errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {/* Pré-visualização do Arquivo com Realce de Pipes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-600" />
                Estrutura dos Registros (|PIPE|)
              </span>
              <span className="text-[11px] text-slate-500">
                Padrão oficial Guia Prático da {spedOutput.fileType === 'EFD_ICMS_IPI' ? 'EFD Fiscal' : 'ECD Contábil'}
              </span>
            </div>
            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {spedOutput.txtContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
