import React, { useState, useEffect } from 'react';
import { 
  initialOffice, 
  initialCompanies, 
  initialCompetences, 
  initialChartOfAccounts, 
  initialPostingRules, 
  initialFiscalDocuments, 
  initialAccountingEntries,
  initialEmployees, 
  initialPartners,
  initialProfitDistributions,
  initialObligations, 
  initialCertificates, 
  initialSubmissions, 
  initialAuditLogs,
  initialAccountingParameters,
  initialSystemCustomization,
  initialSystemUsers,
  initialUserActivityBacklog,
  initialRolePermissions
} from './data/initialData';
import { 
  Company, 
  FiscalDocument, 
  TaxAssessment, 
  AccountingEntry, 
  AccountingAccount, 
  Employee, 
  PayrollPayslip, 
  Partner,
  ProfitDistributionRecord,
  TaxObligation, 
  DigitalCertificate, 
  GovSubmission, 
  AuditLog, 
  Competence,
  AccountingParameters,
  SystemCustomization,
  SystemUser,
  UserActivityBacklog,
  SystemRole,
  RolePermissionConfig
} from './types';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FiscalView } from './components/FiscalView';
import { TaxAssessmentView } from './components/TaxAssessmentView';
import { AccountingView } from './components/AccountingView';
import { PayrollView } from './components/PayrollView';
import { PartnersView } from './components/PartnersView';
import { SpedObligationsView } from './components/SpedObligationsView';
import { GovTransmissionView } from './components/GovTransmissionView';
import { CertificatesAndAuditView } from './components/CertificatesAndAuditView';
import { SupabaseIntegrationView } from './components/SupabaseIntegrationView';
import { AccountingParametersView } from './components/AccountingParametersView';
import { CustomizationView } from './components/CustomizationView';
import { UserManagementView } from './components/UserManagementView';
import { LandingPageView } from './components/LandingPageView';
import { LoginView } from './components/LoginView';
import { CompanyManagementModal } from './components/CompanyManagementModal';
import { CompetenceManagementModal } from './components/CompetenceManagementModal';
import { calculateTaxAssessment } from './services/taxEngine';
import { 
  autoJournalizeFiscalDocuments, 
  autoJournalizePayroll, 
  autoJournalizeProfitDistribution,
  generateBalanceSheet 
} from './services/accountingEngine';
import { scheduleAutoSync, AutoSyncState } from './services/autoSyncService';

/**
 * Hook de persistência local para manter o estado da aplicação entre recarregamentos (F5)
 */
