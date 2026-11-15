const SSS_MINIMUM_MSC = 5000;
const SSS_MAXIMUM_MSC = 35000;
const SSS_MSC_STEP = 500;
const SSS_FIRST_STEP_START = 5250;
const SSS_EMPLOYEE_RATE = 0.05;

// The 2025 employee table starts at ₱5,000 MSC and rounds compensation up by ₱500.
export function getSssEmployeeContribution(salary = 0) {
  const monthlySalary = Math.max(0, Number(salary) || 0);
  if (monthlySalary === 0) return 0;
  const msc = monthlySalary < SSS_FIRST_STEP_START
    ? SSS_MINIMUM_MSC
    : Math.min(
      SSS_MAXIMUM_MSC,
      SSS_MINIMUM_MSC + SSS_MSC_STEP * (Math.floor((monthlySalary - SSS_FIRST_STEP_START) / SSS_MSC_STEP) + 1)
    );
  return Number((msc * SSS_EMPLOYEE_RATE).toFixed(2));
}

export function getPhilHealthEmployeeContribution(salary = 0) {
  // The 5% premium is shared equally; the monthly salary floor and ceiling are ₱10,000 and ₱100,000.
  const monthlySalary = Math.max(0, Number(salary) || 0);
  if (monthlySalary === 0) return 0;
  const monthlyBasicSalary = Math.min(Math.max(monthlySalary, 10000), 100000);
  return Number((monthlyBasicSalary * 0.05 / 2).toFixed(2));
}

export function getPagIbigEmployeeContribution(salary = 0) {
  // Circular 460 sets a ₱10,000 fund salary cap and employee rates of 1% / 2%.
  const fundSalary = Math.min(Math.max(Number(salary) || 0, 0), 10000);
  const rate = fundSalary <= 1500 ? 0.01 : 0.02;
  return Number((fundSalary * rate).toFixed(2));
}

export const birTaxTable = [
  { limit: 250000, rate: 0 },
  { limit: 400000, rate: 0.15 },
  { limit: 800000, rate: 0.2 },
  { limit: 2000000, rate: 0.25 },
  { limit: 8000000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 }
];

// Monthly compensation tax schedule effective 2023 onward (Annex E, RR 11-2018).
export const birMonthlyTaxTable = [
  { limit: 20833, over: 0, base: 0, rate: 0 },
  { limit: 33332, over: 20833, base: 0, rate: 0.15 },
  { limit: 66666, over: 33333, base: 1875, rate: 0.2 },
  { limit: 166666, over: 66667, base: 8541.8, rate: 0.25 },
  { limit: 666666, over: 166667, base: 33541.8, rate: 0.3 },
  { limit: Infinity, over: 666667, base: 183541.8, rate: 0.35 }
];
