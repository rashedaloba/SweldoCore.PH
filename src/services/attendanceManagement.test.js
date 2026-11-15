import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canEditAttendanceRecord,
  buildMonthlyAttendanceReport,
  calculateWorkedMinutes,
  isValidAttendanceDate,
  updateAttendanceRecords
} from './attendanceManagement.js';

const records = [
  { companyId: 'company-one', employeeId: 'employee-one', date: '2026-11-15', status: 'present' },
  { companyId: 'company-one', employeeId: 'employee-one', date: '2026-11-14', status: 'leave' },
  { companyId: 'company-two', employeeId: 'employee-one', date: '2026-11-15', status: 'absent' }
];

test('updating attendance replaces only the matching employee, company, and date', () => {
  assert.deepEqual(updateAttendanceRecords(records, {
    companyId: 'company-one',
    employeeId: 'employee-one',
    date: '2026-11-15',
    status: 'absent'
  }), [
    records[1],
    records[2],
    { companyId: 'company-one', employeeId: 'employee-one', date: '2026-11-15', status: 'absent' }
  ]);
});

test('clearing attendance removes only the matching daily record', () => {
  assert.deepEqual(updateAttendanceRecords(records, {
    companyId: 'company-one',
    employeeId: 'employee-one',
    date: '2026-11-15',
    status: ''
  }), [records[1], records[2]]);
});

test('work time calculation subtracts unpaid breaks and supports overnight shifts', () => {
  assert.equal(calculateWorkedMinutes('09:00', '17:00', 60), 420);
  assert.equal(calculateWorkedMinutes('22:00', '06:00', 30), 450);
  assert.equal(calculateWorkedMinutes('09:00', '17:00', 480), null);
  assert.equal(calculateWorkedMinutes('09:00', '', 0), null);
});

test('attendance dates reject impossible calendar days', () => {
  assert.equal(isValidAttendanceDate('2024-02-29'), true);
  assert.equal(isValidAttendanceDate('2026-02-29'), false);
  assert.equal(isValidAttendanceDate('2026-13-01'), false);
  assert.equal(isValidAttendanceDate('2026-11-00'), false);
});

test('employees can edit only their own attendance while managers can edit the team', () => {
  assert.equal(canEditAttendanceRecord('EMPLOYEE', 'employee-one', 'employee-one'), true);
  assert.equal(canEditAttendanceRecord('EMPLOYEE', 'employee-one', 'employee-two'), false);
  assert.equal(canEditAttendanceRecord('OWNER', 'employee-one', 'employee-two'), true);
  assert.equal(canEditAttendanceRecord('HR_ADMIN', 'employee-one', 'employee-two'), true);
});

test('monthly attendance results count only the selected company and period', () => {
  const employees = [
    { id: 'employee-one', name: 'Employee One' },
    { id: 'employee-two', name: 'Employee Two' }
  ];
  const monthlyRecords = [
    ...records,
    { companyId: 'company-one', employeeId: 'employee-two', date: '2026-11-10', status: 'absent' },
    {
      companyId: 'company-one',
      employeeId: 'employee-two',
      date: '2026-11-12',
      status: 'present',
      clockIn: '09:00',
      clockOut: '17:00',
      unpaidBreakMinutes: 60
    }
  ];

  const report = buildMonthlyAttendanceReport(monthlyRecords, employees, 'company-one', '2026-11');
  assert.deepEqual(
    report.employeeSummaries.map((result) => ({
      employeeId: result.employee.id,
      present: result.present,
      absent: result.absent,
      leave: result.leave,
      recorded: result.recorded,
      totalMinutes: result.totalMinutes,
      hoursIncomplete: result.hoursIncomplete
    })),
    [
      { employeeId: 'employee-one', present: 1, absent: 0, leave: 1, recorded: 2, totalMinutes: 0, hoursIncomplete: 1 },
      { employeeId: 'employee-two', present: 1, absent: 1, leave: 0, recorded: 2, totalMinutes: 420, hoursIncomplete: 0 }
    ]
  );
  assert.deepEqual(report.dailyRecords.map(({ employee, record }) => ({
    employeeId: employee.id,
    date: record.date
  })), [
    { employeeId: 'employee-one', date: '2026-11-15' },
    { employeeId: 'employee-one', date: '2026-11-14' },
    { employeeId: 'employee-two', date: '2026-11-12' },
    { employeeId: 'employee-two', date: '2026-11-10' }
  ]);
  assert.deepEqual(
    buildMonthlyAttendanceReport(records, [employees[0]], 'company-one', '2026-11')
      .dailyRecords.map(({ employee }) => employee.id),
    ['employee-one', 'employee-one']
  );
});
