function parseTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function isValidAttendanceDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function calculateWorkedMinutes(clockIn, clockOut, unpaidBreakMinutes) {
  const start = parseTime(clockIn);
  const end = parseTime(clockOut);
  if (start === null || end === null || unpaidBreakMinutes === '') return null;

  const breakMinutes = Number(unpaidBreakMinutes);
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) return null;

  let shiftMinutes = end - start;
  if (shiftMinutes < 0) shiftMinutes += 24 * 60;
  if (shiftMinutes === 0 || breakMinutes >= shiftMinutes) return null;
  return shiftMinutes - breakMinutes;
}

export function hasValidAttendanceHours(record) {
  const hasHours = ['clockIn', 'clockOut', 'unpaidBreakMinutes']
    .some((field) => Object.hasOwn(record, field));
  if (!hasHours) return true;
  return record.status === 'present'
    && typeof record.clockIn === 'string'
    && typeof record.clockOut === 'string'
    && Number.isInteger(record.unpaidBreakMinutes)
    && calculateWorkedMinutes(record.clockIn, record.clockOut, record.unpaidBreakMinutes) !== null;
}

export function canEditAttendanceRecord(role, currentEmployeeId, employeeId) {
  return role === 'EMPLOYEE'
    ? currentEmployeeId === employeeId
    : role === 'OWNER' || role === 'HR_ADMIN';
}

export function formatWorkedHours(minutes) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function updateAttendanceRecords(records, nextRecord) {
  const updatedRecords = records.filter((record) => !(
    record.companyId === nextRecord.companyId
    && record.employeeId === nextRecord.employeeId
    && record.date === nextRecord.date
  ));

  return nextRecord.status
    ? [...updatedRecords, nextRecord]
    : updatedRecords;
}

export function buildMonthlyAttendanceReport(records, employees, companyId, period) {
  const summaries = new Map(employees.map((employee) => [
    employee.id,
    {
      employee,
      present: 0,
      absent: 0,
      leave: 0,
      recorded: 0,
      totalMinutes: 0,
      hoursIncomplete: 0
    }
  ]));
  const dailyRecords = [];

  records.forEach((record) => {
    if (record.companyId !== companyId || !record.date.startsWith(period)) return;
    const summary = summaries.get(record.employeeId);
    if (!summary) return;
    summary[record.status] += 1;
    summary.recorded += 1;
    dailyRecords.push({ employee: summary.employee, record });

    if (record.status === 'present') {
      const minutes = calculateWorkedMinutes(
        record.clockIn,
        record.clockOut,
        record.unpaidBreakMinutes
      );
      if (minutes === null) summary.hoursIncomplete += 1;
      else summary.totalMinutes += minutes;
    }
  });

  dailyRecords.sort((left, right) => (
    right.record.date.localeCompare(left.record.date)
    || left.employee.name.localeCompare(right.employee.name)
  ));

  return {
    employeeSummaries: employees.map((employee) => summaries.get(employee.id)),
    dailyRecords
  };
}
