import React, { useState } from 'react';
import { 
  Calendar, 
  Lock, 
  Unlock, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Building2, 
  ShieldCheck, 
  FileCheck 
} from 'lucide-react';
import { Company, Competence } from '../types';

interface CompetenceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  competences: Competence[];
  selectedCompetence: string;
  onSelectCompetence: (comp: string) => void;
  onAddCompetence: (year: number, month: number) => void;
  onToggleStatus: (compObj: Competence) => void;
}

export const CompetenceManagementModal: React.FC<CompetenceManagementModalProps> = ({
  isOpen,
  onClose,
  company,
  competences,
  selectedCompetence,
  onSelectCompetence,
  onAddCompetence,
  onToggleStatus,
}) => {
  const [newMonth, setNewMonth] = useState<number>(10);
  const [newYear, setNewYear] = useState<number>(2026);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const companyCompetences = competences.filter(c => c.companyId === company.id);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const exists = companyCompetences.some(c => c.year === newYear && c.month === newMonth);
    if (exists) {
      setErrorMsg(`A competência ${newMonth < 10 ? '0' : ''}${newMonth}/${newYear} já existe para esta empresa.`);
      return;
    }

    onAddCompetence(newYear, newMonth);
    const compStr = `${newMonth < 10 ? '0' : ''}${newMonth}/${newYear}`;
    onSelectCompetence(compStr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Gerenciamento de Competências Fiscais & Contábeis</h2>
              <p className="text-xs text-slate-400">
                Empresa: {company.razaoSocial}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Nova Competência */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Abrir Nova Competência Fiscal
            </h3>
            <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Mês:</label>
                <select
                  value={newMonth}
                  onChange={e => setNewMonth(parseInt(e.target.value))}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>01 - Janeiro</option>
                  <option value={2}>02 - Fevereiro</option>
                  <option value={3}>03 - Março</option>
                  <option value={4}>04 - Abril</option>
                  <option value={5}>05 - Maio</option>
                  <option value={6}>06 - Junho</option>
                  <option value={7}>07 - Julho</option>
                  <option value={8}>08 - Agosto</option>
                  <option value={9}>09 - Setembro</option>
                  <option value={10}>10 - Outubro</option>
                  <option value={11}>11 - Novembro</option>
                  <option value={12}>12 - Dezembro</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Ano:</label>
                <input
                  type="number"
                  min={2020}
                  max={2030}
                  value={newYear}
                  onChange={e => setNewYear(parseInt(e.target.value) || 2026)}
                  className="w-20 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Competência
              </button>
            </form>

            {errorMsg && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* Lista de Competências */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Competências Existentes para esta Empresa
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {companyCompetences.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhuma competência registrada especificamente para esta empresa. O sistema usa 09/2026 por padrão.
                </div>
              ) : (
                companyCompetences.map(c => {
                  const compStr = `${c.month < 10 ? '0' : ''}${c.month}/${c.year}`;
                  const isCurrent = compStr === selectedCompetence;
                  const isOpen = c.status === 'ABERTA';

                  return (
                    <div 
                      key={c.id} 
                      className={`p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{compStr}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                Selecionada
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {isOpen ? 'Em escrituração e apuração contínua' : `Fechada em ${c.dataFechamento || 'Final do período'}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(c)}
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            isOpen
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title={isOpen ? "Clique para travar e fechar competência" : "Clique para reabrir"}
                        >
                          {isOpen ? (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              Aberta
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-rose-600" />
                              Fechada
                            </>
                          )}
                        </button>

                        {/* Selecionar */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCompetence(compStr);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            Ativar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Competência atual: <strong>{selectedCompetence}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
