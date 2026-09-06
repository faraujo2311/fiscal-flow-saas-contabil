import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  DollarSign, 
  ShieldCheck, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart, 
  Receipt,
  X,
  CreditCard
} from 'lucide-react';
import { Company, Partner, ProfitDistributionRecord } from '../types';

interface PartnersViewProps {
  company: Company;
  competencia: string;
  partners: Partner[];
  profitDistributions: ProfitDistributionRecord[];
  saldoLucrosAcumulados: number;
  onAddPartner: (partner: Partner) => void;
  onDistributeProfits: (record: Omit<ProfitDistributionRecord, 'id' | 'saldoLucrosDisponivelDepois' | 'reciboNumero' | 'statusContabilizacao'>) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  company,
  competencia,
  partners,
  profitDistributions,
  saldoLucrosAcumulados,
  onAddPartner,
  onDistributeProfits,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'quadro' | 'distribuicao' | 'informe'>('quadro');
  
  // Modais
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ProfitDistributionRecord | null>(null);
  const [selectedInformePartner, setSelectedInformePartner] = useState<Partner | null>(partners[0] || null);

  // Form de Novo Sócio
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [qualificacao, setQualificacao] = useState<'SOCIO_ADMINISTRADOR' | 'SOCIO_COTISTA' | 'TITULAR'>('SOCIO_ADMINISTRADOR');
  const [participacao, setParticipacao] = useState('50');
  const [prolabore, setProlabore] = useState('5000');
  const [dependentes, setDependentes] = useState('0');
  const [chavePix, setChavePix] = useState('');
  const [bancoNome, setBancoNome] = useState('Banco Itaú');

  // Form de Distribuição de Lucros
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(partners[0]?.id || '');
  const [valorDistribuir, setValorDistribuir] = useState('20000');
  const [dataDistribuicao, setDataDistribuicao] = useState(new Date().toISOString().slice(0, 10));

  // Cálculos consolidados
  const totalCapitalPercent = partners.reduce((sum, p) => sum + p.participacaoCapitalPercent, 0);
  const totalProlaboreMensal = partners.reduce((sum, p) => sum + p.valorProlaboreMensal, 0);
  const totalInssProlabore = partners.reduce((sum, p) => sum + p.inssRetidoProlabore, 0);
  const totalIrrfProlabore = partners.reduce((sum, p) => sum + p.irrfRetidoProlabore, 0);
  const totalDistribuidoExercicio = profitDistributions.reduce((sum, d) => sum + d.valorDistribuido, 0);

  // Saldo restante disponível para distribuição
  const saldoLucrosRestante = Math.max(0, saldoLucrosAcumulados - totalDistribuidoExercicio);

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const valProlabore = parseFloat(prolabore) || 0;
    const deps = parseInt(dependentes, 10) || 0;

    // Cálculo INSS Sócio (11% limitado ao teto R$ 8.157,41 de 2026 -> max 897.31)
    const inss = Math.min(valProlabore * 0.11, 897.31);

    // Cálculo IRRF simplificado com deduções
    const baseIrrf = Math.max(0, valProlabore - inss - (deps * 189.59));
    let irrf = 0;
    if (baseIrrf > 4664.68) {
      irrf = (baseIrrf * 0.275) - 896.00;
    } else if (baseIrrf > 3751.05) {
      irrf = (baseIrrf * 0.225) - 662.77;
    } else if (baseIrrf > 2826.65) {
      irrf = (baseIrrf * 0.15) - 381.44;
    } else if (baseIrrf > 2259.20) {
      irrf = (baseIrrf * 0.075) - 169.44;
    }
    irrf = Math.max(0, Math.round(irrf * 100) / 100);

    const newPartner: Partner = {
      id: `part-${Date.now()}`,
      companyId: company.id,
      nome,
      cpf,
      qualificacao,
      participacaoCapitalPercent: parseFloat(participacao) || 0,
      valorProlaboreMensal: valProlabore,
      dependentesIrrf: deps,
      inssRetidoProlabore: inss,
      irrfRetidoProlabore: irrf,
      prolaboreLiquido: valProlabore - inss - irrf,
      chavePix: chavePix || cpf,
      bancoNome,
    };

