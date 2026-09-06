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
  initialUserActivityBacklog
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
  SystemRole
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
import { calculateTaxAssessment } from './services/taxEngine';
import { 
  autoJournalizeFiscalDocuments, 
  autoJournalizePayroll, 
  autoJournalizeProfitDistribution,
  generateBalanceSheet 
} from './services/accountingEngine';

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
  const [isViewingLandingPage, setIsViewingLandingPage] = useState<boolean>(false);

  // Dados filtrados e computados para a empresa ativa
  const companyPartners = partners.filter(p => p.companyId === selectedCompany.id);
  const companyProfitDistributions = profitDistributions.filter(d => d.companyId === selectedCompany.id);

  // Status de contabilização da folha do mês no Diário Geral
  const isPayrollJournalized = entries.some(e => e.competencia === selectedCompetence && e.origemTipo === 'FOLHA');

  // Saldo de Lucros Acumulados no Patrimônio Líquido apurado pelo Balanço Patrimonial
  const balanceSheetCurrent = generateBalanceSheet(accounts, entries);
  const lucrosItem = balanceSheetCurrent.patrimonioLiquido.find(p => p.nome.toLowerCase().includes('lucro') || p.codigo.startsWith('2.3.02'));
  const saldoLucrosAcumulados = lucrosItem ? lucrosItem.saldo : 450000;

  // Redefinir Dados de Demonstração
  const handleResetDemoData = () => {
    if (window.confirm('Tem certeza de que deseja restaurar os dados para os padrões iniciais de demonstração? Todas as apurações e alterações salvas localmente serão reiniciadas.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Toast Notificação
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addAuditLog = (acao: AuditLog['acao'], detalhes: string, entidade: AuditLog['entidade'] = 'DOCUMENTO_FISCAL') => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      companyId: selectedCompany.id,
      usuario: office.responsavelNome,
      entidade,
      acao,
      detalhes,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handlers da Fase 3: Parâmetros, Personalização e Usuários
  const handleLogBacklog = (action: string, description: string, module: UserActivityBacklog['module']) => {
    const newEntry: UserActivityBacklog = {
      id: `backlog-${Date.now()}`,
      userId: users[0]?.id || 'user-1',
      userName: users[0]?.name || 'Carlos Mendes',
      userRole: users[0]?.role || 'ADMINISTRADOR',
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
    handleLogBacklog('CRIAR_USUARIO', `Usuário ${created.name} criado com perfil ${created.role}`, 'CONFIGURACOES');
    showToast(`Usuário ${created.name} adicionado com sucesso.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = !u.active;
        addAuditLog('ATUALIZAR_USUARIO', `Status do usuário ${u.name} alterado para ${newStatus ? 'Ativo' : 'Inativo'}`, 'SEGURANCA');
        handleLogBacklog('ALTERAR_STATUS_USUARIO', `Status de ${u.name} alterado para ${newStatus ? 'Ativo' : 'Inativo'}`, 'CONFIGURACOES');
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
        handleLogBacklog('ALTERAR_PERFIL_USUARIO', `Perfil de ${u.name} alterado para ${newRole}`, 'CONFIGURACOES');
        showToast(`Perfil de ${u.name} alterado para ${newRole}.`);
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  // 1. Fechar / Reabrir Competência
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

  // 2. Importação de Documento Fiscal
  const handleImportDocument = (newDoc: FiscalDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('IMPORTAR_XML', `Importação de ${newDoc.tipoDoc} nº ${newDoc.numero} (${newDoc.tipoOperacao}) - Chave: ${newDoc.chaveAcesso.slice(0, 16)}...`, 'DOCUMENTO_FISCAL');
    showToast(`Documento ${newDoc.tipoDoc} nº ${newDoc.numero} importado com sucesso.`);
  };

  // 3. Exclusão de Documento
  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    addAuditLog('EXCLUIR', `Exclusão de documento fiscal ID ${docId}`, 'DOCUMENTO_FISCAL');
    showToast('Documento fiscal excluído do sistema.');
  };

  // 4. Apuração Tributária
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

  // 5. Contabilização Automática por Regras
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

  // 6. Novo Lançamento Manual
  const handleAddManualEntry = (entry: AccountingEntry) => {
    setEntries(prev => [entry, ...prev]);
    addAuditLog('CRIAR', `Lançamento manual #${entry.numero} registrado (Total: R$ ${entry.totalDebito.toFixed(2)})`, 'LANCAMENTO_CONTABIL');
    showToast(`Lançamento #${entry.numero} registrado.`);
  };

  // 7. Nova Conta no Plano de Contas
  const handleAddAccount = (acc: AccountingAccount) => {
    setAccounts(prev => [...prev, acc]);
    showToast(`Conta ${acc.codigo} - ${acc.nome} adicionada ao plano de contas.`);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    showToast(`Dados fiscais da empresa ${updatedCompany.nomeFantasia || updatedCompany.razaoSocial} atualizados.`);
  };

  // 8. Folha de Pagamento
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

  // 8.1 Contabilização Automática da Folha de Pagamento em Partidas Dobradas
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

  // 8.2 Gestão de Sócios e Pró-labore
  const handleAddPartner = (newPartner: Partner) => {
    setPartners(prev => [newPartner, ...prev]);
    addAuditLog('CRIAR', `Sócio ${newPartner.nome} cadastrado no QSA (${newPartner.participacaoCapitalPercent}% de cota).`, 'FOLHA');
    showToast(`Sócio ${newPartner.nome} incluído no quadro societário!`);
  };

  // 8.3 Distribuição de Lucros Isentos com Escrituração e Contabilização Automática
  const handleDistributeProfits = (distData: Omit<ProfitDistributionRecord, 'id' | 'saldoLucrosDisponivelDepois' | 'reciboNumero' | 'statusContabilizacao'>) => {
    const nextReciboNum = `REC-LUC-${selectedCompetence.replace('/', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const saldoDepois = Math.max(0, distData.saldoLucrosDisponivelAntes - distData.valorDistribuido);
    const newRecord: ProfitDistributionRecord = {
      ...distData,
      id: `dist-${Date.now()}`,
      saldoLucrosDisponivelDepois: saldoDepois,
      reciboNumero: nextReciboNum,
      statusContabilizacao: 'CONTABILIZADO',
    };

    setProfitDistributions(prev => [newRecord, ...prev]);

    // Contabilização automática imediata da distribuição de lucros
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

  // 9. Obrigações e SPED
  const handleMarkObligationDelivered = (oblId: string, protocol: string) => {
    setObligations(prev => prev.map(o => o.id === oblId ? { ...o, status: 'TRANSMITIDO', protocolo: protocol } : o));
    addAuditLog('TRANSMITIR', `Obrigação ID ${oblId} marcada como transmitida. Protocolo: ${protocol}`, 'SPED');
    showToast('Obrigação registrada como entregue.');
  };

  // 10. Certificados e Transmissões
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

  // Renderização da Landing Page Profissional quando solicitada
  if (isViewingLandingPage) {
    return (
      <LandingPageView
        customization={customization}
        onEnterSystem={() => setIsViewingLandingPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header com Escritório Contábil, Empresa Ativa e Competência */}
      <Header
        office={office}
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={setSelectedCompany}
        competences={competences}
        selectedCompetence={selectedCompetence}
        onSelectCompetence={setSelectedCompetence}
        onToggleCompetenceStatus={handleToggleCompetenceStatus}
        onResetData={handleResetDemoData}
        onOpenSupabase={() => setActiveTab('supabase')}
        customization={customization}
        activeUser={users[0]}
        onOpenLandingPage={() => setIsViewingLandingPage(true)}
      />

      {/* Main Container com Barra Lateral e Conteúdo */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingDocsCount={pendingDocsCount}
          pendingObligationsCount={pendingObligationsCount}
          customization={customization}
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
            />
          )}

          {activeTab === 'usuarios' && (
            <UserManagementView
              users={users}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
              onChangeUserRole={handleChangeUserRole}
              backlog={userBacklog}
              onLogActivity={handleLogBacklog}
            />
          )}
        </main>
      </div>

      {/* Footer Profissional */}
      <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 md:px-8 text-[11px] text-slate-500 font-medium tracking-wide shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            Sistema Conectado (ICP-Brasil & SEFAZ)
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline">V. 2.0.0-fase3</span>
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