function useLocalStorageState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Erro ao ler localStorage [${key}]:`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage [${key}]:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default function App() {
  // Estado Multi-Tenant e Contexto com Persistência
  const [office] = useState(initialOffice);
  const [companies, setCompanies] = useLocalStorageState<Company[]>('saas_contabil_companies', initialCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useLocalStorageState<string>('saas_contabil_selected_company_id', initialCompanies[0].id);
  
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0] || initialCompanies[0];
  const setSelectedCompany = (comp: Company) => setSelectedCompanyId(comp.id);

  const [competences, setCompetences] = useLocalStorageState<Competence[]>('saas_contabil_competences', initialCompetences);
  const [selectedCompetence, setSelectedCompetence] = useLocalStorageState<string>('saas_contabil_selected_competence', '09/2026');
  const [activeTab, setActiveTab] = useLocalStorageState<TabId>('saas_contabil_active_tab', 'dashboard');

  // Dados do Domínio com Persistência Local Real (Preservados após F5)
  const [documents, setDocuments] = useLocalStorageState<FiscalDocument[]>('saas_contabil_documents', initialFiscalDocuments);
  const [assessments, setAssessments] = useLocalStorageState<TaxAssessment[]>('saas_contabil_assessments', []);
  const [accounts, setAccounts] = useLocalStorageState<AccountingAccount[]>('saas_contabil_accounts', initialChartOfAccounts);
  const [entries, setEntries] = useLocalStorageState<AccountingEntry[]>('saas_contabil_entries', initialAccountingEntries);
  const [postingRules] = useState(initialPostingRules);
  const [employees, setEmployees] = useLocalStorageState<Employee[]>('saas_contabil_employees', initialEmployees);
  const [payslips, setPayslips] = useLocalStorageState<PayrollPayslip[]>('saas_contabil_payslips', []);
  const [partners, setPartners] = useLocalStorageState<Partner[]>('saas_contabil_partners', initialPartners);
  const [profitDistributions, setProfitDistributions] = useLocalStorageState<ProfitDistributionRecord[]>('saas_contabil_profit_dist', initialProfitDistributions);
  const [obligations, setObligations] = useLocalStorageState<TaxObligation[]>('saas_contabil_obligations', initialObligations);
  const [certificates, setCertificates] = useLocalStorageState<DigitalCertificate[]>('saas_contabil_certificates', initialCertificates);
  const [submissions, setSubmissions] = useLocalStorageState<GovSubmission[]>('saas_contabil_submissions', initialSubmissions);
  const [auditLogs, setAuditLogs] = useLocalStorageState<AuditLog[]>('saas_contabil_audit_logs', initialAuditLogs);

  // Fase 3: Parâmetros do Especialista, Personalização, Perfis & Usuários
  const [accountingParameters, setAccountingParameters] = useLocalStorageState<AccountingParameters>('saas_contabil_parameters', initialAccountingParameters);
  const [customization, setCustomization] = useLocalStorageState<SystemCustomization>('saas_contabil_customization', initialSystemCustomization);
  const [users, setUsers] = useLocalStorageState<SystemUser[]>('saas_contabil_users', initialSystemUsers);
  const [userBacklog, setUserBacklog] = useLocalStorageState<UserActivityBacklog[]>('saas_contabil_backlog', initialUserActivityBacklog);
  const [rolePermissions, setRolePermissions] = useLocalStorageState<RolePermissionConfig[]>('audicon_role_permissions', initialRolePermissions);
  
  // Estado de Autenticação e Usuário Conectado
  const [isAuthenticated, setIsAuthenticated] = useLocalStorageState<boolean>('saas_contabil_auth_active', false);
  const [activeUserId, setActiveUserId] = useLocalStorageState<string>('saas_contabil_active_user_id', 'user-faraujo');
  const activeUser = users.find(u => u.id === activeUserId) || users[0];

  // Controle de Modais e Visualização
  const [isViewingLandingPage, setIsViewingLandingPage] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('landing') || search.includes('landing')) {
        return true;
      }
    }
    return false;
  });
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);
  const [isCompetenceModalOpen, setIsCompetenceModalOpen] = useState<boolean>(false);

  // Sincronização com hash da URL (#landing)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.toLowerCase().includes('landing')) {
        setIsViewingLandingPage(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Status de Sincronização Automática com Supabase
  const [autoSyncState, setAutoSyncState] = useState<AutoSyncState>({
    status: 'SYNCED',
    lastSyncedAt: new Date(),
    tablesCount: 13,
  });

  // Temporizador de Sessão e Logout por Inatividade
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [sessionMinutesRemaining, setSessionMinutesRemaining] = useState<number>(customization.sessionTimeoutMinutes || 30);

  // Toast Notificação
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Sessão encerrada com sucesso.');
  };

  // Monitoramento de inatividade para expiração da sessão
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetActivity = () => {
      setLastActivityTime(Date.now());
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetActivity));

    const checkInterval = setInterval(() => {
      const timeoutMinutes = customization.sessionTimeoutMinutes || 30;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const elapsed = Date.now() - lastActivityTime;
      const remainingMs = timeoutMs - elapsed;

      if (remainingMs <= 0) {
        setIsAuthenticated(false);
        showToast('Sua sessão expirou devido à inatividade. Faça login novamente para continuar.');
      } else {
        setSessionMinutesRemaining(Math.max(1, Math.ceil(remainingMs / 60000)));
      }
    }, 10000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, resetActivity));
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, lastActivityTime, customization.sessionTimeoutMinutes]);

  // Guardião RBAC: redireciona caso o usuário não possua permissão para a aba ativa
  useEffect(() => {
    if (isAuthenticated && activeUser && activeUser.role !== 'ADMINISTRADOR') {
      const roleConfig = rolePermissions.find(r => r.role === activeUser.role);
      if (roleConfig && !roleConfig.allowedTabs.includes(activeTab)) {
        setActiveTab(roleConfig.allowedTabs[0] || 'dashboard');
      }
    }
  }, [activeTab, activeUser, rolePermissions, isAuthenticated]);

  // Sincronização Automática em Background com o Supabase
  useEffect(() => {
    scheduleAutoSync(
      {
        companies,
        documents,
        entries,
        accounts,
        employees,
        payslips,
        partners,
        distributions: profitDistributions,
        obligations,
        accountingParameters,
        customization,
        users,
        userBacklog,
      },
      (state) => {
        setAutoSyncState(state);
      },
      3000
    );
  }, [
    companies,
    documents,
    entries,
    accounts,
    employees,
    payslips,
    partners,
    profitDistributions,
    obligations,
    accountingParameters,
    customization,
    users,
    userBacklog,
  ]);

  // Dados filtrados e computados para a empresa ativa
  const companyPartners = partners.filter(p => p.companyId === selectedCompany.id);
  const companyProfitDistributions = profitDistributions.filter(d => d.companyId === selectedCompany.id);

  // Status de contabilização da folha do mês no Diário Geral
  const isPayrollJournalized = entries.some(e => e.competencia === selectedCompetence && e.origemTipo === 'FOLHA');

  // Saldo de Lucros Acumulados no Patrimônio Líquido apurado pelo Balanço Patrimonial
  const balanceSheetCurrent = generateBalanceSheet(accounts, entries);
  const lucrosItem = balanceSheetCurrent.patrimonioLiquido.find(p => p.nome.toLowerCase().includes('lucro') || p.codigo.startsWith('2.3.02'));
  const saldoLucrosAcumulados = lucrosItem ? lucrosItem.saldo : 450000;

  // Redefinir Dados de Demonstração (Demo)
  const handleResetDemoData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const addAuditLog = (acao: AuditLog['acao'], detalhes: string, entidade: AuditLog['entidade'] = 'DOCUMENTO_FISCAL') => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      companyId: selectedCompany.id,
      timestamp: new Date().toISOString(),
      usuario: activeUser?.name || 'Carlos Mendes',
      acao,
      detalhes,
      entidade,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handlers da Fase 3: Parâmetros, Personalização e Usuários
  const handleLogBacklog = (action: string, description: string, module: UserActivityBacklog['module']) => {
    const newEntry: UserActivityBacklog = {
      id: `backlog-${Date.now()}`,
      userId: activeUser?.id || 'user-faraujo',
      userName: activeUser?.name || 'Administrador',
      userRole: activeUser?.role || 'ADMINISTRADOR',
      action,
      description,
      module,
      ip: '192.168.1.100',
      timestamp: new Date().toISOString(),
      status: 'SUCESSO',
    };
    setUserBacklog(prev => [newEntry, ...prev]);
  };

  const handleSaveParameters = (newParams: AccountingParameters) => {
    setAccountingParameters(newParams);
    addAuditLog('PARAMETRIZACAO', 'Parâmetros contábeis e fiscais do especialista atualizados.', 'SISTEMA');
    handleLogBacklog('ATUALIZAR_PARAMETROS', 'Configurações de contas e alíquotas salvas', 'CONFIGURACOES');
    showToast('Parâmetros contábeis atualizados com sucesso.');
  };

  const handleSaveCustomization = (newCustom: SystemCustomization) => {
    setCustomization(newCustom);
    addAuditLog('PARAMETRIZACAO', `Customização visual e branding atualizados: ${newCustom.systemName}`, 'SISTEMA');
    handleLogBacklog('ATUALIZAR_CUSTOMIZACAO', `Identidade visual atualizada: ${newCustom.systemName}`, 'CONFIGURACOES');
    showToast('Personalização e branding aplicados com sucesso.');
  };

  const handleAddUser = (newUser: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const created: SystemUser = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, created]);
    addAuditLog('CRIAR_USUARIO', `Novo usuário cadastrado: ${created.name} (${created.role})`, 'SEGURANCA');
    handleLogBacklog('CRIAR_USUARIO', `Usuário ${created.name} criado com perfil ${created.role}`, 'USUARIOS');
    showToast(`Usuário ${created.name} adicionado com sucesso.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = !u.active;
        addAuditLog('ATUALIZAR_USUARIO', `Status do usuário ${u.name} alterado para ${newStatus ? 'Ativo' : 'Bloqueado'}`, 'SEGURANCA');
        handleLogBacklog('ALTERAR_STATUS_USUARIO', `Status de ${u.name} alterado para ${newStatus ? 'Ativo' : 'Bloqueado'}`, 'USUARIOS');
        showToast(`Status do usuário atualizado.`);
        return { ...u, active: newStatus };
      }
      return u;
    }));
  };

  const handleChangeUserRole = (userId: string, newRole: SystemRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addAuditLog('ALTERAR_PERFIL', `Perfil de ${u.name} alterado para ${newRole}`, 'SEGURANCA');
        handleLogBacklog('ALTERAR_PERFIL_USUARIO', `Perfil de ${u.name} alterado para ${newRole}`, 'USUARIOS');
        showToast(`Perfil de ${u.name} alterado para ${newRole}.`);
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === activeUser?.id) {
      showToast('Você não pode excluir sua própria conta conectada.');
      return;
    }
    const userToDelete = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('ATUALIZAR_USUARIO', `Usuário ${userToDelete?.name || userId} excluído`, 'SEGURANCA');
    handleLogBacklog('EXCLUIR_USUARIO', `Usuário ${userToDelete?.name || userId} excluído`, 'USUARIOS');
    showToast('Usuário excluído com sucesso.');
  };

  const handleUpdateUserPassword = (userId: string, newPassword: string, mustChangePassword: boolean = false) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, mustChangePassword } : u));
    const userToUpdate = users.find(u => u.id === userId);
    addAuditLog('ATUALIZAR_USUARIO', `Senha redefinida para ${userToUpdate?.name || userId}${mustChangePassword ? ' (Troca obrigatória no 1º acesso)' : ''}`, 'SEGURANCA');
    handleLogBacklog('REDEFINIR_SENHA', `Senha redefinida para ${userToUpdate?.name || userId}`, 'USUARIOS');
    showToast('Senha atualizada com sucesso.');
  };

  const handleUpdateRolePermissions = (newPermissions: RolePermissionConfig[]) => {
    setRolePermissions(newPermissions);
    addAuditLog('PARAMETRIZACAO', 'Matriz de permissões dos perfis (RBAC) atualizada pelo Administrador', 'SEGURANCA');
    handleLogBacklog('ATUALIZAR_PERFIS', 'Permissões dos perfis de acesso atualizadas', 'USUARIOS');
    showToast('Permissões dos perfis atualizadas com sucesso.');
  };

  const handleUpdatePasswordAndLogin = (userId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, password: newPassword, mustChangePassword: false };
      }
      return u;
    }));
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      const updatedUser = { ...foundUser, password: newPassword, mustChangePassword: false };
      setActiveUserId(updatedUser.id);
      setIsAuthenticated(true);
      setLastActivityTime(Date.now());
      addAuditLog('ATUALIZAR_USUARIO', `Usuário ${updatedUser.name} cadastrou nova senha pessoal no primeiro acesso`, 'SEGURANCA');
      handleLogBacklog('PRIMEIRO_ACESSO', `Senha definitiva cadastrada no primeiro acesso por ${updatedUser.name}`, 'USUARIOS');
      showToast(`Senha pessoal cadastrada com sucesso! Bem-vindo(a), ${updatedUser.name}!`);
    }
  };

  // Handlers para Gestão de Empresas
  const handleAddCompany = (newComp: Omit<Company, 'id'>) => {
    const created: Company = {
      ...newComp,
      id: `comp-${Date.now()}`,
    };
    setCompanies(prev => [...prev, created]);
    setSelectedCompany(created);
    handleLogBacklog('CRIAR_EMPRESA', `Empresa ${created.razaoSocial} cadastrada`, 'CONFIGURACOES');
    showToast(`Empresa "${created.razaoSocial}" cadastrada com sucesso!`);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    handleLogBacklog('EDITAR_EMPRESA', `Empresa ${updatedCompany.razaoSocial} atualizada`, 'CONFIGURACOES');
    showToast(`Dados fiscais da empresa ${updatedCompany.nomeFantasia || updatedCompany.razaoSocial} atualizados.`);
  };

  const handleToggleCompanyStatus = (companyId: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ativo: !c.ativo } : c));
    showToast('Status da empresa atualizado.');
  };

  const handleDeleteCompany = (companyId: string) => {
    if (companies.length <= 1) {
      showToast('Não é possível excluir a única empresa cadastrada.');
      return;
    }
    const comp = companies.find(c => c.id === companyId);
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    if (selectedCompanyId === companyId) {
      const remaining = companies.filter(c => c.id !== companyId);
      if (remaining[0]) setSelectedCompanyId(remaining[0].id);
    }
    handleLogBacklog('EXCLUIR_EMPRESA', `Empresa ${comp?.razaoSocial || companyId} removida`, 'CONFIGURACOES');
    showToast('Empresa excluída com sucesso.');
  };

  // Handlers para Competências Contábeis
  const handleAddCompetence = (year: number, month: number) => {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const label = `${monthStr}/${year}`;
    const exists = competences.some(c => c.companyId === selectedCompany.id && c.year === year && c.month === month);
    if (exists) {
      showToast(`Competência ${label} já está cadastrada.`);
      return;
    }
    const newComp: Competence = {
      id: `comp-${selectedCompany.id}-${year}-${monthStr}`,
      companyId: selectedCompany.id,
      month,
      year,
      status: 'ABERTA',
    };
    setCompetences(prev => [...prev, newComp]);
    setSelectedCompetence(label);
    showToast(`Competência ${label} aberta com sucesso.`);
  };

  const handleToggleCompetenceStatusObj = (compObj: Competence) => {
    setCompetences(prev => prev.map(c => {
      if (c.id === compObj.id) {
        const newStatus = c.status === 'ABERTA' ? 'FECHADA' : 'ABERTA';
        addAuditLog('FECHAR', `Status da competência ${c.month}/${c.year} alterado para ${newStatus}`, 'COMPETENCIA');
        showToast(`Competência ${c.month}/${c.year} ${newStatus === 'FECHADA' ? 'fechada' : 'reaberta'}.`);
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const handleToggleCompetenceStatus = () => {
    const [mesStr, anoStr] = selectedCompetence.split('/');
    const month = parseInt(mesStr, 10);
    const year = parseInt(anoStr, 10);

    setCompetences(prev => {
      const idx = prev.findIndex(c => c.companyId === selectedCompany.id && c.month === month && c.year === year);
      if (idx >= 0) {
        const current = prev[idx];
        const newStatus = current.status === 'ABERTA' ? 'FECHADA' : 'ABERTA';
        const updated = [...prev];
        updated[idx] = { ...current, status: newStatus };
        addAuditLog('FECHAR', `Status da competência ${selectedCompetence} alterado para ${newStatus}.`, 'COMPETENCIA');
        showToast(`Competência ${selectedCompetence} ${newStatus === 'FECHADA' ? 'fechada para novas escriturações' : 'reaberta'}.`);
        return updated;
      } else {
        const newComp: Competence = {
          id: `comp-${selectedCompany.id}-${month}-${year}`,
          companyId: selectedCompany.id,
          month,
          year,
          status: 'FECHADA',
        };
        addAuditLog('FECHAR', `Competência ${selectedCompetence} fechada.`, 'COMPETENCIA');
        showToast(`Competência ${selectedCompetence} fechada com sucesso.`);
        return [...prev, newComp];
      }
    });
  };

  // Importação e Exclusão de Documentos Fiscais
  const handleImportDocument = (newDoc: FiscalDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('IMPORTAR_XML', `Importação de ${newDoc.tipoDoc} nº ${newDoc.numero} (${newDoc.tipoOperacao}) - Chave: ${newDoc.chaveAcesso.slice(0, 16)}...`, 'DOCUMENTO_FISCAL');
    showToast(`Documento ${newDoc.tipoDoc} nº ${newDoc.numero} importado com sucesso.`);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    addAuditLog('EXCLUIR', `Exclusão de documento fiscal ID ${docId}`, 'DOCUMENTO_FISCAL');
    showToast('Documento fiscal excluído do sistema.');
  };

  // Apuração Tributária
  const currentAssessment = assessments.find(
    a => a.companyId === selectedCompany.id && a.competencia === selectedCompetence
  );

  const handleSaveAssessment = (assessment: TaxAssessment) => {
    setAssessments(prev => {
      const filtered = prev.filter(a => !(a.companyId === assessment.companyId && a.competencia === assessment.competencia));
      return [assessment, ...filtered];
    });
    addAuditLog('APURAR', `Apuração tributária executada para competência ${assessment.competencia}. Guias geradas: ${assessment.guias.length}`, 'APURACAO');
    showToast(`Apuração concluída! ${assessment.guias.length} guia(s) emitida(s).`);
  };

  const handleQuickCalculate = () => {
    const res = calculateTaxAssessment(selectedCompany, selectedCompetence, documents);
    handleSaveAssessment(res);
  };

  // Contabilização Automática por Regras
  const handleAutoJournalize = () => {
    const compDocs = documents.filter(d => d.companyId === selectedCompany.id);
    const { newEntries, updatedDocs } = autoJournalizeFiscalDocuments(
      selectedCompany.id,
      selectedCompetence,
      compDocs,
      accounts,
      postingRules
    );

    if (newEntries.length === 0) {
      showToast('Nenhuma nova NF-e pendente de contabilização encontrada.');
      return;
    }

    setEntries(prev => [...newEntries, ...prev]);
    setDocuments(prev => {
      const updatedMap = new Map(updatedDocs.map(d => [d.id, d]));
      return prev.map(d => updatedMap.get(d.id) || d);
    });

    addAuditLog('INTEGRAR', `${newEntries.length} lançamentos de partidas dobradas gerados automaticamente a partir de documentos fiscais.`, 'LANCAMENTO_CONTABIL');
    showToast(`${newEntries.length} lançamentos contabilizados com partidas dobradas 100% balanceadas!`);
  };

  const handleJournalizeSingleDoc = (doc: FiscalDocument) => {
    const { newEntries, updatedDocs } = autoJournalizeFiscalDocuments(
      selectedCompany.id,
      selectedCompetence,
      [doc],
      accounts,
      postingRules
    );

    if (newEntries.length > 0) {
      setEntries(prev => [...newEntries, ...prev]);
      setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDocs[0] : d));
      addAuditLog('INTEGRAR', `Contabilização direta de ${doc.tipoDoc} nº ${doc.numero}`, 'LANCAMENTO_CONTABIL');
      showToast(`NF-e nº ${doc.numero} contabilizada com sucesso.`);
    }
  };

  // Lançamentos Manuais e Plano de Contas
  const handleAddManualEntry = (entry: AccountingEntry) => {
    setEntries(prev => [entry, ...prev]);
    addAuditLog('CRIAR', `Lançamento manual #${entry.numero} registrado (Total: R$ ${entry.totalDebito.toFixed(2)})`, 'LANCAMENTO_CONTABIL');
    showToast(`Lançamento #${entry.numero} registrado.`);
  };

  const handleAddAccount = (acc: AccountingAccount) => {
    setAccounts(prev => [...prev, acc]);
    showToast(`Conta ${acc.codigo} - ${acc.nome} adicionada ao plano de contas.`);
  };

  // Folha de Pagamento & eSocial
  const handleAddEmployee = (emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
    showToast(`Colaborador ${emp.nome} cadastrado com sucesso.`);
  };

  const handleSavePayslips = (generated: PayrollPayslip[]) => {
    setPayslips(prev => {
      const others = prev.filter(p => p.competencia !== selectedCompetence);
      return [...others, ...generated];
    });
    addAuditLog('INTEGRAR', `Folha de pagamento calculada para ${generated.length} colaboradores na competência ${selectedCompetence}`, 'FOLHA');
    showToast(`Folha de pagamento de ${selectedCompetence} processada com sucesso!`);
  };

  const handleSendToESocial = () => {
    setActiveTab('gov');
    showToast('Redirecionado para Central de Transmissões do eSocial.');
  };

  const handleJournalizePayroll = () => {
    const compPayslips = payslips.filter(p => p.competencia === selectedCompetence);
    if (compPayslips.length === 0) {
      showToast('Calcule a folha de pagamento antes de efetuar a contabilização.');
      return;
    }

    const nextNum = entries.length > 0 ? Math.max(...entries.map(e => e.numero)) + 1 : 1001;
    const payrollResult = autoJournalizePayroll(selectedCompany.id, selectedCompetence, compPayslips, accounts, nextNum);
    const newEntries = payrollResult.entries;

    if (newEntries.length === 0) {
      showToast('Nenhum lançamento gerado para a folha.');
      return;
    }

    setEntries(prev => [...newEntries, ...prev]);
    addAuditLog(
      'INTEGRAR',
      `Folha da competência ${selectedCompetence} contabilizada no Livro Diário Geral (${newEntries.length} partidas dobradas registradas).`,
      'FOLHA'
    );
    showToast(`Folha de pagamento de ${selectedCompetence} contabilizada no Diário Geral com sucesso!`);
  };

  // Sócios e Distribuição de Lucros
  const handleAddPartner = (newPartner: Partner) => {
    setPartners(prev => [newPartner, ...prev]);
    addAuditLog('CRIAR', `Sócio ${newPartner.nome} cadastrado no QSA (${newPartner.participacaoCapitalPercent}% de cota).`, 'FOLHA');
    showToast(`Sócio ${newPartner.nome} incluído no quadro societário!`);
  };

  const handleDistributeProfits = (distData: Omit<ProfitDistributionRecord, 'id' | 'saldoLucrosDisponivelDepois' | 'reciboNumero' | 'statusContabilizacao'>) => {
    const nextReciboNum = `REC-LUC-${selectedCompetence.replace('/', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const saldoDepois = Math.max(0, distData.saldoLucrosDisponivelAntes - distData.valorDistribuido);
    const newRecord: ProfitDistributionRecord = {
      ...distData,
      id: `pdist-${Date.now()}`,
      reciboNumero: nextReciboNum,
      saldoLucrosDisponivelDepois: saldoDepois,
      statusContabilizacao: 'CONTABILIZADO',
    };

    setProfitDistributions(prev => [newRecord, ...prev]);

    const nextNum = entries.length > 0 ? Math.max(...entries.map(e => e.numero)) + 1 : 1001;
    const entry = autoJournalizeProfitDistribution(selectedCompany.id, newRecord, accounts, nextNum);

    if (entry) {
      setEntries(prev => [entry, ...prev]);
    }

    addAuditLog(
      'INTEGRAR',
      `Distribuição de Lucros Isentos de R$ ${distData.valorDistribuido.toFixed(2)} para ${distData.partnerNome} contabilizada (Recibo ${nextReciboNum}).`,
      'LANCAMENTO_CONTABIL'
    );
    showToast(`Distribuição de Lucros para ${distData.partnerNome} efetuada e contabilizada no Diário!`);
  };

  // Obrigações e SPED
  const handleMarkObligationDelivered = (oblId: string, protocol: string) => {
    setObligations(prev => prev.map(o => o.id === oblId ? { ...o, status: 'TRANSMITIDO', protocolo: protocol } : o));
    addAuditLog('TRANSMITIR', `Obrigação ID ${oblId} marcada como transmitida. Protocolo: ${protocol}`, 'SPED');
    showToast('Obrigação registrada como entregue.');
  };

  // Certificados e Transmissões
  const companyCertificate = certificates.find(c => c.companyId === selectedCompany.id);

  const handleAddCertificate = (newCert: DigitalCertificate) => {
    setCertificates(prev => [newCert, ...prev]);
    showToast(`Certificado digital ${newCert.alias} instalado no cofre com sucesso.`);
  };

  const handleAddSubmission = (sub: GovSubmission) => {
    setSubmissions(prev => [sub, ...prev]);
  };

  const handleUpdateSubmission = (sub: GovSubmission) => {
    setSubmissions(prev => prev.map(s => s.id === sub.id ? sub : s));
    if (sub.recibo) {
      addAuditLog('TRANSMITIR', `Evento ${sub.evento} autorizado pelo ambiente oficial (${sub.sistema}). Recibo: ${sub.recibo}`, 'TRANSMISSAO');
    }
  };

  // Restauração a partir da Nuvem Supabase
  const handleRestoreFromCloud = (cloudData: {
    companies?: Company[];
    documents?: FiscalDocument[];
    accounts?: AccountingAccount[];
    entries?: AccountingEntry[];
    employees?: Employee[];
    payslips?: PayrollPayslip[];
    partners?: Partner[];
    distributions?: ProfitDistributionRecord[];
    obligations?: TaxObligation[];
    accountingParameters?: AccountingParameters;
    customization?: SystemCustomization;
    users?: SystemUser[];
    userBacklog?: UserActivityBacklog[];
  }) => {
    if (cloudData.companies && cloudData.companies.length > 0) setCompanies(cloudData.companies);
    if (cloudData.documents && cloudData.documents.length > 0) setDocuments(cloudData.documents);
    if (cloudData.accounts && cloudData.accounts.length > 0) setAccounts(cloudData.accounts);
    if (cloudData.entries && cloudData.entries.length > 0) setEntries(cloudData.entries);
    if (cloudData.employees && cloudData.employees.length > 0) setEmployees(cloudData.employees);
    if (cloudData.payslips && cloudData.payslips.length > 0) setPayslips(cloudData.payslips);
    if (cloudData.partners && cloudData.partners.length > 0) setPartners(cloudData.partners);
    if (cloudData.distributions && cloudData.distributions.length > 0) setProfitDistributions(cloudData.distributions);
    if (cloudData.obligations && cloudData.obligations.length > 0) setObligations(cloudData.obligations);
    if (cloudData.accountingParameters) setAccountingParameters(cloudData.accountingParameters);
    if (cloudData.customization) setCustomization(cloudData.customization);
    if (cloudData.users && cloudData.users.length > 0) setUsers(cloudData.users);
    if (cloudData.userBacklog && cloudData.userBacklog.length > 0) setUserBacklog(cloudData.userBacklog);
    showToast('Base de dados restaurada com sucesso a partir do Supabase!');
  };

  // Contadores para Badges do Menu
  const pendingDocsCount = documents.filter(
    d => d.companyId === selectedCompany.id && d.statusContabilizacao === 'PENDENTE'
  ).length;

  const pendingObligationsCount = obligations.filter(
    o => o.status === 'PENDENTE'
  ).length;

  // Renderização da Landing Page Profissional quando solicitada (acessível para visitantes e usuários)
  if (isViewingLandingPage) {
    return (
      <LandingPageView
        customization={customization}
        onEnterSystem={() => {
          setIsViewingLandingPage(false);
          if (typeof window !== 'undefined' && window.location.hash.toLowerCase().includes('landing')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
      />
    );
  }

  // PORTAL DE LOGIN: Se o usuário não estiver autenticado, exibe a tela de login
  if (!isAuthenticated) {
    return (
      <LoginView
        users={users}
        customization={customization}
        onLoginSuccess={(user) => {
          setActiveUserId(user.id);
          setIsAuthenticated(true);
          setLastActivityTime(Date.now());
          addAuditLog('ATUALIZAR_USUARIO', `Usuário ${user.name} efetuou login no sistema`, 'SEGURANCA');
          handleLogBacklog('LOGIN', `Login efetuado com sucesso por ${user.name}`, 'USUARIOS');
          showToast(`Bem-vindo(a), ${user.name}!`);
        }}
        onUpdatePasswordAndLogin={handleUpdatePasswordAndLogin}
        onBackToLandingPage={() => {
          setIsViewingLandingPage(true);
          if (typeof window !== 'undefined') {
            window.location.hash = 'landing';
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header com Escritório Contábil, Empresa Ativa, Competência e Sincronização */}
      <Header
        office={office}
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={setSelectedCompany}
        competences={competences}
        selectedCompetence={selectedCompetence}
        onSelectCompetence={setSelectedCompetence}
        onToggleCompetenceStatus={handleToggleCompetenceStatus}
        customization={customization}
        activeUser={activeUser}
        onLogout={handleLogout}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenCompetenceModal={() => setIsCompetenceModalOpen(true)}
        autoSyncState={autoSyncState}
        sessionMinutesRemaining={sessionMinutesRemaining}
      />

      {/* Main Container com Barra Lateral e Conteúdo */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingDocsCount={pendingDocsCount}
          pendingObligationsCount={pendingObligationsCount}
          customization={customization}
          activeUser={activeUser}
          rolePermissions={rolePermissions}
          onLogout={handleLogout}
          onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
          onOpenLandingPage={() => setIsViewingLandingPage(true)}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F1F5F9] min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              company={selectedCompany}
              competencia={selectedCompetence}
              documents={documents}
              assessment={currentAssessment}
              entries={entries}
              employees={employees}
              obligations={obligations}
              certificate={companyCertificate}
              onNavigate={setActiveTab}
              onQuickCalculate={handleQuickCalculate}
            />
          )}

          {activeTab === 'fiscal' && (
            <FiscalView
              company={selectedCompany}
              competencia={selectedCompetence}
              documents={documents}
              onImportDocument={handleImportDocument}
              onDeleteDocument={handleDeleteDocument}
              onJournalizeDocument={handleJournalizeSingleDoc}
            />
          )}

          {activeTab === 'apuracao' && (
            <TaxAssessmentView
              company={selectedCompany}
              competencia={selectedCompetence}
              documents={documents}
              currentAssessment={currentAssessment}
              onSaveAssessment={handleSaveAssessment}
              onUpdateCompany={handleUpdateCompany}
            />
          )}

          {activeTab === 'contabil' && (
            <AccountingView
              company={selectedCompany}
              competencia={selectedCompetence}
              accounts={accounts}
              entries={entries}
              documents={documents}
              postingRules={postingRules}
              onAddEntry={handleAddManualEntry}
              onAddAccount={handleAddAccount}
              onAutoJournalize={handleAutoJournalize}
            />
          )}

          {activeTab === 'folha' && (
            <PayrollView
              company={selectedCompany}
              competencia={selectedCompetence}
              employees={employees}
              payslips={payslips}
              partners={companyPartners}
              isPayrollJournalized={isPayrollJournalized}
              onAddEmployee={handleAddEmployee}
              onSavePayslips={handleSavePayslips}
              onSendToESocial={handleSendToESocial}
              onJournalizePayroll={handleJournalizePayroll}
            />
          )}

          {activeTab === 'socios' && (
            <PartnersView
              company={selectedCompany}
              competencia={selectedCompetence}
              partners={companyPartners}
              profitDistributions={companyProfitDistributions}
              saldoLucrosAcumulados={saldoLucrosAcumulados}
              onAddPartner={handleAddPartner}
              onDistributeProfits={handleDistributeProfits}
            />
          )}

          {activeTab === 'sped' && (
            <SpedObligationsView
              company={selectedCompany}
              competencia={selectedCompetence}
              documents={documents}
              obligations={obligations}
              accounts={accounts}
              entries={entries}
              onMarkObligationDelivered={handleMarkObligationDelivered}
            />
          )}

          {activeTab === 'gov' && (
            <GovTransmissionView
              company={selectedCompany}
              competencia={selectedCompetence}
              submissions={submissions}
              certificate={companyCertificate}
              onAddSubmission={handleAddSubmission}
              onUpdateSubmission={handleUpdateSubmission}
            />
          )}

          {(activeTab === 'certificados' || activeTab === 'auditoria') && (
            <CertificatesAndAuditView
              companies={companies}
              certificates={certificates}
              auditLogs={auditLogs}
              onAddCertificate={handleAddCertificate}
              activeCompany={selectedCompany}
            />
          )}

          {activeTab === 'supabase' && (
            <SupabaseIntegrationView
              companies={companies}
              documents={documents}
              accounts={accounts}
              entries={entries}
              employees={employees}
              payslips={payslips}
              partners={partners}
              distributions={profitDistributions}
              obligations={obligations}
              accountingParameters={accountingParameters}
              customization={customization}
              users={users}
              userBacklog={userBacklog}
              onRestoreFromCloud={handleRestoreFromCloud}
              onAuditLog={(acao, desc) => addAuditLog(acao, desc, 'TRANSMISSAO')}
            />
          )}

          {activeTab === 'parametros' && (
            <AccountingParametersView
              parameters={accountingParameters}
              onSaveParameters={handleSaveParameters}
              accounts={accounts}
              activeCompany={selectedCompany}
            />
          )}

          {activeTab === 'personalizacao' && (
            <CustomizationView
              customization={customization}
              onSaveCustomization={handleSaveCustomization}
              onOpenLandingPage={() => setIsViewingLandingPage(true)}
              onResetData={handleResetDemoData}
            />
          )}

          {activeTab === 'usuarios' && (
            <UserManagementView
              users={users}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
              onChangeUserRole={handleChangeUserRole}
              onDeleteUser={handleDeleteUser}
              onUpdateUserPassword={handleUpdateUserPassword}
              activeUserId={activeUser.id}
              backlog={userBacklog}
              onLogActivity={handleLogBacklog}
              rolePermissions={rolePermissions}
              onUpdateRolePermissions={handleUpdateRolePermissions}
            />
          )}
        </main>
      </div>

      {/* Modal de Gestão Completa de Empresas Clientes */}
      {isCompanyModalOpen && (
        <CompanyManagementModal
          isOpen={isCompanyModalOpen}
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={(c) => {
            setSelectedCompany(c);
            setIsCompanyModalOpen(false);
          }}
          onAddCompany={handleAddCompany}
          onUpdateCompany={handleUpdateCompany}
          onToggleCompanyStatus={handleToggleCompanyStatus}
          onDeleteCompany={handleDeleteCompany}
          onClose={() => setIsCompanyModalOpen(false)}
        />
      )}

      {/* Modal de Gestão Completa de Competências Contábeis */}
      {isCompetenceModalOpen && (
        <CompetenceManagementModal
          isOpen={isCompetenceModalOpen}
          company={selectedCompany}
          competences={competences}
          selectedCompetence={selectedCompetence}
          onSelectCompetence={(compLabel) => {
            setSelectedCompetence(compLabel);
            setIsCompetenceModalOpen(false);
          }}
          onAddCompetence={handleAddCompetence}
          onToggleStatus={handleToggleCompetenceStatusObj}
          onClose={() => setIsCompetenceModalOpen(false)}
        />
      )}

      {/* Footer Profissional */}
      <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 md:px-8 text-[11px] text-slate-500 font-medium tracking-wide shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            Sistema Conectado (ICP-Brasil & SEFAZ)
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline">V. 2.5.0 • Audicon Compliance</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">Suporte Central: {customization.supportPhone}</span>
          <span>© 2026 {customization.systemName} Solutions</span>
        </div>
      </footer>

      {/* Toast Flutuante de Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
