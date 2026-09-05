import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  RotateCw, 
  KeyRound, 
  ShieldCheck, 
  ExternalLink,
  Receipt
} from 'lucide-react';
import { Company, DigitalCertificate, GovSubmission } from '../types';
import { createGovSubmission, processGovSubmissionMock } from '../services/govConnector';

interface GovTransmissionViewProps {
  company: Company;
  competencia: string;
  submissions: GovSubmission[];
  certificate?: DigitalCertificate;
  onAddSubmission: (sub: GovSubmission) => void;
  onUpdateSubmission: (sub: GovSubmission) => void;
}

export const GovTransmissionView: React.FC<GovTransmissionViewProps> = ({
  company,
  competencia,
  submissions,
  certificate,
  onAddSubmission,
  onUpdateSubmission,
}) => {
  const [selectedSistema, setSelectedSistema] = useState<'ESOCIAL' | 'REINF' | 'SEFAZ'>('ESOCIAL');
  const [selectedEvento, setSelectedEvento] = useState('S-1200 - Remuneração de Trabalhador');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<GovSubmission | null>(null);

  const compSubmissions = submissions.filter(s => s.companyId === company.id);

  const handleTransmit = async () => {
    if (!certificate) return;

    setIsTransmitting(true);
    const newSub = createGovSubmission(company, selectedSistema, selectedEvento, competencia);
    onAddSubmission(newSub);

    // Processar através da máquina de estados
    setTimeout(async () => {
      const res = await processGovSubmissionMock(newSub, certificate);
      onUpdateSubmission(res.submission);
      setIsTransmitting(false);
      if (res.success) {
        setLastReceipt(res.submission);
      }
    }, 1200);
  };

  const eventosPorSistema = {
    ESOCIAL: [
      'S-1200 - Remuneração de Trabalhador',
      'S-1210 - Pagamentos de Rendimentos',
      'S-2200 - Cadastramento Inicial do Vínculo e Admissão',
      'S-1299 - Fechamento dos Eventos Periódicos',
    ],
    REINF: [
      'R-1000 - Informações do Contribuinte',
      'R-2010 - Retenção de Contribuição Previdenciária (Serviços Tomados)',
      'R-4010 - Pagamentos e Retenções de IRRF',
      'R-2099 - Fechamento dos Eventos Periódicos',
    ],
    SEFAZ: [
      'Manifestação do Destinatário - Confirmação da Operação',
      'Consulta Status Serviço NF-e Nacional',
      'Consulta DFe em Lote (Distribuição DF-e)',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Transmissões Governo (eSocial, EFD-Reinf e SEFAZ)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Máquina de estados oficial: Envio síncrono/assíncrono, assinatura com certificado A1 e obtenção de recibo definitivo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {certificate ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>A1 Ativo ({certificate.diasParaVencer}d)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Sem Certificado A1</span>
            </div>
          )}
        </div>
      </div>

      {/* Painel de Transmissão de Novo Lote */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-600" />
          Transmitir Eventos para Ambiente Oficial do Governo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Órgão / Sistema</label>
            <select
              value={selectedSistema}
              onChange={(e) => {
                const s = e.target.value as any;
                setSelectedSistema(s);
                setSelectedEvento(eventosPorSistema[s][0]);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ESOCIAL">eSocial (Trabalho & Previdência)</option>
              <option value="REINF">EFD-Reinf (Receita Federal)</option>
              <option value="SEFAZ">SEFAZ Nacional (Notas Fiscais)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-medium mb-1">Evento a Transmitir</label>
            <select
              value={selectedEvento}
              onChange={(e) => setSelectedEvento(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {eventosPorSistema[selectedSistema].map((ev, i) => (
                <option key={i} value={ev}>{ev}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            Assinatura digital automática com Certificado A1 da empresa ({company.razaoSocial})
          </div>

          <button
            type="button"
            disabled={isTransmitting || !certificate}
            onClick={handleTransmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
          >
            {isTransmitting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Assinando e Transmitindo...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Assinar e Transmitir Lote
              </>
            )}
          </button>
        </div>
      </div>

      {/* Histórico de Transmissões e Recibos */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">
            Trilha de Comunicações & Recibos de Entrega ({compSubmissions.length})
          </span>
          <span className="text-slate-500">Ambiente de Produção Conectado</span>
        </div>

        {compSubmissions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Nenhum lote transmitido ainda para este cliente.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {compSubmissions.map((sub) => {
              const isAutorizado = sub.estado === 'AUTORIZADO';

              return (
                <div key={sub.id} className="p-4 hover:bg-slate-50/60 transition-colors text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {sub.sistema}
                      </span>
                      <span className="font-semibold text-slate-900">{sub.evento}</span>
                      <span className="text-slate-500">• Comp: {sub.competencia}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                      isAutorizado
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.estado === 'REJEITADO'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isAutorizado ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {sub.estado}
                    </span>
                  </div>

                  <div className="text-slate-500 text-[11px]">
                    Resposta do Órgão: <span className="text-slate-700 font-medium">{sub.mensagemResposta || 'Aguardando processamento'}</span>
                  </div>

                  {sub.protocolo && sub.recibo && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500">Protocolo Oficial:</span>
                        <span className="text-slate-900 font-bold">{sub.protocolo}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500">Recibo Definitivo:</span>
                        <span className="text-blue-600 font-bold">{sub.recibo}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recibo de Entrega Destacado */}
      {lastReceipt && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-800 text-xs space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Comprovante Oficial de Entrega Eletrônica
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>Órgão: <strong className="text-emerald-950">{lastReceipt.sistema}</strong></div>
            <div>Evento: <strong className="text-emerald-950">{lastReceipt.evento}</strong></div>
            <div>Recibo: <strong className="font-mono text-emerald-950">{lastReceipt.recibo}</strong></div>
          </div>
          <div className="text-[11px] text-emerald-700">
            O lote foi homologado e arquivado com sucesso no cofre de evidências da contabilidade.
          </div>
        </div>
      )}
    </div>
  );
};
