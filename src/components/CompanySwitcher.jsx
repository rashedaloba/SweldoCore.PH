import { usePayroll } from '../context/PayrollContext';

export default function CompanySwitcher({ onChange }) {
  const { companies, currentCompanyId, setCurrentCompany } = usePayroll();

  return (
    <label className="header-selector company-selector">
      <span className="selector-label">Company</span>
      <select
        aria-label="Company"
        value={currentCompanyId}
        onChange={(event) => {
          setCurrentCompany(event.target.value);
          onChange?.();
        }}
      >
        {companies.map((company) => (
          <option value={company.id} key={company.id}>{company.name}</option>
        ))}
      </select>
    </label>
  );
}
