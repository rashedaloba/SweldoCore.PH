import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LiveTaxBreakdown from '../components/LiveTaxBreakdown';
import { usePayroll } from '../context/PayrollContext';
import { calculatePayroll } from '../services/payrollCalculator';
import { formatPHP as money, formatPayrollPeriod } from '../utils/formatters';
import { getCurrentPayrollPeriod } from '../utils/payrollPeriod.js';

export default function RunPayroll() {
  const {
    currentCompany,
    currentRole,
    companyEmployees,
    currentPayrollRun,
    savePayrollRun,
    selectedPayrollPeriod
  } = usePayroll();
  const period = selectedPayrollPeriod;
  const periodLabel = formatPayrollPeriod(period);
  const isCurrentPeriod = period === getCurrentPayrollPeriod();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(companyEmployees[0]?.id ?? '');
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const employee = companyEmployees.find((member) => member.id === selectedEmployeeId) ?? companyEmployees[0];

  useEffect(() => {
    setShowApprovalMessage(false);
    setConfirmingApproval(false);
  }, [currentCompany?.id, period]);

  const rows = useMemo(() => {
    if (currentPayrollRun?.status === 'approved') return currentPayrollRun.employees || [];
    return companyEmployees.map((member) => ({
      employeeId: member.id,
      name: member.name,
      position: member.position,
      salary: Number(member.salary),
      ...calculatePayroll(member.salary)
    }));
  }, [companyEmployees, currentPayrollRun]);

  const totals = rows.reduce((acc, row) => {
    acc.gross += row.gross;
    acc.deductions += row.totalDeductions + row.monthlyTax;
    acc.net += row.netPay;
    return acc;
  }, { gross: 0, deductions: 0, net: 0 });
  const selectedRow = rows.find((row) => row.employeeId === (employee?.id || selectedEmployeeId)) || rows[0];
  const isApproved = currentPayrollRun?.status === 'approved';

  const approveRun = () => {
    if (!rows.length || isApproved) return;
    savePayrollRun({
      id: `${currentCompany.id}-${period}`,
      companyId: currentCompany.id,
      company: { ...currentCompany },
      period,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      employees: rows,
      totalGross: totals.gross,
      totalDeductions: totals.deductions,
      totalNet: totals.net
    });
    setConfirmingApproval(false);
    setShowApprovalMessage(true);
  };

  if (currentRole === 'EMPLOYEE') {
    return (
      <div className="page-section">
        <div className="card access-card">
          <div className="access-icon">↗</div>
          <p className="eyebrow">Payroll access</p>
          <h1>Payroll processing is for administrators</h1>
          <p className="page-description">Your payslip and monthly pay estimate are available in your employee workspace.</p>
          <Link className="primary-button" to="/payslip">Open my payslip <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-heading payroll-heading">
        <div>
          <p className="eyebrow">Payroll processing · {currentCompany?.name}</p>
          <h1>{periodLabel} payroll</h1>
      <p className="page-description">Review each employee’s salary-based calculation, then record the approval for this pay run.</p>
        </div>
        <div className="heading-actions">
          <span className={`status-pill ${isApproved ? 'approved' : 'pending'}`}><span className="status-dot" />{isApproved ? 'Approved' : rows.length ? 'Ready for review' : 'Needs setup'}</span>
          {isApproved ? (
            <Link className="primary-button" to="/payslip">View payslips <span aria-hidden="true">→</span></Link>
          ) : !rows.length ? (
            <Link className="primary-button" to="/employees">Add employees <span aria-hidden="true">→</span></Link>
          ) : (
            <button className="primary-button" onClick={() => setConfirmingApproval(true)}>Approve payroll <span aria-hidden="true">→</span></button>
          )}
        </div>
      </div>

      {showApprovalMessage && <div className="inline-success" role="status">Payroll approval recorded for {periodLabel}. This snapshot is saved in this browser; payslips are available to print.</div>}
      {!isApproved && !isCurrentPeriod && (
        <div className="snapshot-notice" role="note">
          <strong>No approved snapshot for {periodLabel}.</strong>
          This estimate uses the current roster and salaries, not salary values from the selected month.
        </div>
      )}
      {confirmingApproval && (
        <div className="approval-confirmation" role="alert">
          <div>
            <strong>Approve {periodLabel} payroll?</strong>
            <p>This records a payroll snapshot for {rows.length} {rows.length === 1 ? 'employee' : 'employees'} with an estimated net payout of {money(totals.net)}. It does not transfer funds.</p>
          </div>
          <div className="approval-actions">
            <button className="ghost-button" type="button" onClick={() => setConfirmingApproval(false)}>Cancel</button>
            <button className="primary-button" type="button" onClick={approveRun}>Confirm approval</button>
          </div>
        </div>
      )}

      <section className="payroll-summary-strip">
        <div><span>Employees</span><strong>{rows.length}</strong></div>
        <div><span>Gross payroll</span><strong>{money(totals.gross)}</strong></div>
        <div><span>Estimated deductions</span><strong>{money(totals.deductions)}</strong></div>
        <div><span>Estimated net pay</span><strong>{money(totals.net)}</strong></div>
      </section>

      {rows.length === 0 ? (
        <section className="card empty-content">
          <div className="empty-icon">+</div><h2>Add employees before reviewing payroll</h2>
          <p>Payroll calculations use the monthly base salary saved in each employee record.</p>
          <Link className="primary-button" to="/employees">Go to people <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <>
          <section className="card payroll-table-card">
            <div className="section-title-row table-title-row">
              <div><p className="eyebrow">Payroll register</p><h2>Employee pay calculations</h2></div>
              <span className="table-caption">Select a row to inspect deductions</span>
            </div>
            <div className="payroll-table-wrap">
              <table className="payroll-table">
                <thead><tr><th>Employee</th><th>Gross pay</th><th>Deductions</th><th>Net pay</th><th><span className="sr-only">Details</span></th></tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.employeeId} className={row.employeeId === selectedRow?.employeeId ? 'selected' : ''}>
                      <td><div className="employee-cell"><span className="avatar">{row.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{row.name}</strong><small>{row.position}</small></span></div></td>
                      <td>{money(row.gross)}</td>
                      <td>{money(row.totalDeductions + row.monthlyTax)}</td>
                      <td className="net-cell">{money(row.netPay)}</td>
                      <td><button className="table-action" type="button" aria-label={`View payroll details for ${row.name}`} onClick={() => setSelectedEmployeeId(row.employeeId)}>Details <span aria-hidden="true">→</span></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>{isApproved ? 'Approved payroll snapshot' : 'Monthly base salary calculations'}</span><span>{rows.length} {rows.length === 1 ? 'employee' : 'employees'}</span></div>
          </section>

          <div className="payroll-detail-grid">
            <section className="card selected-employee-card">
              <div className="section-title-row"><div><p className="eyebrow">Selected employee</p><h2>{selectedRow?.name || 'Employee details'}</h2></div><span className="status-pill neutral">{selectedRow?.position || 'No position'}</span></div>
              <div className="selected-pay-total"><span>Estimated net pay</span><strong>{money(selectedRow?.netPay)}</strong></div>
              <p className="note-text">Computed using the employee’s saved monthly base salary and the statutory rates configured in this workspace.</p>
            </section>
            <LiveTaxBreakdown salary={selectedRow?.salary ?? selectedRow?.gross ?? 0} />
          </div>
          <p className="payroll-disclaimer">This workspace calculates monthly base salary only. Attendance, overtime, loans, allowances, and other adjustments are not included. Review current statutory rules before using these figures for actual payroll.</p>
        </>
      )}
    </div>
  );
}
