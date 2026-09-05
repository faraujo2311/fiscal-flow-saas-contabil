import React, { useState } from 'react';
import { 
  Users, 
  Calculator, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Plus, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  Briefcase,
  Send,
  Eye
} from 'lucide-react';
import { Company, Employee, PayrollPayslip } from '../types';
import { calculateEmployeePayroll } from '../services/payrollEngine';

interface PayrollViewProps {
  company: Company;
  competencia: string;
  employees: Employee[];
  payslips: PayrollPayslip[];
  onAddEmployee: (emp: Employee) => void;
  onSavePayslips: (payslips: PayrollPayslip[]) => void;
  onSendToESocial: () => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  company,
  competencia,
  employees,
  payslips,
  onAddEmployee,
  onSavePayslips,
  onSendToESocial,
}) => {
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollPayslip | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Form states
  const [empNome, setEmpNome] = useState('');
  const [empCpf, setEmpCpf] = useState('');
  const [empCargo, setEmpCargo] = useState('');
  const [empCbo, setEmpCbo] = useState('4110-10');
  const [empSalario, setEmpSalario] = useState<number>(2500);
  const [empDepIrrf, setEmpDepIrrf] = useState<number>(0);
  const [empVt, setEmpVt] = useState<boolean>(true);

  const compEmployees = employees.filter(e => e.companyId === company.id);
  const compPayslips = payslips.filter(p => p.competencia === competencia);

  const handleCalculatePayroll = () => {
    const generated: PayrollPayslip[] = compEmployees.map(emp => {
      return calculateEmployeePayroll(emp, competencia);
    });
    onSavePayslips(generated);
  };

  const handleSaveEmployee = () => {
    if (!empNome || !empCpf || empSalario <= 0) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      companyId: company.id,
      matriculaESocial: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: empNome,
      cpf: empCpf,
      pis: `120.${Math.floor(10000 + Math.random() * 90000)}.89-1`,
      ctps: `${Math.floor(10000 + Math.random() * 90000)}/001-SP`,
      cargo: empCargo || 'Assistente Administrativo',
      cbo: empCbo,
      departamento: 'Operacional',
      dataAdmissao: new Date().toISOString().slice(0, 10),
      salarioBase: empSalario,
      status: 'ATIVO',
      dependentesIrrf: empDepIrrf,
      valeTransporte: empVt,
      descontoVtPercent: empVt ? 6 : 0,
    };

    onAddEmployee(newEmp);
    setIsEmployeeModalOpen(false);
    setEmpNome('');
    setEmpCpf('');
  };

  const totalFolhaBruta = compPayslips.reduce((acc, p) => acc + p.totalProventos, 0);
  const totalDescontos = compPayslips.reduce((acc, p) => acc + p.totalDescontos, 0);
  const totalLiquido = compPayslips.reduce((acc, p) => acc + p.salarioLiquido, 0);
  const totalFgts = compPayslips.reduce((acc, p) => acc + p.valorFgts, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Folha de Pagamento & Departamento Pessoal (eSocial)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo progressivo oficial de INSS e IRRF, geração de holerites e integração com eventos S-1200 / S-1210.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEmployeeModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Novo Empregado
          </button>
          <button
            type="button"
            onClick={handleCalculatePayroll}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Calcular Folha ({competencia})
          </button>
        </div>
      </div>

      {/* KPI Cards da Folha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Proventos Bruto
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {totalFolhaBruta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {compEmployees.length} colaboradores ativos
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Descontos (INSS/IRRF/VT)
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Retenções em folha
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">
            Total Líquido a Pagar
          </div>
          <div className="text-xl font-bold text-blue-600 mt-1">
            {totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Até 5º dia útil
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
            FGTS do Mês (8% Patronal)
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {totalFgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Guia FGTS Digital
          </div>
        </div>
      </div>

      {/* Lista de Empregados e Holerites */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">
            Quadro de Funcionários e Folha Processada
          </span>
          {compPayslips.length > 0 && (
            <button
              type="button"
              onClick={onSendToESocial}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Transmitir eSocial S-1200
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Colaborador / CPF</th>
                <th className="py-2.5 px-3">Cargo / CBO</th>
                <th className="py-2.5 px-3 text-right">Salário Base</th>
                <th className="py-2.5 px-3 text-right">INSS (Desc.)</th>
                <th className="py-2.5 px-3 text-right">IRRF</th>
                <th className="py-2.5 px-3 text-right">FGTS (8%)</th>
                <th className="py-2.5 px-3 text-right">Líquido</th>
                <th className="py-2.5 px-3 text-center">Holerite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {compEmployees.map((emp) => {
                const payslip = compPayslips.find(p => p.employeeId === emp.id);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-medium">
                      <div className="text-slate-900 font-semibold">{emp.nome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">CPF: {emp.cpf} • Mat: {emp.matriculaESocial}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-slate-800">{emp.cargo}</div>
                      <div className="text-[10px] text-slate-500 font-mono">CBO: {emp.cbo}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {emp.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>

                    <td className="py-2.5 px-3 text-right text-rose-600 font-medium">
                      {payslip ? payslip.valorInss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right text-rose-600 font-medium">
                      {payslip ? (payslip.valorIrrf > 0 ? payslip.valorIrrf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Isento') : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                      {payslip ? payslip.valorFgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 text-sm">
                      {payslip ? payslip.salarioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {payslip ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPayslip(payslip)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-slate-200 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Holerite
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Pendente cálculo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Impressão de Holerite Profissional */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl p-6 space-y-4 border border-slate-200">
            <div className="border border-slate-300 p-4 rounded-lg space-y-3 bg-white">
              {/* Cabeçalho do Empregador e Empregado */}
              <div className="flex justify-between border-b border-slate-300 pb-3">
                <div>
                  <h2 className="text-base font-bold uppercase text-slate-900">{company.razaoSocial}</h2>
                  <div className="text-xs text-slate-600">CNPJ: {company.cnpj}</div>
                  <div className="text-xs text-slate-600">{company.cidade}/{company.uf}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold uppercase text-slate-900">Recibo de Pagamento de Salário</div>
                  <div className="text-xs font-bold text-blue-600">Referente a {selectedPayslip.competencia}</div>
                </div>
              </div>

              {/* Dados do Funcionário */}
              <div className="grid grid-cols-4 gap-2 text-xs border-b border-slate-200 pb-2">
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold uppercase">Nome:</span>
                  <div className="font-bold text-slate-800">{selectedPayslip.employeeName}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase">CPF:</span>
                  <div className="font-bold font-mono text-slate-800">{selectedPayslip.employeeCpf}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase">CBO:</span>
                  <div className="font-bold font-mono text-slate-800">{selectedPayslip.cbo}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold uppercase">Função:</span>
                  <div className="font-bold text-slate-800">{selectedPayslip.cargo}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold uppercase">Salário Base:</span>
                  <div className="font-bold text-slate-800">{selectedPayslip.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
              </div>

              {/* Tabela de Eventos */}
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="py-1">Cód.</th>
                    <th className="py-1">Descrição</th>
                    <th className="py-1 text-center">Ref.</th>
                    <th className="py-1 text-right">Vencimentos</th>
                    <th className="py-1 text-right">Descontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectedPayslip.eventos.map((ev, i) => (
                    <tr key={i}>
                      <td className="py-1.5 font-mono text-slate-500">{ev.codigo}</td>
                      <td className="py-1.5 font-medium">{ev.nome}</td>
                      <td className="py-1.5 text-center font-mono text-slate-500">{ev.referencia}</td>
                      <td className="py-1.5 text-right font-medium">
                        {ev.tipo === 'PROVENTO' ? ev.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}
                      </td>
                      <td className="py-1.5 text-right font-medium text-rose-600">
                        {ev.tipo === 'DESCONTO' ? ev.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totais */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-300 pt-2 text-xs font-bold">
                <div>
                  <span className="text-slate-500">TOTAL VENCIMENTOS:</span>
                  <div className="text-sm text-slate-900">{selectedPayslip.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
                <div>
                  <span className="text-slate-500">TOTAL DESCONTOS:</span>
                  <div className="text-sm text-rose-600">{selectedPayslip.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <span className="text-slate-600 text-[11px]">VALOR LÍQUIDO A RECEBER:</span>
                  <div className="text-base text-blue-600 font-bold">{selectedPayslip.salarioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
              </div>

              {/* Bases Legais */}
              <div className="grid grid-cols-4 gap-2 border-t border-slate-200 pt-2 text-[10px] text-slate-500">
                <div>Sal. Contr. INSS: <strong className="text-slate-700">{selectedPayslip.baseInss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                <div>Base FGTS: <strong className="text-slate-700">{selectedPayslip.baseFgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                <div>FGTS do Mês: <strong className="text-slate-700">{selectedPayslip.valorFgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                <div>Base IRRF: <strong className="text-slate-700">{selectedPayslip.baseIrrf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
              </div>

              {/* Linha de Assinatura */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-center">
                <div>
                  <div className="border-b border-slate-300 w-4/5 mx-auto mb-1"></div>
                  <div className="text-slate-500">Data: ____/____/________</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-4/5 mx-auto mb-1"></div>
                  <div className="text-slate-500">Assinatura do Funcionário</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Holerite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Empregado */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl p-6 space-y-4 text-slate-800">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Admitir Empregado (eSocial S-2200)
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={empNome}
                  onChange={(e) => setEmpNome(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={empCpf}
                  onChange={(e) => setEmpCpf(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cargo</label>
                  <input
                    type="text"
                    placeholder="Ex: Assistente"
                    value={empCargo}
                    onChange={(e) => setEmpCargo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">CBO</label>
                  <input
                    type="text"
                    placeholder="4110-10"
                    value={empCbo}
                    onChange={(e) => setEmpCbo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Salário Base (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={empSalario}
                    onChange={(e) => setEmpSalario(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-right focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dependentes IRRF</label>
                  <input
                    type="number"
                    value={empDepIrrf}
                    onChange={(e) => setEmpDepIrrf(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-center focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-vt"
                  checked={empVt}
                  onChange={(e) => setEmpVt(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chk-vt" className="text-slate-700 text-xs cursor-pointer select-none">
                  Optante de Vale Transporte (Desconto de 6%)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEmployee}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                Salvar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
