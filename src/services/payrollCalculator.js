import {
  birMonthlyTaxTable,
  birTaxTable,
  getPagIbigEmployeeContribution,
  getPhilHealthEmployeeContribution,
  getSssEmployeeContribution
} from '../constants/phTaxRates.js';

const asMoney = (value) => Number(value.toFixed(2));

export function findSssContribution(salary) {
  return getSssEmployeeContribution(salary);
}

export function findPhilHealthContribution(salary) {
  return getPhilHealthEmployeeContribution(salary);
}

export function findPagIbigContribution(salary) {
  return getPagIbigEmployeeContribution(salary);
}

function calculateAnnualTaxAmount(annualTaxableIncome) {
  let remaining = Math.max(0, Number(annualTaxableIncome) || 0);
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of birTaxTable) {
    if (remaining <= 0) break;
    const bracketWidth = bracket.limit === Infinity ? remaining : bracket.limit - previousLimit;
    const taxablePortion = Math.min(remaining, bracketWidth);
    tax += taxablePortion * bracket.rate;
    remaining -= taxablePortion;
    previousLimit = bracket.limit;
  }

  return tax;
}

export function computeAnnualTax(annualTaxableIncome) {
  return asMoney(calculateAnnualTaxAmount(annualTaxableIncome) / 12);
}

export function computeMonthlyTax(monthlyTaxableIncome) {
  const taxableCompensation = Math.max(0, Number(monthlyTaxableIncome) || 0);
  const bracket = birMonthlyTaxTable.find((item) => taxableCompensation <= item.limit)
    ?? birMonthlyTaxTable[birMonthlyTaxTable.length - 1];
  return asMoney(bracket.base + Math.max(0, taxableCompensation - bracket.over) * bracket.rate);
}

export function calculatePayroll(salary, overrides = {}) {
  const gross = Math.max(0, Number(salary) || 0);
  const sss = overrides.sss ?? findSssContribution(gross);
  const philHealth = overrides.philHealth ?? findPhilHealthContribution(gross);
  const pagIbig = overrides.pagIbig ?? findPagIbigContribution(gross);
  const totalDeductions = asMoney(sss + philHealth + pagIbig);
  const taxableIncome = Math.max(0, gross - totalDeductions);
  const monthlyTax = computeMonthlyTax(taxableIncome);
  const netPay = gross - totalDeductions - monthlyTax;

  return {
    gross,
    sss,
    philHealth,
    pagIbig,
    totalDeductions: asMoney(totalDeductions),
    taxableIncome: asMoney(taxableIncome),
    monthlyTax,
    netPay: asMoney(netPay),
    annualTax: asMoney(calculateAnnualTaxAmount(taxableIncome * 12))
  };
}
