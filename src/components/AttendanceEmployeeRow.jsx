import { useEffect, useState } from 'react';
import { ATTENDANCE_STATUSES } from '../constants/attendance.js';
import { calculateWorkedMinutes, formatWorkedHours } from '../services/attendanceManagement.js';

function getDraft(record) {
  return {
    status: record?.status || '',
    clockIn: record?.clockIn || '',
    clockOut: record?.clockOut || '',
    unpaidBreakMinutes: record?.unpaidBreakMinutes === undefined
      ? '0'
      : String(record.unpaidBreakMinutes)
  };
}

function getInitials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

export default function AttendanceEmployeeRow({ employee, date, record, onSave }) {
  const [draft, setDraft] = useState(() => getDraft(record));
  const [saveError, setSaveError] = useState('');
  const workedMinutes = draft.status === 'present'
    ? calculateWorkedMinutes(draft.clockIn, draft.clockOut, draft.unpaidBreakMinutes)
    : null;
  useEffect(() => {
    setDraft(getDraft(record));
    setSaveError('');
  }, [date, record?.status, record?.clockIn, record?.clockOut, record?.unpaidBreakMinutes]);

  const saveRecord = (status, hours) => {
    try {
      onSave(employee.id, date, status, hours);
      setSaveError('');
      return true;
    } catch (error) {
      setSaveError(error.message);
      return false;
    }
  };
  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleStatusChange = (status) => {
    if (status === 'present') {
      setSaveError('');
      setDraft((current) => ({ ...current, status }));
      return;
    }

    if (saveRecord(status)) {
      setDraft(getDraft(status ? { status } : null));
    }
  };

  const handleSaveHours = () => {
    saveRecord('present', draft);
  };

  return (
    <div className="attendance-row">
      <div className="employee-meta">
        <div className="avatar">{getInitials(employee.name)}</div>
        <div>
          <strong>{employee.name}</strong>
          <small>{employee.position}</small>
        </div>
      </div>
      <label className="attendance-status-field">
        <span className="sr-only">Attendance status for {employee.name}</span>
        <select value={draft.status} onChange={(event) => handleStatusChange(event.target.value)}>
          <option value="">Not marked</option>
          {ATTENDANCE_STATUSES.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      {draft.status === 'present' && (
        <div className="attendance-hours-editor">
          <label>
            Clock in
            <input
              type="time"
              value={draft.clockIn}
              onChange={(event) => updateDraft('clockIn', event.target.value)}
            />
          </label>
          <label>
            Clock out
            <input
              type="time"
              value={draft.clockOut}
              onChange={(event) => updateDraft('clockOut', event.target.value)}
            />
          </label>
          <label>
            Unpaid break (minutes)
            <input
              type="number"
              min="0"
              step="1"
              value={draft.unpaidBreakMinutes}
              onChange={(event) => updateDraft('unpaidBreakMinutes', event.target.value)}
            />
          </label>
          <p className="attendance-hours-hint">
            End time before start time counts as an overnight shift. Break time is deducted.
          </p>
          {workedMinutes !== null && (
            <p className="attendance-hours-total" aria-live="polite">
              Hours worked: {formatWorkedHours(workedMinutes)}
            </p>
          )}
          {saveError && <p className="attendance-hours-error" role="alert">{saveError}</p>}
          <button type="button" className="secondary-button" disabled={workedMinutes === null} onClick={handleSaveHours}>
            Save work hours
          </button>
        </div>
      )}
    </div>
  );
}
