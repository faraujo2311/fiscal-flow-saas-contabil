import React, { useState } from 'react';
import { 
  Sliders, 
  BookOpen, 
  Calculator, 
  ShieldAlert, 
  FileSpreadsheet, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lock,
  FileCheck
} from 'lucide-react';
import { AccountingParameters, AccountingAccount, Company } from '../types';

interface AccountingParametersViewProps {
  parameters: AccountingParameters;
  onSaveParameters: (newParams: AccountingParameters) => void;
  accounts: AccountingAccount[];
  activeCompany: Company;
}

export const AccountingParametersView: React.FC<AccountingParametersViewProps> = ({
  parameters,
  onSaveParameters,
  accounts,
  activeCompany,
}) => {
  const [formData, setFormData] = useState<AccountingParameters>(parameters);
  const [activeSection, setActiveSection] = useState<'contas' | 'tributos' | 'fechamento' | 'sped' | 'simulador'>('contas');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulador de Partida Dobrada para o Especialista
  const [simuladorTipo, setSimuladorTipo] = useState<'VENDA' | 'FOLHA' | 'PROLABORE' | 'SIMPLES'>('VENDA');
  const [simuladorValor, setSimuladorValor] = useState<number>(10000);

  const handleFieldChange = <K extends keyof AccountingParameters>(field: K, value: AccountingParameters[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveParameters(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar todos os parâmetros para o padrão normativo contábil brasileiro?')) {
      setFormData(parameters);
    }
  };

  // Encontra nome da conta
  const getAccountLabel = (code: string) => {
    const acc = accounts.find(a => a.codigo === code);
    return acc ? `${acc.codigo} - ${acc.nome}` : code;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header do Módulo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Especialista Contábil & Compliance
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Empresa: <strong>{activeCompany.razaoSocial}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            Parâmetros & Regras de Contabilização
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Defina as contas padrão de partidas dobradas, taxas de presunção tributária, travas de fechamento e leiautes do SPED ECD/EFD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Parâmetros
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Parâmetros contábeis e fiscais atualizados com sucesso e aplicados às rotinas de cálculo do sistema!</span>
        </div>
      )}

      {/* Navegação por Sub-abas */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection('contas')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'contas'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Mapeamento de Contas (Partidas Dobradas)
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('tributos')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'tributos'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Presunções Fiscais & Fator R
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('fechamento')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'fechamento'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Travas de Segurança & Fechamento
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('sped')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'sped'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Parâmetros SPED & Signatário
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('simulador')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'simulador'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Simulador de Partidas Dobradas
        </button>
      </div>

      {/* Conteúdo das Seções */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        {/* SEÇÃO 1: MAPEAMENTO DE CONTAS */}
        {activeSection === 'contas' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Contas Analíticas Padrão para Contabilização Automática
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ao importar XMLs fiscais ou processar folha de pagamento, o motor contábil utilizará estas contas de débito e crédito no Livro Diário Geral.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Faturamento e Vendas */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Operações Comerciais & Receita
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Receita de Vendas (Mercadorias)
                  </label>
                  <input
                    type="text"
                    value={formData.contaVendasMercadorias}
                    onChange={e => handleFieldChange('contaVendasMercadorias', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaVendasMercadorias)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Prestação de Serviços
                  </label>
                  <input
                    type="text"
                    value={formData.contaPrestacaoServicos}
                    onChange={e => handleFieldChange('contaPrestacaoServicos', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaPrestacaoServicos)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Clientes / Contas a Receber (Ativo Circulante)
                  </label>
                  <input
                    type="text"
                    value={formData.contaClientes}
                    onChange={e => handleFieldChange('contaClientes', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaClientes)}
                  </span>
                </div>
              </div>

              {/* Compras, Estoque e Fornecedores */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Compras & Fornecedores
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Fornecedores Nacionais (Passivo Circulante)
                  </label>
                  <input
                    type="text"
                    value={formData.contaFornecedores}
                    onChange={e => handleFieldChange('contaFornecedores', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaFornecedores)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Estoque de Mercadorias (Ativo)
                  </label>
                  <input
                    type="text"
                    value={formData.contaEstoqueMercadorias}
                    onChange={e => handleFieldChange('contaEstoqueMercadorias', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaEstoqueMercadorias)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Custo das Mercadorias Vendidas (CMV)
                  </label>
                  <input
                    type="text"
                    value={formData.contaCmv}
                    onChange={e => handleFieldChange('contaCmv', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaCmv)}
                  </span>
                </div>
              </div>

              {/* Folha e Pró-Labore */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Folha, Pró-Labore & Encargos Sociais
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Salários a Pagar (Passivo)
                  </label>
                  <input
                    type="text"
                    value={formData.contaSalariosAPagar}
                    onChange={e => handleFieldChange('contaSalariosAPagar', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaSalariosAPagar)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Despesa com Salários e Ordenados
                  </label>
                  <input
                    type="text"
                    value={formData.contaDespesaSalarios}
                    onChange={e => handleFieldChange('contaDespesaSalarios', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaDespesaSalarios)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Pró-Labore a Pagar (Sócios)
                  </label>
                  <input
                    type="text"
                    value={formData.contaProlaboreAPagar}
                    onChange={e => handleFieldChange('contaProlaboreAPagar', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaProlaboreAPagar)}
                  </span>
                </div>
              </div>

              {/* Tributos a Recolher */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Tributos & Provisões Fiscais
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Simples Nacional a Recolher (DAS)
                  </label>
                  <input
                    type="text"
                    value={formData.contaImpostosSimples}
                    onChange={e => handleFieldChange('contaImpostosSimples', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaImpostosSimples)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de IRPJ a Recolher (Lucro Presumido)
                  </label>
                  <input
                    type="text"
                    value={formData.contaIrpjAPagar}
                    onChange={e => handleFieldChange('contaIrpjAPagar', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaIrpjAPagar)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conta de Lucros Acumulados (Patrimônio Líquido)
                  </label>
                  <input
                    type="text"
                    value={formData.contaLucrosAcumulados}
                    onChange={e => handleFieldChange('contaLucrosAcumulados', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Atual: {getAccountLabel(formData.contaLucrosAcumulados)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 2: TRIBUTOS E PRESUNÇÃO */}
        {activeSection === 'tributos' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Parâmetros de Presunção Fiscal & Limites Tributários
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Alíquotas de presunção para apuração do Lucro Presumido (Lei 9.249/95) e gatilhos de enquadramento do Simples Nacional (LC 123/2006).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Presunção IRPJ / CSLL - Comércio (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.percentualPresuncaoComercio}
                    onChange={e => handleFieldChange('percentualPresuncaoComercio', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Regra geral para revenda de mercadorias (8% IRPJ / 12% CSLL).
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Presunção IRPJ / CSLL - Serviços (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.percentualPresuncaoServico}
                    onChange={e => handleFieldChange('percentualPresuncaoServico', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Regra para serviços profissionais regulamentados (32%).
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Limite Fator R (Simples Nacional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={formData.fatorRLimitePercent}
                    onChange={e => handleFieldChange('fatorRLimitePercent', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Folha/Receita ≥ 28% tributa no Anexo III (alíquotas a partir de 6%).
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Alíquota Base IRPJ (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aliquotaIrpjBase}
                    onChange={e => handleFieldChange('aliquotaIrpjBase', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Alíquota fixa de 15% sobre o lucro apurado ou presumido.
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Limite Adicional IRPJ (R$/mês)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">R$</span>
                  <input
                    type="number"
                    step="1000"
                    value={formData.adicionalIrpjLimiteMensal}
                    onChange={e => handleFieldChange('adicionalIrpjLimiteMensal', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Adicional de 10% sobre o lucro que exceder R$ 20.000/mês (ou R$ 60.000/tri).
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Alíquota Base CSLL (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aliquotaCsllBase}
                    onChange={e => handleFieldChange('aliquotaCsllBase', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  Alíquota de 9% sobre a base de cálculo da CSLL.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 3: TRAVAS DE SEGURANÇA E FECHAMENTO */}
        {activeSection === 'fechamento' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Políticas de Segurança e Fechamento Contábil
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure as travas sistêmicas para garantir compliance com as Normas Brasileiras de Contabilidade (NBC TG / ITG 2000).
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-4">
                <input
                  type="checkbox"
                  id="chk-bloquear-retroativo"
                  checked={formData.bloquearLancamentosRetroativos}
                  onChange={e => handleFieldChange('bloquearLancamentosRetroativos', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <label htmlFor="chk-bloquear-retroativo" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Bloquear Lançamentos em Competências Fechadas (Imutabilidade do Diário)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Impede que novos lançamentos manuais ou integrações fiscais alterem o Diário Geral de meses cujo balanço ou SPED já foram transmitidos à Receita Federal.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-4">
                <input
                  type="checkbox"
                  id="chk-partidas-dobradas"
                  checked={formData.exigirPartidasDobradasEstritas}
                  onChange={e => handleFieldChange('exigirPartidasDobradasEstritas', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div>
                  <label htmlFor="chk-partidas-dobradas" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Exigir Equilíbrio Estrito de Partidas Dobradas (Débito = Crédito)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Rejeita qualquer lançamento ou lote contábil cuja soma dos débitos não seja idêntica à soma dos créditos, garantindo balancetes sempre fechados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 4: SPED & SIGNATÁRIO */}
        {activeSection === 'sped' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Parâmetros Oficiais do SPED (ECD / ECF / EFD) e Signatário
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Informações obrigatórias que serão geradas nos registros 0000, 0930 e I010 dos arquivos magnéticos da Receita Federal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Plano de Contas Referencial da Receita Federal
                </label>
                <select
                  value={formData.planoReferencialRFB}
                  onChange={e => handleFieldChange('planoReferencialRFB', e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                >
                  <option value="PJ_GERAL">1 - Pessoa Jurídica em Geral (Lucro Real / Presumido)</option>
                  <option value="PJ_LUCRO_PRESUMIDO">2 - Lucro Presumido Simplificado</option>
                  <option value="FINANCEIRAS">3 - Instituições Financeiras</option>
                  <option value="IMUNES_ISENTAS">4 - Imunes e Isentas</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Mapeia as contas contábeis locais para o padrão fiscal da RFB.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Versão do Leiaute da ECD (SPED Contábil)
                </label>
                <input
                  type="text"
                  value={formData.versaoLeiauteECD}
                  onChange={e => handleFieldChange('versaoLeiauteECD', e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Leiaute oficial vigente: 9.00 (Ano-Calendário 2026/2025).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome do Contador Responsável Técnico
                </label>
                <input
                  type="text"
                  value={formData.nomeContadorResponsavel}
                  onChange={e => handleFieldChange('nomeContadorResponsavel', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Número do Registro Profissional (CRC)
                </label>
                <input
                  type="text"
                  value={formData.crcContadorResponsavel}
                  onChange={e => handleFieldChange('crcContadorResponsavel', e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 5: SIMULADOR DE PARTIDAS DOBRADAS */}
        {activeSection === 'simulador' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Simulador & Testador de Partidas Dobradas
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Valide antecipadamente como o motor contábil irá escriturar automaticamente os fatos geradores com os parâmetros configurados acima.
              </p>
            </div>

            {/* Controles do Simulador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fato Gerador / Operação a Testar:
                </label>
                <select
                  value={simuladorTipo}
                  onChange={e => setSimuladorTipo(e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                >
                  <option value="VENDA">Faturamento de NF-e a Prazo (Venda de Mercadorias)</option>
                  <option value="FOLHA">Apropriação da Folha Mensal de Empregados</option>
                  <option value="PROLABORE">Apropriação e Retenção do Pró-Labore de Sócios</option>
                  <option value="SIMPLES">Apuração e Provisão do DAS (Simples Nacional)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor da Operação (R$):
                </label>
                <input
                  type="number"
                  value={simuladorValor}
                  onChange={e => setSimuladorValor(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Resultado da Escrituração Simulada */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Escrituração Contábil Gerada pelo Motor:</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  Equilíbrio Débito = Crédito: 100% OK
                </span>
              </div>

              <div className="p-4 bg-white space-y-3">
                {simuladorTipo === 'VENDA' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded border border-blue-100">
                      <div>
                        <span className="font-bold text-blue-800">[DÉBITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaClientes}</span> - Clientes a Receber (Ativo Circulante)
                      </div>
                      <div className="font-mono font-bold text-blue-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded border border-emerald-100">
                      <div>
                        <span className="font-bold text-emerald-800">[CRÉDITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaVendasMercadorias}</span> - Receita de Vendas de Mercadorias (Resultado)
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}

                {simuladorTipo === 'FOLHA' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded border border-blue-100">
                      <div>
                        <span className="font-bold text-blue-800">[DÉBITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaDespesaSalarios}</span> - Despesas com Salários e Ordenados
                      </div>
                      <div className="font-mono font-bold text-blue-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded border border-emerald-100">
                      <div>
                        <span className="font-bold text-emerald-800">[CRÉDITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaSalariosAPagar}</span> - Salários a Pagar (Passivo Circulante)
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        R$ {(simuladorValor * 0.88).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded border border-emerald-100">
                      <div>
                        <span className="font-bold text-emerald-800">[CRÉDITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaInssAPagar}</span> - INSS Retido a Recolher
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        R$ {(simuladorValor * 0.12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}

                {simuladorTipo === 'PROLABORE' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded border border-blue-100">
                      <div>
                        <span className="font-bold text-blue-800">[DÉBITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaDespesaProlabore}</span> - Despesa com Pró-Labore de Sócios
                      </div>
                      <div className="font-mono font-bold text-blue-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded border border-emerald-100">
                      <div>
                        <span className="font-bold text-emerald-800">[CRÉDITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaProlaboreAPagar}</span> - Pró-Labore a Pagar (Passivo)
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}

                {simuladorTipo === 'SIMPLES' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded border border-blue-100">
                      <div>
                        <span className="font-bold text-blue-800">[DÉBITO]</span>{' '}
                        <span className="font-mono text-slate-700">4.1.03.001</span> - Despesas com Tributos do Simples Nacional
                      </div>
                      <div className="font-mono font-bold text-blue-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded border border-emerald-100">
                      <div>
                        <span className="font-bold text-emerald-800">[CRÉDITO]</span>{' '}
                        <span className="font-mono text-slate-700">{formData.contaImpostosSimples}</span> - DAS a Recolher (Passivo Circulante)
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        R$ {simuladorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
