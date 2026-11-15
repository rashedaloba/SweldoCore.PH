export function formatPHP(amount) {
  return `₱${Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatPayrollPeriod(period) {
  const date = period ? new Date(`${period}-01T12:00:00`) : new Date();
  return date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}
