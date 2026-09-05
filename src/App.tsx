import React, { useState } from 'react';
import { 
  initialOffice, 
  initialCompanies, 
  initialCompetences, 
  initialChartOfAccounts, 
  initialPostingRules, 
  initialFiscalDocuments, 
  initialAccountingEntries,
  initialEmployees, 
  initialObligations, 
  initialCertificates, 
  initialSubmissions, 
  initialAuditLogs 
} from './data/initialData';
import { 
  Company, 
  FiscalDocument, 
  TaxAssessment, 
  AccountingEntry, 
  AccountingAccount, 
  Employee, 
  PayrollPayslip, 
  TaxObligation, 
  DigitalCertificate, 
  GovSubmission, 
  AuditLog, 
  Competence 
} from './types';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FiscalView } from './components/FiscalView';
import { TaxAssessmentView } from './components/TaxAssessmentView';
import { AccountingView } from './components/AccountingView';
import { PayrollView } from './components/PayrollView';
import { SpedObligationsView } from './components/SpedObligationsView';
import { GovTransmissionView } from './components/GovTransmissionView';
import { CertificatesAndAuditView } from './components/CertificatesAndAuditView';
import { calculateTaxAssessment } from './services/taxEngine';
import { autoJournalizeFiscalDocuments } from './services/accountingEngine';

export default function App() {
  // Estado Multi-Tenant e Contexto
  const [office] = useState(initialOffice);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company>(initialCompanies[0]);
  const [competences, setCompetences] = useState<Competence[]>(initialCompetences);
  const [selectedCompetence, setSelectedCompetence] = useState<string>('09/2026');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Dados do Domínio
  const [documents, setDocuments] = useState<FiscalDocument[]>(initialFiscalDocuments);
  const [assessments, setAssessments] = useState<TaxAssessment[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>(initialChartOfAccounts);
  const [entries, setEntries] = useState<AccountingEntry[]>(initialAccountingEntries);
  const [postingRules] = useState(initialPostingRules);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [payslips, setPayslips] = useState<PayrollPayslip[]>([]);
  const [obligations, setObligations] = useState<TaxObligation[]>(initialObligations);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>(initialCertificates);
  const [submissions, setSubmissions] = useState<GovSubmission[]>(initialSubmissions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

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

  // Contadores para Badges do Menu
  const pendingDocsCount = documents.filter(
    d => d.companyId === selectedCompany.id && d.statusContabilizacao === 'PENDENTE'
  ).length;

  const pendingObligationsCount = obligations.filter(
    o => o.status === 'PENDENTE'
  ).length;

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
      />

      {/* Main Container com Barra Lateral e Conteúdo */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingDocsCount={pendingDocsCount}
          pendingObligationsCount={pendingObligationsCount}
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
              onAddEmployee={handleAddEmployee}
              onSavePayslips={handleSavePayslips}
              onSendToESocial={handleSendToESocial}
            />
          )}

          {activeTab === 'sped' && (
            <SpedObligationsView
              company={selectedCompany}
              competencia={selectedCompetence}
              documents={documents}
              obligations={obligations}
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
          <span className="hidden sm:inline">V. 1.0.4-pro</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">Suporte Central: 0800 123 4567</span>
          <span>© 2024 Lumen Contábil Solutions</span>
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
