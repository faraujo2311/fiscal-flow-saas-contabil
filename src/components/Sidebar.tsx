import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  BookOpen, 
  Users, 
  DollarSign, 
  FileSpreadsheet, 
  Send, 
  KeyRound, 
  History, 
  Database,
  Sliders,
  Palette,
  Shield,
  Globe,
  ExternalLink
} from 'lucide-react';
import { SystemCustomization, SystemUser, RolePermissionConfig } from '../types';
import { Building2, LogOut } from 'lucide-react';

export type TabId = 
  | 'dashboard' 
  | 'fiscal' 
  | 'apuracao' 
  | 'contabil' 
  | 'folha' 
  | 'socios' 
  | 'sped' 
  | 'gov' 
  | 'certificados' 
  | 'auditoria' 
  | 'supabase'
  | 'parametros'
  | 'personalizacao'
  | 'usuarios';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  pendingDocsCount: number;
  pendingObligationsCount: number;
  customization?: SystemCustomization;
  activeUser?: SystemUser;
  rolePermissions?: RolePermissionConfig[];
  onLogout?: () => void;
  onOpenCompanyModal?: () => void;
  onOpenLandingPage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingDocsCount,
  pendingObligationsCount,
  customization,
  activeUser,
  rolePermissions,
  onLogout,
  onOpenCompanyModal,
  onOpenLandingPage,
}) => {
  const brandName = customization?.systemName || 'Lumen Contábil';
  const brandShort = customization?.shortName || 'L';
  const officeName = customization?.officeDisplayName || 'Audicon Contabilidade';

  const operationalItems: { id: TabId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'fiscal',
      label: 'Fiscal (XML)',
      icon: <FileText className="w-4 h-4" />,
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'apuracao',
      label: 'Apuração Fiscal',
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: 'contabil',
      label: 'Contábil',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'folha',
      label: 'Folha de Pagamento',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'socios',
      label: 'Sócios & Lucros',
      icon: <DollarSign className="w-4 h-4" />,
    },
  ];

  const complianceItems: { id: TabId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'sped',
      label: 'SPED & Obrigações',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: pendingObligationsCount > 0 ? pendingObligationsCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'gov',
      label: 'Transmissões GOV',
      icon: <Send className="w-4 h-4" />,
    },
    {
      id: 'certificados',
      label: 'Certificados Digitais',
      icon: <KeyRound className="w-4 h-4" />,
    },
    {
      id: 'auditoria',
      label: 'Trilha de Auditoria',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'supabase',
      label: 'Nuvem Supabase',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
  ];

  const configItems: { id: TabId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'parametros',
      label: 'Parâmetros do Especialista',
      icon: <Sliders className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'personalizacao',
      label: 'Personalização & Marca',
      icon: <Palette className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'usuarios',
      label: 'Perfis & Auditoria (RBAC)',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
    },
  ];

  // Filtragem de abas permitidas de acordo com o perfil RBAC configurado
  const isTabAllowed = (tabId: TabId): boolean => {
    if (!activeUser) return true;
    if (activeUser.role === 'ADMINISTRADOR') return true;
    if (!rolePermissions || rolePermissions.length === 0) return true;
    const roleConfig = rolePermissions.find(r => r.role === activeUser.role);
    if (!roleConfig) return true;
    return roleConfig.allowedTabs.includes(tabId);
  };

  const visibleOperational = operationalItems.filter(item => isTabAllowed(item.id));
  const visibleCompliance = complianceItems.filter(item => isTabAllowed(item.id));
  const visibleConfig = configItems.filter(item => isTabAllowed(item.id));

  const renderNavGroup = (items: typeof operationalItems) => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors whitespace-nowrap md:whitespace-normal cursor-pointer ${
              isActive
                ? 'bg-blue-600/10 text-blue-400 rounded-md border border-blue-600/20 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-full md:w-64 bg-[#0F172A] text-slate-400 border-r border-slate-800 shrink-0 flex flex-col">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-base shadow-sm shadow-blue-500/20 shrink-0">
            {brandShort}
          </div>
          <div className="overflow-hidden">
            <span className="text-white font-semibold text-sm tracking-tight block truncate">
              {brandName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide block">
              Escrituração & SPED
            </span>
          </div>
        </div>

        {onOpenLandingPage && (
          <button
            type="button"
            onClick={onOpenLandingPage}
            title="Ver Landing Page Profissional"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-blue-400" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {visibleOperational.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 px-2">
              Operacional
            </div>
            {renderNavGroup(visibleOperational)}
          </div>
        )}

        {visibleCompliance.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 px-2">
              Conformidade & SPED
            </div>
            {renderNavGroup(visibleCompliance)}
          </div>
        )}

        {visibleConfig.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2 px-2">
              Configurações & Gestão
            </div>
            {renderNavGroup(visibleConfig)}
          </div>
        )}
      </nav>

      {/* Bottom Profile / Tenant Box */}
      <div className="p-3 mt-auto bg-slate-900 border-t border-slate-800 space-y-2.5">
        {/* Cartão do Usuário Logado */}
        {activeUser && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`w-7 h-7 rounded-full ${activeUser.avatarColor || 'bg-blue-600'} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                {activeUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {activeUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {activeUser.role}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Deslogar do Sistema"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Informações da Licença do Escritório */}
        <div 
          className="flex items-center gap-2.5 px-1 text-slate-400"
          title="Escritório Contábil titular da licença do SaaS e responsável técnico com CRC ativo"
        >
          <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
            {officeName.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden leading-tight">
            <div className="text-[11px] font-semibold text-slate-300 truncate">{officeName}</div>
            <div className="text-[9px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Plano Pro • CRC Ativo (Licença SaaS)
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

