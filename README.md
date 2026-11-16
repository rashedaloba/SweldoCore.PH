# SweldoPH Payroll Workspace

## Purpose

SweldoPH helps a Philippine business keep a simple employee roster, review monthly salary estimates, record an internal payroll approval, and download itemized pay statements as PDFs. It is intended for small-business owners, HR administrators, payroll staff, and employees who need to review their pay details.

## Scope and limitations

- Manage company details and employee names, positions, and monthly base salaries.
- Record daily employee attendance as present, absent, or on leave. For present days, enter clock-in, clock-out, and unpaid break minutes to calculate hours worked; review daily records and monthly per-employee totals. Employees can record their own attendance and see only their own daily and monthly results; Owner/HR can manage all employees. Older status-only records remain visible but are flagged until their work times are entered. Attendance is stored locally and does not change payroll calculations.
- Review SSS, PhilHealth, Pag-IBIG, and withholding-tax estimates by employee.
- Record one approved payroll snapshot per company and month, then download its payslips as PDFs.
- Export the selected-month payroll summary as CSV.
- Store workspace data in this browser's `localStorage`; it is not shared with other devices or users.
- Use the shared pay-month selector across the Dashboard, Attendance, Payroll, and Payslips. Attendance is recorded by day within that month; approved payroll snapshots and payslips can be reviewed by month.
- Switch companies and between owner, HR administrator, and employee workspace previews from the account menu. Owners can delete the selected company and its records in Company settings, but at least one company must remain. Profile switching is a UI preview, not authentication or a security boundary.
- The payroll calculator uses configured rates and monthly base salary only; recorded attendance does not change pay estimates. It does not process overtime, loans, allowances, government filings, or bank transfers.
- The workspace does not provide sign-in or server-side access control. Verify statutory rates and payroll details before using figures for real payroll.

The configured schedules are based on the [SSS 2025 employee contribution table](https://www.sss.gov.ph/sss-contribution-table/), [PhilHealth's 2025 premium advisory](https://www.philhealth.gov.ph/advisories/2025/PA2025-0002.pdf), [Pag-IBIG Circular 460](https://dmw.gov.ph/archives/v1/resources/dsms/DMW/ISN-EXT/2025/DMW-ADVISORY-37-2025.pdf), and the BIR's [monthly withholding tax table effective 2023 onward](https://bir-cdn.bir.gov.ph/local/pdf/Annex%20E%20RR%2011-2018.pdf). These sources should be checked for updates before a live payroll is run.

## User flow

1. Open the account menu to select a company or preview owner, HR administrator, or employee workflows.
2. Review or update employee records under **People**.
3. Select a pay month from the shared selector. **Attendance** records daily statuses and work times, deducts unpaid breaks, and shows a daily history plus monthly totals; an end time earlier than the start time is treated as an overnight shift. Employees can record and review only their selected profile's attendance in the preview.
4. Open **Payroll**, inspect each employee's gross pay and deductions for the selected month, then confirm approval to save that month's snapshot. Approval records a local workspace snapshot; it does not transfer funds.
5. Open **Payslips** to review or download a statement for the selected month. The employee preview shows only the selected employee's pay details; approved statements use the saved payroll snapshot. Unapproved historical previews use current salary records and are not reconstructed history.
6. Update business details under **Company settings** or export the payroll summary from **Overview**.

## Verification

The project was verified on 15 November 2026:

- `npm test` — 19 tests passed.
- `npm run build` — succeeded. Vite reports an advisory because the PDF-generation bundle exceeds 500 kB.

Run `npm audit` separately to check dependency advisories.

## Folder and file structure

```text
.
├── .gitignore
├── index.html                    # Vite HTML entry point
├── package.json                  # Scripts and dependencies
├── package-lock.json
├── public/
│   ├── company-logo.png
│   └── sweldo-logo.svg
├── README.md
├── src/
│   ├── App.jsx                   # Workspace shell and routes
│   ├── index.css
│   ├── main.jsx                  # React entry point
│   ├── components/               # Navigation, attendance, employee, payroll, and payslip UI
│   │   ├── AccountMenu.jsx
│   │   ├── AttendanceEmployeeRow.jsx
│   │   ├── AttendanceMonthlyResults.jsx
│   │   ├── CompanySwitcher.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── EmployeeModal.jsx
│   │   ├── LiveTaxBreakdown.jsx
│   │   ├── Navbar.jsx
│   │   ├── PayrollPeriodSelector.jsx
│   │   └── PrintablePayslip.jsx
│   ├── constants/                # Attendance values and Philippine tax rates
│   │   ├── attendance.js
│   │   └── phTaxRates.js
│   ├── context/
│   │   └── PayrollContext.jsx    # Workspace state and localStorage persistence
│   ├── pages/                    # Top-level workspace screens
│   │   ├── Attendance.jsx
│   │   ├── CompanySettings.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── PayslipView.jsx
│   │   └── RunPayroll.jsx
│   ├── services/                 # Business logic and focused tests
│   │   ├── attendanceManagement.js
│   │   ├── attendanceManagement.test.js
│   │   ├── companyManagement.js
│   │   ├── companyManagement.test.js
│   │   ├── payrollCalculator.js
│   │   ├── payrollCalculator.test.js
│   │   ├── payrollExport.js
│   │   ├── payrollExport.test.js
│   │   ├── workspaceStorage.js
│   │   └── workspaceStorage.test.js
│   ├── styles/                   # Screen, shell, responsive, and print styles
│   │   ├── attendance.css
│   │   ├── dashboard.css
│   │   ├── documents.css
│   │   ├── employees.css
│   │   ├── payroll.css
│   │   ├── print.css
│   │   ├── responsive.css
│   │   ├── shell.css
│   │   └── theme.css
│   └── utils/
│       ├── formatters.js
│       ├── payrollPeriod.js
│       └── payrollPeriod.test.js
└── vite.config.js
```

Generated `node_modules/` and `dist/` directories are omitted.

## Run locally

Use Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```
