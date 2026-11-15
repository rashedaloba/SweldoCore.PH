import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePayroll,
  computeAnnualTax,
  computeMonthlyTax,
  findPagIbigContribution,
  findPhilHealthContribution,
  findSssContribution
} from './payrollCalculator.js';

test('zero or negative salary does not produce employee deductions', () => {
  for (const salary of [0, -1000]) {
    assert.deepEqual(calculatePayroll(salary), {
      gross: 0,
      sss: 0,
      philHealth: 0,
      pagIbig: 0,
      totalDeductions: 0,
      taxableIncome: 0,
      monthlyTax: 0,
      netPay: 0,
      annualTax: 0
    });
  }
});

test('employee contributions use the configured minimums, bands, and caps', () => {
  assert.equal(findSssContribution(5000), 250);
  assert.equal(findSssContribution(5250), 275);
  assert.equal(findSssContribution(35000), 1750);
  assert.equal(findPhilHealthContribution(5000), 250);
  assert.equal(findPhilHealthContribution(100000), 2500);
  assert.equal(findPhilHealthContribution(150000), 2500);
  assert.equal(findPagIbigContribution(1500), 15);
  assert.equal(findPagIbigContribution(10000), 200);
  assert.equal(findPagIbigContribution(150000), 200);
});

test('monthly withholding tax handles the bracket boundary', () => {
  assert.equal(computeMonthlyTax(20833), 0);
  assert.equal(computeMonthlyTax(33332), 1874.85);
  assert.equal(computeMonthlyTax(33333), 1875);
  assert.equal(computeAnnualTax(400000), 1875);
});

test('payroll totals reconcile to the rounded employee deductions', () => {
  const payroll = calculatePayroll(35000);

  assert.equal(payroll.totalDeductions, 2825);
  assert.equal(payroll.taxableIncome, 32175);
  assert.equal(payroll.monthlyTax, 1701.3);
  assert.equal(payroll.netPay, 30473.7);
});
