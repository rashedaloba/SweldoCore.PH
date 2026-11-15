import { useEffect, useMemo, useState } from 'react';
import AttendanceEmployeeRow from '../components/AttendanceEmployeeRow.jsx';
import AttendanceMonthlyResults from '../components/AttendanceMonthlyResults.jsx';
import { usePayroll } from '../context/PayrollContext';
import { buildMonthlyAttendanceReport } from '../services/attendanceManagement.js';
import { formatPayrollPeriod } from '../utils/formatters';

function getLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getLastDayOfPeriod(period) {
  const [year, month] = period.split('-').map(Number);
  const day = new Date(year, month, 0).getDate();
  return `${period}-${String(day).padStart(2, '0')}`;
}

function formatAttendanceDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function Attendance() {
  const {
    currentCompany,
    currentCompanyId,
    currentRole,
    currentEmployee,
    companyEmployees,
    attendanceRecords,
    setAttendanceRecord,
    selectedPayrollPeriod,
    setSelectedPayrollPeriod
  } = usePayroll();
  const [date, setDate] = useState(getLocalDate);
  const periodLabel = formatPayrollPeriod(selectedPayrollPeriod);
  const isEmployee = currentRole === 'EMPLOYEE';
  const canManageAttendance = !isEmployee;
  const visibleEmployees = isEmployee
    ? (currentEmployee ? [currentEmployee] : [])
    : companyEmployees;

  useEffect(() => {
    setDate((currentDate) => (
      currentDate.slice(0, 7) === selectedPayrollPeriod
        ? currentDate
        : `${selectedPayrollPeriod}-01`
    ));
  }, [selectedPayrollPeriod]);

  const dailyRecords = useMemo(
    () => new Map(attendanceRecords
      .filter((record) => record.companyId === currentCompanyId && record.date === date)
      .map((record) => [record.employeeId, record])),
    [attendanceRecords, currentCompanyId, date]
  );
  const counts = useMemo(() => {
    const summary = { present: 0, absent: 0, leave: 0, unmarked: 0 };
    visibleEmployees.forEach((employee) => {
      const status = dailyRecords.get(employee.id)?.status;
      if (status) summary[status] += 1;
      else summary.unmarked += 1;
    });
    return summary;
  }, [dailyRecords, visibleEmployees]);
  const monthlyReport = useMemo(
    () => buildMonthlyAttendanceReport(
      attendanceRecords,
      visibleEmployees,
      currentCompanyId,
      selectedPayrollPeriod
    ),
    [attendanceRecords, visibleEmployees, currentCompanyId, selectedPayrollPeriod]
  );

  const pageDescription = canManageAttendance
    ? `Record daily attendance for ${currentCompany?.name || 'your company'}.`
    : 'Record or review your own daily attendance. Only your selected profile is shown.';

  return (
    <div className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{currentCompany?.name} · {periodLabel}</p>
          <h1>Attendance</h1>
          <p className="page-description">{pageDescription} The register is scoped to the selected pay month.</p>
        </div>
      </div>

      <section className="card attendance-controls">
        <label className="attendance-date-field">
          Attendance date in {periodLabel}
          <input
            type="date"
            min={`${selectedPayrollPeriod}-01`}
            max={getLastDayOfPeriod(selectedPayrollPeriod)}
            value={date}
            onChange={(event) => {
              const nextDate = event.target.value;
              if (!nextDate) return;
              setDate(nextDate);
              setSelectedPayrollPeriod(nextDate.slice(0, 7));
            }}
          />
        </label>
        <p>Attendance for this selected month is saved in this browser and does not change payroll calculations.</p>
      </section>

      {isEmployee && (
        <p className="attendance-access-note" role="note">
          Employee preview can record only the selected employee’s attendance. Owner and HR profiles can manage the full company register.
        </p>
      )}

      {canManageAttendance && (
        <div className="attendance-summary" aria-label={`Daily attendance summary for ${formatAttendanceDate(date)}`}>
          {[
            ['Present', counts.present, 'present'],
            ['Absent', counts.absent, 'absent'],
            ['On leave', counts.leave, 'leave'],
            ['Not marked', counts.unmarked, 'unmarked']
          ].map(([label, count, status]) => (
            <section className={`card attendance-stat ${status}`} key={status}>
              <span>{label}</span>
              <strong>{count}</strong>
            </section>
          ))}
        </div>
      )}

      {!visibleEmployees.length ? (
        <section className="card empty-content">
          <div className="empty-icon" aria-hidden="true">▦</div>
          <h2>{isEmployee ? 'Employee profile unavailable' : 'No employees to track yet'}</h2>
          <p>
            {isEmployee
              ? 'Select an employee profile from the account menu to view its attendance.'
              : 'Add employees under People before recording daily attendance.'}
          </p>
        </section>
      ) : (
        <section className="attendance-register" aria-label="Daily attendance register">
          <div className="attendance-register-heading">
            <div>
              <p className="eyebrow">{periodLabel}</p>
              <h2>{isEmployee ? 'My attendance' : 'Employee attendance'}</h2>
              <p className="attendance-date-caption">{formatAttendanceDate(date)}</p>
            </div>
            <span>{visibleEmployees.length} {visibleEmployees.length === 1 ? 'employee' : 'employees'}</span>
          </div>

          <div className="list-table">
            {visibleEmployees.map((employee) => (
              <AttendanceEmployeeRow
                key={`${employee.id}-${date}`}
                employee={employee}
                date={date}
                record={dailyRecords.get(employee.id)}
                onSave={setAttendanceRecord}
              />
            ))}
          </div>
        </section>
      )}

      {visibleEmployees.length > 0 && (
        <AttendanceMonthlyResults
          periodLabel={periodLabel}
          report={monthlyReport}
          isEmployee={isEmployee}
        />
      )}
    </div>
  );
}
