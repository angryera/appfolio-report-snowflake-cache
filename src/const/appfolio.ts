import { SnowFlakeInsertingMethod } from "./enum";

const AppFolioReports = {
  // Correct params
  GeneralLedger: {
    name: "general_ledger",
    insertMethod: SnowFlakeInsertingMethod.BulkInsertV2,
    params: {
      property_visibility: "all",
      project_visibility: "all",
      accounting_basis: "accrual",
      posted_on_from: "01/01/2024",
      // posted_on_to: "03/01/2024",
      posted_on_to: new Date().toLocaleDateString("en-US"), // Dynamically sets today's date in MM/DD/YYYY format
    },
  },
  // Correct params
  RentRoll: {
    name: "rent_roll",
    insertMethod: SnowFlakeInsertingMethod.BulkInsert,
    params: {
      unit_visibility: "all",
      property_visibility: "all",
      as_of_to: new Date().toLocaleDateString("en-US"),
      non_revenue_units: "1",
    },
  },
  BudgetDetail: {
    name: "property_budget",
    insertMethod: SnowFlakeInsertingMethod.BulkInsert,
    params: {
      period_from: "Jan 2024",
      period_to: "Dec 2025",
      property_visibility: "all",
    },
  },
  // Correct params
  IncomeStatement: {
    name: "income_statement",
    insertMethod: SnowFlakeInsertingMethod.BulkInsert,
    params: {
      property_visibility: "all",
      accounting_basis: "Accrual",
      level_of_detail: "detail_view",
      include_zero_balance_gl_accounts: "1",
      posted_on_to: `${new Date().getFullYear()}-12`,
    },
  },
  // Correct params
  TenantTickler: {
    name: "tenant_tickler",
    insertMethod: SnowFlakeInsertingMethod.BulkInsert,
    params: {
      property_visibility: "all",
      occurred_on_from: "01/01/2024",
      occurred_on_to: new Date().toLocaleDateString("en-US"),
    },
  },
  // Correct params
  UnitVacancy: {
    name: "unit_vacancy",
    insertMethod: SnowFlakeInsertingMethod.BulkInsert,
    params: {
      unit_visibility: "all",
      property_visibility: "all",
    },
  },
};

export default AppFolioReports;
