import { ATTENDANCE_STATUSES } from '../constants/attendance.js';
import { hasValidAttendanceHours, isValidAttendanceDate } from './attendanceManagement.js';
import { getCurrentPayrollPeriod, isValidPayrollPeriod } from '../utils/payrollPeriod.js';

const defaultCompanies = [
  {
    id: 'metro-north',
    name: 'Metro North Manufacturing',
    address: 'Mandaluyong City, Metro Manila',
    tin: '000-123-456-000',
    email: 'payroll@metronorth.ph',
    phone: '+63 2 8891 2041'
  },
  {
    id: 'sari-foods',
    name: 'Sari Foods Distribution',
    address: 'Cebu Business Park, Cebu City',
    tin: '000-445-982-124',
    email: 'finance@sarifoods.ph',
    phone: '+63 32 254 7714'
  }
];

const defaultEmployees = [
  { id: 'emp-1', name: 'Maria Santos', position: 'Operations Manager', salary: 68000, companyId: 'metro-north' },
  { id: 'emp-2', name: 'Jun Dela Cruz', position: 'Warehouse Supervisor', salary: 42000, companyId: 'metro-north' },
  { id: 'emp-3', name: 'Liza Ramos', position: 'Payroll Analyst', salary: 35000, companyId: 'metro-north' },
  { id: 'emp-4', name: 'Aldrin Reyes', position: 'Logistics Coordinator', salary: 28000, companyId: 'sari-foods' },
  { id: 'emp-5', name: 'Rhea Lim', position: 'Finance Officer', salary: 39000, companyId: 'sari-foods' }
];

const defaultCompanyState = {
  currentCompanyId: defaultCompanies[0].id,
  currentRole: 'OWNER',
  currentEmployeeId: defaultEmployees[0].id,
  selectedPayrollPeriod: getCurrentPayrollPeriod(),
  companies: defaultCompanies,
  employees: defaultEmployees,
  attendanceRecords: [],
  payrollRuns: []
};

export function readStoredState() {
  try {
    const raw = window.localStorage.getItem('ph-payroll-state');
    if (!raw) return { state: defaultCompanyState, notice: null };

    const stored = JSON.parse(raw);
    if (!Array.isArray(stored.companies) || !stored.companies.length || !Array.isArray(stored.employees)) {
      throw new Error('Stored workspace data has an invalid shape.');
    }

    const companiesValid = stored.companies.every((company) =>
      company && typeof company.id === 'string' && typeof company.name === 'string'
    );
    const employeesValid = stored.employees.every((employee) =>
      employee && typeof employee.id === 'string' && typeof employee.name === 'string'
      && typeof employee.companyId === 'string' && Number.isFinite(Number(employee.salary))
    );
    if (!companiesValid || !employeesValid) {
      throw new Error('Stored workspace records are incomplete.');
    }

    const companyIds = new Set(stored.companies.map((company) => company.id));
    const currentCompanyId = companyIds.has(stored.currentCompanyId)
      ? stored.currentCompanyId
      : stored.companies[0]?.id ?? '';
    const validRoles = ['OWNER', 'HR_ADMIN', 'EMPLOYEE'];
    const currentRole = validRoles.includes(stored.currentRole) ? stored.currentRole : 'OWNER';
    const employees = stored.employees.filter((employee) => companyIds.has(employee.companyId));
    const selectedPayrollPeriod = isValidPayrollPeriod(stored.selectedPayrollPeriod)
      ? stored.selectedPayrollPeriod
      : defaultCompanyState.selectedPayrollPeriod;
    const attendanceRecords = stored.attendanceRecords ?? [];
    const attendanceStatuses = new Set(ATTENDANCE_STATUSES.map((status) => status.value));
    const attendanceKeys = new Set();
    const attendanceValid = Array.isArray(attendanceRecords) && attendanceRecords.every((record) => {
      if (
        !record
        || !companyIds.has(record.companyId)
        || !employees.some((employee) => employee.id === record.employeeId && employee.companyId === record.companyId)
        || !isValidAttendanceDate(record.date)
        || !attendanceStatuses.has(record.status)
        || !hasValidAttendanceHours(record)
      ) return false;

      const key = JSON.stringify([record.companyId, record.employeeId, record.date]);
      if (attendanceKeys.has(key)) return false;
      attendanceKeys.add(key);
      return true;
    });
    if (!attendanceValid) {
      throw new Error('Stored attendance records are incomplete.');
    }

    return {
      state: {
        ...defaultCompanyState,
        ...stored,
        companies: stored.companies,
        employees,
        attendanceRecords,
        selectedPayrollPeriod,
        currentCompanyId,
        currentRole,
        currentEmployeeId: employees.some((employee) => employee.id === stored.currentEmployeeId)
          ? stored.currentEmployeeId
          : employees.find((employee) => employee.companyId === currentCompanyId)?.id ?? '',
        payrollRuns: Array.isArray(stored.payrollRuns) ? stored.payrollRuns : []
      },
      notice: null
    };
  } catch {
    return {
      state: defaultCompanyState,
      notice: 'Saved workspace data could not be read. The current view uses starter data; changes will replace the unread saved data.'
    };
  }
}
