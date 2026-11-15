import { Link } from 'react-router-dom';
import { formatPHP } from '../utils/formatters';

export default function EmployeeDashboard({ employee, payroll }) {
  if (!employee) {
    return (
      <div className="page-section">
        <section className="card empty-content">
          <div className="empty-icon">♙</div>
          <h2>No employee account selected</h2>
          <p>Choose an employee account from the workspace menu to view its pay details.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Employee workspace</p>
          <h1>Hi, {employee.name.split(' ')[0]}</h1>
          <p className="page-description">Review your monthly pay estimate and open your latest statement.</p>
        </div>
        <Link className="primary-button" to="/payslip">View payslip <span aria-hidden="true">→</span></Link>
      </div>

      <section className="employee-pay-card">
        <div>
          <span className="inverse-label">Estimated monthly take-home pay</span>
          <strong>{formatPHP(payroll.netPay)}</strong>
          <small>Based on your current monthly base salary</small>
        </div>
        <div className="employee-pay-meta">
          <span>Monthly gross</span><strong>{formatPHP(payroll.gross)}</strong>
          <span>Estimated deductions</span><strong>{formatPHP(payroll.totalDeductions + payroll.monthlyTax)}</strong>
        </div>
      </section>

      <section className="card employee-info-card">
        <div className="section-title-row">
          <div><p className="eyebrow">Pay details</p><h2>How your estimate is calculated</h2></div>
          <span className="status-pill neutral">Monthly estimate</span>
        </div>
        <div className="payslip-table">
          <div className="row"><span>SSS contribution</span><strong>{formatPHP(payroll.sss)}</strong></div>
          <div className="row"><span>PhilHealth contribution</span><strong>{formatPHP(payroll.philHealth)}</strong></div>
          <div className="row"><span>Pag-IBIG contribution</span><strong>{formatPHP(payroll.pagIbig)}</strong></div>
          <div className="row"><span>Withholding tax estimate</span><strong>{formatPHP(payroll.monthlyTax)}</strong></div>
          <div className="row payslip-subtotal"><span>Estimated net pay</span><strong>{formatPHP(payroll.netPay)}</strong></div>
        </div>
        <p className="note-text">This estimate uses your monthly base salary. Attendance, overtime, loans, and other adjustments are not included.</p>
      </section>
    </div>
  );
}
