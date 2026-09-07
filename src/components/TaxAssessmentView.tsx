import React, { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  Barcode, 
  CheckCircle2, 
  Printer, 
  Layers, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar,
  Eye,
  Download,
  AlertTriangle,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sliders,
  RefreshCw,
  Play,
  Check,
  Settings,
  Terminal,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { Company, FiscalDocument, TaxAssessment, TaxGuide, CalimaProcessConfig } from '../types';
import { calculateTaxAssessment } from '../services/taxEngine';

interface TaxAssessmentViewProps {
  company: Company;
  competencia: string;
  documents: FiscalDocument[];
  currentAssessment?: TaxAssessment;
  onSaveAssessment: (assessment: TaxAssessment) => void;
  onUpdateCompany?: (company: Company) => void;
  onAutoJournalize?: (assessment?: TaxAssessment) => void;
}

export const TaxAssessmentView: React.FC<TaxAssessmentViewProps> = ({
  company,
  competencia,
  documents,
  currentAssessment,
  onSaveAssessment,
  onUpdateCompany,
  onAutoJournalize,
}) => {
  const [selectedGuide, setSelectedGuide] = useState<TaxGuide | null>(null);

  // Parâmetros de Execução do Calima MLF (calcularImpostoProcessView)
  const [calimaConfig, setCalimaConfig] = useState<CalimaProcessConfig>({
    saldoCredorIcmsAnterior: 0,
    considerPreviousCredit: true,
    validateConsistencies: true,
    generateAccountingJournal: true,
    recalculateDocs: true,
    updateCompetenceStatus: true,
    selectedTaxes: ['DAS', 'ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'RETENCOES'],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Simulador de Pró-labore e Fator R
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simFolha12, setSimFolha12] = useState<number>(company.folha12Meses || 0);

  const handleRunAssessment = (overrideCompany?: Company) => {
    setIsProcessing(true);
    setProgressPercent(15);
    setProcessStep('1/4 - Validando consistências cadastrais e regras de CFOP/CST dos XMLs...');
    setConsoleLogs([
      `[MLF-CALIMA] Iniciando processo calcularImpostoProcessView...`,
      `[MLF-CALIMA] Empresa: ${company.razaoSocial} (CNPJ: ${company.cnpj})`,
      `[MLF-CALIMA] Regime: ${company.regimeTributario} | Competência: ${competencia}`,
      `[MLF-CALIMA] Verificando ${documents.length} documentos fiscais escriturados...`,
    ]);

    setTimeout(() => {
      setProgressPercent(45);
      setProcessStep('2/4 - Consolidando bases tributárias e créditos fiscais a partir dos XMLs...');
      setConsoleLogs(prev => [
        ...prev,
        `[MLF-CALIMA] Bases de Saídas e Entradas consolidadas com sucesso.`,
        `[MLF-CALIMA] Aplicando parametrização tributária e regras de segregação...`,
      ]);

      setTimeout(() => {
        setProgressPercent(80);
        setProcessStep('3/4 - Calculando alíquotas efetivas e partilhas tributárias...');
        setConsoleLogs(prev => [
          ...prev,
          `[MLF-CALIMA] Gerando guias e demonstrativos de arrecadação...`,
        ]);

        setTimeout(() => {
          const compToUse = overrideCompany && 'regimeTributario' in overrideCompany ? overrideCompany : company;
          const assessment = calculateTaxAssessment(compToUse, competencia, documents, calimaConfig);
          onSaveAssessment(assessment);

          if (calimaConfig.generateAccountingJournal && onAutoJournalize) {
            onAutoJournalize(assessment);
            setConsoleLogs(prev => [
              ...prev,
              `[MLF-CALIMA] Integração MLC: Lançamentos contábeis de provisão tributária transmitidos ao Livro Diário!`,
            ]);
          }

          setProgressPercent(100);
          setProcessStep('4/4 - Processo concluído com êxito!');
          setConsoleLogs(prev => [
            ...prev,
            `[MLF-CALIMA] Apuração gravada com sucesso! ${assessment.guias.length} guias geradas.`,
          ]);
          setIsProcessing(false);
        }, 400);
      }, 400);
    }, 400);
  };

  const handleApplySimulatedFolha = () => {
    const updatedCompany: Company = {
      ...company,
      folha12Meses: simFolha12,
    };
    if (onUpdateCompany) {
      onUpdateCompany(updatedCompany);
    }
    handleRunAssessment(updatedCompany);
    setIsSimulatorOpen(false);
  };

  const isSimples = company.regimeTributario === 'SIMPLES_NACIONAL';

  // Toggle seleção de tributo
  const handleToggleTax = (taxName: string) => {
    setCalimaConfig(prev => {
      const current = prev.selectedTaxes || [];
      const updated = current.includes(taxName)
        ? current.filter(t => t !== taxName)
        : [...current, taxName];
      return { ...prev, selectedTaxes: updated };
    });
  };

  // Cálculos do simulador
  const simRatio = company.rbt12 > 0 ? simFolha12 / company.rbt12 : 0;
  const simPercent = Math.round(simRatio * 10000) / 100;
  const simAtingiu28 = simPercent >= 28.0;
  const simAnexo = simAtingiu28 ? 'ANEXO_III' : 'ANEXO_V';
  const valorMinimoPara28 = Math.round(company.rbt12 * 0.28 * 100) / 100;
  const deficitPara28 = Math.max(0, valorMinimoPara28 - simFolha12);

  return (
    <div className="space-y-6">
      {/* Header com Identificação do Calima MLF */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                MÓDULO FISCAL (MLF)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                processo: calcularImpostoProcessView
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Calima Engine Ativo
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <Calculator className="w-5 h-5 text-amber-600" />
              Cálculo e Apuração de Impostos Fiscais
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Processamento fiscal automatizado para competência <strong className="text-slate-800">{competencia}</strong> • Empresa: <strong className="text-slate-800">{company.razaoSocial}</strong> ({isSimples ? 'Simples Nacional' : 'Lucro Presumido'}).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              {showConfigPanel ? 'Ocultar Parâmetros' : 'Configurar Parâmetros'}
            </button>

            <button
              type="button"
              id="btn-run-assessment"
              disabled={isProcessing}
              onClick={() => handleRunAssessment()}
              className={`px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs shadow-amber-200 transition-all cursor-pointer ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculando Impostos...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentAssessment ? 'Recalcular Impostos (MLF)' : 'Calcular Impostos (MLF)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Progresso e Notificação de Execução */}
        {isProcessing && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                {processStep}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Painel de Parâmetros do Processo Calima (MLF) */}
        {showConfigPanel && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-amber-600" />
                Parâmetros do Processo (Calima MLF - calcularImpostoProcessView)
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Homologado com Calima ERP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Seleção de Impostos */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 md:col-span-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Tributos a Apurar no Processo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(isSimples 
                    ? ['DAS'] 
                    : ['ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'RETENCOES']
                  ).map(tax => {
                    const isSelected = calimaConfig.selectedTaxes?.includes(tax);
                    return (
                      <button
                        key={tax}
                        type="button"
                        onClick={() => handleToggleTax(tax)}
                        className={`px-2 py-1.5 rounded text-[11px] font-bold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <span>{tax}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Saldo Credor Anterior de ICMS */}
              {!isSimples && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                  <label className="font-bold text-slate-800 block text-[11px]">
                    Saldo Credor ICMS Anterior (R$):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={calimaConfig.saldoCredorIcmsAnterior || 0}
                    onChange={(e) => setCalimaConfig(prev => ({
                      ...prev,
                      saldoCredorIcmsAnterior: parseFloat(e.target.value) || 0,
                    }))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Compensável contra débitos do mês
                  </span>
                </div>
              )}

              {/* Opções Avançadas do Calima */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Automações do Processo:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={calimaConfig.generateAccountingJournal}
                    onChange={(e) => setCalimaConfig(prev => ({
                      ...prev,
                      generateAccountingJournal: e.target.checked,
                    }))}
                    className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px]">Gerar Provisão Contábil (MLC)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={calimaConfig.considerPreviousCredit}
                    onChange={(e) => setCalimaConfig(prev => ({
                      ...prev,
                      considerPreviousCredit: e.target.checked,
                    }))}
                    className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px]">Compensar Saldo Credor Anterior</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={calimaConfig.validateConsistencies}
                    onChange={(e) => setCalimaConfig(prev => ({
                      ...prev,
                      validateConsistencies: e.target.checked,
                    }))}
                    className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px]">Pré-validar inconsistências XML</span>
                </label>
              </div>
            </div>

            {/* Terminal de Logs do Calima */}
            {consoleLogs.length > 0 && (
              <div className="p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-[11px] space-y-1 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-amber-400" />
                    Console do Processo Fiscal Calima (MLF)
                  </span>
                  <span className="text-emerald-400 font-bold">STATUS: SUCESSO</span>
                </div>
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!currentAssessment ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Calculator className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            Nenhuma apuração gerada para {competencia}
          </h2>
          <p className="text-xs max-w-md mx-auto mt-1.5 mb-5 text-slate-500 leading-relaxed">
            O motor tributário consolidará todas as notas fiscais válidas de saídas e entradas, calculando a memória de cálculo oficial e emitindo as guias de recolhimento.
          </p>
          <button
            type="button"
            onClick={() => handleRunAssessment()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            Executar Apuração da Competência
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Resumo do Faturamento Base */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Faturamento Bruto Saídas (Base de Cálculo)
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {currentAssessment.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Total de vendas registradas
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isSimples ? 'Receita Bruta Acumulada (RBT12)' : 'Compras / Entradas c/ Crédito'}
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {isSimples 
                  ? currentAssessment.simples?.rbt12.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : currentAssessment.faturamentoEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                }
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {isSimples ? 'Últimos 12 meses para faixa' : 'Base para créditos de ICMS'}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Total de Tributos Devidos
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1.5 tracking-tight">
                {currentAssessment.guias.reduce((acc, g) => acc + g.valorTotal, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {currentAssessment.guias.length} Guia(s) gerada(s)
              </div>
            </div>
          </div>

          {/* Memória de Cálculo Específica do Regime */}
          {isSimples && currentAssessment.simples && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Memória de Cálculo - Simples Nacional ({currentAssessment.simples.anexo})
                </h2>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold">
                  Alíquota Efetiva: {currentAssessment.simples.aliquotaEfetiva}%
                </span>
              </div>

              {/* Fator R (Art. 18, §§ 5º-J e 5º-M da LC 123/2006) */}
              {currentAssessment.simples.fatorR && (
                <div className={`p-5 rounded-xl border ${
                  currentAssessment.simples.fatorR.atingiuLimite28
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                } space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        currentAssessment.simples.fatorR.atingiuLimite28 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-amber-600 text-white'
                      }`}>
                        %R
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Análise do Fator R • LC 123/2006
                          </span>
                          <span className="text-[10px] font-semibold bg-white/80 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                            Art. 18, §§ 5º-J / 5º-M
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Razão oficial entre Folha de Salários / Pró-labore (FS12) e Faturamento Bruto (RBT12)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-900 shadow-2xs">
                        Fator R: {currentAssessment.simples.fatorR.fatorPercentual.toFixed(2)}%
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        currentAssessment.simples.fatorR.atingiuLimite28
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentAssessment.simples.fatorR.atingiuLimite28 ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Anexo III Assegurado (a partir de 6%)
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Enquadrado no Anexo V (a partir de 15,5%)
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
                        className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        {isSimulatorOpen ? 'Fechar Simulador' : 'Simulador Pró-labore'}
                      </button>
                    </div>
                  </div>

                  {/* Barra Visual de Progresso até a Meta de 28% */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>Evolução do Índice: <strong className="font-mono">{currentAssessment.simples.fatorR.fatorPercentual.toFixed(2)}%</strong></span>
                      <span>Meta Legal para Anexo III: <strong className="font-mono text-blue-700">28,00%</strong></span>
                    </div>
                    <div className="relative w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          currentAssessment.simples.fatorR.atingiuLimite28 
                            ? 'bg-emerald-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (currentAssessment.simples.fatorR.fatorPercentual / 40) * 100)}%` }}
                      />
                      {/* Marcador dos 28% (28 / 40 = 70% da barra) */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                        style={{ left: '70%' }}
                        title="Marco dos 28%"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0%</span>
                      <span className="text-slate-800 font-bold" style={{ marginLeft: '65%' }}>28% (Meta)</span>
                      <span>40%+</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Folha de Salários + Pró-labore (12M)</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                        {currentAssessment.simples.fatorR.folha12Meses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Inclui encargos previdenciários patronais
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Receita Bruta Acumulada (RBT12)</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                        {currentAssessment.simples.fatorR.rbt12.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Base para determinação da alíquota
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Parecer do Planejamento Tributário</div>
                      <div className="font-medium text-slate-800 mt-0.5 text-[11px] leading-relaxed">
                        {currentAssessment.simples.fatorR.recomendacao}
                      </div>
                    </div>
                  </div>

                  {/* PAINEL INTERATIVO DE SIMULAÇÃO DE CENÁRIOS */}
                  {isSimulatorOpen && (
                    <div className="mt-4 p-4 bg-white border-2 border-blue-200 rounded-xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Simulador de Otimização Pró-labore vs Economia no DAS
                          </h4>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100">
                          Ferramenta de Estratégia Contábil
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Simular Nova Folha / Pró-labore Acumulado (12 Meses):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="1000"
                              value={simFolha12}
                              onChange={(e) => setSimFolha12(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                            />
                            {deficitPara28 > 0 && (
                              <button
                                type="button"
                                onClick={() => setSimFolha12(valorMinimoPara28)}
                                className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors"
                                title="Ajustar automaticamente para atingir exatamente 28%"
                              >
                                Fixar 28% (+R$ {deficitPara28.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Aumento no pró-labore dos sócios eleva o Fator R e pode reduzir a alíquota de 15,5% para 6,0%.
                          </p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">Fator R Projetado:</span>
                            <span className={`font-mono font-bold ${simAtingiu28 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {simPercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">Anexo Projetado:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              simAtingiu28 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {simAnexo === 'ANEXO_III' ? 'Anexo III (Alíquotas reduzidas)' : 'Anexo V (Alíquotas majoradas)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                            <span className="text-slate-600">Deficit para meta (28%):</span>
                            <span className="font-mono font-bold text-slate-800">
                              {deficitPara28 === 0 ? 'Meta atingida!' : deficitPara28.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSimFolha12(company.folha12Meses || 0)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Restaurar Original
                        </button>
                        <button
                          type="button"
                          onClick={handleApplySimulatedFolha}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-blue-200 cursor-pointer transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Salvar Folha e Reprocessar DAS
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fórmula Visual */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
                <div className="text-[11px] text-slate-500 mb-1.5 font-sans font-bold">
                  Fórmula Oficial (Lei Complementar nº 123/2006):
                </div>
                <div className="leading-relaxed">
                  Alíq. Efetiva = [ ({currentAssessment.simples.rbt12.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {currentAssessment.simples.aliquotaNominal}%) - {currentAssessment.simples.parcelaDeduzir.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ] / {currentAssessment.simples.rbt12.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = <strong className="text-blue-700 font-bold">{currentAssessment.simples.aliquotaEfetiva}%</strong>
                </div>
              </div>

              {/* Partilha dos Tributos */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Partilha dos 7 Tributos no DAS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">IRPJ</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.irpj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">CSLL</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.csll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">COFINS</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.cofins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">PIS</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.pis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">CPP (INSS Patr.)</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.cpp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">ICMS</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">ISS</div>
                    <div className="font-bold text-slate-800 mt-1">
                      {currentAssessment.simples.partilhaTributos.iss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Memória Lucro Presumido */}
          {!isSimples && currentAssessment.icms && currentAssessment.pis && currentAssessment.cofins && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Confronto ICMS */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Confronto de ICMS (Débito x Crédito)</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">SEFAZ/SP</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500">(+) Débitos das Vendas (Saídas):</span>
                    <span className="font-bold text-slate-800">
                      {currentAssessment.icms.totalDebitos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500">(-) Créditos das Compras (Entradas):</span>
                    <span className="font-bold text-blue-600">
                      {currentAssessment.icms.totalCreditos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-bold text-blue-900">(=) Saldo de ICMS a Recolher:</span>
                    <span className="font-bold text-blue-700 text-sm">
                      {Math.max(0, currentAssessment.icms.saldoApurado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* PIS & COFINS Cumulativo */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>PIS & COFINS (Regime Cumulativo)</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Receita Federal</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500">PIS (0,65% s/ Faturamento):</span>
                    <span className="font-bold text-slate-800">
                      {currentAssessment.pis.valorApurado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500">COFINS (3,00% s/ Faturamento):</span>
                    <span className="font-bold text-slate-800">
                      {currentAssessment.cofins.valorApurado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Total Contribuições Federais:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {(currentAssessment.pis.valorApurado + currentAssessment.cofins.valorApurado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* IRPJ (Lucro Presumido) */}
              {currentAssessment.irpj && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>IRPJ (Imposto de Renda PJ • Lucro Presumido)</span>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">DARF 2089</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500">Base de Presunção (8% Comércio / 32% Serviços):</span>
                      <span className="font-bold text-slate-800">
                        {currentAssessment.irpj.baseCalculo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500">Alíquota Normal (15%):</span>
                      <span className="font-bold text-slate-800">
                        {(currentAssessment.irpj.baseCalculo * 0.15).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    {currentAssessment.irpj.adicional10 > 0 && (
                      <div className="flex justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                        <span className="font-semibold">Adicional de 10% (&gt; R$ 20k/mês):</span>
                        <span className="font-bold">
                          {currentAssessment.irpj.adicional10.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="font-bold text-amber-950">(=) Total IRPJ a Recolher:</span>
                      <span className="font-bold text-amber-800 text-sm">
                        {currentAssessment.irpj.valorApurado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CSLL (Lucro Presumido) */}
              {currentAssessment.csll && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>CSLL (Contribuição Social s/ Lucro Líquido)</span>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">DARF 2372</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500">Base de Presunção (12% Comércio / 32% Serviços):</span>
                      <span className="font-bold text-slate-800">
                        {currentAssessment.csll.baseCalculo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500">Alíquota Legal:</span>
                      <span className="font-bold text-slate-800">9,00%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="font-bold text-amber-950">(=) Total CSLL a Recolher:</span>
                      <span className="font-bold text-amber-800 text-sm">
                        {currentAssessment.csll.valorApurado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ISS e Retenções */}
              {((currentAssessment.iss && currentAssessment.iss.valorApurado > 0) || (currentAssessment.retencoes && currentAssessment.retencoes.totalRetido > 0)) && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5 md:col-span-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>ISSQN Municipal & Retenções Federais</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Tributos Municipais / Fonte</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {currentAssessment.iss && currentAssessment.iss.valorApurado > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800 block">ISS (Serviços 2% a 5%):</span>
                          <span className="text-slate-500 text-[11px]">Base: {currentAssessment.iss.baseCalculo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <span className="font-bold text-blue-700 text-sm">
                          {currentAssessment.iss.valorApurado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    )}
                    {currentAssessment.retencoes && currentAssessment.retencoes.totalRetido > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800 block">Retenções na Fonte (IRRF/CRF):</span>
                          <span className="text-slate-500 text-[11px]">Dedutíveis na apuração</span>
                        </div>
                        <span className="font-bold text-emerald-700 text-sm">
                          {currentAssessment.retencoes.totalRetido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guias Geradas (DAS, DARF, GNRE) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-blue-600" />
                  Guias de Recolhimento - Memória e Demonstração de Cálculo
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Valores apurados a partir dos documentos fiscais escriturados na competência.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-800 self-start sm:self-auto">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Simulação Fiscal - Guias Não Registradas na Rede Bancária</span>
              </div>
            </div>

            {/* Banner de Aviso de Segurança Financeira */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Aviso de Segurança Financeira: </span>
                As guias apresentadas nesta tela são simulações geradas pelo motor contábil para conferência de alíquotas e partilha. 
                <strong className="text-amber-950 font-bold ml-1">NÃO EFETUE PAGAMENTO:</strong> estas guias não possuem registro na CIP / Febraban. Em ambiente produtivo, a emissão definitiva com código de barras registrado é realizada via integração webservice da Receita Federal (PGDAS-D / DCTFWeb) ou SEFAZ estadual.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {currentAssessment.guias.map((guia) => (
                <div 
                  key={guia.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {guia.tipo} - {guia.codigoReceita}
                      </span>
                      <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Venc: {guia.dataVencimento}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2.5">
                      {guia.descricao}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-[10px] font-bold text-rose-700">
                      <span>NÃO PAGAR • DEMO</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Valor Principal Apurado</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {guia.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 truncate mt-1 bg-white p-1 rounded border border-slate-200">
                      {guia.linhaDigitavel}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGuide(guia)}
                    className="w-full py-2 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visualizar Espelho / Memória da Guia
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão da Guia */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            
            {/* Faixa de Alerta Obrigatório no Topo */}
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 flex items-center gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold uppercase tracking-wide">Atenção - Guia de Demonstração / Homologação:</span>
                <p className="mt-0.5 text-rose-800">
                  Este documento é uma representação de espelho contábil. Não possui registro bancário na CIP e <strong>NÃO DEVE SER PAGO</strong> em agências ou aplicativos bancários.
                </p>
              </div>
            </div>

            {/* Guia Document Header */}
            <div className="relative border-2 border-slate-900 p-5 rounded-xl space-y-4 overflow-hidden bg-white">
              {/* Tarja D'água Diagonal de Simulação */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 select-none">
                <span className="text-5xl font-black tracking-widest text-rose-900 rotate-[-25deg] uppercase">
                  SIMULAÇÃO - NÃO PAGAR
                </span>
              </div>

              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 text-white font-bold flex items-center justify-center text-sm rounded-lg">
                    {selectedGuide.tipo}
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-tight text-slate-900">
                      {selectedGuide.tipo === 'DAS' ? 'Documento de Arrecadação do Simples Nacional' : 'Documento de Arrecadação de Receitas Federais'}
                    </h2>
                    <div className="text-xs text-slate-600 font-medium">
                      Demonstrativo de Memória Fiscal • Ambiente de Homologação
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase">CÓDIGO RECEITA</div>
                  <div className="text-sm font-mono font-bold text-slate-900">{selectedGuide.codigoReceita}</div>
                </div>
              </div>

              {/* Informações da Empresa Contribuinte */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3 relative z-10">
                <div>
                  <span className="text-slate-500 font-semibold uppercase">Razão Social:</span>
                  <div className="font-bold text-slate-900">{company.razaoSocial}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase">CNPJ:</span>
                  <div className="font-bold font-mono text-slate-900">{company.cnpj}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase">Período de Apuração:</span>
                  <div className="font-bold text-slate-900">{selectedGuide.competencia}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase">Data de Vencimento:</span>
                  <div className="font-bold text-rose-700">{selectedGuide.dataVencimento}</div>
                </div>
              </div>

              {/* Valores */}
              <div className="bg-slate-100 p-3.5 rounded-lg flex justify-between items-center text-sm font-bold relative z-10">
                <span className="text-slate-700">VALOR TOTAL CALCULADO:</span>
                <span className="text-lg text-slate-900">
                  {selectedGuide.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* Linha Digitável e Código de Barras Substituído */}
              <div className="pt-2 text-center space-y-2.5 relative z-10">
                <div className="text-xs font-mono font-bold tracking-wider text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  {selectedGuide.linhaDigitavel}
                </div>
                <div className="p-3 bg-slate-100 border border-dashed border-slate-300 rounded-lg text-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                    [ CÓDIGO DE BARRAS DESABILITADO - GUIA DE SIMULAÇÃO FISCAL ]
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Este documento não possui registro bancário na CIP/Febraban e não é passível de leitura por leitores ópticos ou internet banking.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-blue-200 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Espelho Demonstrativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
