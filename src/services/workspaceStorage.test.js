import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurrentPayrollPeriod } from '../utils/payrollPeriod.js';
import { readStoredState } from './workspaceStorage.js';

function readStateWithStorage(stored) {
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: () => JSON.stringify(stored)
    }
  };
  try {
    return readStoredState();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

const validWorkspace = {
  companies: [{ id: 'company-one', name: 'Company One' }],
  employees: []
};

function workspaceWithAttendance(attendanceRecords) {
  return {
    ...validWorkspace,
    employees: [{ id: 'employee-one', companyId: 'company-one', name: 'Employee One', salary: 1000 }],
    attendanceRecords
  };
}

test('stored workspace keeps its selected payroll month', () => {
  const result = readStateWithStorage({
    ...validWorkspace,
    selectedPayrollPeriod: '2025-03'
  });

  assert.equal(result.state.selectedPayrollPeriod, '2025-03');
  assert.equal(result.notice, null);
});

test('invalid saved payroll months fall back to the current period', () => {
  const result = readStateWithStorage({
    ...validWorkspace,
    selectedPayrollPeriod: '2025-13'
  });

  assert.equal(result.state.selectedPayrollPeriod, getCurrentPayrollPeriod());
});

test('stored attendance accepts legacy status records and valid work-time records', () => {
  const result = readStateWithStorage(workspaceWithAttendance([
    { companyId: 'company-one', employeeId: 'employee-one', date: '2026-11-14', status: 'present' },
    {
      companyId: 'company-one',
      employeeId: 'employee-one',
      date: '2026-11-15',
      status: 'present',
      clockIn: '09:00',
      clockOut: '17:00',
      unpaidBreakMinutes: 60
    }
  ]));

  assert.equal(result.notice, null);
  assert.equal(result.state.attendanceRecords.length, 2);
});

test('stored attendance rejects duplicate dates and invalid work times', () => {
  const record = {
    companyId: 'company-one',
    employeeId: 'employee-one',
    date: '2026-11-15',
    status: 'present',
    clockIn: '09:00',
    clockOut: '17:00',
    unpaidBreakMinutes: 60
  };
  const duplicateResult = readStateWithStorage(workspaceWithAttendance([record, record]));
  const invalidHoursResult = readStateWithStorage(workspaceWithAttendance([{
    ...record,
    unpaidBreakMinutes: 480
  }]));
  const invalidDateResult = readStateWithStorage(workspaceWithAttendance([{
    ...record,
    date: '2026-02-30'
  }]));

  assert.match(duplicateResult.notice, /could not be read/);
  assert.match(invalidHoursResult.notice, /could not be read/);
  assert.match(invalidDateResult.notice, /could not be read/);
});
