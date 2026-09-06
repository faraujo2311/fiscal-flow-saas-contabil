import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  CloudUpload, 
  CloudDownload, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  Table, 
  Terminal, 
  Zap, 
  Activity,
  Layers,
  ArrowRight,
  Code2,
  Sparkles
} from 'lucide-react';
import { 
  Company, 
  FiscalDocument, 
  AccountingEntry, 
  AccountingAccount, 
  Employee, 
  PayrollPayslip, 
  Partner, 
  ProfitDistributionRecord, 
  TaxObligation,
  AccountingParameters,
  SystemCustomization,
  SystemUser,
  UserActivityBacklog
} from '../types';
import { 
  testSupabaseConnection, 
  syncAllEntitiesToSupabase, 
  fetchAllEntitiesFromSupabase,
  generateSupabaseSqlDDL,
  generatePhase3MigrationSql,
  SupabaseHealthStatus,
  SyncProgressItem,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_DB_URL,
  SUPABASE_PROJECT_ID
} from '../services/supabaseClient';

interface SupabaseIntegrationViewProps {
  companies: Company[];
  documents: FiscalDocument[];
  accounts: AccountingAccount[];
  entries: AccountingEntry[];
  employees: Employee[];
  payslips: PayrollPayslip[];
  partners: Partner[];
  distributions: ProfitDistributionRecord[];
  obligations: TaxObligation[];
  accountingParameters?: AccountingParameters;
  customization?: SystemCustomization;
  users?: SystemUser[];
  userBacklog?: UserActivityBacklog[];
  onRestoreFromCloud: (cloudData: {
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
  }) => void;
  onAuditLog?: (action: 'INTEGRAR' | 'CRIAR' | 'EDITAR', description: string) => void;
}

