import { useRef, useState } from 'react';
import { formatPHP as money, formatPayrollPeriod } from '../utils/formatters';

export default function PrintablePayslip({ employee, payrollData, company, period, approved = false }) {
  const payroll = payrollData;
  const payslipRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const periodLabel = formatPayrollPeriod(period);

  if (!employee || !payroll) return null;

  const downloadPayslip = async () => {
    if (!payslipRef.current) {
      setDownloadMessage('The payslip is not ready to download. Please try again.');
      return;
    }

    const employeeFilename = employee.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'employee';
    const periodFilename = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setIsDownloading(true);
    setDownloadMessage('');

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf()
        .set({
          margin: 12,
          filename: `payslip-${employeeFilename}-${periodFilename}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            ignoreElements: (element) => element.classList?.contains('no-print')
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.payslip-header', '.payslip-employee-block', '.payslip-net'] }
        })
        .from(payslipRef.current)
        .save();
      setDownloadMessage('PDF downloaded.');
    } catch (error) {
      console.error('Failed to generate payslip PDF.', error);
      setDownloadMessage("PDF download failed. Try again or use your browser's Print command to save as PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="payslip-printable" ref={payslipRef} aria-busy={isDownloading}>
      <div className="payslip-header">
        <div className="payslip-brand">
          <img className="payslip-brand-mark" src="/sweldo-logo.svg" alt="" />
          <div><h2>{company?.name || 'Company'}</h2><p>{company?.address}</p></div>
        </div>
        <div className="payslip-heading-meta"><span className={`status-pill ${approved ? 'approved' : 'pending'}`}>{approved ? 'Approved' : 'Estimate'}</span><strong>PAY STATEMENT</strong><span>{periodLabel}</span></div>
        <button className="primary-button no-print" type="button" onClick={downloadPayslip} disabled={isDownloading}>
          <span aria-hidden="true">↓</span> {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      </div>
      {downloadMessage && <p className="pdf-download-message no-print" role={downloadMessage.startsWith('PDF download failed') ? 'alert' : 'status'}>{downloadMessage}</p>}

      <div className="payslip-employee-block">
        <div><span>Employee</span><strong>{employee.name}</strong></div>
        <div><span>Position</span><strong>{employee.position}</strong></div>
        <div><span>Company TIN</span><strong>{company?.tin || '—'}</strong></div>
        <div><span>Pay period</span><strong>{periodLabel}</strong></div>
      </div>

      <div className="payslip-body">
        <div className="payslip-table">
          <div className="row payslip-table-head"><span>Earnings</span><strong>Amount</strong></div>
          <div className="row"><span>Monthly base salary</span><strong>{money(payroll.gross)}</strong></div>
          <div className="row payslip-subtotal"><span>Gross pay</span><strong>{money(payroll.gross)}</strong></div>
        </div>

        <div className="payslip-table">
          <div className="row payslip-table-head"><span>Employee deductions</span><strong>Amount</strong></div>
          <div className="row"><span>SSS contribution</span><strong>{money(payroll.sss)}</strong></div>
          <div className="row"><span>PhilHealth contribution</span><strong>{money(payroll.philHealth)}</strong></div>
          <div className="row"><span>Pag-IBIG contribution</span><strong>{money(payroll.pagIbig)}</strong></div>
          <div className="row"><span>Withholding tax estimate</span><strong>{money(payroll.monthlyTax)}</strong></div>
          <div className="row payslip-subtotal"><span>Total deductions</span><strong>{money(payroll.totalDeductions + payroll.monthlyTax)}</strong></div>
        </div>
      </div>

      <div className="payslip-net"><span>Net pay</span><strong>{money(payroll.netPay)}</strong></div>
      <div className="payslip-disclaimer">
        <strong>{approved ? 'Payroll workspace record' : 'Estimated pay statement'}</strong>
        <p>Based on monthly base salary and the statutory rates configured in this workspace. Attendance, overtime, loans, allowances, and other adjustments are not included.</p>
      </div>
    </article>
  );
}