    onAddPartner(newPartner);
    setIsPartnerModalOpen(false);
    setNome('');
    setCpf('');
  };

  const handleExecuteDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const partner = partners.find(p => p.id === selectedPartnerId);
    if (!partner) return;

    const valor = parseFloat(valorDistribuir);
    if (isNaN(valor) || valor <= 0) {
      alert('Informe um valor de distribuição válido.');
      return;
    }

    if (valor > saldoLucrosRestante) {
      if (!confirm(`Atenção: O valor a distribuir (R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) excede o saldo contábil disponível em Lucros Acumulados (R$ ${saldoLucrosRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Deseja prosseguir mesmo assim sob deliberação extraordinária?`)) {
        return;
      }
    }

    onDistributeProfits({
      companyId: company.id,
      competencia,
      dataDistribuicao,
      partnerId: partner.id,
      partnerNome: partner.nome,
      partnerCpf: partner.cpf,
      valorDistribuido: valor,
      saldoLucrosDisponivelAntes: saldoLucrosRestante,
      isencaoLegalArtigo: 'Art. 10 da Lei nº 9.249/1995 (Isenção Total de IRRF)',
    });

    setIsDistributeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Quadro Societário & Distribuição de Lucros Isentos (Lei 9.249/95)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão societária, pró-labore com apuração de INSS/IRRF e escrituração contábil de dividendos isentos aos sócios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPartnerModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Sócio
          </button>

          <button
            type="button"
            onClick={() => setIsDistributeModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Distribuir Lucros Isentos
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Saldo Lucros no PL</span>
            <PieChart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            R$ {saldoLucrosRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Suficiência Contábil (Balanço J100)
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lucros Distribuídos</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            R$ {totalDistribuidoExercicio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {profitDistributions.length} deliberações registradas
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pró-labore Mensal</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            R$ {totalProlaboreMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            INSS Retido: R$ {totalInssProlabore.toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Capital Social Alocado</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {totalCapitalPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalCapitalPercent === 100 ? (
              <span className="text-emerald-600 font-medium">100% integralizado</span>
            ) : (
              <span className="text-amber-600 font-medium">Parcial ({totalCapitalPercent}%)</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs de Navegação Interna */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('quadro')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeSubTab === 'quadro'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Quadro de Sócios & Pró-labore ({partners.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('distribuicao')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeSubTab === 'distribuicao'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Distribuição de Lucros & Recibos ({profitDistributions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('informe')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeSubTab === 'informe'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Comprovante Anual de Rendimentos (IRPF)
        </button>
      </div>

      {/* TAB 1: QUADRO DE SÓCIOS */}
      {activeSubTab === 'quadro' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sócios Cadastrados no Contrato Social
              </h2>
              <p className="text-[11px] text-slate-500">
                Remuneração por pró-labore, incidência previdenciária e retenção do imposto de renda.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
              Total Quotas: {totalCapitalPercent}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Sócio / Titular</th>
                  <th className="py-2.5 px-4">Qualificação</th>
                  <th className="py-2.5 px-4 text-center">Capital %</th>
                  <th className="py-2.5 px-4 text-right">Pró-labore Bruto</th>
                  <th className="py-2.5 px-4 text-right">INSS (11%)</th>
                  <th className="py-2.5 px-4 text-right">IRRF Retido</th>
                  <th className="py-2.5 px-4 text-right">Líquido a Pagar</th>
                  <th className="py-2.5 px-4">Dados Bancários / Pix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.map(partner => (
                  <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{partner.nome}</div>
                      <div className="text-[11px] text-slate-500 font-mono">CPF: {partner.cpf}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {partner.qualificacao.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">
                      {partner.participacaoCapitalPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      R$ {partner.valorProlaboreMensal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      - R$ {partner.inssRetidoProlabore.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      - R$ {partner.irrfRetidoProlabore.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      R$ {partner.prolaboreLiquido.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{partner.bancoNome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Pix: {partner.chavePix}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DISTRIBUIÇÃO DE LUCROS & RECIBOS */}
      {activeSubTab === 'distribuicao' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Amparo Legal da Isenção Total de Imposto de Renda</div>
              <p className="mt-1 leading-relaxed text-emerald-800">
                Conforme o <strong>Art. 10 da Lei nº 9.249/1995</strong> e o <strong>Art. 141 do RIR/2018</strong>, 
                os lucros e dividendos apurados com base em balanço contábil devidamente escriturado 
                (livros Diário e Razão) e pagos aos sócios são <strong>100% isentos de imposto de renda na fonte (IRRF) 
                e não integram a base de cálculo da contribuição previdenciária (INSS)</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Histórico de Distribuições de Lucros aos Sócios
              </h2>
              <span className="text-xs font-medium text-slate-500">
                Competência Vigente: {competencia}
              </span>
            </div>

            {profitDistributions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhuma distribuição de lucros registrada até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Recibo / Data</th>
                      <th className="py-2.5 px-4">Sócio Beneficiário</th>
                      <th className="py-2.5 px-4">Competência</th>
                      <th className="py-2.5 px-4 text-right">Valor Distribuído</th>
                      <th className="py-2.5 px-4">Status Contábil</th>
                      <th className="py-2.5 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profitDistributions.map(dist => (
                      <tr key={dist.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900">{dist.reciboNumero}</div>
                          <div className="text-[11px] text-slate-500">{dist.dataDistribuicao}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{dist.partnerNome}</div>
                          <div className="text-[11px] text-slate-500 font-mono">CPF: {dist.partnerCpf}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {dist.competencia}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 text-sm">
                          R$ {dist.valorDistribuido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Contabilizado no Diário
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(dist)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded text-[11px] font-semibold flex items-center gap-1 mx-auto transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Recibo Oficial
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMPROVANTE ANUAL DE RENDIMENTOS (IRPF) */}
      {activeSubTab === 'informe' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Selecione o Sócio:</span>
              <select
                value={selectedInformePartner?.id || ''}
                onChange={(e) => {
                  const p = partners.find(part => part.id === e.target.value);
                  if (p) setSelectedInformePartner(p);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800"
              >
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.cpf})</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir Informe
            </button>
          </div>

          {selectedInformePartner && (
            <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs font-sans text-xs space-y-4 max-w-4xl mx-auto">
              {/* Cabeçalho Oficial do Informe */}
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <div className="text-base font-extrabold text-slate-900 uppercase">
                    Comprovante de Rendimentos Pagos e de Retenção de IRRF
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Exercício de 2027 • Ano-Calendário de 2026 • Instrução Normativa RFB
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono font-bold text-slate-800">
                  REF. EFD-REINF / DIRF
                </div>
              </div>

              {/* Quadro 1: Fonte Pagadora */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                <div className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                  1. Fonte Pagadora da Pessoa Jurídica
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">CNPJ:</span>
                    <strong className="text-slate-800">{company.cnpj}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 block">Nome Empresarial:</span>
                    <strong className="text-slate-800">{company.razaoSocial}</strong>
                  </div>
                </div>
              </div>

              {/* Quadro 2: Pessoa Física Beneficiária */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                <div className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                  2. Pessoa Física Beneficiária dos Rendimentos
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">CPF:</span>
                    <strong className="text-slate-800">{selectedInformePartner.cpf}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 block">Nome Completo:</span>
                    <strong className="text-slate-800">{selectedInformePartner.nome}</strong>
                  </div>
                </div>
              </div>

              {/* Quadro 3: Rendimentos Tributáveis (Pró-labore anual projetado) */}
              <div className="border border-slate-300 rounded-lg p-3">
                <div className="font-bold text-slate-900 uppercase text-[11px] mb-2">
                  3. Rendimentos Tributáveis, Deduções e Imposto de Renda Retido na Fonte
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span>01. Total dos Rendimentos Brutos de Pró-labore (com 13º):</span>
                    <strong className="text-slate-900">
                      R$ {(selectedInformePartner.valorProlaboreMensal * 12).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span>02. Contribuição Previdenciária Oficial (INSS Retido):</span>
                    <strong className="text-slate-900">
                      R$ {(selectedInformePartner.inssRetidoProlabore * 12).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span>05. Imposto de Renda Retido na Fonte (IRRF):</span>
                    <strong className="text-red-700">
                      R$ {(selectedInformePartner.irrfRetidoProlabore * 12).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quadro 4: Rendimentos Isentos e Não Tributáveis (Lucros Distribuídos) */}
              <div className="border border-slate-300 rounded-lg p-3 bg-emerald-50/50">
                <div className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center justify-between">
                  <span>4. Rendimentos Isentos e Não Tributáveis</span>
                  <span className="text-emerald-700 text-[10px] font-semibold">Art. 10 Lei 9.249/95</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between border-b border-emerald-100 py-1">
                    <span>01. Lucros e dividendos efetivamente pagos ao sócio/titular:</span>
                    <strong className="text-emerald-800 text-sm">
                      R$ {profitDistributions
                        .filter(d => d.partnerId === selectedInformePartner.id)
                        .reduce((sum, d) => sum + d.valorDistribuido, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Assinatura */}
              <div className="pt-6 mt-6 border-t border-slate-300 flex justify-between text-[11px] text-slate-600">
                <div>
                  Fonte Pagadora: <strong>{company.razaoSocial}</strong>
                </div>
                <div>
                  Emitido digitalmente pelo SaaS Contábil em {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVO SÓCIO */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Cadastrar Sócio no Quadro Societário
              </h3>
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo do Sócio</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Clara Menezes"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualificação Societária</label>
                  <select
                    value={qualificacao}
                    onChange={(e) => setQualificacao(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="SOCIO_ADMINISTRADOR">Sócio-Administrador</option>
                    <option value="SOCIO_COTISTA">Sócio-Cotista</option>
                    <option value="TITULAR">Titular / EIRELI / SLU</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Participação Capital (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={participacao}
                    onChange={(e) => setParticipacao(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pró-labore Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={prolabore}
                    onChange={(e) => setProlabore(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dependentes IRRF</label>
                  <input
                    type="number"
                    min="0"
                    value={dependentes}
                    onChange={(e) => setDependentes(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Banco Principal</label>
                  <input
                    type="text"
                    value={bancoNome}
                    onChange={(e) => setBancoNome(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chave Pix para Pagamentos</label>
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="CPF, E-mail ou Chave Aleatória"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs"
                >
                  Salvar Sócio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISTRIBUIR LUCROS */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Nova Distribuição de Lucros Isentos (Lei 9.249/95)
              </h3>
              <button
                type="button"
                onClick={() => setIsDistributeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-3.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Contábil de Lucros no PL:</span>
                <strong className="text-slate-900">
                  R$ {saldoLucrosRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-600 font-medium">
                <span>Tratamento Tributário:</span>
                <span>Isenção Total de IRRF & INSS</span>
              </div>
            </div>

            <form onSubmit={handleExecuteDistribution} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sócio Beneficiário</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — Quota: {p.participacaoCapitalPercent}%
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor a Distribuir (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={valorDistribuir}
                    onChange={(e) => setValorDistribuir(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data do Pagamento / Deliberação</label>
                  <input
                    type="date"
                    required
                    value={dataDistribuicao}
                    onChange={(e) => setDataDistribuicao(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Contabilização Automática em Partidas Dobradas:
                </div>
                <div>• Débito: <strong>2.3.02.01.001 - Lucros Acumulados (PL)</strong></div>
                <div>• Crédito: <strong>1.1.01.02.001 - Banco Conta Movimento (Ativo)</strong></div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDistributeModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar & Escriturar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECIBO OFICIAL DE DISTRIBUIÇÃO */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 font-sans text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm uppercase text-slate-900">
                  Recibo Oficial de Distribuição de Lucros Isentos
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedReceipt.reciboNumero} • Competência: {selectedReceipt.competencia}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-slate-700 leading-relaxed">
              <p>
                Recebi de <strong>{company.razaoSocial}</strong>, inscrita no CNPJ sob o nº <strong>{company.cnpj}</strong>, 
                a quantia líquida de:
              </p>
              <div className="p-3 bg-white border border-slate-300 rounded text-center text-base font-extrabold text-emerald-800 font-mono">
                R$ {selectedReceipt.valorDistribuido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px]">
                Referente à <strong>antecipação / distribuição de lucros contábeis apurados</strong>, 
                com amparo de <strong>isenção integral de Imposto de Renda na Fonte e contribuição previdenciária</strong>, 
                nos exatos termos do <strong>{selectedReceipt.isencaoLegalArtigo}</strong>.
              </p>
            </div>

            <div className="border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
              <div><strong>Favorecido(a):</strong> {selectedReceipt.partnerNome}</div>
              <div><strong>CPF:</strong> {selectedReceipt.partnerCpf}</div>
              <div><strong>Data de Pagamento:</strong> {selectedReceipt.dataDistribuicao}</div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
              <div className="text-center w-48 border-t border-slate-400 pt-1 text-[10px] text-slate-600">
                Assinatura do Sócio
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Recibo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
