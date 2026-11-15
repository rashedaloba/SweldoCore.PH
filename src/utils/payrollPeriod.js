export function getCurrentPayrollPeriod(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isValidPayrollPeriod(period) {
  return typeof period === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
}
