import assert from 'node:assert/strict';
import test from 'node:test';
import { removeCompanyFromState } from './companyManagement.js';

const state = {
  companies: [{ id: 'one' }, { id: 'two' }],
  employees: [
    { id: 'employee-one', companyId: 'one' },
    { id: 'employee-two', companyId: 'two' }
  ],
  attendanceRecords: [
    { employeeId: 'employee-one', companyId: 'one', date: '2026-11-15', status: 'present' },
    { employeeId: 'employee-two', companyId: 'two', date: '2026-11-15', status: 'leave' }
  ],
  payrollRuns: [
    { id: 'run-one', companyId: 'one' },
    { id: 'run-two', companyId: 'two' }
  ],
  currentCompanyId: 'one',
  currentEmployeeId: 'employee-one'
};

test('deleting a company removes its records and selects a remaining company', () => {
  assert.deepEqual(removeCompanyFromState(state, 'one'), {
    companies: [{ id: 'two' }],
    employees: [{ id: 'employee-two', companyId: 'two' }],
    attendanceRecords: [
      { employeeId: 'employee-two', companyId: 'two', date: '2026-11-15', status: 'leave' }
    ],
    payrollRuns: [{ id: 'run-two', companyId: 'two' }],
    currentCompanyId: 'two',
    currentEmployeeId: 'employee-two'
  });
});

test('deleting an unknown or last company leaves workspace state unchanged', () => {
  const singleCompanyState = { ...state, companies: [{ id: 'one' }] };
  assert.equal(removeCompanyFromState(state, 'missing'), state);
  assert.equal(removeCompanyFromState(singleCompanyState, 'one'), singleCompanyState);
});
