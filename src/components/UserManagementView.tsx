import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  UserCheck, 
  History, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Lock,
  Mail,
  Building,
  KeyRound,
  Plus,
  Ban,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Save
} from 'lucide-react';
import { SystemUser, SystemRole, UserActivityBacklog, RolePermissionConfig, TabModuleId } from '../types';
import { generateSecurePassword } from '../utils/security';
import { initialRolePermissions } from '../data/initialData';

interface UserManagementViewProps {
  users: SystemUser[];
  onAddUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  onToggleUserStatus: (userId: string) => void;
  onChangeUserRole: (userId: string, newRole: SystemRole) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserPassword?: (userId: string, newPassword: string, mustChangePassword?: boolean) => void;
  activeUserId?: string;
  backlog: UserActivityBacklog[];
  onLogActivity: (action: string, description: string, module: UserActivityBacklog['module']) => void;
  rolePermissions: RolePermissionConfig[];
  onUpdateRolePermissions: (rolePermissions: RolePermissionConfig[]) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onAddUser,
  onToggleUserStatus,
  onChangeUserRole,
  onDeleteUser,
  onUpdateUserPassword,
  activeUserId,
  backlog,
  rolePermissions,
  onUpdateRolePermissions,
}) => {
  const [activeTab, setActiveTab] = useState<'perfis' | 'usuarios' | 'backlog'>('perfis');
  
  // Filtros de Backlog
  const [filterModule, setFilterModule] = useState<string>('TODOS');
  const [filterRole, setFilterRole] = useState<string>('TODOS');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Modal Novo Usuário
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<SystemRole>('ANALISTA');
  const [newUserDept, setNewUserDept] = useState('Depto Fiscal');
  const [newUserPassword, setNewUserPassword] = useState(generateSecurePassword(14));
  const [newUserMustChangePassword, setNewUserMustChangePassword] = useState(true);

  // Modal Alterar / Redefinir Senha
  const [passwordModalUser, setPasswordModalUser] = useState<SystemUser | null>(null);
  const [editPasswordInput, setEditPasswordInput] = useState('');
  const [editPasswordMustChange, setEditPasswordMustChange] = useState(true);
  const [editPasswordCopied, setEditPasswordCopied] = useState(false);

  // Modal Confirmação de Exclusão
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<SystemUser | null>(null);

  // Estado local para edição da matriz de permissões
  const [permissionConfigs, setPermissionConfigs] = useState<RolePermissionConfig[]>(rolePermissions);
  const [hasSavedPermissions, setHasSavedPermissions] = useState(false);

  // Módulos do Sistema Disponíveis para Configuração de Visibilidade
  const systemModulesList: {
    id: TabModuleId;
    name: string;
    category: 'Operacional' | 'Conformidade & SPED' | 'Configurações & Gestão';
    description: string;
  }[] = [
    { id: 'dashboard', name: 'Dashboard & Indicadores', category: 'Operacional', description: 'Visão executiva, faturamento, impostos e status das obrigações' },
    { id: 'fiscal', name: 'Fiscal (XML NF-e / NFS-e)', category: 'Operacional', description: 'Importação e conferência automatizada de notas fiscais' },
    { id: 'apuracao', name: 'Apuração Tributária', category: 'Operacional', description: 'Cálculo de alíquotas do Simples, Lucro Presumido e emissão DAS/DARF' },
    { id: 'contabil', name: 'Módulo Contábil', category: 'Operacional', description: 'Plano de contas, Livro Diário, Balancete e Razão Geral' },
    { id: 'folha', name: 'Folha de Pagamento & eSocial', category: 'Operacional', description: 'Pró-labore, salários, INSS progressivo e eventos S-1200' },
    { id: 'socios', name: 'Sócios & Distribuição de Lucros', category: 'Operacional', description: 'Apuração de lucros isentos com base no Art. 14 da LC 123/06' },
    { id: 'sped', name: 'SPED & Obrigações Acessórias', category: 'Conformidade & SPED', description: 'Geração e validação de arquivos ECD, ECF e EFD Fiscal' },
    { id: 'gov', name: 'Transmissões GOV', category: 'Conformidade & SPED', description: 'Disparo de eventos eSocial, DCTFWeb e emissão DARF numerada' },
    { id: 'certificados', name: 'Certificados Digitais (A1)', category: 'Conformidade & SPED', description: 'Cofre criptográfico e alertas de expiração ICP-Brasil' },
    { id: 'auditoria', name: 'Trilha de Auditoria & Conformidade', category: 'Conformidade & SPED', description: 'Log contínuo e imutável de todas as ações de usuários' },
    { id: 'supabase', name: 'Nuvem Supabase (PostgreSQL)', category: 'Conformidade & SPED', description: 'Inspeção e sincronização em tempo real de 13 tabelas' },
    { id: 'parametros', name: 'Parâmetros Fiscais & Contábeis', category: 'Configurações & Gestão', description: 'Contas de integração, travas contábeis e alíquotas de presunção' },
    { id: 'personalizacao', name: 'Personalização & Marca', category: 'Configurações & Gestão', description: 'Nome do escritório, logo, timeout de sessão e landing page' },
    { id: 'usuarios', name: 'Gestão de Usuários & Perfis', category: 'Configurações & Gestão', description: 'Controle de acesso baseado em papéis (RBAC) e senhas' },
  ];

  // Alternar permissão de um módulo para um perfil específico
  const togglePermission = (role: SystemRole, tabId: TabModuleId) => {
    setHasSavedPermissions(false);
    setPermissionConfigs(prev => {
      return prev.map(config => {
        if (config.role !== role) return config;

        const isAllowed = config.allowedTabs.includes(tabId);
        let updatedTabs: TabModuleId[];
        if (isAllowed) {
          // Não permitir remover a aba 'usuarios' do ADMINISTRADOR para evitar lockout
          if (role === 'ADMINISTRADOR' && tabId === 'usuarios') {
            return config;
          }
          updatedTabs = config.allowedTabs.filter(t => t !== tabId);
        } else {
          updatedTabs = [...config.allowedTabs, tabId];
        }
        return {
          ...config,
          allowedTabs: updatedTabs,
        };
      });
    });
  };

  // Conceder todos os módulos para um perfil
  const grantAllModules = (role: SystemRole) => {
    setHasSavedPermissions(false);
    const allTabIds = systemModulesList.map(m => m.id);
    setPermissionConfigs(prev => prev.map(c => c.role === role ? { ...c, allowedTabs: allTabIds } : c));
  };

  // Limpar módulos de um perfil (mantendo apenas dashboard)
  const clearModules = (role: SystemRole) => {
    setHasSavedPermissions(false);
    const minimalTabs: TabModuleId[] = role === 'ADMINISTRADOR' ? ['dashboard', 'usuarios'] : ['dashboard'];
    setPermissionConfigs(prev => prev.map(c => c.role === role ? { ...c, allowedTabs: minimalTabs } : c));
  };

  // Salvar a configuração de permissões
  const handleSavePermissions = () => {
    onUpdateRolePermissions(permissionConfigs);
    setHasSavedPermissions(true);
    setTimeout(() => setHasSavedPermissions(false), 3000);
  };

  // Restaurar padrões de fábrica
  const handleResetToDefaultPermissions = () => {
    setPermissionConfigs(initialRolePermissions);
    onUpdateRolePermissions(initialRolePermissions);
    setHasSavedPermissions(true);
    setTimeout(() => setHasSavedPermissions(false), 3000);
  };

  const handleOpenAddModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('ANALISTA');
    setNewUserDept('Depto Fiscal');
    setNewUserPassword(generateSecurePassword(14));
    setNewUserMustChangePassword(true);
    setShowAddModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDept,
      active: true,
      avatarColor: newUserRole === 'ADMINISTRADOR' ? 'bg-blue-600' : newUserRole === 'ANALISTA' ? 'bg-emerald-600' : 'bg-amber-600',
      password: newUserPassword.trim() || generateSecurePassword(14),
      mustChangePassword: newUserMustChangePassword,
      lastLogin: new Date().toISOString(),
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddModal(false);
  };

  const handleOpenPasswordModal = (user: SystemUser) => {
    setPasswordModalUser(user);
    const initialPass = generateSecurePassword(14);
    setEditPasswordInput(initialPass);
    setEditPasswordMustChange(true);
    setEditPasswordCopied(false);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !editPasswordInput.trim()) return;

    if (onUpdateUserPassword) {
      onUpdateUserPassword(passwordModalUser.id, editPasswordInput.trim(), editPasswordMustChange);
    }
    setPasswordModalUser(null);
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(editPasswordInput);
    setEditPasswordCopied(true);
    setTimeout(() => setEditPasswordCopied(false), 2000);
  };

  // Filtragem de backlog
  const filteredBacklog = backlog.filter(item => {
    if (filterModule !== 'TODOS' && item.module !== filterModule) return false;
    if (filterRole !== 'TODOS' && item.userRole !== filterRole) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return (
        item.userName.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              Segurança & Governança Corporativa
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Controle de Acesso Baseado em Perfis (RBAC)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Gerenciamento de Perfis, Usuários & Auditoria
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Defina papéis (Administrador, Analista, Operador), configure quais módulos cada perfil tem autorização para visualizar e audite acessos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('perfis')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'perfis'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Gestão de Perfis & Módulos (RBAC)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usuarios')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Equipe & Usuários Cadastrados ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backlog')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'backlog'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Backlog de Atividades & Auditoria ({backlog.length})
        </button>
      </div>

      {/* TAB 1: GESTÃO DE PERFIS & PERMISSÕES (RBAC) */}
      {activeTab === 'perfis' && (
        <div className="space-y-6">
          {/* Instruções e Controle de Salvamento */}
          <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-white rounded-xl border border-purple-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Controle Dinâmico de Módulos por Perfil
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Marque ou desmarque quais telas cada perfil poderá visualizar e operar. Os menus laterais dos usuários são adaptados imediatamente após a gravação.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetToDefaultPermissions}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Restaurar Padrão
              </button>
              <button
                id="btn-save-role-permissions"
                type="button"
                onClick={handleSavePermissions}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                  hasSavedPermissions
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                }`}
              >
                {hasSavedPermissions ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Permissões Salvas!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cards dos 3 Perfis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {permissionConfigs.map(config => {
              const allowedCount = config.allowedTabs.length;
              const totalCount = systemModulesList.length;
              return (
                <div key={config.role} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${config.badgeColor}`}>
                      {config.role}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {allowedCount} de {totalCount} módulos
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{config.roleName}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {config.description}
                  </p>
                  
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => grantAllModules(config.role)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Liberar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => clearModules(config.role)}
                      className="text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      Restringir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matriz Interativa de Permissões por Módulo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriz Interativa de Visibilidade dos Módulos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique nas caixas de seleção para habilitar ou bloquear o acesso de cada papel.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-72">Módulo & Funcionalidade</th>
                    <th className="py-3 px-4 w-32">Categoria</th>
                    <th className="py-3 px-4 text-center w-36">
                      <div className="flex flex-col items-center">
                        <span className="text-blue-700 font-bold">Administrador</span>
                        <span className="text-[10px] text-slate-400 font-normal">Acesso Total</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-36">
                      <div className="flex flex-col items-center">
                        <span className="text-emerald-700 font-bold">Analista</span>
                        <span className="text-[10px] text-slate-400 font-normal">Fiscal & Contábil</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-36">
                      <div className="flex flex-col items-center">
                        <span className="text-amber-700 font-bold">Operador</span>
                        <span className="text-[10px] text-slate-400 font-normal">Operações & XML</span>
                      </div>
                    </th>
                    <th className="py-3 px-4">Descrição de Acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systemModulesList.map(mod => {
                    const adminConfig = permissionConfigs.find(c => c.role === 'ADMINISTRADOR');
                    const analistaConfig = permissionConfigs.find(c => c.role === 'ANALISTA');
                    const operadorConfig = permissionConfigs.find(c => c.role === 'OPERADOR');

                    const isAdminAllowed = adminConfig?.allowedTabs.includes(mod.id) ?? true;
                    const isAnalistaAllowed = analistaConfig?.allowedTabs.includes(mod.id) ?? false;
                    const isOperadorAllowed = operadorConfig?.allowedTabs.includes(mod.id) ?? false;

                    return (
                      <tr key={mod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{mod.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {mod.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            mod.category === 'Operacional'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : mod.category === 'Conformidade & SPED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {mod.category}
                          </span>
                        </td>

                        {/* Checkbox Administrador */}
                        <td className="py-3 px-4 text-center">
                          <label className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAdminAllowed}
                              onChange={() => togglePermission('ADMINISTRADOR', mod.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* Checkbox Analista */}
                        <td className="py-3 px-4 text-center">
                          <label className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAnalistaAllowed}
                              onChange={() => togglePermission('ANALISTA', mod.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </label>
                        </td>

                        {/* Checkbox Operador */}
                        <td className="py-3 px-4 text-center">
                          <label className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isOperadorAllowed}
                              onChange={() => togglePermission('OPERADOR', mod.id)}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                            />
                          </label>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px] leading-relaxed">
                          {mod.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Tabela com Botão de Salvar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total de 14 módulos homologados com segregação de funções (SoD)
              </span>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Aplicar Permissões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USUÁRIOS */}
      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Usuários Ativos no Escritório Contábil</h3>
              <p className="text-xs text-slate-500 mt-0.5">Gerenciamento de contas, atribuição de perfis e controle de acesso.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Membro
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nome & Identificação</th>
                  <th className="py-3 px-4">E-mail de Acesso</th>
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4">Perfil (RBAC)</th>
                  <th className="py-3 px-4">Segurança / 1º Acesso</th>
                  <th className="py-3 px-4">Último Acesso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => {
                  const isSelf = u.id === activeUserId;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${u.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
                            {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600">{u.department}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={e => onChangeUserRole(u.id, e.target.value as SystemRole)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                            u.role === 'ADMINISTRADOR'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : u.role === 'ANALISTA'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          } ${isSelf ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                          <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                          <option value="ANALISTA">ANALISTA</option>
                          <option value="OPERADOR">OPERADOR</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Usuário deve criar nova senha pessoal no próximo login">
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            Troca Obrigatória no 1º Acesso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Senha Pessoal Ativa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(u.lastLogin).toLocaleDateString('pt-BR')} {new Date(u.lastLogin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.active ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bloquear / Desbloquear */}
                          <button
                            type="button"
                            onClick={() => onToggleUserStatus(u.id)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              u.active
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.active ? "Bloquear acesso do usuário" : "Desbloquear usuário"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Alterar / Redefinir Senha */}
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(u)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                            title="Alterar ou redefinir senha de acesso"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir Usuário */}
                          {onDeleteUser && (
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => setDeleteConfirmUser(u)}
                              className={`p-1.5 rounded transition-colors ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                              }`}
                              title={isSelf ? "Você não pode excluir sua própria conta logada" : "Excluir usuário"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BACKLOG DE ATIVIDADES & AUDITORIA */}
      {activeTab === 'backlog' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar histórico..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 w-52"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Módulo:</span>
                <select
                  value={filterModule}
                  onChange={e => setFilterModule(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="TODOS">Todos os Módulos</option>
                  <option value="FISCAL">Fiscal</option>
                  <option value="CONTABIL">Contábil</option>
                  <option value="FOLHA">Folha</option>
                  <option value="SPED">SPED</option>
                  <option value="USUARIOS">Usuários & Acesso</option>
                  <option value="CONFIGURACOES">Configurações</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Papel:</span>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="TODOS">Todos os Papéis</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="ANALISTA">Analista</option>
                  <option value="OPERADOR">Operador</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Exibindo <strong>{filteredBacklog.length}</strong> de {backlog.length} registros
            </div>
          </div>

          {/* Tabela de Backlog */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Operador Responsável</th>
                    <th className="py-3 px-4">Perfil</th>
                    <th className="py-3 px-4">Módulo</th>
                    <th className="py-3 px-4">Ação Executada</th>
                    <th className="py-3 px-4">Detalhes Técnicos</th>
                    <th className="py-3 px-4">IP</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBacklog.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString('pt-BR')} {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.userName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.userRole === 'ADMINISTRADOR'
                            ? 'bg-blue-100 text-blue-800'
                            : item.userRole === 'ANALISTA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 text-[11px]">{item.module}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.action}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={item.description}>
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{item.ip}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'SUCESSO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'BLOQUEADO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Novo Membro da Equipe</h3>
                  <p className="text-xs text-slate-500">Cadastre um usuário e defina as credenciais de acesso.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-medium"
                  placeholder="Ex: Carlos Mendonça"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-medium"
                  placeholder="carlos@audicon.cnt.br"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={e => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-medium"
                  placeholder="Ex: Depto Fiscal / Contábil"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso (RBAC)</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as SystemRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-bold"
                >
                  <option value="ADMINISTRADOR">Administrador (Acesso Total & Fechamento)</option>
                  <option value="ANALISTA">Analista (Escrituração, Apuração & SPED)</option>
                  <option value="OPERADOR">Operador (Upload de Documentos & Lançamentos)</option>
                </select>
              </div>

              {/* Campo Senha Inicial com Gerador Seguro */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Senha Inicial de Acesso</label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserPassword(generateSecurePassword(14));
                      setNewUserMustChangePassword(true);
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Gerar Automática
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-mono text-xs bg-slate-50 font-bold"
                  placeholder="Mínimo 12 caracteres com letras, números e símbolos"
                />
                
                {/* Opção de Troca Obrigatória no Primeiro Acesso */}
                <label className="mt-2 flex items-start gap-2 p-2 bg-purple-50/60 border border-purple-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUserMustChangePassword}
                    onChange={e => setNewUserMustChangePassword(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-[11px] text-slate-700">
                    <strong>Exigir troca obrigatória de senha no primeiro acesso</strong>
                    <span className="block text-[10px] text-slate-500">
                      O usuário será obrigado a cadastrar sua própria senha pessoal ao logar pela primeira vez.
                    </span>
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar / Redefinir Senha */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Alterar / Redefinir Senha</h3>
                  <p className="text-xs text-slate-500">{passwordModalUser.name} ({passwordModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Nova Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPasswordInput(generateSecurePassword(14));
                      setEditPasswordMustChange(true);
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Gerar Automática
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editPasswordInput}
                    onChange={e => setEditPasswordInput(e.target.value)}
                    className="w-full pl-3 pr-20 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-mono text-xs bg-slate-50 font-bold"
                    placeholder="Mínimo 12 caracteres"
                  />
                  <button
                    type="button"
                    onClick={copyPasswordToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    {editPasswordCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Opção de Troca Obrigatória no Primeiro Acesso */}
                <label className="mt-3 flex items-start gap-2 p-2.5 bg-purple-50/60 border border-purple-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPasswordMustChange}
                    onChange={e => setEditPasswordMustChange(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-[11px] text-slate-700">
                    <strong>Exigir que o usuário troque esta senha no próximo login</strong>
                    <span className="block text-[10px] text-slate-500">
                      Ideal para senhas geradas automaticamente pelo administrador.
                    </span>
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Excluir Usuário</h3>
                <p className="text-xs text-slate-500">Essa ação revogará todos os acessos imediatamente.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja remover o usuário <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteUser && deleteConfirmUser) {
                    onDeleteUser(deleteConfirmUser.id);
                  }
                  setDeleteConfirmUser(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
