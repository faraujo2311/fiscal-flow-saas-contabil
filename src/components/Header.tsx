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
  RotateCcw,
  Database,
  Globe,
  Shield
} from 'lucide-react';
import { Company, Competence, OfficeTenant, SystemCustomization, SystemUser } from '../types';

interface HeaderProps {
  office: OfficeTenant;
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  competences: Competence[];
  selectedCompetence: string;
  onSelectCompetence: (comp: string) => void;
  onToggleCompetenceStatus: () => void;
  onResetData?: () => void;
  onOpenSupabase?: () => void;
  customization?: SystemCustomization;
  activeUser?: SystemUser;
  onOpenLandingPage?: () => void;
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
  onResetData,
  onOpenSupabase,
  customization,
  activeUser,
  onOpenLandingPage,
}) => {
  const currentCompObj = competences.find(
    c => c.companyId === selectedCompany.id && `${c.month < 10 ? '0' : ''}${c.month}/${c.year}` === selectedCompetence
  );
  const isCompetenceOpen = !currentCompObj || currentCompObj.status === 'ABERTA';

  const officeDisplayName = customization?.officeDisplayName || office.name;
  const crcDisplay = customization?.crc || office.crcResponsavel;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 px-6 py-2.5 shadow-xs">
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Escritório Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs shadow-blue-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm tracking-tight">
                {officeDisplayName}
              </span>
              <span 
                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-bold uppercase tracking-wider"
                title="SaaS Contábil - Contexto do Escritório Contábil Ativo"
              >
                Tenant: {office.id}
              </span>
              {activeUser && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  activeUser.role === 'ADMINISTRADOR'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : activeUser.role === 'ANALISTA'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  <Shield className="w-2.5 h-2.5" />
                  {activeUser.name.split(' ')[0]} ({activeUser.role})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-[11px]">{crcDisplay}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-blue-600" />
                {office.responsavelNome}
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Empresa, Competência e Persistência */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Empresa Cliente */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 transition-colors">
            <Building2 className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
            <div className="flex flex-col text-left mr-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">
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
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-4"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-900">
                    {c.razaoSocial} ({c.regimeTributario === 'SIMPLES_NACIONAL' ? 'Simples' : 'L. Presumido'})
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Seletor de Competência */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 transition-colors">
            <Calendar className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
            <div className="flex flex-col text-left mr-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">
                Competência
              </span>
              <select
                id="select-active-competence"
                aria-label="Competência"
                value={selectedCompetence}
                onChange={(e) => onSelectCompetence(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
              >
                <option value="09/2026" className="bg-white text-slate-900">09/2026 (Atual)</option>
                <option value="08/2026" className="bg-white text-slate-900">08/2026 (Anterior)</option>
                <option value="07/2026" className="bg-white text-slate-900">07/2026</option>
              </select>
            </div>

            {/* Status da Competência */}
            <button
              id="btn-toggle-competence"
              type="button"
              onClick={onToggleCompetenceStatus}
              title={isCompetenceOpen ? "Clique para fechar competência" : "Clique para reabrir competência"}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                isCompetenceOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {isCompetenceOpen ? (
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
          </div>

          {/* Regime Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-medium">Regime:</span>
            <span className="font-bold text-slate-800">
              {selectedCompany.regimeTributario === 'SIMPLES_NACIONAL'
                ? `Simples (${selectedCompany.anexoSimples || 'Anexo I'})`
                : 'Lucro Presumido'}
            </span>
          </div>

          {/* Nuvem Supabase Badge / Button */}
          {onOpenSupabase && (
            <button
              type="button"
              onClick={onOpenSupabase}
              title="Acessar painel e sincronização da Nuvem Supabase (PostgreSQL)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          {/* Landing Page Button */}
          {onOpenLandingPage && (
            <button
              type="button"
              onClick={onOpenLandingPage}
              title="Visualizar Landing Page Profissional do Sistema"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold">Landing Page</span>
            </button>
          )}

          {/* Persistência Local & Reset */}
          {onResetData && (
            <button
              type="button"
              onClick={onResetData}
              title="Restaurar banco de dados demonstrativo inicial"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Restaurar Demo</span>
            </button>
          )}

          {/* Notification Bell */}
          <div 
            className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title="Notificações e Avisos de Compliance"
          >
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            <Bell className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
