export function removeCompanyFromState(state, companyId) {
  if (state.companies.length <= 1 || !state.companies.some((company) => company.id === companyId)) {
    return state;
  }

  const companies = state.companies.filter((company) => company.id !== companyId);
  const currentCompanyId = state.currentCompanyId === companyId
    ? companies[0].id
    : state.currentCompanyId;
  const employees = state.employees.filter((employee) => employee.companyId !== companyId);
  const selectedEmployee = employees.find((employee) =>
    employee.id === state.currentEmployeeId && employee.companyId === currentCompanyId
  );

  return {
    ...state,
    companies,
    employees,
    currentCompanyId,
    currentEmployeeId: selectedEmployee?.id
      ?? employees.find((employee) => employee.companyId === currentCompanyId)?.id
      ?? '',
    attendanceRecords: (state.attendanceRecords || []).filter((record) => record.companyId !== companyId),
    payrollRuns: (state.payrollRuns || []).filter((run) => run.companyId !== companyId)
  };
}
