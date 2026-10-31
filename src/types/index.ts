export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'BDT';

export type UserRole = 'ADMIN' | 'LEAD_AUDITOR' | 'SENIOR_ACCOUNTANT' | 'COMPLIANCE_OFFICER' | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  permissions: {
    canRunReconciliation: boolean;
    canPostAdjustingEntries: boolean;
    canApproveStatements: boolean;
    canModifyCOAMapping: boolean;
    canExportXBRL: boolean;
    canSignOffAudit: boolean;
  };
}

export interface Entity {
  id: string;
  code: string;
  name: string;
  currency: CurrencyCode;
  country: string;
  taxId: string;
  ownershipPercentage: number;
  consolidationMethod: 'FULL' | 'EQUITY' | 'PROPORTIONAL';
}

export interface ErpConnection {
  id: string;
  name: string;
  type: 'SAP' | 'QUICKBOOKS' | 'TALLY' | 'XERO' | 'BANK_FEED' | 'MFS_BKASH';
  status: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'DISCONNECTED';
  lastSyncTime: string;
  latencyMs: number;
  recordsIngested: number;
  authType: 'OAUTH2' | 'API_KEY' | 'MT940_HOST' | 'ODBC';
  apiVersion: string;
  health: 'HEALTHY' | 'DEGRADED';
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  subcategory: string;
  standardMapping: string;
  confidenceScore: number;
  isMapped: boolean;
  notes?: string;
}

export interface JournalVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  entityId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  currency: CurrencyCode;
  sourceSystem: string;
  referenceDocId: string;
  status: 'POSTED' | 'PENDING_APPROVAL' | 'FLAGGED';
  createdBy: string;
  approvedBy?: string;
  hash: string;
}

export type MatchStatus = 'MATCHED' | 'UNMATCHED' | 'PROBABLE_MATCH';

export interface BankReconciliationItem {
  id: string;
  glDate: string;
  glRef: string;
  glDescription: string;
  glAmount: number; // positive = debit/receipt, negative = credit/payment
  bankDate: string;
  bankRef: string;
  bankDescription: string;
  bankAmount: number;
  variance: number;
  status: MatchStatus;
  matchScore: number; // 0 to 100
  matchRuleApplied?: string;
  suggestedAdjustment?: {
    type: 'BANK_FEE' | 'TIMING_DIFFERENCE' | 'FX_DIFFERENCE' | 'INTEREST_INCOME';
    amount: number;
    accountCode: string;
    description: string;
  };
}

export interface IntercompanyBalance {
  id: string;
  entityAId: string;
  entityAName: string;
  entityBId: string;
  entityBName: string;
  balanceInEntityACurrency: number;
  currencyA: CurrencyCode;
  balanceInEntityBCurrency: number;
  currencyB: CurrencyCode;
  fxConvertedDifferenceUSD: number;
  status: 'RECONCILED' | 'UNRECONCILED' | 'ELIMINATION_PENDING';
  transferPricingDocRef: string;
  eliminationVoucherReady: boolean;
}

export interface ThreeWayMatchLine {
  itemCode: string;
  description: string;
  poQty: number;
  poUnitPrice: number;
  grnQty: number;
  invoiceQty: number;
  invoiceUnitPrice: number;
  qtyVariance: number;
  priceVariance: number;
  isMatched: boolean;
}

export interface ThreeWayMatchRecord {
  id: string;
  vendorName: string;
  poNumber: string;
  grnNumber: string;
  invoiceNumber: string;
  date: string;
  totalPoAmount: number;
  totalInvoiceAmount: number;
  varianceAmount: number;
  status: 'MATCHED' | 'FLAGGED_MISMATCH' | 'WITHIN_TOLERANCE';
  toleranceThresholdPct: number;
  lines: ThreeWayMatchLine[];
  resolutionNotes?: string;
}

export type AnomalyType = 
  | 'BENFORD_OUTLIER'
  | 'DUPLICATE_PAYMENT'
  | 'SPLIT_TRANSACTION'
  | 'WEEKEND_OFF_HOURS'
  | 'ROUND_SUM_MANUAL_ENTRY';

export interface AnomalyAlert {
  id: string;
  type: AnomalyType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  detectedAt: string;
  amount: number;
  currency: CurrencyCode;
  entityId: string;
  entityName: string;
  impactedVoucher?: string;
  beneficiary?: string;
  confidenceScore: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  riskFactors: string[];
}

export interface ComplianceRuleCheck {
  id: string;
  framework: 'IFRS' | 'US-GAAP' | 'LOCAL_REGULATORY';
  standardRef: string;
  ruleTitle: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  testedAccounts: string[];
  findings: string;
  recommendation: string;
  lastEvaluated: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actorEmail: string;
  action: 'CREATE' | 'UPDATE' | 'RECONCILE' | 'ADJUST' | 'APPROVE' | 'EXPORT' | 'FLAG';
  module: 'BANK_REC' | 'INTERCOMPANY' | 'THREE_WAY' | 'FINANCIAL_STMT' | 'COA_MAPPING' | 'COMPLIANCE';
  entityId: string;
  description: string;
  previousHash: string;
  currentHash: string;
  metadata: Record<string, any>;
  isTamperVerified: boolean;
}

export type FinancialPeriod = 'Q4_2026' | 'Q3_2026' | 'FY_2025' | 'TTM_2026';

export interface AuditRatioMetric {
  id: string;
  name: string;
  category: 'LIQUIDITY' | 'SOLVENCY' | 'PROFITABILITY' | 'EFFICIENCY';
  formula: string;
  currentValue: number;
  priorValue: number;
  benchmark: number;
  unit: 'RATIO' | 'PERCENT' | 'DAYS';
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'ATTENTION_REQUIRED';
  auditorGuidance: string;
}

export interface BenfordVoucherSample {
  id: string;
  voucherNumber: string;
  vendor: string;
  amount: number;
  leadingDigit: number;
  accountCategory: string;
  date: string;
  flaggedReason?: string;
}

export interface StatementLineItem {
  id: string;
  accountCode: string;
  lineTitle: string;
  level: number; // 0 = category, 1 = subcategory, 2 = detail
  currentPeriod: number;
  priorPeriod: number;
  variancePercent: number;
  isSummary?: boolean;
  drilldownVouchers?: JournalVoucher[];
  entityBreakdown?: {
    'ENT-NA': number;
    'ENT-EMEA': number;
    'ENT-APAC': number;
    'ENT-BD': number;
    'ELIMINATIONS': number;
  };
}

export interface FinancialStatementsData {
  balanceSheet: {
    asOfDate: string;
    assets: StatementLineItem[];
    liabilities: StatementLineItem[];
    equity: StatementLineItem[];
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
  };
  incomeStatement: {
    period: string;
    revenue: StatementLineItem[];
    costOfGoodsSold: StatementLineItem[];
    grossProfit: number;
    operatingExpenses: StatementLineItem[];
    operatingIncome: number;
    taxesAndInterest: StatementLineItem[];
    netIncome: number;
  };
  cashFlow: {
    period: string;
    operatingActivities: StatementLineItem[];
    investingActivities: StatementLineItem[];
    financingActivities: StatementLineItem[];
    netCashChange: number;
    beginningCash: number;
    endingCash: number;
  };
  equityChanges: {
    shareCapitalBeginning: number;
    shareCapitalAdditions: number;
    shareCapitalEnding: number;
    retainedEarningsBeginning: number;
    netIncomeAddition: number;
    dividendDistributions: number;
    retainedEarningsEnding: number;
    otherReserves: number;
    totalEquityEnding: number;
  };
}

