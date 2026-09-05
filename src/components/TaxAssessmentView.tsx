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
  Download
} from 'lucide-react';
import { Company, FiscalDocument, TaxAssessment, TaxGuide } from '../types';
import { calculateTaxAssessment } from '../services/taxEngine';

interface TaxAssessmentViewProps {
  company: Company;
  competencia: string;
  documents: FiscalDocument[];
  currentAssessment?: TaxAssessment;
  onSaveAssessment: (assessment: TaxAssessment) => void;
}

export const TaxAssessmentView: React.FC<TaxAssessmentViewProps> = ({
  company,
  competencia,
  documents,
  currentAssessment,
  onSaveAssessment,
}) => {
  const [selectedGuide, setSelectedGuide] = useState<TaxGuide | null>(null);

  const handleRunAssessment = () => {
    const assessment = calculateTaxAssessment(company, competencia, documents);
    onSaveAssessment(assessment);
  };

  const isSimples = company.regimeTributario === 'SIMPLES_NACIONAL';

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Motor de Apuração Fiscal & Geração de Guias
            </h1>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {isSimples ? 'Simples Nacional' : 'Lucro Presumido'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apuração automática com base nas NF-es e NFC-es escrituradas na competência <strong className="text-slate-700">{competencia}</strong>.
          </p>
        </div>

        <button
          type="button"
          id="btn-run-assessment"
          onClick={handleRunAssessment}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          {currentAssessment ? 'Reprocessar Apuração' : 'Executar Apuração Agora'}
        </button>
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
            onClick={handleRunAssessment}
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
            </div>
          )}

          {/* Guias Geradas (DAS, DARF, GNRE) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Barcode className="w-4 h-4 text-blue-600" />
              Guias de Recolhimento Geradas para Pagamento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Venc: {guia.dataVencimento}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2.5">
                      {guia.descricao}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Valor Principal</div>
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
                    Visualizar / Imprimir Guia
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão da Guia */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Guia Document Header */}
            <div className="border-2 border-slate-900 p-5 rounded-xl space-y-4">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 text-white font-bold flex items-center justify-center text-sm rounded-lg">
                    {selectedGuide.tipo}
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-tight text-slate-900">
                      {selectedGuide.tipo === 'DAS' ? 'Documento de Arrecadação do Simples Nacional' : 'Documento de Arrecadação de Receitas Federais'}
                    </h2>
                    <div className="text-xs text-slate-600 font-medium">
                      Ministério da Fazenda / Secretaria Especial da Receita Federal
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase">CÓDIGO RECEITA</div>
                  <div className="text-sm font-mono font-bold text-slate-900">{selectedGuide.codigoReceita}</div>
                </div>
              </div>

              {/* Informações da Empresa Contribuinte */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3">
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
              <div className="bg-slate-100 p-3.5 rounded-lg flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700">VALOR TOTAL A RECOLHER:</span>
                <span className="text-lg text-slate-900">
                  {selectedGuide.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* Linha Digitável e Código de Barras */}
              <div className="pt-2 text-center space-y-2.5">
                <div className="text-xs font-mono font-bold tracking-wider text-slate-800 bg-slate-100 p-2.5 rounded-lg">
                  {selectedGuide.linhaDigitavel}
                </div>
                <div className="h-12 bg-slate-900 text-white flex items-center justify-center font-mono text-xs tracking-widest rounded-lg">
                  || | ||| | |||| | |||||||| |||| | || | ||| |||| | ||||
                </div>
                <div className="text-[10px] text-slate-500">
                  Autenticação Mecânica / Código de Barras Padrão Febraban
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
                Imprimir Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
