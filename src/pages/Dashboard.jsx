import { Link } from 'react-router-dom';
import { usePayroll } from '../context/PayrollContext';
import { calculatePayroll } from '../services/payrollCalculator';
import EmployeeDashboard from '../components/EmployeeDashboard';
import { downloadPayrollSummary } from '../services/payrollExport';
import { formatPHP as money, formatPayrollPeriod } from '../utils/formatters';

export default function Dashboard() {
  const { currentCompany, companyEmployees, currentRole, currentEmployee, currentPayrollRun, selectedPayrollPeriod } = usePayroll();
  const period = selectedPayrollPeriod;
  const periodLabel = formatPayrollPeriod(period);

  if (currentRole === 'EMPLOYEE') {
    return <EmployeeDashboard employee={currentEmployee} payroll={calculatePayroll(currentEmployee?.salary)} />;
  }

  const isApproved = currentPayrollRun?.status === 'approved';
  const payrollRows = isApproved && currentPayrollRun.employees?.length
    ? currentPayrollRun.employees
    : companyEmployees.map((employee) => ({ ...employee, ...calculatePayroll(employee.salary) }));
  const totals = payrollRows.reduce((acc, payroll) => {
    acc.gross += payroll.gross;
    acc.deductions += payroll.totalDeductions + payroll.monthlyTax;
    acc.net += payroll.netPay;
    return acc;
  }, { gross: 0, deductions: 0, net: 0 });
  const hasEmployees = companyEmployees.length > 0;
  const overviewAction = isApproved
    ? { to: '/run-payroll', label: 'View payroll run' }
    : hasEmployees
      ? { to: '/run-payroll', label: 'Review payroll' }
      : { to: '/employees', label: 'Add employees' };

  return (
    <div className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{currentCompany?.name}</p>
          <h1>Payroll overview</h1>
          <p className="page-description">Manage your people and review {periodLabel} payroll in one place.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={() => downloadPayrollSummary(currentCompany, payrollRows, period)}>
            <span aria-hidden="true">↓</span> Export CSV
          </button>
          <Link className="primary-button" to={overviewAction.to}>{overviewAction.label} <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <section className="cycle-card">
        <div className="cycle-card-main">
          <div className="cycle-label"><span className="cycle-dot" /> {periodLabel} payroll</div>
          <h2>{isApproved ? 'Payroll run approved' : hasEmployees ? 'Your payroll is ready for review' : 'Add employees to begin payroll'}</h2>
          <p>{isApproved ? 'The monthly payroll snapshot is saved. You can view the details or download individual payslips.' : hasEmployees ? `Review each employee’s pay calculation before approving the ${periodLabel} payroll run.` : 'Add employee records and monthly base salaries before reviewing payroll.'}</p>
          <Link className="cycle-link" to={overviewAction.to}>{isApproved ? 'Open payroll run' : hasEmployees ? 'Start review' : 'Go to people'} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="cycle-total">
          <span>Estimated net pay</span>
          <strong>{money(isApproved ? currentPayrollRun.totalNet : totals.net)}</strong>
          <small>{payrollRows.length} {payrollRows.length === 1 ? 'employee' : 'employees'} in this run</small>
        </div>
      </section>

      <section className="stats-grid" aria-label="Payroll totals">
        <article className="stat-card">
          <div className="stat-topline"><span>Team members</span></div>
          <strong>{companyEmployees.length}</strong>
          <small>In this company roster</small>
        </article>
        <article className="stat-card">
          <div className="stat-topline"><span>Gross payroll</span></div>
          <strong>{money(totals.gross)}</strong>
          <small>Monthly base salary total</small>
        </article>
        <article className="stat-card">
          <div className="stat-topline"><span>Estimated deductions</span></div>
          <strong>{money(totals.deductions)}</strong>
          <small>Contributions and withholding tax</small>
        </article>
        <article className="stat-card stat-card-accent">
          <div className="stat-topline"><span>Estimated net pay</span></div>
          <strong>{money(totals.net)}</strong>
          <small>{isApproved ? 'Saved in the approved run' : 'Before attendance and other adjustments'}</small>
        </article>
      </section>

      <div className="dashboard-bottom-grid">
        <section className="card workflow-card">
          <div className="section-title-row">
            <div><p className="eyebrow">Next steps</p><h2>Payroll workflow</h2></div>
            <span className={`status-pill ${isApproved ? 'approved' : hasEmployees ? 'neutral' : 'pending'}`}>{isApproved ? 'Approved' : hasEmployees ? 'Ready to review' : 'Needs setup'}</span>
          </div>
          <Link className="workflow-row" to="/employees">
            <span className="workflow-index complete">1</span>
            <span className="workflow-copy"><strong>Check the employee roster</strong><small>{companyEmployees.length} team members · monthly base salaries</small></span>
            <span className="workflow-arrow">→</span>
          </Link>
          <Link className="workflow-row" to="/run-payroll">
            <span className={`workflow-index ${isApproved ? 'complete' : 'current'}`}>2</span>
            <span className="workflow-copy"><strong>{isApproved ? 'Review approved payroll' : hasEmployees ? 'Review pay calculations' : 'Add employees before payroll review'}</strong><small>Confirm gross pay, deductions, and take-home pay</small></span>
            <span className="workflow-arrow">→</span>
          </Link>
          <Link className="workflow-row" to="/payslip">
            <span className={`workflow-index ${isApproved ? 'complete' : ''}`}>3</span>
            <span className="workflow-copy"><strong>Open or download payslips</strong><small>View an employee’s itemized pay statement</small></span>
            <span className="workflow-arrow">→</span>
          </Link>
          <p className="note-text">Figures are estimates based on monthly base salary only. Review company policy and current statutory rules before processing real payroll.</p>
        </section>

        <section className="card company-card">
          <div className="section-title-row"><div><p className="eyebrow">Company</p><h2>Business profile</h2></div><Link className="text-link" to="/company-settings">Edit</Link></div>
          <div className="company-name-mark">{currentCompany?.name?.slice(0, 1) || 'C'}</div>
          <strong className="company-card-name">{currentCompany?.name}</strong>
          <p>{currentCompany?.address}</p>
          <div className="company-contact"><span>{currentCompany?.email}</span><span>{currentCompany?.phone}</span></div>
          <div className="company-tin"><span>TIN</span><strong>{currentCompany?.tin}</strong></div>
        </section>
      </div>
    </div>
  );
}
