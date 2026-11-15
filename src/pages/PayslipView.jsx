import { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { calculatePayroll } from '../services/payrollCalculator';
import PrintablePayslip from '../components/PrintablePayslip';
import { formatPayrollPeriod } from '../utils/formatters';

export default function PayslipView() {
  const { currentCompany, currentRole, companyEmployees, currentEmployee, currentPayrollRun, selectedPayrollPeriod } = usePayroll();
  const periodLabel = formatPayrollPeriod(currentPayrollRun?.period || selectedPayrollPeriod);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(companyEmployees[0]?.id || '');
  const isEmployee = currentRole === 'EMPLOYEE';
  const availableEmployees = currentPayrollRun?.status === 'approved' && currentPayrollRun.employees?.length
    ? currentPayrollRun.employees.map((person) => ({
      id: person.employeeId,
      name: person.name,
      position: person.position,
      salary: person.salary
    }))
    : companyEmployees;
  const employeeId = isEmployee
    ? currentEmployee?.id
    : availableEmployees.some((person) => person.id === selectedEmployeeId)
      ? selectedEmployeeId
      : availableEmployees[0]?.id;
  const employeeRecord = availableEmployees.find((person) => person.id === employeeId)
    ?? (isEmployee ? null : availableEmployees[0]);
  const approvedRecord = currentPayrollRun?.status === 'approved'
    ? currentPayrollRun.employees?.find((person) => person.employeeId === employeeId)
    : null;
  const employee = approvedRecord
    ? { id: approvedRecord.employeeId, name: approvedRecord.name, position: approvedRecord.position, salary: approvedRecord.salary }
    : employeeRecord;
  const payrollData = approvedRecord || (employee ? calculatePayroll(employee.salary) : null);

  if (!employee) {
    return (
      <div className="page-section">
        <div className="card empty-content">
          <div className="empty-icon">▤</div><h2>No payslip to display</h2>
          <p>Add an employee and review payroll to create a pay statement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-heading payslip-page-heading">
        <div>
          <p className="eyebrow">Employee pay statement · {periodLabel}</p>
          <h1>{approvedRecord ? 'Approved payslip' : 'Payslip preview'}</h1>
          <p className="page-description">Review the itemized monthly pay statement for {employee.name}.</p>
        </div>
        {!isEmployee && availableEmployees.length > 1 && (
          <label className="employee-picker"><span>Employee</span><select value={employeeId || ''} onChange={(event) => setSelectedEmployeeId(event.target.value)}>
            {availableEmployees.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}
          </select></label>
        )}
      </div>
      {!approvedRecord && (
        <div className="snapshot-notice" role="note">
          <strong>No approved snapshot for {periodLabel}.</strong>
          This preview uses the current employee salary, not salary values from the selected month.
        </div>
      )}
      <PrintablePayslip
        employee={employee}
        payrollData={payrollData}
        company={currentPayrollRun?.status === 'approved' ? currentPayrollRun.company || currentCompany : currentCompany}
        period={currentPayrollRun?.period || selectedPayrollPeriod}
        approved={Boolean(approvedRecord)}
      />
    </div>
  );
}
