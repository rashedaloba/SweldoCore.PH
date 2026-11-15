import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ATTENDANCE_STATUSES } from '../constants/attendance.js';
import { removeCompanyFromState } from '../services/companyManagement.js';
import {
  canEditAttendanceRecord,
  calculateWorkedMinutes,
  isValidAttendanceDate,
  updateAttendanceRecords
} from '../services/attendanceManagement.js';
import { readStoredState } from '../services/workspaceStorage.js';
import { isValidPayrollPeriod } from '../utils/payrollPeriod.js';

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  const [initialLoad] = useState(readStoredState);
  const [state, setState] = useState(initialLoad.state);
  const [storageNotice, setStorageNotice] = useState(initialLoad.notice);
  const [canPersist, setCanPersist] = useState(!initialLoad.notice);

  useEffect(() => {
    if (!canPersist) return;
    try {
      window.localStorage.setItem('ph-payroll-state', JSON.stringify(state));
      setStorageNotice(null);
    } catch {
      setStorageNotice('Changes could not be saved in this browser. Check browser storage availability and space.');
    }
  }, [state, canPersist]);

  const updateState = (updater) => {
    setState(updater);
    setCanPersist(true);
  };

  const currentCompany = useMemo(
    () => state.companies.find((company) => company.id === state.currentCompanyId) ?? state.companies[0],
    [state.companies, state.currentCompanyId]
  );

  const companyEmployees = useMemo(
    () => state.employees.filter((employee) => employee.companyId === state.currentCompanyId),
    [state.employees, state.currentCompanyId]
  );

  const currentEmployee = companyEmployees.find((employee) => employee.id === state.currentEmployeeId) ?? null;

  const currentPayrollRun = useMemo(
    () => (state.payrollRuns || []).find((run) =>
      run.companyId === state.currentCompanyId && run.period === state.selectedPayrollPeriod
    ) ?? null,
    [state.payrollRuns, state.currentCompanyId, state.selectedPayrollPeriod]
  );

  const setCurrentRole = (role) => updateState((current) => ({ ...current, currentRole: role }));

  const setCurrentCompany = (companyId) => {
    updateState((current) => {
      const firstEmployee = current.employees.find((employee) => employee.companyId === companyId);
      return { ...current, currentCompanyId: companyId, currentEmployeeId: firstEmployee?.id ?? '' };
    });
  };

  const setCurrentEmployee = (employeeId) => updateState((current) => ({ ...current, currentEmployeeId: employeeId }));

  const setSelectedPayrollPeriod = (period) => {
    if (!isValidPayrollPeriod(period)) {
      throw new Error('Payroll period must use YYYY-MM format.');
    }
    if (period === state.selectedPayrollPeriod) return;
    updateState((current) => ({ ...current, selectedPayrollPeriod: period }));
  };

  const setAttendanceRecord = (employeeId, date, status, hours = {}) => {
    if (!isValidAttendanceDate(date)) {
      throw new Error('Attendance date must use YYYY-MM-DD format.');
    }
    if (!canEditAttendanceRecord(state.currentRole, state.currentEmployeeId, employeeId)) {
      throw new Error('Employee previews can only modify their own attendance records.');
    }
    if (status && !ATTENDANCE_STATUSES.some((option) => option.value === status)) {
      throw new Error('Attendance status is not supported.');
    }
    if (status === 'present' && calculateWorkedMinutes(
      hours.clockIn,
      hours.clockOut,
      hours.unpaidBreakMinutes
    ) === null) {
      throw new Error('Present attendance requires valid clock-in and clock-out times and a shorter unpaid break.');
    }
    if (!state.employees.some((employee) =>
      employee.id === employeeId && employee.companyId === state.currentCompanyId
    )) {
      throw new Error('Attendance can only be recorded for an employee in the current company.');
    }
    if (date.slice(0, 7) !== state.selectedPayrollPeriod) {
      throw new Error('Attendance date must fall within the selected payroll month.');
    }

    updateState((current) => ({
      ...current,
      attendanceRecords: updateAttendanceRecords(current.attendanceRecords || [], {
        companyId: current.currentCompanyId,
        employeeId,
        date,
        status,
        ...(status === 'present' ? {
          clockIn: hours.clockIn,
          clockOut: hours.clockOut,
          unpaidBreakMinutes: Number(hours.unpaidBreakMinutes)
        } : {})
      })
    }));
  };

  const updateCompany = (companyId, updates) => {
    updateState((current) => ({
      ...current,
      companies: current.companies.map((company) =>
        company.id === companyId ? { ...company, ...updates } : company
      )
    }));
  };

  const deleteCompany = (companyId) => {
    updateState((current) => removeCompanyFromState(current, companyId));
  };

  const addEmployee = (employee) => {
    const newEmployee = { ...employee, id: employee.id || crypto.randomUUID() };
    updateState((current) => ({
      ...current,
      employees: [...current.employees, newEmployee],
      currentEmployeeId: current.currentEmployeeId || (
        newEmployee.companyId === current.currentCompanyId ? newEmployee.id : current.currentEmployeeId
      )
    }));
  };

  const updateEmployee = (employeeId, changes) => {
    updateState((current) => ({
      ...current,
      employees: current.employees.map((employee) =>
        employee.id === employeeId ? { ...employee, ...changes } : employee
      )
    }));
  };

  const deleteEmployee = (employeeId) => {
    updateState((current) => {
      const employees = current.employees.filter((employee) => employee.id !== employeeId);
      return {
        ...current,
        employees,
        attendanceRecords: (current.attendanceRecords || []).filter((record) => record.employeeId !== employeeId),
        currentEmployeeId: current.currentEmployeeId === employeeId
          ? employees.find((employee) => employee.companyId === current.currentCompanyId)?.id ?? ''
          : current.currentEmployeeId
      };
    });
  };

  const savePayrollRun = (run) => {
    updateState((current) => ({
      ...current,
      payrollRuns: [
        ...(current.payrollRuns || []).filter((item) => !(item.companyId === run.companyId && item.period === run.period)),
        run
      ]
    }));
  };

  const value = {
    ...state,
    currentCompany,
    companyEmployees,
    currentEmployee,
    currentPayrollRun,
    storageNotice,
    setCurrentRole,
    setCurrentCompany,
    setCurrentEmployee,
    setSelectedPayrollPeriod,
    setAttendanceRecord,
    updateCompany,
    deleteCompany,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    savePayrollRun
  };

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>;
}

export function usePayroll() {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within PayrollProvider');
  }
  return context;
}
