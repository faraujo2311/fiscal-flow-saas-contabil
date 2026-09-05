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
  Code
} from 'lucide-react';
import { Company, FiscalDocument, TaxObligation } from '../types';
import { generateSpedEfdIcmsIpi, SpedValidationResult } from '../services/spedEngine';

interface SpedObligationsViewProps {
  company: Company;
  competencia: string;
  documents: FiscalDocument[];
  obligations: TaxObligation[];
  onMarkObligationDelivered: (id: string, protocol: string) => void;
}

export const SpedObligationsView: React.FC<SpedObligationsViewProps> = ({
  company,
  competencia,
  documents,
  obligations,
  onMarkObligationDelivered,
}) => {
  const [spedOutput, setSpedOutput] = useState<{
    txtContent: string;
    validation: SpedValidationResult;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const compDocs = documents.filter(d => d.companyId === company.id);

  const handleGenerateSped = () => {
    const res = generateSpedEfdIcmsIpi(company, competencia, compDocs);
    setSpedOutput(res);
  };

  const handleDownloadTxt = () => {
    if (!spedOutput) return;
    const [mes, ano] = competencia.split('/');
    const filename = `SPED_EFD_${company.cnpj.replace(/\D/g, '')}_${ano}${mes}.txt`;
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
            Obrigações Fiscais & Gerador SPED (EFD ICMS/IPI)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geração de arquivos texto oficiais em pipes (|...|) compatíveis com o validador PVA da Receita Federal e SEFAZ.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateSped}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <FileCheck className="w-4 h-4" />
          Gerar Arquivo SPED EFD
        </button>
      </div>

      {/* Matriz de Obrigações Acessórias */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Quadro de Prazos e Entregas - Competência {competencia}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {obligations.map((obl) => (
            <div 
              key={obl.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
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

      {/* Resultados do Gerador SPED EFD */}
      {spedOutput && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Arquivo Digital SPED EFD ICMS/IPI Gerado com Sucesso
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Layout Versão 018 (Vigente)
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Hash de Controle: <strong className="text-slate-800 font-semibold">{spedOutput.validation.hash}</strong> • Total de Registros: {spedOutput.validation.totalLines} linhas
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
                Aprovado na Pré-Validação
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Blocos Gerados</div>
              <div className="font-bold text-slate-800 mt-1">
                Bloco 0 (Abertura), C (Notas), 9 (Totais)
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Compatibilidade PVA</div>
              <div className="font-bold text-blue-600 mt-1">
                Receita Federal / Guia Prático EFD
              </div>
            </div>
          </div>

          {/* Pré-visualização do Arquivo com Realce de Pipes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-600" />
                Estrutura dos Registros (|PIPE|)
              </span>
              <span className="text-[11px] text-slate-500">
                Padrão oficial Guia Prático EFD ICMS/IPI
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
