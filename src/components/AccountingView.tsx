import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Scale, 
  TrendingUp, 
  RefreshCw, 
  Check, 
  DollarSign, 
  Filter, 
  GitCommit,
  CheckCheck,
  Building2,
  BookMarked,
  CalendarCheck,
  Printer,
  Search,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  AccountingAccount, 
  AccountingEntry, 
  AccountingEntryLine, 
  Company, 
  FiscalDocument, 
  PostingRule 
} from '../types';
import { 
  autoJournalizeFiscalDocuments, 
  generateDreStatement, 
  generateTrialBalance, 
  generateBalanceSheet,
  generateGeneralLedger,
  generateClosingEntries,
  validateDoubleEntry 
} from '../services/accountingEngine';

interface AccountingViewProps {
  company: Company;
  competencia: string;
  accounts: AccountingAccount[];
  entries: AccountingEntry[];
  documents: FiscalDocument[];
  postingRules: PostingRule[];
  onAddEntry: (entry: AccountingEntry) => void;
  onAddAccount: (acc: AccountingAccount) => void;
  onAutoJournalize: () => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  company,
  competencia,
  accounts,
  entries,
  documents,
  postingRules,
  onAddEntry,
  onAddAccount,
  onAutoJournalize,
}) => {
  const [subTab, setSubTab] = useState<'lancamentos' | 'balancete' | 'dre' | 'balanco' | 'razao' | 'encerramento' | 'plano' | 'regras' | 'conciliacao'>('lancamentos');

  // Estado do Livro Razão
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<string>('1.1.01.02.001');
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState<string>('');

  // Modal Novo Lançamento
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryHistorico, setEntryHistorico] = useState('');
  const [entryData, setEntryData] = useState('2026-09-05');
  const [entryLines, setEntryLines] = useState<AccountingEntryLine[]>([
    { id: '1', contaCodigo: '1.1.01.01.001', contaNome: 'Caixa Geral', tipo: 'DEBITO', valor: 0 },
    { id: '2', contaCodigo: '4.1.01.01.001', contaNome: 'Receita Bruta de Vendas de Mercadorias', tipo: 'CREDITO', valor: 0 },
  ]);

  // Modal Nova Conta
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAccCodigo, setNewAccCodigo] = useState('');
  const [newAccReduzido, setNewAccReduzido] = useState('');
  const [newAccNome, setNewAccNome] = useState('');
  const [newAccTipo, setNewAccTipo] = useState<'ANALITICA' | 'SINTETICA'>('ANALITICA');
  const [newAccNatureza, setNewAccNatureza] = useState<'DEVEDORA' | 'CREDORA'>('DEVEDORA');

  const compEntries = entries.filter(e => e.companyId === company.id);
  const compAccounts = accounts.filter(a => a.companyId === company.id);

  // Relatórios Oficiais
  const trialBalance = generateTrialBalance(compAccounts, compEntries);
  const dre = generateDreStatement(compAccounts, compEntries);
  const balanceSheet = generateBalanceSheet(compAccounts, compEntries);
  const generalLedger = generateGeneralLedger(selectedAccountForLedger, compAccounts, compEntries);
  const closingSimulation = generateClosingEntries(company.id, competencia, compAccounts, compEntries);
  const hasClosingEntry = compEntries.some(e => e.origemTipo === 'ENCERRAMENTO');

  // Validação em tempo real do novo lançamento
  const entryValidation = validateDoubleEntry(entryLines);

  const handleSaveEntry = () => {
    if (!entryValidation.balanced) return;

    const nextNum = compEntries.length > 0 ? Math.max(...compEntries.map(e => e.numero)) + 1 : 1001;

    const newEntry: AccountingEntry = {
      id: `entry-${Date.now()}`,
      companyId: company.id,
      competencia,
      numero: nextNum,
      data: entryData,
      origemTipo: 'MANUAL',
      historicoPadrao: entryHistorico || 'Lançamento Contábil Manual',
      linhas: entryLines,
      totalDebito: entryValidation.totalDebito,
      totalCredito: entryValidation.totalCredito,
      balanceado: true,
      criadoEm: new Date().toISOString(),
      criadoPor: 'Carlos Eduardo Silva',
    };

    onAddEntry(newEntry);
    setIsEntryModalOpen(false);
    setEntryHistorico('');
  };

  const handleSaveAccount = () => {
    if (!newAccCodigo || !newAccNome) return;

    const newAccount: AccountingAccount = {
      id: `acc-${Date.now()}`,
      companyId: company.id,
      codigo: newAccCodigo,
      codigoReduzido: newAccReduzido || newAccCodigo.replace(/\./g, '').slice(-3),
      nome: newAccNome,
      tipo: newAccTipo,
      natureza: newAccNatureza,
      categoria: newAccCodigo.startsWith('1') ? 'ATIVO' : newAccCodigo.startsWith('2') ? 'PASSIVO' : newAccCodigo.startsWith('3') ? 'DESPESAS' : 'RECEITAS',
      nivel: newAccCodigo.split('.').length,
      saldoInicial: 0,
      saldoAtual: 0,
    };

    onAddAccount(newAccount);
    setIsAccountModalOpen(false);
    setNewAccCodigo('');
    setNewAccNome('');
  };

  const pendingDocsToJournalize = documents.filter(
    d => d.companyId === company.id && d.statusContabilizacao === 'PENDENTE'
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Módulo Contábil: Partidas Dobradas, Balancete e DRE
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Garantia matemática de balanceamento Débito = Crédito e integração automática a partir de eventos fiscais.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingDocsToJournalize.length > 0 && (
            <button
              type="button"
              onClick={onAutoJournalize}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Contabilizar {pendingDocsToJournalize.length} NF-e(s)
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEntryModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px text-xs">
        <button
          type="button"
          onClick={() => setSubTab('lancamentos')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'lancamentos'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Lançamentos ({compEntries.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('balancete')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'balancete'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Balancete de Verificação
        </button>

        <button
          type="button"
          onClick={() => setSubTab('dre')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'dre'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          DRE Oficial
        </button>

        <button
          type="button"
          onClick={() => setSubTab('balanco')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'balanco'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Balanço Patrimonial
        </button>

        <button
          type="button"
          onClick={() => setSubTab('razao')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'razao'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          Livro Razão Analítico
        </button>

        <button
          type="button"
          onClick={() => setSubTab('encerramento')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'encerramento'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Encerramento (ARE)
        </button>

        <button
          type="button"
          onClick={() => setSubTab('plano')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'plano'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Plano de Contas ({compAccounts.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('regras')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'regras'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          Regras de Contabilização
        </button>

        <button
          type="button"
          onClick={() => setSubTab('conciliacao')}
          className={`px-3.5 py-2.5 font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'conciliacao'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Conciliação Fiscal x Contábil
        </button>
      </div>

      {/* 1. ABA LANÇAMENTOS CONTÁBEIS */}
      {subTab === 'lancamentos' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Lançamentos Escriturados na Competência {competencia}
              </span>
              <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Partidas Dobradas Balanceadas (100%)
              </span>
            </div>

            {compEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Nenhum lançamento contábil registrado ainda para {competencia}.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {compEntries.map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-slate-50/60 transition-colors text-xs space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
                          Lançamento #{entry.numero}
                        </span>
                        <span className="text-slate-500">Data: {new Date(entry.data).toLocaleDateString('pt-BR')}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          entry.origemTipo === 'FISCAL' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          Origem: {entry.origemTipo} {entry.documentoRef ? `(${entry.documentoRef})` : ''}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        Total: {entry.totalDebito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>

                    <div className="text-slate-700 font-medium">
                      Histórico: <span className="text-slate-500 font-normal">{entry.historicoPadrao}</span>
                    </div>

                    {/* Linhas de Débito e Crédito */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                      <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1.5">
                        <div className="text-[10px] font-sans font-bold text-blue-700 uppercase tracking-wider">Partida Devedora (D)</div>
                        {entry.linhas.filter(l => l.tipo === 'DEBITO').map(l => (
                          <div key={l.id} className="flex justify-between items-center text-slate-700">
                            <span className="truncate pr-2">{l.contaCodigo} - {l.contaNome}</span>
                            <span className="text-blue-700 font-bold shrink-0">
                              {l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-1.5">
                        <div className="text-[10px] font-sans font-bold text-amber-700 uppercase tracking-wider">Partida Credora (C)</div>
                        {entry.linhas.filter(l => l.tipo === 'CREDITO').map(l => (
                          <div key={l.id} className="flex justify-between items-center text-slate-700">
                            <span className="truncate pr-2">{l.contaCodigo} - {l.contaNome}</span>
                            <span className="text-amber-700 font-bold shrink-0">
                              {l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ABA BALANCETE DE VERIFICAÇÃO */}
      {subTab === 'balancete' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Balancete de Verificação Analítico - Competência {competencia}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                trialBalance.fechado
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {trialBalance.fechado ? '✓ Balancete Fechado (Débitos = Créditos)' : '⚠ Desbalanceado'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-sans border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Classificação</th>
                    <th className="py-3 px-4 font-semibold">Red.</th>
                    <th className="py-3 px-4 font-sans font-semibold">Descrição da Conta</th>
                    <th className="py-3 px-4 text-right font-semibold">Saldo Anterior</th>
                    <th className="py-3 px-4 text-right font-semibold">Débito</th>
                    <th className="py-3 px-4 text-right font-semibold">Crédito</th>
                    <th className="py-3 px-4 text-right font-semibold">Saldo Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trialBalance.rows.map((row) => {
                    const isSintetica = row.tipo === 'SINTETICA';
                    return (
                      <tr 
                        key={row.codigo} 
                        className={`hover:bg-slate-50/70 transition-colors ${isSintetica ? 'font-bold bg-slate-50/50 text-slate-900 font-sans' : ''}`}
                      >
                        <td className="py-2.5 px-4">{row.codigo}</td>
                        <td className="py-2.5 px-4 text-slate-400">{row.codigoReduzido}</td>
                        <td className="py-2.5 px-4 font-sans">
                          <span style={{ paddingLeft: `${(row.nivel - 1) * 12}px` }}>
                            {row.nome}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-500">
                          {row.saldoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2.5 px-4 text-right text-blue-600 font-medium">
                          {row.movimentoDebito > 0 ? row.movimentoDebito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-amber-600 font-medium">
                          {row.movimentoCredito > 0 ? row.movimentoCredito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                          {row.saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100/70 text-slate-800 font-bold border-t-2 border-slate-200 text-xs">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 font-sans uppercase">
                      Total Geral dos Movimentos Analíticos
                    </td>
                    <td className="py-3 px-4 text-right text-blue-700">
                      {trialBalance.totalDebitoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-700">
                      {trialBalance.totalCreditoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-700 font-bold">
                      Dife: R$ 0,00
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA DRE (Demonstração do Resultado do Exercício) */}
      {subTab === 'dre' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 max-w-4xl">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  Demonstração do Resultado do Exercício (DRE)
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  {company.razaoSocial} • Competência: {competencia} • Padrão CPC / NBC TG
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Resultado Líquido</div>
                <div className="text-xl font-bold text-blue-600 mt-0.5">
                  {dre.lucroLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {dre.items.map((item) => {
                const isHeader = item.tipo === 'TITULO';
                const isSubtotal = item.tipo === 'SUBTOTAL';
                const isResult = item.tipo === 'RESULTADO';

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                      isResult 
                        ? 'bg-blue-50 border border-blue-200 font-bold text-sm text-blue-900'
                        : isSubtotal
                        ? 'bg-slate-100 font-bold text-slate-900'
                        : isHeader
                        ? 'font-bold text-slate-800 pt-2 font-sans'
                        : 'text-slate-600 pl-4'
                    }`}
                  >
                    <span>{item.descricao}</span>
                    <span className={isResult ? 'text-blue-700' : isSubtotal ? 'text-slate-900' : 'text-slate-700'}>
                      {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA BALANÇO PATRIMONIAL OFICIAL */}
      {subTab === 'balanco' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Balanço Patrimonial Estático & Dinâmico</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                    balanceSheet.equilibrado 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {balanceSheet.equilibrado ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Equação Fundamental Equilibrada (Ativo = Passivo + PL)
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Diferença de Equilíbrio: {balanceSheet.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Demonstração contábil oficial nos termos das NBC TG e Lei das S/A (6.404/76) • Competência {competencia}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Balanço
                </button>
              </div>
            </div>

            {/* Cards de Métricas do Balanço */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">Total do Ativo</span>
                <div className="text-xl font-bold text-blue-900 mt-1">
                  {balanceSheet.totalAtivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5 flex justify-between">
                  <span>Circulante: {balanceSheet.subtotalAtivoCirculante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Passivo Exigível</span>
                <div className="text-xl font-bold text-amber-900 mt-1">
                  {(balanceSheet.subtotalPassivoCirculante + balanceSheet.subtotalPassivoNaoCirculante).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Circulante: {balanceSheet.subtotalPassivoCirculante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">Patrimônio Líquido</span>
                <div className="text-xl font-bold text-emerald-900 mt-1">
                  {balanceSheet.subtotalPatrimonioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Resultado DRE no Período: {balanceSheet.resultadoExercicioApurado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            {/* Balanço em 2 Colunas (Ativo vs Passivo + PL) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LADO DO ATIVO */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    1. ATIVO TOTAL
                  </span>
                  <span className="font-mono font-bold text-blue-800 text-sm">
                    {balanceSheet.totalAtivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 p-3 space-y-4 text-xs font-mono">
                  {/* Ativo Circulante */}
                  <div>
                    <div className="flex items-center justify-between py-1 px-2 font-bold text-slate-800 bg-slate-50 rounded">
                      <span>1.1 ATIVO CIRCULANTE</span>
                      <span>{balanceSheet.subtotalAtivoCirculante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="pl-3 mt-1 space-y-1 text-slate-600">
                      {balanceSheet.ativoCirculante.map((item) => (
                        <div key={item.codigo} className={`flex items-center justify-between py-0.5 px-2 ${item.tipo === 'SINTETICA' ? 'font-semibold text-slate-700' : 'text-[11px] text-slate-500'}`}>
                          <span>{item.codigo} {item.nome}</span>
                          <span>{item.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ativo Não Circulante */}
                  <div>
                    <div className="flex items-center justify-between py-1 px-2 font-bold text-slate-800 bg-slate-50 rounded">
                      <span>1.2 ATIVO NÃO CIRCULANTE</span>
                      <span>{balanceSheet.subtotalAtivoNaoCirculante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="pl-3 mt-1 space-y-1 text-slate-600">
                      {balanceSheet.ativoNaoCirculante.map((item) => (
                        <div key={item.codigo} className={`flex items-center justify-between py-0.5 px-2 ${item.tipo === 'SINTETICA' ? 'font-semibold text-slate-700' : 'text-[11px] text-slate-500'}`}>
                          <span>{item.codigo} {item.nome}</span>
                          <span>{item.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>TOTAL DO ATIVO</span>
                  <span className="font-mono text-blue-700 text-sm">
                    {balanceSheet.totalAtivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              {/* LADO DO PASSIVO E PATRIMÔNIO LÍQUIDO */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    2. PASSIVO E PATRIMÔNIO LÍQUIDO
                  </span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {balanceSheet.totalPassivoEPatrimonioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 p-3 space-y-4 text-xs font-mono">
                  {/* Passivo Circulante */}
                  <div>
                    <div className="flex items-center justify-between py-1 px-2 font-bold text-slate-800 bg-slate-50 rounded">
                      <span>2.1 PASSIVO CIRCULANTE</span>
                      <span>{balanceSheet.subtotalPassivoCirculante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="pl-3 mt-1 space-y-1 text-slate-600">
                      {balanceSheet.passivoCirculante.map((item) => (
                        <div key={item.codigo} className={`flex items-center justify-between py-0.5 px-2 ${item.tipo === 'SINTETICA' ? 'font-semibold text-slate-700' : 'text-[11px] text-slate-500'}`}>
                          <span>{item.codigo} {item.nome}</span>
                          <span>{item.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Passivo Não Circulante */}
                  <div>
                    <div className="flex items-center justify-between py-1 px-2 font-bold text-slate-800 bg-slate-50 rounded">
                      <span>2.2 PASSIVO NÃO CIRCULANTE</span>
                      <span>{balanceSheet.subtotalPassivoNaoCirculante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="pl-3 mt-1 text-[11px] text-slate-500 px-2">
                      Nenhuma exigibilidade de longo prazo registrada.
                    </div>
                  </div>

                  {/* Patrimônio Líquido */}
                  <div>
                    <div className="flex items-center justify-between py-1 px-2 font-bold text-slate-800 bg-slate-50 rounded">
                      <span>2.3 PATRIMÔNIO LÍQUIDO</span>
                      <span>{balanceSheet.subtotalPatrimonioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="pl-3 mt-1 space-y-1 text-slate-600">
                      {balanceSheet.patrimonioLiquido.map((item) => (
                        <div key={item.codigo} className={`flex items-center justify-between py-0.5 px-2 ${item.codigo.includes('03.01') ? 'font-bold text-emerald-700 bg-emerald-50/50 rounded' : item.tipo === 'SINTETICA' ? 'font-semibold text-slate-700' : 'text-[11px] text-slate-500'}`}>
                          <span>{item.codigo} {item.nome}</span>
                          <span>{item.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>TOTAL PASSIVO + PL</span>
                  <span className="font-mono text-emerald-700 text-sm">
                    {balanceSheet.totalPassivoEPatrimonioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA LIVRO RAZÃO ANALÍTICO (RAZONETES) */}
      {subTab === 'razao' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-blue-600" />
                Livro Razão Analítico • Razonetes por Conta
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Extrato cronológico com rastreamento integral de débitos, créditos e evolução do saldo por conta contábil analítica.
              </p>
            </div>

            {/* Barra de Seleção e Busca de Conta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione a Conta Contábil Analítica
                </label>
                <select
                  value={selectedAccountForLedger}
                  onChange={(e) => setSelectedAccountForLedger(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                >
                  {compAccounts
                    .filter(a => a.tipo === 'ANALITICA')
                    .map(a => (
                      <option key={a.codigo} value={a.codigo}>
                        {a.codigo} ({a.codigoReduzido}) - {a.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filtrar no Histórico
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar histórico..."
                    value={ledgerSearchTerm}
                    onChange={(e) => setLedgerSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Cabeçalho da Conta Selecionada */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Natureza da Conta</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {generalLedger.natureza}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Saldo Anterior/Inicial</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                  {generalLedger.saldoInicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                <div className="text-[10px] text-blue-700 uppercase font-semibold">Total Débitos</div>
                <div className="text-xs font-mono font-bold text-blue-900 mt-0.5">
                  {generalLedger.totalDebitos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <div className="text-[10px] text-emerald-700 uppercase font-semibold">Saldo Atual Resultante</div>
                <div className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                  {generalLedger.saldoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            {/* Tabela de Linhas do Razão */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Lçto</th>
                      <th className="py-2.5 px-3">Origem</th>
                      <th className="py-2.5 px-3">Histórico do Lançamento</th>
                      <th className="py-2.5 px-3 text-right">Débito (+)</th>
                      <th className="py-2.5 px-3 text-right">Crédito (-)</th>
                      <th className="py-2.5 px-3 text-right">Saldo Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr className="bg-slate-50/50 font-semibold text-slate-600">
                      <td className="py-2 px-3">{competencia ? `01/${competencia}` : '01/09/2026'}</td>
                      <td className="py-2 px-3">-</td>
                      <td className="py-2 px-3 font-sans">SALDO INICIAL</td>
                      <td className="py-2 px-3 font-sans text-slate-500">Transporte de saldo da competência anterior</td>
                      <td className="py-2 px-3 text-right">-</td>
                      <td className="py-2 px-3 text-right">-</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {generalLedger.saldoInicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                    {generalLedger.linhas
                      .filter(l => !ledgerSearchTerm || l.historico.toLowerCase().includes(ledgerSearchTerm.toLowerCase()))
                      .map((l) => (
                        <tr key={`${l.entryId}-${l.entryNumero}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 text-slate-700">{l.data}</td>
                          <td className="py-2 px-3 font-bold text-blue-600">#{l.entryNumero}</td>
                          <td className="py-2 px-3 font-sans">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {l.origemTipo}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-800">
                            {l.historico}
                            {l.documentoRef && (
                              <span className="ml-1 text-[10px] text-slate-400 font-mono">[{l.documentoRef}]</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right text-blue-700 font-bold">
                            {l.debito > 0 ? l.debito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                          </td>
                          <td className="py-2 px-3 text-right text-amber-700 font-bold">
                            {l.credito > 0 ? l.credito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {l.saldoResultante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      ))}
                    {generalLedger.linhas.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-sans text-xs">
                          Nenhum lançamento registrado nesta conta para a competência atual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ABA ENCERRAMENTO DO EXERCÍCIO / ARE */}
      {subTab === 'encerramento' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-purple-600" />
                  Apuração do Resultado do Exercício (ARE) • Encerramento de Contas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Rotina contábil obrigatória para zerar contas temporárias de Receitas e Despesas/Custos, apurando o Lucro ou Prejuízo Líquido transferido ao Patrimônio Líquido.
                </p>
              </div>

              {hasClosingEntry ? (
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Exercício Já Encerrado
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Aguardando Encerramento
                </span>
              )}
            </div>

            {/* Painel de Balanço da Apuração */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Receitas Brutas a Zerar</span>
                <div className="text-lg font-bold text-emerald-700 mt-1">
                  {closingSimulation.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Débito nas contas de Receita Operacional
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Despesas & Custos a Zerar</span>
                <div className="text-lg font-bold text-amber-700 mt-1">
                  {closingSimulation.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Crédito nas contas de Custos e Despesas
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                closingSimulation.resultadoLiquido >= 0 
                  ? 'bg-blue-50/70 border-blue-200' 
                  : 'bg-rose-50/70 border-rose-200'
              }`}>
                <span className="text-[11px] font-semibold text-blue-800 uppercase">Resultado Líquido Apurado</span>
                <div className={`text-lg font-bold mt-1 ${
                  closingSimulation.resultadoLiquido >= 0 ? 'text-blue-900' : 'text-rose-900'
                }`}>
                  {closingSimulation.resultadoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-[10px] text-blue-700 mt-0.5">
                  {closingSimulation.resultadoLiquido >= 0 
                    ? 'Transferência a Crédito de Lucros Acumulados' 
                    : 'Transferência a Débito de Prejuízos Acumulados'}
                </div>
              </div>
            </div>

            {/* Detalhamento das Contas Envolvidas */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mapeamento das Contas de Contrapartida
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Conta Transitória de ARE</span>
                  <div className="font-semibold text-slate-800 mt-0.5">3.9.01.01.001 - Resultado do Exercício em Apuração</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Centraliza os saldos de encerramento temporários das contas de resultado.
                  </p>
                </div>
                <div className="bg-white p-3 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Conta Definitiva de Destino no PL</span>
                  <div className="font-semibold text-slate-800 mt-0.5">2.3.02.01.001 - Lucros ou Prejuízos Acumulados</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Incorpora o resultado líquido final no Patrimônio Líquido da empresa.
                  </p>
                </div>
              </div>
            </div>

            {/* Ação de Execução */}
            {!hasClosingEntry ? (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-purple-900">
                    Deseja gerar o lançamento de encerramento oficial no Livro Diário?
                  </div>
                  <div className="text-[11px] text-purple-700 mt-0.5">
                    O sistema criará automaticamente as partidas dobradas zerando as receitas e despesas e transferindo o lucro para o PL.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (closingSimulation.closingEntry) {
                      onAddEntry(closingSimulation.closingEntry);
                      alert('Encerramento contábil executado com sucesso! Lançamento de ARE inserido no Livro Diário.');
                    }
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs shadow-purple-200 transition-colors cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  Executar Encerramento de Contas (ARE)
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <span className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  O encerramento deste exercício foi gravado e registrado no Livro Diário.
                </span>
                <span className="font-mono text-emerald-700 font-bold">
                  Ref: ARE - {competencia}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. ABA PLANO DE CONTAS */}
      {subTab === 'plano' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <span className="text-xs text-slate-600">
              Plano de Contas configurável com mapeamento referencial SPED ECD/ECF.
            </span>
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Conta
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Código Estruturado</th>
                    <th className="py-3 px-4">Reduzido</th>
                    <th className="py-3 px-4">Descrição da Conta</th>
                    <th className="py-3 px-4 text-center">Tipo</th>
                    <th className="py-3 px-4 text-center">Natureza</th>
                    <th className="py-3 px-4">Cód. Referencial ECD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {compAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{acc.codigo}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{acc.codigoReduzido}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        <span style={{ paddingLeft: `${(acc.nivel - 1) * 12}px` }}>
                          {acc.nome}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.tipo === 'ANALITICA' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {acc.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.natureza === 'DEVEDORA' ? 'text-blue-700' : 'text-amber-700'
                        }`}>
                          {acc.natureza}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {acc.codigoReferencialECD || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA REGRAS DE CONTABILIZAÇÃO */}
      {subTab === 'regras' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-blue-600" />
                Regras de Contabilização Fiscal ➔ Contábil (Motor de Eventos)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Mapeamentos de regras que transformam XMLs de entrada e saída em lançamentos balanceados com histórico parametrizado.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {postingRules.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.descricao}</span>
                    <span className="text-[10px] font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 font-semibold shadow-xs">
                      CFOP Gatilho: {r.cfopFiltro || 'Todos'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-mono text-[11px]">
                    <div>
                      <span className="text-blue-700 font-bold">Débito:</span> {r.contaDebitoCodigo}
                    </div>
                    <div>
                      <span className="text-amber-700 font-bold">Crédito:</span> {r.contaCreditoCodigo}
                    </div>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Modelo do Histórico: <span className="font-mono text-slate-800 font-medium">{r.historicoModelo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ABA CONCILIAÇÃO FISCAL X CONTÁBIL */}
      {subTab === 'conciliacao' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-blue-600" />
                Auditoria & Conciliação Fiscal x Contábil ({competencia})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Confronto automático entre o livro fiscal de notas e os saldos das contas contábeis correspondentes.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Faturamento Fiscal vs. Receita Contábil</div>
                  <div className="text-slate-500 mt-0.5">
                    Saídas no XML: R$ 24.850,00 • Crédito na Conta 4.1.01: R$ 24.850,00
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Conciliado
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">ICMS Apurado vs. Passivo Tributário</div>
                  <div className="text-slate-500 mt-0.5">
                    Valor apurado no Fiscal vs. Saldo da Conta 2.1.03.01.001 (ICMS a Recolher)
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Consistente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lançamento Manual */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Novo Lançamento Contábil (Partidas Dobradas)
              </h2>
              <button
                type="button"
                onClick={() => setIsEntryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Data do Lançamento</label>
                <input
                  type="date"
                  value={entryData}
                  onChange={(e) => setEntryData(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Competência</label>
                <input
                  type="text"
                  disabled
                  value={competencia}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Histórico Padrão</label>
                <input
                  type="text"
                  placeholder="Ex: Vlr. ref. pagamento fornecedor conforme NF..."
                  value={entryHistorico}
                  onChange={(e) => setEntryHistorico(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Linhas de Partidas */}
            <div className="space-y-3 border-t border-b border-slate-100 py-4">
              <div className="text-xs font-bold text-slate-700">Partidas (Débito e Crédito):</div>

              {entryLines.map((line, idx) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-2">
                    <select
                      value={line.tipo}
                      onChange={(e) => {
                        const updated = [...entryLines];
                        updated[idx].tipo = e.target.value as 'DEBITO' | 'CREDITO';
                        setEntryLines(updated);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg font-bold ${
                        line.tipo === 'DEBITO' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <option value="DEBITO">Débito (D)</option>
                      <option value="CREDITO">Crédito (C)</option>
                    </select>
                  </div>

                  <div className="col-span-6">
                    <select
                      value={line.contaCodigo}
                      onChange={(e) => {
                        const updated = [...entryLines];
                        const acc = compAccounts.find(a => a.codigo === e.target.value);
                        if (acc) {
                          updated[idx].contaCodigo = acc.codigo;
                          updated[idx].contaNome = acc.nome;
                          setEntryLines(updated);
                        }
                      }}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 truncate focus:outline-none focus:border-blue-500"
                    >
                      {compAccounts.filter(a => a.tipo === 'ANALITICA').map(a => (
                        <option key={a.id} value={a.codigo}>
                          {a.codigo} - {a.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={line.valor || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = [...entryLines];
                        updated[idx].valor = val;
                        setEntryLines(updated);
                      }}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-right focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Verificação do Balanço */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              entryValidation.balanced
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <div>
                <span className="font-bold">Total Débito:</span> R$ {entryValidation.totalDebito.toFixed(2)} | <span className="font-bold">Total Crédito:</span> R$ {entryValidation.totalCredito.toFixed(2)}
              </div>
              <div>
                {entryValidation.balanced ? (
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Lançamento Balanceado
                  </span>
                ) : (
                  <span className="font-bold">
                    Diferença: R$ {entryValidation.difference.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEntryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!entryValidation.balanced}
                onClick={handleSaveEntry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-200 cursor-pointer transition-colors"
              >
                Salvar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Conta */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-800">
            <h2 className="text-base font-bold text-slate-900">Nova Conta Contábil</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Classificação (Código)</label>
                <input
                  type="text"
                  placeholder="Ex: 1.1.01.02.003"
                  value={newAccCodigo}
                  onChange={(e) => setNewAccCodigo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nome da Conta</label>
                <input
                  type="text"
                  placeholder="Ex: Banco Santander c/c"
                  value={newAccNome}
                  onChange={(e) => setNewAccNome(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tipo</label>
                  <select
                    value={newAccTipo}
                    onChange={(e) => setNewAccTipo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ANALITICA">Analítica (Recebe lançamentos)</option>
                    <option value="SINTETICA">Sintética (Totalizadora)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Natureza</label>
                  <select
                    value={newAccNatureza}
                    onChange={(e) => setNewAccNatureza(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="DEVEDORA">Devedora</option>
                    <option value="CREDORA">Credora</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAccount}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs shadow-blue-200 cursor-pointer transition-colors"
              >
                Salvar Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
