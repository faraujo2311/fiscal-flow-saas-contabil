import React from 'react';
import { 
  Building2, 
  Calendar, 
  Lock, 
  Unlock, 
  UserCheck, 
  ShieldCheck,
  ChevronDown,
  Bell,
  CloudCheck,
  CloudUpload,
  CloudAlert,
  Cloud,
  LogOut,
  Shield,
  Clock,
  Settings
} from 'lucide-react';
import { Company, Competence, OfficeTenant, SystemCustomization, SystemUser } from '../types';
import { AutoSyncState } from '../services/autoSyncService';
import { getTheme } from '../utils/theme';

interface HeaderProps {
  office: OfficeTenant;
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  competences: Competence[];
  selectedCompetence: string;
  onSelectCompetence: (comp: string) => void;
  onToggleCompetenceStatus: () => void;
  customization?: SystemCustomization;
  activeUser?: SystemUser;
  onLogout?: () => void;
  onOpenCompanyModal?: () => void;
  onOpenCompetenceModal?: () => void;
  autoSyncState?: AutoSyncState;
  sessionMinutesRemaining?: number;
}

export const Header: React.FC<HeaderProps> = ({
  office,
  companies,
  selectedCompany,
  onSelectCompany,
  competences,
  selectedCompetence,
  onSelectCompetence,
  onToggleCompetenceStatus,
  customization,
  activeUser,
  onLogout,
  onOpenCompanyModal,
  onOpenCompetenceModal,
  autoSyncState,
  sessionMinutesRemaining,
}) => {
  const theme = getTheme(customization?.primaryThemeColor);
  const currentCompObj = competences.find(
    c => c.companyId === selectedCompany.id && `${c.month < 10 ? '0' : ''}${c.month}/${c.year}` === selectedCompetence
  );
  const isCompetenceOpen = !currentCompObj || currentCompObj.status === 'ABERTA';

  const officeDisplayName = customization?.officeDisplayName || office.name;
  const crcDisplay = customization?.crc || office.crcResponsavel;
  const accountantNameDisplay = customization?.accountantName || office.responsavelNome;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 px-5 py-2.5 shadow-xs">
      <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Escritório Brand & Context */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${theme.bgPrimary} flex items-center justify-center font-bold text-white shadow-xs ${theme.shadowColor} shrink-0`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm tracking-tight">
                {officeDisplayName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-[11px] font-medium text-slate-600">{crcDisplay}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <UserCheck className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
                {accountantNameDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Empresa, Competência, Sincronização e Logout */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor e Gestão de Empresa Cliente */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-1 py-1 hover:border-slate-300 transition-colors">
            <Building2 className={`w-4 h-4 ${theme.textPrimary} mr-2 shrink-0`} />
            <div className="flex flex-col text-left mr-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase leading-none mb-0.5">
                Empresa Ativa
              </span>
              <select
                id="select-active-company"
                aria-label="Empresa Ativa"
                value={selectedCompany.id}
                onChange={(e) => {
                  const comp = companies.find(c => c.id === e.target.value);
                  if (comp) onSelectCompany(comp);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-3"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-900">
                    {c.razaoSocial} ({c.regimeTributario === 'SIMPLES_NACIONAL' ? 'Simples' : 'L. Presumido'}) {!c.ativo ? '[BLOQUEADA]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {onOpenCompanyModal && (
              <button
                type="button"
                onClick={onOpenCompanyModal}
                title="Gerenciar Empresas (Cadastrar, Editar, Bloquear, Excluir)"
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Seletor de Competência */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-1.5 py-1 hover:border-slate-300 transition-colors">
            <Calendar className={`w-4 h-4 ${theme.textPrimary} mr-2 shrink-0`} />
            <div className="flex flex-col text-left mr-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase leading-none mb-0.5">
                Competência
              </span>
              <select
                id="select-active-competence"
                aria-label="Competência"
                value={selectedCompetence}
                onChange={(e) => onSelectCompetence(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {competences
                  .filter(c => c.companyId === selectedCompany.id)
                  .map(c => {
                    const label = `${c.month < 10 ? '0' : ''}${c.month}/${c.year}`;
                    return (
                      <option key={c.id} value={label} className="bg-white text-slate-900">
                        {label} {label === '09/2026' ? '(Atual)' : ''}
                      </option>
                    );
                  })}
                {/* Fallback caso não haja competência cadastrada */}
                {!competences.some(c => c.companyId === selectedCompany.id) && (
                  <option value={selectedCompetence} className="bg-white text-slate-900">
                    {selectedCompetence} (Atual)
                  </option>
                )}
              </select>
            </div>

            {/* Status da Competência */}
            <button
              id="btn-toggle-competence"
              type="button"
              onClick={onToggleCompetenceStatus}
              title={isCompetenceOpen ? "Clique para fechar competência" : "Clique para reabrir competência"}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer mr-1 ${
                isCompetenceOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {isCompetenceOpen ? (
                <>
                  <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                  Aberta
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-rose-600" />
                  Fechada
                </>
              )}
            </button>

            {onOpenCompetenceModal && (
              <button
                type="button"
                onClick={onOpenCompetenceModal}
                title="Abrir ou gerenciar competências contábeis"
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Regime Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <ShieldCheck className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
            <span className="text-slate-500 font-medium text-[11px]">Regime:</span>
            <span className="font-bold text-slate-800 text-[11px]">
              {selectedCompany.regimeTributario === 'SIMPLES_NACIONAL'
                ? `Simples (${selectedCompany.anexoSimples || 'Anexo I'})`
                : 'Lucro Presumido'}
            </span>
          </div>

          {/* Indicador de Sincronização Automática com Supabase */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            title="Sincronização automática com banco de dados Supabase em segundo plano"
          >
            {autoSyncState?.status === 'SYNCING' ? (
              <>
                <CloudUpload className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span className="text-[11px] font-semibold text-amber-700">Salvando na Nuvem...</span>
              </>
            ) : autoSyncState?.status === 'ERROR' ? (
              <>
                <CloudAlert className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[11px] font-semibold text-rose-700">Nuvem Pendente</span>
              </>
            ) : (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-800">Nuvem Sincronizada</span>
              </>
            )}
          </div>

          {/* Timer de Sessão */}
          {sessionMinutesRemaining !== undefined && (
            <div 
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600"
              title="Tempo restante de sessão antes do logout automático"
            >
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{sessionMinutesRemaining} min</span>
            </div>
          )}

          {/* Notification Bell */}
          <div 
            className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title="Notificações e Avisos de Compliance"
          >
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            <Bell className="w-4 h-4" />
          </div>

          {/* Usuário Ativo Autenticado & Botão de Logout */}
          {activeUser && (
            <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
              <div 
                className={`w-7 h-7 rounded-full ${activeUser.avatarColor || 'bg-blue-600'} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
                title={`Conectado como: ${activeUser.name} (${activeUser.email})`}
              >
                {activeUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="hidden lg:flex flex-col text-left max-w-[130px]">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate" title={activeUser.name}>
                  {activeUser.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate" title={activeUser.email}>
                  {activeUser.email}
                </span>
              </div>
              {onLogout && (
                <button
                  id="btn-header-logout"
                  type="button"
                  onClick={onLogout}
                  title="Encerrar Sessão (Sair da Conta)"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
