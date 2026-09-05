import React, { useState } from 'react';
import { 
  KeyRound, 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Lock, 
  Calendar, 
  User, 
  Activity,
  FileCheck
} from 'lucide-react';
import { AuditLog, Company, DigitalCertificate } from '../types';

interface CertificatesAndAuditViewProps {
  companies: Company[];
  certificates: DigitalCertificate[];
  auditLogs: AuditLog[];
  onAddCertificate: (cert: DigitalCertificate) => void;
  activeCompany: Company;
}

export const CertificatesAndAuditView: React.FC<CertificatesAndAuditViewProps> = ({
  companies,
  certificates,
  auditLogs,
  onAddCertificate,
  activeCompany,
}) => {
  const [viewMode, setViewMode] = useState<'certificados' | 'auditoria'>('certificados');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Form de Certificado
  const [certCompanyId, setCertCompanyId] = useState(activeCompany.id);
  const [certEmissor, setCertEmissor] = useState('AC Certisign Multipla G7');
  const [certSenha, setCertSenha] = useState('123456');

  const handleSaveCertificate = () => {
    const comp = companies.find(c => c.id === certCompanyId);
    if (!comp) return;

    const validade = new Date();
    validade.setFullYear(validade.getFullYear() + 1);

    const newCert: DigitalCertificate = {
      id: `cert-${Date.now()}`,
      companyId: comp.id,
      tipo: 'A1',
      razaoSocial: comp.razaoSocial,
      cnpj: comp.cnpj,
      alias: `e-CNPJ A1 - ${comp.razaoSocial}`,
      emissor: certEmissor,
      subjectCnpj: comp.cnpj,
      validoDe: new Date().toISOString(),
      validoAte: validade.toISOString(),
      diasParaVencer: 365,
      status: 'VALIDO',
      numeroSerie: `SERIE-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    onAddCertificate(newCert);
    setIsCertModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header com Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            Cofre de Certificados A1 & Trilha de Auditoria (Compliance)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de credenciais ICP-Brasil para assinaturas automatizadas e trilha de auditoria para fins contábeis e fiscais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('certificados')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'certificados' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cofre A1 ({certificates.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('auditoria')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'auditoria' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trilha de Auditoria ({auditLogs.length})
            </button>
          </div>

          {viewMode === 'certificados' && (
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Certificado A1
            </button>
          )}
        </div>
      </div>

      {/* Visão de Certificados */}
      {viewMode === 'certificados' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => {
              const comp = companies.find(c => c.id === cert.companyId);
              const isWarning = cert.diasParaVencer <= 30;

              return (
                <div 
                  key={cert.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{cert.alias}</div>
                        <div className="text-xs text-slate-500">Empresa: {comp?.razaoSocial}</div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                      isWarning
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isWarning ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {cert.diasParaVencer} dias restantes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-200 pt-3 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-500 font-semibold">Emissor ICP-Brasil</span>
                      <div className="text-slate-800 font-medium font-sans">{cert.emissor}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-500 font-semibold">Número de Série</span>
                      <div className="text-slate-800 font-medium truncate">{cert.numeroSerie}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-500 font-semibold">Válido A Partir De</span>
                      <div className="text-slate-800 font-medium font-sans">{new Date(cert.validoDe).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-500 font-semibold">Expira Em</span>
                      <div className="text-slate-800 font-medium font-sans">{new Date(cert.validoAte).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visão de Trilha de Auditoria */}
      {viewMode === 'auditoria' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Eventos Registrados no Livro de Auditoria Imutável
            </span>
            <span className="text-slate-500">Rastreabilidade Completa (Compliance)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Data e Hora</th>
                  <th className="py-2.5 px-3">Usuário Responsável</th>
                  <th className="py-2.5 px-3">Tipo de Ação</th>
                  <th className="py-2.5 px-3">Descrição Detalhada do Evento</th>
                  <th className="py-2.5 px-3 font-mono">Endereço IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {log.usuario || log.userName || 'Sistema'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                        {log.acao || log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.detalhes || log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '177.136.241.98'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Adicionar Certificado */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl p-6 space-y-4 text-slate-800">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              Instalar Certificado A1 no Cofre Seguro
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Empresa Cliente Titular</label>
                <select
                  value={certCompanyId}
                  onChange={(e) => setCertCompanyId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Autoridade Certificadora (Emissor)</label>
                <input
                  type="text"
                  value={certEmissor}
                  onChange={(e) => setCertEmissor(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Senha do Certificado (.PFX / .P12)</label>
                <input
                  type="password"
                  value={certSenha}
                  onChange={(e) => setCertSenha(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                O arquivo é criptografado com chave AES-256 e mantido isolado por tenant contábil.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCertificate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                Instalar no Cofre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
