import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PayrollProvider, usePayroll } from './context/PayrollContext';
import Navbar from './components/Navbar';
import AccountMenu from './components/AccountMenu';
import PayrollPeriodSelector from './components/PayrollPeriodSelector';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import RunPayroll from './pages/RunPayroll';
import PayslipView from './pages/PayslipView';
import CompanySettings from './pages/CompanySettings';

const routeNames = {
  '/dashboard': 'Overview',
  '/employees': 'People',
  '/attendance': 'Attendance',
  '/run-payroll': 'Payroll',
  '/payslip': 'Payslips',
  '/company-settings': 'Company settings'
};

function Workspace() {
  const location = useLocation();
  const { currentCompany, currentRole, storageNotice } = usePayroll();
  const isPeriodPage = ['/attendance', '/payslip'].includes(location.pathname)
    || (location.pathname === '/run-payroll' && currentRole !== 'EMPLOYEE')
    || (location.pathname === '/dashboard' && currentRole !== 'EMPLOYEE');
  const showPeriodSelector = isPeriodPage;

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>{currentCompany?.name || 'Company'}</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{routeNames[location.pathname] || 'Workspace'}</strong>
          </div>
          <div className={`header-controls ${showPeriodSelector ? 'has-period-selector' : ''}`}>
            {showPeriodSelector && <PayrollPeriodSelector />}
            <AccountMenu />
          </div>
        </header>
        <main className="page-container">
          {storageNotice && <div className="storage-warning" role="alert">{storageNotice}</div>}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/run-payroll" element={<RunPayroll />} />
            <Route path="/payslip" element={<PayslipView />} />
            <Route path="/company-settings" element={<CompanySettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <PayrollProvider>
      <Workspace />
    </PayrollProvider>
  );
}

export default App;
