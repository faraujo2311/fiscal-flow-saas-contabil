import { Employee, PayrollPayslip, PayrollEvent } from '../types';

export function calculateEmployeePayroll(
  employee: Employee,
  competencia: string,
  horasExtrasHoras: number = 0,
  outrosProventos: number = 0
): PayrollPayslip {
  const salarioBase = employee.salarioBase;

  // 1. Proventos
  const eventos: PayrollEvent[] = [
    {
      codigo: '001',
      nome: 'SALÁRIO BASE CONTRATUAL',
      tipo: 'PROVENTO',
      referencia: '30D',
      valor: salarioBase,
    }
  ];

  let valorHoraExtra = 0;
  if (horasExtrasHoras > 0) {
    const valorHoraNormal = salarioBase / 220;
    valorHoraExtra = Math.round(horasExtrasHoras * valorHoraNormal * 1.5 * 100) / 100;
    eventos.push({
      codigo: '050',
      nome: 'HORAS EXTRAS 50%',
      tipo: 'PROVENTO',
      referencia: `${horasExtrasHoras}h`,
      valor: valorHoraExtra,
    });
  }

  if (outrosProventos > 0) {
    eventos.push({
      codigo: '080',
      nome: 'GRATIFICAÇÃO / DSR / ADICIONAL',
      tipo: 'PROVENTO',
      referencia: '-',
      valor: outrosProventos,
    });
  }

  const totalBruto = salarioBase + valorHoraExtra + outrosProventos;

  // 2. Cálculo Progressivo do INSS (Tabela Vigente)
  // Faixa 1: até 1.412,00 -> 7,5%
  // Faixa 2: 1.412,01 até 2.666,68 -> 9%
  // Faixa 3: 2.666,69 até 4.000,03 -> 12%
  // Faixa 4: 4.000,04 até 7.786,02 -> 14%
  // Teto máximo INSS = 908,86
  let valorInss = 0;
  const baseInss = Math.min(totalBruto, 7786.02);

  if (baseInss <= 1412.00) {
    valorInss = baseInss * 0.075;
  } else if (baseInss <= 2666.68) {
    valorInss = (1412.00 * 0.075) + ((baseInss - 1412.00) * 0.09);
  } else if (baseInss <= 4000.03) {
    valorInss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((baseInss - 2666.68) * 0.12);
  } else {
    valorInss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((baseInss - 4000.03) * 0.14);
  }

  valorInss = Math.round(Math.min(valorInss, 908.86) * 100) / 100;

  eventos.push({
    codigo: '901',
    nome: 'INSS FOLHA PROGRESSIVO',
    tipo: 'DESCONTO',
    referencia: `${(Math.round((valorInss / totalBruto) * 1000) / 10).toFixed(1)}%`,
    valor: valorInss,
  });

  // 3. Cálculo IRRF
  // Base IRRF = Total Bruto - INSS - (Dependentes * 189,59)
  const deducaoDependentes = (employee.dependentesIrrf || 0) * 189.59;
  const baseIrrfCalculada = totalBruto - valorInss - deducaoDependentes;
  const baseIrrf = Math.max(0, baseIrrfCalculada);

  let valorIrrf = 0;
  let aliquotaIrrfRef = '0%';

  if (baseIrrf <= 2259.20) {
    valorIrrf = 0;
    aliquotaIrrfRef = 'ISENTO';
  } else if (baseIrrf <= 2826.65) {
    valorIrrf = (baseIrrf * 0.075) - 169.44;
    aliquotaIrrfRef = '7.5%';
  } else if (baseIrrf <= 3751.05) {
    valorIrrf = (baseIrrf * 0.15) - 381.44;
    aliquotaIrrfRef = '15.0%';
  } else if (baseIrrf <= 4664.68) {
    valorIrrf = (baseIrrf * 0.225) - 662.77;
    aliquotaIrrfRef = '22.5%';
  } else {
    valorIrrf = (baseIrrf * 0.275) - 896.00;
    aliquotaIrrfRef = '27.5%';
  }

  valorIrrf = Math.round(Math.max(0, valorIrrf) * 100) / 100;

  if (valorIrrf > 0) {
    eventos.push({
      codigo: '902',
      nome: 'IRRF S/ SALÁRIOS',
      tipo: 'DESCONTO',
      referencia: aliquotaIrrfRef,
      valor: valorIrrf,
    });
  }

  // 4. Vale Transporte (até 6% do salário base se optante)
  let valorVt = 0;
  if (employee.valeTransporte) {
    valorVt = Math.round(salarioBase * 0.06 * 100) / 100;
    eventos.push({
      codigo: '903',
      nome: 'VALE TRANSPORTE 6%',
      tipo: 'DESCONTO',
      referencia: '6.0%',
      valor: valorVt,
    });
  }

  // 5. FGTS (8% a cargo do empregador)
  const baseFgts = totalBruto;
  const valorFgts = Math.round(baseFgts * 0.08 * 100) / 100;

  const totalProventos = Math.round(
    eventos.filter(e => e.tipo === 'PROVENTO').reduce((sum, e) => sum + e.valor, 0) * 100
  ) / 100;

  const totalDescontos = Math.round(
    eventos.filter(e => e.tipo === 'DESCONTO').reduce((sum, e) => sum + e.valor, 0) * 100
  ) / 100;

  const salarioLiquido = Math.round((totalProventos - totalDescontos) * 100) / 100;

  return {
    id: `payslip-${employee.id}-${competencia.replace('/', '')}`,
    employeeId: employee.id,
    employeeName: employee.nome,
    employeeCpf: employee.cpf,
    cargo: employee.cargo,
    cbo: employee.cbo,
    competencia,
    salarioBase,
    eventos,
    totalProventos,
    totalDescontos,
    salarioLiquido,
    baseInss,
    valorInss,
    baseIrrf,
    valorIrrf,
    baseFgts,
    valorFgts,
  };
}
