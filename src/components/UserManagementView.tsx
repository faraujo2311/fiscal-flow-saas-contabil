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
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Lock,
  Mail,
  Building,
  KeyRound,
  Eye,
  Plus
} from 'lucide-react';
import { SystemUser, SystemRole, UserActivityBacklog } from '../types';

interface UserManagementViewProps {
  users: SystemUser[];
  onAddUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  onToggleUserStatus: (userId: string) => void;
  onChangeUserRole: (userId: string, newRole: SystemRole) => void;
  backlog: UserActivityBacklog[];
  onLogActivity: (action: string, description: string, module: UserActivityBacklog['module']) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onAddUser,
  onToggleUserStatus,
  onChangeUserRole,
  backlog,
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
      lastLogin: new Date().toISOString(),
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddModal(false);
  };

  // Filtragem de backlog
  const filteredBacklog = backlog.filter(item => {
    if (filterModule !== 'TODOS' && item.module !== filterModule) return false;
    if (filterRole !== 'TODOS' && item.userRole !== filterRole) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      if (!matchDesc && !matchUser && !matchAction) return false;
    }
    return true;
  });

  const exportBacklogCsv = () => {
    const headers = ['Data/Hora', 'Usuario', 'Perfil', 'Modulo', 'Acao', 'Descricao', 'IP', 'Status'];
    const rows = filteredBacklog.map(b => [
      b.timestamp,
      `"${b.userName}"`,
      b.userRole,
      b.module,
      `"${b.action}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      b.ip,
      b.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_backlog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Matriz de permissões RBAC
  const permissionsMatrix = [
    {
      modulo: 'Visão Geral & Dashboard',
      admin: true,
      analista: true,
      operador: true,
      detalhe: 'Acesso a KPIs, gráficos e resumos contábeis.',
    },
    {
      modulo: 'Importação & Parser de XMLs',
      admin: true,
      analista: true,
      operador: true,
      detalhe: 'Upload de NF-e e NFS-e para conferência.',
    },
    {
      modulo: 'Apuração Fiscal & DAS / DARF',
      admin: true,
      analista: true,
      operador: false,
      detalhe: 'Cálculo de alíquotas efetivas e geração de guias.',
    },
    {
      modulo: 'Escrituração Contábil & Diário Geral',
      admin: true,
      analista: true,
      operador: false,
      detalhe: 'Lançamentos manuais e partidas dobradas oficiais.',
    },
    {
      modulo: 'Folha de Pagamento & eSocial',
      admin: true,
      analista: true,
      operador: false,
      detalhe: 'Cálculo de encargos, holerites e eventos S-1200.',
    },
    {
      modulo: 'Sócios & Distribuição de Lucros',
      admin: true,
      analista: true,
      operador: false,
      detalhe: 'Apuração de lucros isentos e emissão de recibos.',
    },
    {
      modulo: 'Geração de Arquivos SPED (EFD & ECD)',
      admin: true,
      analista: true,
      operador: false,
      detalhe: 'Geração e validação dos arquivos magnéticos da RFB.',
    },
    {
      modulo: 'Sincronização Nuvem (PostgreSQL)',
      admin: true,
      analista: true,
      operador: false,
      detalhe: 'Sincronização e restauração do banco de dados.',
    },
    {
      modulo: 'Parâmetros Fiscais & Contábeis',
      admin: true,
      analista: false,
      operador: false,
      detalhe: 'Configuração de contas e travas de fechamento.',
    },
    {
      modulo: 'Gestão de Usuários & Perfis',
      admin: true,
      analista: false,
      operador: false,
      detalhe: 'Criação de contas e auditoria de atividades.',
    },
  ];

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
            Defina papéis (Administrador, Analista, Operador), gerencie credenciais da equipe contábil e inspecione a trilha de auditoria completa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
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
          <ShieldCheck className="w-3.5 h-3.5" />
          Perfis de Acesso (RBAC)
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

      {/* TAB 1: PERFIS DE ACESSO */}
      {activeTab === 'perfis' && (
        <div className="space-y-6">
          {/* Cards dos 3 Perfis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                  Nível 1 • Máximo
                </span>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Administrador</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sócio, Diretor ou Contador Responsável Técnico com CRC ativo. Possui autonomia irrestrita sobre parametrizações, fechamento contábil e auditoria.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                <span className="font-bold text-blue-600">Permissão Total:</span> Acesso irrestrito a todos os módulos, fechamento e desfazimento.
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Nível 2 • Técnico
                </span>
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Analista Contábil / Fiscal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Profissional encarregado da escrituração diária, importação de notas, apuração do Simples/Presumido, conferência de folha e geração do SPED.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                <span className="font-bold text-emerald-600">Operação Completa:</span> Não altera parâmetros mestres nem exclui usuários do sistema.
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  Nível 3 • Operacional
                </span>
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Operador / Assistente</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Auxiliares e estagiários contábeis dedicados ao upload de arquivos XML, digitação de lançamentos e consulta a guias de recolhimento.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                <span className="font-bold text-amber-600">Restrição de Segurança:</span> Não apura impostos finais, não fecha mês e não gera SPED.
              </div>
            </div>
          </div>

          {/* Matriz Visual de Permissões */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Matriz Detalhada de Permissões por Módulo</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visão consolidada de direitos de acesso e segregação de funções (SoD).</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Funcionalidade / Módulo</th>
                    <th className="py-3 px-4 text-center w-28">Administrador</th>
                    <th className="py-3 px-4 text-center w-28">Analista</th>
                    <th className="py-3 px-4 text-center w-28">Operador</th>
                    <th className="py-3 px-4">Objetivo de Controle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.modulo}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.analista ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700">
                            <XCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.operador ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.detalhe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Membro
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4">Perfil Atribuído</th>
                  <th className="py-3 px-4">Último Acesso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${u.avatarColor} text-white font-bold flex items-center justify-center text-[10px]`}>
                          {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-600">{u.department}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={e => onChangeUserRole(u.id, e.target.value as SystemRole)}
                        className={`text-[11px] font-bold px-2 py-1 rounded border focus:ring-1 focus:ring-purple-500 cursor-pointer ${
                          u.role === 'ADMINISTRADOR'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : u.role === 'ANALISTA'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="ADMINISTRADOR">Administrador</option>
                        <option value="ANALISTA">Analista</option>
                        <option value="OPERADOR">Operador</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.lastLogin).toLocaleDateString('pt-BR')} {new Date(u.lastLogin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleUserStatus(u.id)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded cursor-pointer transition-colors ${
                          u.active
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.active ? 'Desativar' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))}
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
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-medium"
                >
                  <option value="TODOS">Todos os Módulos</option>
                  <option value="FISCAL">Fiscal (XML)</option>
                  <option value="CONTABIL">Contábil</option>
                  <option value="FOLHA">Folha eSocial</option>
                  <option value="SOCIOS">Sócios & Lucros</option>
                  <option value="SPED">SPED</option>
                  <option value="SUPABASE">Supabase Cloud</option>
                  <option value="CONFIGURACOES">Configurações</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Perfil:</span>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-medium"
                >
                  <option value="TODOS">Todos os Perfis</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="ANALISTA">Analista</option>
                  <option value="OPERADOR">Operador</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={exportBacklogCsv}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>

          {/* Tabela de Backlog */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Perfil</th>
                    <th className="py-3 px-4">Módulo</th>
                    <th className="py-3 px-4">Ação</th>
                    <th className="py-3 px-4">Descrição & Contexto</th>
                    <th className="py-3 px-4">IP Origem</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBacklog.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString('pt-BR')} {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.userName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
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
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {item.module}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {item.ip}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {item.status === 'SUCESSO' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            OK
                          </span>
                        )}
                        {item.status === 'ALERTA' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Alerta
                          </span>
                        )}
                        {item.status === 'BLOQUEADO' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-600" />
                            Bloqueado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredBacklog.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Cadastrar Novo Usuário
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 font-medium"
                  placeholder="Ex: Ana Carolina Silva"
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
                  placeholder="ana.silva@escritorio.cnt.br"
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
    </div>
  );
};