export const SupabaseIntegrationView: React.FC<SupabaseIntegrationViewProps> = ({
  companies,
  documents,
  accounts,
  entries,
  employees,
  payslips,
  partners,
  distributions,
  obligations,
  accountingParameters,
  customization,
  users,
  userBacklog,
  onRestoreFromCloud,
  onAuditLog,
}) => {
  const [health, setHealth] = useState<SupabaseHealthStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgressItem[]>([]);
  const [syncResult, setSyncResult] = useState<{ success: boolean; errors: string[] } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedDbUrl, setCopiedDbUrl] = useState(false);
  const [copiedQuickFix, setCopiedQuickFix] = useState(false);
  const [copiedRoleFix, setCopiedRoleFix] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'ddl' | 'tables'>('status');
  const [sqlMode, setSqlMode] = useState<'phase3' | 'full'>('phase3');

  const copyQuickFix = () => {
    navigator.clipboard.writeText('ALTER TABLE public.companies ALTER COLUMN cnae TYPE TEXT;');
    setCopiedQuickFix(true);
    setTimeout(() => setCopiedQuickFix(false), 2500);
  };

  const copyRoleFix = () => {
    navigator.clipboard.writeText('ALTER TABLE public.system_users DROP CONSTRAINT IF EXISTS system_users_role_check;');
    setCopiedRoleFix(true);
    setTimeout(() => setCopiedRoleFix(false), 2500);
  };

  const runHealthCheck = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setHealth(res);
    } catch {
      setHealth({
        connected: false,
        latencyMs: 0,
        projectUrl: SUPABASE_URL,
        projectId: SUPABASE_PROJECT_ID,
        timestamp: new Date().toISOString(),
        error: 'Erro inesperado ao testar conexão',
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleSyncToCloud = async () => {
    setActiveTab('status');
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await syncAllEntitiesToSupabase(
        companies,
        documents,
        entries,
        accounts,
        employees,
        payslips,
        partners,
        distributions,
        obligations,
        accountingParameters,
        customization,
        users,
        userBacklog,
        (progress) => setSyncProgress(progress)
      );

      setSyncResult({
        success: res.success,
        errors: res.errors,
      });

      if (onAuditLog) {
        onAuditLog(
          'INTEGRAR',
          `Sincronização de dados executada com o Supabase (${companies.length} empresas, ${entries.length} lançamentos, ${documents.length} notas, 4 tabelas Fase 3).`
        );
      }
    } catch (err: unknown) {
      setSyncResult({
        success: false,
        errors: [err instanceof Error ? err.message : 'Falha na sincronização'],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!window.confirm('Deseja restaurar os registros armazenados no Supabase e mesclar ao sistema local?')) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await fetchAllEntitiesFromSupabase();
      if (res.success && res.data) {
        onRestoreFromCloud(res.data);
        alert('Dados sincronizados da nuvem Supabase com sucesso!');
        if (onAuditLog) {
          onAuditLog('INTEGRAR', 'Restauração de registros a partir da base PostgreSQL Supabase realizada.');
        }
      } else {
        alert(`Erro ao restaurar: ${res.error || 'Nenhum dado retornado'}`);
      }
    } catch (err: unknown) {
      alert(`Falha: ${err instanceof Error ? err.message : 'Erro na conexão'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const getActiveSqlCode = () => {
    return sqlMode === 'phase3' ? generatePhase3MigrationSql() : generateSupabaseSqlDDL();
  };

  const copySql = () => {
    navigator.clipboard.writeText(getActiveSqlCode());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const totalLocalRecords = 
    companies.length + 
    documents.length + 
    accounts.length + 
    entries.length + 
    employees.length + 
    payslips.length + 
    partners.length + 
    distributions.length + 
    obligations.length +
    (accountingParameters ? 1 : 0) +
    (customization ? 1 : 0) +
    (users?.length || 0) +
    (userBacklog?.length || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Conexão Supabase & Nuvem PostgreSQL
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                  health?.connected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {health?.connected ? `Conectado (${health.latencyMs}ms)` : 'Verificando...'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Integração direta com o projeto Supabase <strong className="text-slate-700">{SUPABASE_PROJECT_ID}</strong> para persistência relacional na nuvem.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runHealthCheck}
            disabled={isTesting}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            Testar Conexão
          </button>

          <button
            type="button"
            onClick={handleSyncToCloud}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
            title="Sincronizar todos os dados locais para as tabelas criadas no Supabase"
          >
            <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Sincronizando com Supabase...' : 'Sincronizar Dados Locais para o Supabase'}</span>
            <span className="px-1.5 py-0.5 bg-emerald-700 text-emerald-100 rounded text-[10px] font-mono">
              {totalLocalRecords}
            </span>
          </button>
        </div>
      </div>

      {/* Grid de Informações da Conexão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Status do Servidor */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Status do Endpoint
            </span>
            <span className="text-[10px] text-slate-400 font-mono">REST API v1</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Conectividade:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Latência de Resposta:</span>
              <span className="font-mono font-bold text-slate-800">{health?.latencyMs ?? 0} ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">ID do Projeto:</span>
              <span className="font-mono font-semibold text-slate-700">{SUPABASE_PROJECT_ID}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Credenciais & URLs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              Credenciais & Endpoints
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Configurado
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
              <div className="truncate pr-2">
                <span className="text-[10px] text-slate-400 block">Project URL</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block">{SUPABASE_URL}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_URL);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 1500);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copiar URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
              <div className="truncate pr-2">
                <span className="text-[10px] text-slate-400 block">String PostgreSQL Direct</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block">db.rtfwrzuacelrxxbfpxow.supabase.co:5432</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_DB_URL);
                  setCopiedDbUrl(true);
                  setTimeout(() => setCopiedDbUrl(false), 1500);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copiar String de Conexão"
              >
                {copiedDbUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Resumo dos Registros */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Volume de Dados do Sistema
            </span>
            <span className="text-[10px] font-mono text-slate-500">{totalLocalRecords} registros</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Lançamentos</span>
              <strong className="text-slate-900 font-mono text-sm">{entries.length}</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Notas Fiscais</span>
              <strong className="text-slate-900 font-mono text-sm">{documents.length}</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Empregados</span>
              <strong className="text-slate-900 font-mono text-sm">{employees.length}</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Sócios (QSA)</span>
              <strong className="text-slate-900 font-mono text-sm">{partners.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Controle */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'status'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CloudUpload className="w-4 h-4" />
          Sincronização & Tabelas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ddl')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'ddl'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Script SQL de Inicialização (DDL)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'tables'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          Estrutura do Banco de Dados
        </button>
      </div>

      {/* ABA 1: Painel de Sincronização */}
      {activeTab === 'status' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-emerald-600" />
                Sincronização Bidirecional com a Nuvem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Envie dados em lote (upsert) para o Supabase ou restaure a base de dados a partir das tabelas na nuvem.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreFromCloud}
                disabled={isRestoring}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <CloudDownload className={`w-3.5 h-3.5 ${isRestoring ? 'animate-bounce' : ''}`} />
                {isRestoring ? 'Buscando...' : 'Restaurar da Nuvem'}
              </button>

              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                {isSyncing ? 'Sincronizando com Supabase...' : 'Sincronizar Dados Locais para o Supabase'}
              </button>
            </div>
          </div>

          {/* Feedback de Sincronização */}
          {syncResult && (
            <div className={`p-4 rounded-xl text-xs border ${
              syncResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-amber-50 text-amber-950 border-amber-300 shadow-xs'
            }`}>
              <div className="font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <span className="text-sm">
                    {syncResult.success 
                      ? 'Todas as 13 tabelas foram sincronizadas com sucesso no Supabase!' 
                      : 'Atenção: Algumas tabelas precisam ser atualizadas no Supabase'}
                  </span>
                </div>
                {!syncResult.success && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('ddl')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Abrir Script SQL Atualizado
                  </button>
                )}
              </div>

              {syncResult.errors.length > 0 && (
                <div className="mt-3 space-y-2">
                  {syncResult.errors.some(e => e.includes('system_users_role_check') || e.includes('system_users')) && (
                    <div className="p-3 bg-white/90 rounded-lg border border-amber-300 text-amber-900 space-y-1">
                      <div className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                        <span>💡 Diagnóstico: Restrição de Perfil de Usuário (Role Check Constraint):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        A tabela <code>system_users</code> no banco de dados possui uma restrição que não reconhece o perfil <code>OPERADOR</code> (usado por analistas operacionais e de folha).
                      </p>
                      <p className="text-[11px] leading-relaxed text-emerald-800 font-medium">
                        Basta rodar o comando rápido abaixo no <strong>SQL Editor</strong> do Supabase para remover a restrição e permitir todos os perfis do sistema:
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={copyRoleFix}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-medium text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedRoleFix ? 'Comando Copiado!' : 'Copiar Ajuste de Perfis (ALTER TABLE DROP CONSTRAINT)'}
                        </button>
                      </div>
                    </div>
                  )}

                  {syncResult.errors.some(e => e.includes('22001') || e.includes('cnae')) && (
                    <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                      <div className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                        <span>💡 Diagnóstico do Erro 22001 (value too long for character varying 15):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        A coluna <code>cnae</code> no PostgreSQL foi criada originalmente como <code>VARCHAR(15)</code>, mas o cadastro contém a descrição completa da atividade. Como a tabela <code>companies</code> foi rejeitada pelo banco, as demais tabelas falharam por cascata de chave estrangeira.
                      </p>
                      <p className="text-[11px] leading-relaxed text-emerald-800 font-medium">
                        ✓ O sistema agora conta com <strong>auto-recuperação inteligente</strong>: clique em <strong>"Sincronizar Dados Locais para o Supabase"</strong> e o sistema enviará o código do CNAE sanitizado, sincronizando todas as tabelas imediatamente!
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={copyQuickFix}
                          className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-medium text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedQuickFix ? 'Comando Copiado!' : 'Copiar Ajuste Rápido (ALTER TABLE)'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto p-2.5 bg-slate-900 text-amber-300 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-sans text-[10px] pb-1 border-b border-slate-800 mb-1">
                      Registro de Respostas do Banco de Dados:
                    </div>
                    {syncResult.errors.map((err, i) => (
                      <div key={i} className="break-words">
                        • {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grid de Tabelas e Status de Sincronização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { name: 'companies', label: 'Empresas Cadastradas', count: companies.length, tag: 'Fase 1' },
              { name: 'fiscal_documents', label: 'Documentos Fiscais (NF-e/NFS-e)', count: documents.length, tag: 'Fase 1' },
              { name: 'accounting_accounts', label: 'Plano de Contas Referencial', count: accounts.length, tag: 'Fase 1' },
              { name: 'accounting_entries', label: 'Livro Diário Geral', count: entries.length, tag: 'Fase 1' },
              { name: 'employees', label: 'Empregados (eSocial)', count: employees.length, tag: 'Fase 2' },
              { name: 'payroll_payslips', label: 'Holerites & Folha', count: payslips.length, tag: 'Fase 2' },
              { name: 'partners', label: 'Sócios & QSA', count: partners.length, tag: 'Fase 2' },
              { name: 'profit_distributions', label: 'Distribuição de Lucros', count: distributions.length, tag: 'Fase 2' },
              { name: 'tax_obligations', label: 'Obrigações e Prazos', count: obligations.length, tag: 'Fase 2' },
              { name: 'accounting_parameters', label: 'Parâmetros Contábeis', count: accountingParameters ? 1 : 0, tag: 'Fase 3' },
              { name: 'system_customization', label: 'Personalização White-Label', count: customization ? 1 : 0, tag: 'Fase 3' },
              { name: 'system_users', label: 'Usuários & Perfis RBAC', count: users?.length || 0, tag: 'Fase 3' },
              { name: 'user_activity_backlog', label: 'Trilha de Auditoria & Backlog', count: userBacklog?.length || 0, tag: 'Fase 3' },
            ].map((tbl) => {
              const itemProgress = syncProgress.find(p => p.table === tbl.name);
              return (
                <div key={tbl.name} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-800 truncate">{tbl.label}</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded ${
                        tbl.tag === 'Fase 3' 
                          ? 'bg-blue-100 text-blue-800' 
                          : tbl.tag === 'Fase 2' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tbl.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Tabela: <span className="text-slate-700 font-semibold">{tbl.name}</span>
                    </div>
                    {itemProgress?.message && itemProgress.status === 'error' && (
                      <div className="text-[10px] text-rose-600 mt-1 truncate" title={itemProgress.message}>
                        {itemProgress.message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {tbl.count} regs
                    </span>
                    {itemProgress && (
                      <span className={`text-[10px] font-semibold ${
                        itemProgress.status === 'success' 
                          ? 'text-emerald-600' 
                          : itemProgress.status === 'error'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}>
                        {itemProgress.status === 'success' ? '✓ OK' : itemProgress.status === 'syncing' ? 'Sincronizando...' : 'Erro'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: Script SQL de Inicialização (DDL) */}
      {activeTab === 'ddl' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          {/* Banner de Ação pós-execução do Script */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                ✓
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  Tabelas já foram criadas no Supabase SQL Editor?
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    {totalLocalRecords} registros prontos (13 tabelas)
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Após executar o script SQL no Supabase, clique abaixo para sincronizar todos os dados locais com a nuvem PostgreSQL.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              {isSyncing ? 'Sincronizando com Supabase...' : 'Sincronizar Dados Locais para o Supabase'}
            </button>
          </div>

          {/* Seletor do Modo SQL: Fase 3 Incremental vs DDL Completo */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Escolha o tipo de script SQL desejado para o Supabase:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSqlMode('phase3')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  sqlMode === 'phase3'
                    ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-100'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Migração Incremental Fase 3 (Recomendado)
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                    Não apaga dados
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cria apenas as 4 novas tabelas (parâmetros, customização, usuários RBAC e backlog) sem tocar nas 9 tabelas já existentes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSqlMode('full')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  sqlMode === 'full'
                    ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-100'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    DDL Completo (Todas as 13 Tabelas)
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">
                    Recriação do Schema
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cria o banco de dados contábil completo do zero com todas as 13 tabelas, chaves estrangeiras, índices e RLS.
                </p>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-800" />
                {sqlMode === 'phase3' 
                  ? 'Script SQL: Migração Incremental Fase 3 (4 Novas Tabelas)' 
                  : 'Script SQL: DDL Geral Completo (13 Tabelas Relacionais)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {sqlMode === 'phase3'
                  ? 'Gera as tabelas: accounting_parameters, system_customization, system_users e user_activity_backlog.'
                  : 'Gera o schema completo incluindo empresas, notas, diário, plano de contas, folha, sócios e parametrizações.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir SQL Editor do Supabase
              </a>

              <button
                type="button"
                onClick={copySql}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Script Copiado!' : 'Copiar Script SQL'}
              </button>
            </div>
          </div>

          {/* Editor de Código Visual */}
          <div className="relative">
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {getActiveSqlCode()}
            </pre>
          </div>
        </div>
      )}

      {/* ABA 3: Estrutura do Banco de Dados */}
      {activeTab === 'tables' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              Arquitetura Relacional do Schema Contábil (PostgreSQL) - 13 Tabelas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabelas modeladas para conformidade com normas CFC / NBC TG, RFB, eSocial e requisitos corporativos multi-usuário.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="border border-slate-200 rounded-lg p-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                1. companies & fiscal_documents (Fase 1)
              </h3>
              <p className="text-slate-600 mt-1">
                Armazena cadastros multi-tenant das empresas contábeis e todas as notas fiscais importadas via XML (NF-e, NFS-e, CT-e) com decomposição tributária em formato JSONB e campos normalizados.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                2. accounting_accounts & accounting_entries (Fase 1)
              </h3>
              <p className="text-slate-600 mt-1">
                Implementação clássica de Partidas Dobradas (Livro Diário Geral). Cada lançamento possui array de partidas (DÉBITO e CRÉDITO), vinculando contas de Ativo, Passivo, Patrimônio Líquido, Receitas e Despesas.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                3. employees & payroll_payslips (Fase 2)
              </h3>
              <p className="text-slate-600 mt-1">
                Cadastro de empregados para integração com eSocial (S-2200), cálculo de holerites por competência (S-1200/S-1210) com proventos, descontos de INSS progressivo, IRRF e encargos de FGTS.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                4. partners, profit_distributions & tax_obligations (Fase 2)
              </h3>
              <p className="text-slate-600 mt-1">
                Controle de sócios e cotas do capital social (QSA), apuração de pró-labore com INSS/IRRF retidos, recibos de lucros isentos e controle de obrigações acessórias federais, estaduais e municipais.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-blue-50/40">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                5. accounting_parameters, system_customization, system_users & user_activity_backlog (Fase 3)
              </h3>
              <p className="text-slate-700 mt-1">
                Regras de negócio e parametrização do especialista (contas de integração automática, presunções de Lucro Presumido, travas contábeis e signatários ECD/EFD), personalização visual White-Label do escritório, gestão de acessos baseada em papéis (RBAC com 4 perfis) e auditoria completa de ações (Backlog de atividades com IP, módulo e carimbo de data/hora).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
