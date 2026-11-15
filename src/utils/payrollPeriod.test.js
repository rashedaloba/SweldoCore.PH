import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurrentPayrollPeriod, isValidPayrollPeriod } from './payrollPeriod.js';

test('payroll period formats the year and zero-padded month', () => {
  assert.equal(getCurrentPayrollPeriod(new Date(2026, 0, 15)), '2026-01');
  assert.equal(getCurrentPayrollPeriod(new Date(2026, 10, 15)), '2026-11');
});

test('payroll period validation rejects malformed months', () => {
  assert.equal(isValidPayrollPeriod('2026-11'), true);
  assert.equal(isValidPayrollPeriod('2026-13'), false);
  assert.equal(isValidPayrollPeriod('2026-1'), false);
  assert.equal(isValidPayrollPeriod(null), false);
});
