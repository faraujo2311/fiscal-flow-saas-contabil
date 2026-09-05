import React from 'react';
import { 
  FileText, 
  Calculator, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert,
  DownloadCloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  Company, 
  FiscalDocument, 
  AccountingEntry, 
  TaxObligation, 
  DigitalCertificate, 
  Employee,
  TaxAssessment
} from '../types';

interface DashboardViewProps {
  company: Company;
  competencia: string;
  documents: FiscalDocument[];
  assessment?: TaxAssessment;
  entries: AccountingEntry[];
  employees: Employee[];
  obligations: TaxObligation[];
  certificate?: DigitalCertificate;
  onNavigate: (tab: any) => void;
  onQuickCalculate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  competencia,
  documents,
  assessment,
  entries,
  employees,
  obligations,
  certificate,
  onNavigate,
  onQuickCalculate,
}) => {
  const compDocs = documents.filter(d => d.companyId === company.id);
  const saidas = compDocs.filter(d => d.tipoOperacao === 'SAIDA');
  const entradas = compDocs.filter(d => d.tipoOperacao === 'ENTRADA');

  const faturamentoSaidas = saidas.reduce((acc, curr) => acc + curr.valorTotalNota, 0);
  const totalEntradas = entradas.reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const pendingContabilizacao = compDocs.filter(d => d.statusContabilizacao === 'PENDENTE').length;

  const totalImpostosApurados = assessment?.guias.reduce((acc, g) => acc + g.valorTotal, 0) || 0;

  const folhaBrutaEstimada = employees
    .filter(e => e.companyId === company.id && e.status === 'ATIVO')
    .reduce((acc, curr) => acc + curr.salarioBase, 0);

  const pendingObligations = obligations.filter(o => o.status === 'PENDENTE');

  return (
    <div className="space-y-6">
      {/* Top Header com Título e Ações Primárias */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visão Geral Operacional</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitoramento de pendências, conciliações fiscais e apurações em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-quick-import-xml"
            type="button"
            onClick={() => onNavigate('fiscal')}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Importar XML
          </button>
          <button
            id="btn-quick-apuracao"
            type="button"
            onClick={() => {
              onQuickCalculate();
              onNavigate('apuracao');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Apurar Impostos
          </button>
        </div>
      </div>

      {/* Banner de Identificação da Empresa */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-lg font-bold tracking-tight text-slate-800">
              {company.razaoSocial}
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded border border-slate-200 font-mono">
              CNPJ: {company.cnpj}
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-semibold">
              {company.regimeTributario === 'SIMPLES_NACIONAL' ? 'Simples Nacional' : 'Lucro Presumido'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            {company.atividadePrincipal} • Município: {company.cidade}/{company.uf} • Competência de Trabalho: <strong className="text-blue-600">{competencia}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Empresa Regular
          </span>
        </div>
      </div>

      {/* Alerta de Certificado A1 se estiver vencendo */}
      {certificate && certificate.diasParaVencer <= 30 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Atenção ao Certificado Digital A1:</span> O certificado desta empresa expira em <strong>{certificate.diasParaVencer} dias</strong> ({new Date(certificate.validoAte).toLocaleDateString('pt-BR')}). Renove com a Autoridade Certificadora para manter as transmissões ativas.
            </div>
          </div>
          <button 
            type="button"
            onClick={() => onNavigate('certificados')}
            className="px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-xs font-semibold shrink-0 ml-3 transition-colors cursor-pointer"
          >
            Ver Certificado
          </button>
        </div>
      )}

      {/* Grid de Métricas Operacionais no estilo Professional Polish */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Faturamento Fiscal */}
        <div 
          onClick={() => onNavigate('fiscal')}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {saidas.length} Saídas
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {faturamentoSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Faturamento Fiscal (Saídas)
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{entradas.length} Entradas</span>
            <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Ver XMLs <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Impostos Apurados / Guias */}
        <div 
          onClick={() => onNavigate('apuracao')}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              assessment ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
            }`}>
              {assessment ? 'Apurado' : 'Pendente'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {totalImpostosApurados > 0 
              ? totalImpostosApurados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : 'R$ 0,00'}
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Tributos a Recolher
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{company.regimeTributario === 'SIMPLES_NACIONAL' ? 'Guia DAS' : 'ICMS + DARF'}</span>
            <span className="text-amber-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Calcular <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Contábil & Lançamentos */}
        <div 
          onClick={() => onNavigate('contabil')}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              Equilibrado
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {entries.filter(e => e.companyId === company.id).length}
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Lançamentos Contábeis
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className={pendingContabilizacao > 0 ? "text-amber-600 font-medium" : "text-emerald-600"}>
              {pendingContabilizacao} NF-e pendentes
            </span>
            <span className="text-emerald-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Livro Razão <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Folha & Colaboradores */}
        <div 
          onClick={() => onNavigate('folha')}
          className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Ativos
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {employees.filter(e => e.companyId === company.id).length}
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Colaboradores Cadastrados
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Folha: {folhaBrutaEstimada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            <span className="text-purple-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Folha <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Seção Central de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Cadeia Operacional e Documentos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Cadeia de Valor */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              Cadeia de Processamento Integrada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-slate-500 font-semibold mb-1">1. Entrada XMLs</div>
                <div className="font-bold text-slate-800 text-sm">{compDocs.length} documentos</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">Parser e Chaves OK</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-slate-500 font-semibold mb-1">2. Apuração Fiscal</div>
                <div className="font-bold text-slate-800 text-sm">
                  {assessment ? 'Concluída' : 'Pendente'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Memória de cálculo</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-slate-500 font-semibold mb-1">3. Contabilidade</div>
                <div className="font-bold text-slate-800 text-sm">Partidas Dobradas</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">Balancete & DRE</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-slate-500 font-semibold mb-1">4. SPED / Compliance</div>
                <div className="font-bold text-slate-800 text-sm">EFD & eSocial</div>
                <div className="text-[11px] text-blue-600 font-medium mt-1">Pronto p/ Envio</div>
              </div>
            </div>
          </div>

          {/* Últimos Documentos Fiscais Importados */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Documentos Fiscais na Competência {competencia}
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('fiscal')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-1"
              >
                Ver Todos ({compDocs.length})
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {compDocs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Nenhum documento fiscal importado ainda para {competencia}.
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('fiscal')}
                    className="px-3.5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs shadow-blue-200 cursor-pointer"
                  >
                    Importar Primeiro XML
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                      <th className="px-6 py-3 font-semibold">Tipo / Nº</th>
                      <th className="px-6 py-3 font-semibold">Emissão</th>
                      <th className="px-6 py-3 font-semibold">Emitente / Destinatário</th>
                      <th className="px-6 py-3 font-semibold text-right">Valor Total</th>
                      <th className="px-6 py-3 font-semibold text-center">Status Contábil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {compDocs.slice(0, 4).map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-medium">
                          <span className="text-blue-600 font-bold">{doc.tipoDoc}</span> nº {doc.numero}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-3.5 max-w-[200px] truncate text-slate-800" title={doc.tipoOperacao === 'SAIDA' ? doc.destinatarioRazao : doc.emitenteRazao}>
                          {doc.tipoOperacao === 'SAIDA' ? doc.destinatarioRazao : doc.emitenteRazao}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                          {doc.valorTotalNota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.statusContabilizacao === 'CONTABILIZADO'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {doc.statusContabilizacao}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Compliance & Governo */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Compliance & Governo
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('sped')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Gerar SPED
              </button>
            </div>

            <div className="space-y-3">
              {/* Certificado A1 item */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Certificado Digital A1</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                    {certificate ? `Vence em ${certificate.diasParaVencer} dias` : 'Não configurado'}
                  </span>
                </div>
                <div className="w-16 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-amber-500"></div>
                </div>
              </div>

              {/* Sincronização SEFAZ */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Sincronização SEFAZ</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Online & Ativo</span>
                </div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
              </div>

              {/* Obrigações do mês */}
              {obligations.slice(0, 2).map((obl) => (
                <div key={obl.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{obl.nome}</span>
                    <span className="text-[10px] text-slate-400">Vencimento dia {obl.diaVencimento}</span>
                  </div>
                  {obl.status === 'TRANSMITIDO' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Pendente
                    </span>
                  )}
                </div>
              ))}

              {/* Alerta de Auditoria azul característico do tema */}
              <div className="mt-5 p-4 bg-blue-600 rounded-xl text-white shadow-xs shadow-blue-200">
                <div className="text-xs opacity-80 uppercase tracking-wider font-bold mb-1">
                  Alerta de Auditoria & Compliance
                </div>
                <p className="text-sm font-medium leading-snug">
                  Auditoria preventiva ativada para a competência {competencia}. Recomenda-se validação de retenções antes do fechamento definitivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
