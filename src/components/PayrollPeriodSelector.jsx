import { usePayroll } from '../context/PayrollContext';

export default function PayrollPeriodSelector() {
  const { selectedPayrollPeriod, setSelectedPayrollPeriod } = usePayroll();

  return (
    <label className="pay-period-selector">
      <span className="selector-label">Pay month</span>
      <input
        type="month"
        aria-label="Shared pay month"
        value={selectedPayrollPeriod}
        onChange={(event) => {
          if (event.target.value) setSelectedPayrollPeriod(event.target.value);
        }}
      />
    </label>
  );
}
