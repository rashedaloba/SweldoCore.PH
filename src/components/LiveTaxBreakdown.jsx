import { calculatePayroll } from '../services/payrollCalculator';
import { formatPHP } from '../utils/formatters';

export default function LiveTaxBreakdown({ salary = 0 }) {
  const payroll = calculatePayroll(salary);

  const items = [
    { label: 'SSS', value: payroll.sss },
    { label: 'PhilHealth', value: payroll.philHealth },
    { label: 'Pag-IBIG', value: payroll.pagIbig },
    { label: 'Withholding tax', value: payroll.monthlyTax }
  ];

  return (
    <div className="card tax-card">
      <div className="card-header-row">
        <div><p className="eyebrow">Monthly breakdown</p><h2>Estimated deductions</h2></div>
        <span className="status-pill neutral">Monthly</span>
      </div>

      <div className="tax-grid">
        {items.map((item) => (
          <div key={item.label} className="tax-stat">
            <span>{item.label}</span>
            <strong>{formatPHP(item.value)}</strong>
          </div>
        ))}
      </div>

      <div className="tax-summary">
        <div>
          <span>Gross pay</span>
          <strong>{formatPHP(payroll.gross)}</strong>
        </div>
        <div>
          <span>Net pay</span>
          <strong>{formatPHP(payroll.netPay)}</strong>
        </div>
      </div>
      <p className="note-text">Estimated from monthly base salary using the rates configured in this workspace.</p>
    </div>
  );
}
