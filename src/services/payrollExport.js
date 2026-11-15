import { calculatePayroll } from './payrollCalculator.js';
import { formatPayrollPeriod } from '../utils/formatters.js';

export function escapeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = typeof value === 'string' && /^[\t\r\n ]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function downloadPayrollSummary(company, employees, period) {
  const rows = [
    ['Payroll summary', company?.name || 'Company', formatPayrollPeriod(period)],
    ['Employee', 'Gross pay', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Withholding tax', 'Net pay'],
    ...employees.map((employee) => {
      const payroll = employee.monthlyTax != null ? employee : calculatePayroll(employee.salary);
      return [employee.name, payroll.gross, payroll.sss, payroll.philHealth, payroll.pagIbig, payroll.monthlyTax, payroll.netPay];
    })
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `payroll-summary-${period}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
