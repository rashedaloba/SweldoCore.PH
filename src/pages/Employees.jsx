import { useMemo, useState } from 'react';
import EmployeeModal from '../components/EmployeeModal';
import { usePayroll } from '../context/PayrollContext';
import { formatPHP, formatPayrollPeriod } from '../utils/formatters';

export default function Employees() {
  const { currentCompany, currentRole, companyEmployees, currentPayrollRun, selectedPayrollPeriod, addEmployee, updateEmployee, deleteEmployee, currentCompanyId } = usePayroll();
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const filteredEmployees = useMemo(
    () =>
      companyEmployees.filter((employee) =>
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.position.toLowerCase().includes(search.toLowerCase())
      ),
    [companyEmployees, search]
  );

  const handleSave = (payload) => {
    const employeeData = {
      ...payload,
      companyId: currentCompanyId,
      id: selectedEmployee?.id || payload.id || crypto.randomUUID()
    };

    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }

    setOpenModal(false);
    setSelectedEmployee(null);
  };

  if (currentRole === 'EMPLOYEE') {
    return (
      <div className="page-section">
        <section className="card access-card">
          <div className="access-icon">♙</div>
          <p className="eyebrow">People directory</p>
          <h1>Administrator access required</h1>
          <p className="page-description">Employee records and company-wide salary information are only available to the owner and HR administrator.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{currentCompany?.name}</p>
          <h1>People</h1>
          <p className="page-description">Manage employee profiles and monthly base salaries used in payroll estimates.</p>
        </div>
        {(currentRole === 'OWNER' || currentRole === 'HR_ADMIN') && (
          <button className="primary-button" onClick={() => setOpenModal(true)}>
            Add employee <span aria-hidden="true">+</span>
          </button>
        )}
      </div>

      <div className="toolbar card">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or position"
          aria-label="Search employees by name or position"
        />
        <span className="filter-pill">{filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}</span>
      </div>

      {currentPayrollRun?.status === 'approved' && (
        <div className="snapshot-notice" role="status">
          <strong>{formatPayrollPeriod(currentPayrollRun.period || selectedPayrollPeriod)} payroll is approved.</strong>
          Roster edits affect future calculations; this saved payroll snapshot and its payslips will remain unchanged.
        </div>
      )}

      {filteredEmployees.length > 0 && (
        <div className="employee-table-heading"><span>Employee</span><span>Monthly base salary</span><span>Roster and actions</span></div>
      )}
      <div className="list-table">
        {filteredEmployees.map((employee) => (
          <div className="table-row" key={employee.id}>
            <div className="employee-meta">
              <div className="avatar">{employee.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div>
                <strong>{employee.name}</strong>
                <small>{employee.position}</small>
              </div>
            </div>

            <div className="employee-detail">
              <div className="detail-label">Monthly base</div>
              <div className="detail-value">{formatPHP(employee.salary)}</div>
            </div>

            <div className="row-actions">
              <span className="status-pill neutral">On roster</span>
              {(currentRole === 'OWNER' || currentRole === 'HR_ADMIN') && (
                <>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setOpenModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="danger-button" onClick={() => {
                    if (window.confirm(`Remove ${employee.name} from this company roster?`)) deleteEmployee(employee.id);
                  }}>
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="card empty-content">
          <div className="empty-icon">⌕</div>
          <h2>{companyEmployees.length ? 'No employees match your search' : 'Your employee roster is empty'}</h2>
          <p>{companyEmployees.length ? 'Try another name or position.' : 'Add an employee to start building your roster and preparing payroll.'}</p>
          {!companyEmployees.length && (currentRole === 'OWNER' || currentRole === 'HR_ADMIN') && <button className="primary-button" onClick={() => setOpenModal(true)}>Add first employee <span aria-hidden="true">→</span></button>}
        </div>
      )}

      <EmployeeModal
        open={openModal}
        employee={selectedEmployee}
        onClose={() => {
          setOpenModal(false);
          setSelectedEmployee(null);
        }}
        onSave={handleSave}
        companyId={currentCompanyId}
      />
    </div>
  );
}
