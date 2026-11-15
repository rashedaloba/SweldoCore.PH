import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePayroll } from '../context/PayrollContext';

export default function CompanySettings() {
  const {
    companies,
    currentCompany,
    companyEmployees,
    payrollRuns,
    updateCompany,
    deleteCompany,
    currentRole
  } = usePayroll();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: currentCompany?.name || '',
    address: currentCompany?.address || '',
    tin: currentCompany?.tin || '',
    email: currentCompany?.email || '',
    phone: currentCompany?.phone || ''
  });

  useEffect(() => {
    setForm({
      name: currentCompany?.name || '',
      address: currentCompany?.address || '',
      tin: currentCompany?.tin || '',
      email: currentCompany?.email || '',
      phone: currentCompany?.phone || ''
    });
    setSaved(false);
  }, [currentCompany?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateCompany(currentCompany.id, form);
    setSaved(true);
  };

  const handleDelete = () => {
    if (companies.length <= 1) return;

    const companyRuns = payrollRuns.filter((run) => run.companyId === currentCompany.id);
    const confirmed = window.confirm(
      `Delete ${currentCompany.name}? This also permanently removes ${companyEmployees.length} employee record(s) and ${companyRuns.length} saved payroll run(s) for this company. This cannot be undone.`
    );
    if (!confirmed) return;

    deleteCompany(currentCompany.id);
    navigate('/dashboard', { replace: true });
  };

  if (currentRole !== 'OWNER') {
    return (
      <div className="page-section">
        <section className="card access-card">
          <div className="access-icon">⌑</div>
          <p className="eyebrow">Company settings</p>
          <h1>Owner access required</h1>
          <p className="page-description">Company registration details can only be changed by the business owner.</p>
          <Link className="primary-button" to="/dashboard">Return to overview <span aria-hidden="true">→</span></Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Business settings</p>
          <h1>Company profile</h1>
          <p className="page-description">Keep your registered business details up to date for employee and payroll records.</p>
        </div>
      </div>

      <form className="card settings-form" onSubmit={handleSubmit}>
        <div className="form-section-heading"><h2>Business information</h2><p>These details identify your company in this workspace.</p></div>
        <div className="settings-grid">
          <label>
            Legal company name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            TIN
            <input name="tin" value={form.tin} onChange={handleChange} />
          </label>
          <label className="wide">
            Business address
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label>
            Email address
            <input name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Phone number
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
        </div>

        <div className="form-actions">
          {saved && <span className="save-confirmation" role="status">Changes saved</span>}
          <button type="submit" className="primary-button">Save company details <span aria-hidden="true">→</span></button>
        </div>
      </form>

      <section className="card danger-zone">
        <div>
          <h2>Delete company</h2>
          <p>
            Deleting this company also removes its employee records and saved payroll runs.
            {companies.length <= 1 && ' At least one company must remain in the workspace.'}
          </p>
        </div>
        <button
          type="button"
          className="danger-button"
          disabled={companies.length <= 1}
          onClick={handleDelete}
        >
          Delete {currentCompany.name}
        </button>
      </section>
    </div>
  );
}
