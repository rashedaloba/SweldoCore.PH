import { ATTENDANCE_STATUSES } from '../constants/attendance.js';
import {
  calculateWorkedMinutes,
  formatWorkedHours
} from '../services/attendanceManagement.js';

function formatShortDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getHoursLabel(record) {
  if (record.status !== 'present') return '—';
  const minutes = calculateWorkedMinutes(
    record.clockIn,
    record.clockOut,
    record.unpaidBreakMinutes
  );
  return minutes === null ? 'Incomplete' : formatWorkedHours(minutes);
}

export default function AttendanceMonthlyResults({
  periodLabel,
  report,
  isEmployee
}) {
  const { employeeSummaries, dailyRecords } = report;
  const monthlyRecordCount = dailyRecords.length;
  const incompleteHoursCount = employeeSummaries.reduce(
    (total, result) => total + result.hoursIncomplete,
    0
  );

  return (
    <section
      className="card attendance-monthly-results"
      aria-label={`${isEmployee ? 'My' : 'Employee'} attendance results for ${periodLabel}`}
    >
      <div className="attendance-monthly-heading">
        <div>
          <p className="eyebrow">Monthly results</p>
          <h2>{isEmployee ? 'My attendance' : 'Employee attendance'} · {periodLabel}</h2>
        </div>
        <span>{monthlyRecordCount} {monthlyRecordCount === 1 ? 'daily record' : 'daily records'}</span>
      </div>

      {monthlyRecordCount === 0 && (
        <p className="attendance-no-results" role="status">
          No attendance has been recorded for {periodLabel} yet. Mark daily attendance above to build this report.
        </p>
      )}
      {incompleteHoursCount > 0 && (
        <p className="attendance-hours-note" role="note">
          {incompleteHoursCount} present record(s) are missing work times. Select those dates above to complete the hours.
        </p>
      )}

      <div className="attendance-month-table-wrap">
        <table className="attendance-month-table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Present</th>
              <th scope="col">Absent</th>
              <th scope="col">On leave</th>
              <th scope="col">Recorded days</th>
              <th scope="col">Hours worked</th>
            </tr>
          </thead>
          <tbody>
            {employeeSummaries.map(({
              employee,
              present,
              absent,
              leave,
              recorded,
              totalMinutes,
              hoursIncomplete
            }) => (
              <tr key={employee.id}>
                <th scope="row">
                  <strong>{employee.name}</strong>
                  <small>{employee.position}</small>
                </th>
                <td>{present}</td>
                <td>{absent}</td>
                <td>{leave}</td>
                <td>{recorded}</td>
                <td>{hoursIncomplete ? 'Incomplete' : formatWorkedHours(totalMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-daily-results">
        <div className="attendance-daily-heading">
          <h3>{isEmployee ? 'My daily records' : 'Daily records'}</h3>
          <span>{dailyRecords.length} {dailyRecords.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        {dailyRecords.length === 0 ? (
          <p className="attendance-no-results" role="status">
            No daily attendance records to show for {periodLabel}.
          </p>
        ) : (
          <div className="attendance-month-table-wrap">
            <table className="attendance-month-table attendance-daily-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  {!isEmployee && <th scope="col">Employee</th>}
                  <th scope="col">Status</th>
                  <th scope="col">Clock in</th>
                  <th scope="col">Clock out</th>
                  <th scope="col">Unpaid break</th>
                  <th scope="col">Hours worked</th>
                </tr>
              </thead>
              <tbody>
                {dailyRecords.map(({ employee, record }) => {
                  const statusLabel = ATTENDANCE_STATUSES.find(
                    (status) => status.value === record.status
                  )?.label || record.status;

                  return (
                    <tr key={`${record.employeeId}-${record.date}`}>
                      <td>{formatShortDate(record.date)}</td>
                      {!isEmployee && <td>{employee.name}</td>}
                      <td>{statusLabel}</td>
                      <td>{record.clockIn || '—'}</td>
                      <td>{record.clockOut || '—'}</td>
                      <td>
                        {record.unpaidBreakMinutes === undefined
                          ? '—'
                          : `${record.unpaidBreakMinutes} min`}
                      </td>
                      <td>{getHoursLabel(record)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
