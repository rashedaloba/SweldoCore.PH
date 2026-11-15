import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayroll } from '../context/PayrollContext';
import CompanySwitcher from './CompanySwitcher';

const profiles = [
  { role: 'OWNER', label: 'Company owner', detail: 'Manage company, attendance, and payroll' },
  { role: 'HR_ADMIN', label: 'HR administrator', detail: 'Manage people, attendance, and payroll' },
  { role: 'EMPLOYEE', label: 'Employee', detail: 'Record attendance and view personal pay' }
];

export default function AccountMenu() {
  const {
    currentRole,
    setCurrentRole,
    currentEmployee,
    companyEmployees,
    setCurrentEmployee,
    currentCompany
  } = usePayroll();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const employeeProfile = currentRole === 'EMPLOYEE' ? currentEmployee : null;
  const displayName = employeeProfile?.name
    || (currentRole === 'HR_ADMIN' ? 'HR administrator' : currentRole === 'EMPLOYEE' ? 'Employee' : 'Company owner');
  const initials = displayName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const currentProfileLabel = profiles.find((profile) => profile.role === currentRole)?.label || 'Workspace profile';

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const chooseProfile = (role) => {
    setCurrentRole(role);
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        className="account-menu-trigger"
        ref={triggerRef}
        type="button"
        aria-label={`Workspace profile: ${currentProfileLabel}. Open profile menu`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="workspace-account-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="profile-avatar">{initials}</span>
        <span className="profile-copy">
          <strong>{displayName}</strong>
          <small>{currentProfileLabel}</small>
        </span>
        <span className="select-chevron" aria-hidden="true">⌄</span>
      </button>

      {open && (
        <section
          className="account-panel"
          id="workspace-account-panel"
          role="dialog"
          aria-label="Workspace profile and account actions"
        >
          <div className="account-panel-heading">
            <span className="profile-avatar large">{initials}</span>
            <div>
              <strong>{displayName}</strong>
              <small>{currentCompany?.name}</small>
            </div>
          </div>

          {currentRole !== 'EMPLOYEE' && (
            <CompanySwitcher onChange={() => setOpen(false)} />
          )}

          <div className="account-section">
            <p className="account-section-title">Switch workspace profile</p>
            {profiles.map((profile) => (
              <button
                className={`profile-option ${currentRole === profile.role ? 'selected' : ''}`}
                key={profile.role}
                type="button"
                aria-pressed={currentRole === profile.role}
                onClick={() => chooseProfile(profile.role)}
              >
                <span className="profile-option-avatar">{profile.label.slice(0, 1)}</span>
                <span className="profile-option-copy"><strong>{profile.label}</strong><small>{profile.detail}</small></span>
                {currentRole === profile.role && <span className="profile-check" aria-label="Current profile">✓</span>}
              </button>
            ))}
          </div>

          {currentRole === 'EMPLOYEE' && (
            <label className="account-employee-picker">
              <span>Employee account</span>
              <select
                aria-label="Employee account"
                value={currentEmployee?.id || ''}
                onChange={(event) => setCurrentEmployee(event.target.value)}
                disabled={!companyEmployees.length}
              >
                {companyEmployees.length ? companyEmployees.map((employee) => (
                  <option value={employee.id} key={employee.id}>{employee.name}</option>
                )) : <option value="">No employee profiles in this company</option>}
              </select>
            </label>
          )}

          <div className="account-actions">
            {currentRole !== 'EMPLOYEE' && (
              <Link to="/employees" onClick={() => setOpen(false)}>
                <span className="account-action-icon" aria-hidden="true">♙</span>
                Manage people
                <span className="account-action-arrow" aria-hidden="true">›</span>
              </Link>
            )}
            {currentRole !== 'EMPLOYEE' && (
              <Link to="/payslip" onClick={() => setOpen(false)}>
                <span className="account-action-icon" aria-hidden="true">▤</span>
                Payslips
                <span className="account-action-arrow" aria-hidden="true">›</span>
              </Link>
            )}
            {currentRole === 'OWNER' && (
              <Link to="/company-settings" onClick={() => setOpen(false)}>
                <span className="account-action-icon" aria-hidden="true">⚙</span>
                Company settings
                <span className="account-action-arrow" aria-hidden="true">›</span>
              </Link>
            )}
            {currentRole === 'EMPLOYEE' && (
              <Link to="/payslip" onClick={() => setOpen(false)}>
                <span className="account-action-icon" aria-hidden="true">▤</span>
                My payslip
                <span className="account-action-arrow" aria-hidden="true">›</span>
              </Link>
            )}
          </div>

          <p className="account-footnote">Workspace data is saved in this browser. Profile switching is for preview and does not provide sign-in or access control.</p>
        </section>
      )}
    </div>
  );
}
