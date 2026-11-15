import { Link, NavLink } from 'react-router-dom';
import { usePayroll } from '../context/PayrollContext';

const navGroups = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/dashboard', label: 'Overview', roles: ['OWNER', 'HR_ADMIN', 'EMPLOYEE'], icon: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6' },
      { to: '/employees', label: 'People', roles: ['OWNER', 'HR_ADMIN'], icon: 'M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16 3.2a3.5 3.5 0 0 1 0 6.8M17 14h.5a4.5 4.5 0 0 1 4.5 4.5V20' },
      { to: '/attendance', label: 'Attendance', roles: ['OWNER', 'HR_ADMIN', 'EMPLOYEE'], icon: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 13h3M8 17h3M14 13h2' }
    ]
  },
  {
    label: 'PAYROLL',
    items: [
      { to: '/run-payroll', label: 'Payroll', roles: ['OWNER', 'HR_ADMIN'], icon: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h4' },
      { to: '/payslip', label: 'Payslips', roles: ['OWNER', 'HR_ADMIN', 'EMPLOYEE'], icon: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7' }
    ]
  },
  {
    label: 'BUSINESS',
    items: [
      { to: '/company-settings', label: 'Company settings', roles: ['OWNER'], icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM19.4 15l1.1.8-1.5 2.6-1.3-.5a7.7 7.7 0 0 1-1.5.9l-.2 1.4h-3l-.2-1.4a7.7 7.7 0 0 1-1.5-.9l-1.3.5-1.5-2.6 1.1-.8a7 7 0 0 1 0-1.8l-1.1-.8L8 9.8l1.3.5a7.7 7.7 0 0 1 1.5-.9l.2-1.4h3l.2 1.4a7.7 7.7 0 0 1 1.5.9l1.3-.5 1.5 2.6-1.1.8a7 7 0 0 1 0 1.8Z' }
    ]
  }
];

function NavIcon({ path }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={path} /></svg>;
}

export default function Navbar() {
  const { currentRole } = usePayroll();
  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(currentRole)) }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="app-sidebar">
      <Link className="brand-wrap" to="/dashboard" aria-label="SweldoPH home">
        <img className="brand-mark" src="/sweldo-logo.svg" alt="" />
        <div className="brand-copy">
          <div className="brand-name">SweldoPH</div>
          <div className="brand-subtitle">Payroll workspace</div>
        </div>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        {visibleGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="sidebar-label">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <NavIcon path={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-footnote">
        <span className="footnote-dot" />
        <div><strong>Saved in this browser</strong><small>Company records, attendance, and pay runs</small></div>
      </div>
    </aside>
  );
}
