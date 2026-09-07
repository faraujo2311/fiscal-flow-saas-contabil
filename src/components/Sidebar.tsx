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
  Layers,
  Building2,
  LogOut
} from 'lucide-react';
import { SystemCustomization, SystemUser, RolePermissionConfig, TabId, SystemModuleId, SYSTEM_MODULES } from '../types';
import { getTheme } from '../utils/theme';

export type { TabId };

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  pendingDocsCount: number;
  pendingObligationsCount: number;
  customization?: SystemCustomization;
  activeUser?: SystemUser;
  rolePermissions?: RolePermissionConfig[];
  activeModule?: SystemModuleId;
  onSelectModule?: (moduleId: SystemModuleId) => void;
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
  activeModule = 'ALL',
  onSelectModule,
  onLogout,
  onOpenCompanyModal,
  onOpenLandingPage,
}) => {
  const theme = getTheme(customization?.primaryThemeColor);
  const brandName = customization?.systemName || 'Lumen Contábil';
  const brandShort = customization?.shortName || 'L';
  const officeName = customization?.officeDisplayName || 'Audicon Contabilidade';

  // 1. MÓDULO FISCAL (MLF)
  const fiscalItems: { id: TabId; label: string; sublabel?: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'apuracao',
      label: 'Cálculo de Impostos',
      sublabel: 'MLF - calcularImpostoProcessView',
      icon: <Calculator className="w-4 h-4 text-amber-400" />,
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'fiscal',
      label: 'Escrituração Fiscal',
      sublabel: 'NF-e / NFC-e / CT-e',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'sped',
      label: 'SPED & Obrigações',
      sublabel: 'EFD-ICMS / EFD-Contribuições',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-400" />,
      badge: pendingObligationsCount > 0 ? pendingObligationsCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
  ];

  // 2. MÓDULO CONTÁBIL (MLC)
  const contabilItems: { id: TabId; label: string; sublabel?: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'contabil',
      label: 'Lançamentos & Razão',
      sublabel: 'Partidas Dobradas e Balancetes',
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'parametros',
      label: 'Parâmetros Contábeis',
      sublabel: 'Plano de Contas & Regras',
      icon: <Sliders className="w-4 h-4 text-blue-400" />,
    },
  ];

  // 3. MÓDULO FOLHA DE PAGAMENTO (MLP)
  const folhaItems: { id: TabId; label: string; sublabel?: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'folha',
      label: 'Folha de Pagamento',
      sublabel: 'Holerites, INSS & eSocial',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'socios',
      label: 'Sócios & Pró-Labore',
      sublabel: 'Fator R & Distribuição',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
    },
  ];

  // 4. GOVERNANÇA & SISTEMA
  const gestaoItems: { id: TabId; label: string; sublabel?: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Geral',
      sublabel: 'Visão Integrada',
      icon: <LayoutDashboard className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'gov',
      label: 'Transmissões GOV',
      sublabel: 'SEFAZ, Conectividade & DCTFWeb',
      icon: <Send className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'certificados',
      label: 'Certificados Digitais',
      sublabel: 'Gerenciador A1 / A3',
      icon: <KeyRound className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'auditoria',
      label: 'Trilha de Auditoria',
      sublabel: 'Logs e Rastreabilidade',
      icon: <History className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'supabase',
      label: 'Nuvem Supabase',
      sublabel: 'Sincronização & Backup',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'personalizacao',
      label: 'Personalização & Marca',
      sublabel: 'White-Label & Identidade',
      icon: <Palette className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'usuarios',
      label: 'Perfis & Equipe (RBAC)',
      sublabel: 'Controle de Acesso',
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

  const visibleFiscal = fiscalItems.filter(item => isTabAllowed(item.id));
  const visibleContabil = contabilItems.filter(item => isTabAllowed(item.id));
  const visibleFolha = folhaItems.filter(item => isTabAllowed(item.id));
  const visibleGestao = gestaoItems.filter(item => isTabAllowed(item.id));

  // Filtragem por módulo ativo
  const showFiscal = activeModule === 'ALL' || activeModule === 'FISCAL';
  const showContabil = activeModule === 'ALL' || activeModule === 'CONTABIL';
  const showFolha = activeModule === 'ALL' || activeModule === 'FOLHA';
  const showGestao = activeModule === 'ALL' || activeModule === 'GESTAO';

  const renderNavGroup = (items: typeof fiscalItems) => (
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
                ? `${theme.navActive} rounded-md shadow-xs`
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className={`shrink-0 ${isActive ? theme.textPrimaryLight : ''}`}>
                {item.icon}
              </span>
              <div className="text-left overflow-hidden">
                <span className="block truncate font-medium">{item.label}</span>
                {item.sublabel && (
                  <span className="block text-[10px] text-slate-500 truncate leading-tight">
                    {item.sublabel}
                  </span>
                )}
              </div>
            </div>
            {item.badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
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
          <div className={`w-8 h-8 ${theme.bgPrimary} rounded flex items-center justify-center font-bold text-white text-base shadow-sm ${theme.shadowColor} shrink-0`}>
            {brandShort}
          </div>
          <div className="overflow-hidden">
            <span className="text-white font-semibold text-sm tracking-tight block truncate">
              {brandName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide block">
              ERP Fiscal, Contábil & Folha
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
            <Globe className={`w-4 h-4 ${theme.textPrimaryLight}`} />
          </button>
        )}
      </div>

      {/* Seletor Rápido de Módulo do Sistema */}
      {onSelectModule && (
        <div className="px-3 pt-3 pb-2 border-b border-slate-800/70 bg-slate-900/40">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Módulos do Sistema
            </span>
            {activeModule !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectModule('ALL')}
                className="text-[9px] text-amber-400 hover:underline lowercase font-medium cursor-pointer"
              >
                ver todos
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onSelectModule('ALL')}
              className={`px-1.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                activeModule === 'ALL'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Todos os Módulos"
            >
              Geral
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectModule('FISCAL');
                if (!['apuracao', 'fiscal', 'sped'].includes(activeTab)) {
                  onSelectTab('apuracao');
                }
              }}
              className={`px-1.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                activeModule === 'FISCAL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Módulo Fiscal (MLF)"
            >
              Fiscal
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectModule('CONTABIL');
                if (!['contabil', 'parametros'].includes(activeTab)) {
                  onSelectTab('contabil');
                }
              }}
              className={`px-1.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                activeModule === 'CONTABIL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-300 hover:bg-blue-500/10'
              }`}
              title="Módulo Contábil (MLC)"
            >
              Contábil
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectModule('FOLHA');
                if (!['folha', 'socios'].includes(activeTab)) {
                  onSelectTab('folha');
                }
              }}
              className={`px-1.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                activeModule === 'FOLHA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-300 hover:bg-emerald-500/10'
              }`}
              title="Módulo Folha de Pagamento (MLP)"
            >
              Folha
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* 1. MÓDULO FISCAL (MLF) */}
        {showFiscal && visibleFiscal.length > 0 && (
          <div className="rounded-lg bg-slate-900/30 p-1 border border-amber-500/10">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1.5 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Fiscal (MLF)
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">
                MLF
              </span>
            </div>
            {renderNavGroup(visibleFiscal)}
          </div>
        )}

        {/* 2. MÓDULO CONTÁBIL (MLC) */}
        {showContabil && visibleContabil.length > 0 && (
          <div className="rounded-lg bg-slate-900/30 p-1 border border-blue-500/10">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-1.5 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Contábil (MLC)
              </span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded font-mono">
                MLC
              </span>
            </div>
            {renderNavGroup(visibleContabil)}
          </div>
        )}

        {/* 3. MÓDULO FOLHA DE PAGAMENTO (MLP) */}
        {showFolha && visibleFolha.length > 0 && (
          <div className="rounded-lg bg-slate-900/30 p-1 border border-emerald-500/10">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-1.5 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Folha (MLP)
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                MLP
              </span>
            </div>
            {renderNavGroup(visibleFolha)}
          </div>
        )}

        {/* 4. GOVERNANÇA & SISTEMA */}
        {showGestao && visibleGestao.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2 px-2 flex items-center justify-between">
              <span>Governança & Gestão</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-mono">
                ADM
              </span>
            </div>
            {renderNavGroup(visibleGestao)}
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

