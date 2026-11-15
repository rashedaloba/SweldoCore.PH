import { useEffect, useRef, useState } from 'react';

const emptyForm = {
  name: '',
  position: '',
  salary: '',
  companyId: ''
};

export default function EmployeeModal({ open, onClose, onSave, employee, companyId }) {
  const [form, setForm] = useState({ ...emptyForm, companyId });
  const modalRef = useRef(null);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || '',
        position: employee.position || '',
        salary: employee.salary || '',
        companyId: employee.companyId || companyId
      });
    } else {
      setForm({ ...emptyForm, companyId });
    }
  }, [employee, companyId, open]);

  useEffect(() => {
    if (!open) return undefined;

    modalRef.current?.querySelector('input')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;

      const focusable = modalRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      salary: Number(form.salary)
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="employee-dialog-title">{employee ? 'Edit employee' : 'Add employee'}</h3>
          <button className="ghost-button" type="button" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Position
            <input name="position" value={form.position} onChange={handleChange} required />
          </label>

          <label>
            Monthly salary (PHP)
            <input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={handleChange} required />
          </label>

          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
