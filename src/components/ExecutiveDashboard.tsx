import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  Play,
  Sliders,
  ShieldCheck,
  Building,
  Calendar,
  Sparkles,
  Info,
  FileCheck2,
  Database,
  BarChart3,
  ListFilter
} from 'lucide-react';
import { CurrencyCode, FinancialPeriod } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  ANOMALY_ALERTS,
  BANK_RECONCILIATION_DATA,
  THREE_WAY_MATCH_RECORDS,
  AUDIT_RATIOS,
  ENTITIES,
  getFinancialStatementsForEntityAndPeriod
} from '../data/mockData';
import { FinancialDriftChart } from './FinancialDriftChart';

interface ExecutiveDashboardProps {
  selectedCurrency: CurrencyCode;
  selectedEntityId: string;
  selectedPeriod: FinancialPeriod;
  onNavigateToTab: (tab: string) => void;
  onRunReconciliation: () => void;
  isReconciling: boolean;
  reconciliationProgress: number;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  selectedCurrency,
  selectedEntityId,
  selectedPeriod,
  onNavigateToTab,
  onRunReconciliation,
  isReconciling,
  reconciliationProgress,
}) => {
  const [showEngineConfig, setShowEngineConfig] = useState<boolean>(false);
  const [wireFeeTolerance, setWireFeeTolerance] = useState<number>(50);
  const [dateToleranceDays, setDateToleranceDays] = useState<number>(3);
  const [fuzzyThreshold, setFuzzyThreshold] = useState<number>(85);

  // Clean segmented executive panel tab
  const [executiveViewTab, setExecutiveViewTab] = useState<'discrepancies' | 'ratios' | 'three_way' | 'integrations'>('discrepancies');

  const activeEntity = ENTITIES.find((e) => e.id === selectedEntityId) || ENTITIES[0];
  const dynamicFS = getFinancialStatementsForEntityAndPeriod(selectedEntityId, selectedPeriod);

  const openAlerts = ANOMALY_ALERTS.filter((a) => a.status !== 'RESOLVED');
  const matchedCount = BANK_RECONCILIATION_DATA.filter((i) => i.status === 'MATCHED').length;
  const totalRecItems = BANK_RECONCILIATION_DATA.length;
  const recVelocityPct = Math.round((matchedCount / totalRecItems) * 100);

  const periodDisplayLabels: Record<FinancialPeriod, string> = {
    Q4_2026: 'Q4 2026 (YTD Oct 31)',
    Q3_2026: 'Q3 2026 (Ended Sep 30)',
    FY_2025: 'FY 2025 (Annual Audited)',
    TTM_2026: 'Trailing 12 Months (TTM)',
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex-wrap">
            <span>Corporate Close Cycle</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{periodDisplayLabels[selectedPeriod]}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Audit In-Progress
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{activeEntity.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Financial Health &amp; Audit Reconciliation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Real-time ledger consolidation across 4 international subsidiaries including Bangladesh Dhaka R&amp;D Hub, automated ERP sync feeds, three-way procurement matching, and algorithmic fraud detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEngineConfig(!showEngineConfig)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Matching Calibration</span>
          </button>

          <button
            onClick={onRunReconciliation}
            disabled={isReconciling}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all whitespace-nowrap shadow-sm active:scale-98 ${
              isReconciling
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>{isReconciling ? `Matching Ledgers (${reconciliationProgress}%)` : 'Run Reconciliation Engine'}</span>
          </button>
        </div>
      </div>

      {/* Bangladesh Subsidiary Entity Highlight Card when ENT-BD is Selected */}
      {selectedEntityId === 'ENT-BD' && (
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-300 dark:border-emerald-700/80 rounded-xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                ৳
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Meridian Technologies Bangladesh Ltd. (Dhaka Center)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700">
                    NBR Mushak 6.3 Registered
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-300 dark:border-teal-700">
                    BASIS ITES Member
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Gulshan-2, Dhaka · TIN: <strong className="font-mono">BD-TIN-88910482</strong> · BIN: <strong className="font-mono">001928374-0101</strong> · FX Currency: <strong>৳ BDT (Bangladeshi Taka)</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-slate-500 block">bKash Payouts</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">124 Instant IPN</span>
              </div>
              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-slate-500 block">BRAC / SCB BEFTN</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">৳50.61M Repatriated</span>
              </div>
              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-slate-500 block">NBR VAT &amp; VDS</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Mushak 6.3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engine Parameter Calibration Drawer */}
      {showEngineConfig && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tier Reconciliation Engine Parameters</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Dynamic Algorithm Calibration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-medium block">
                Wire Fee Intermediary Variance ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={wireFeeTolerance}
                  onChange={(e) => setWireFeeTolerance(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="font-mono font-bold w-12 text-right">${wireFeeTolerance}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Amounts differing up to ${wireFeeTolerance} are routed to automated wire charge AJE suggestions.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-medium block">
                Date Float Window (&plusmn; Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={dateToleranceDays}
                  onChange={(e) => setDateToleranceDays(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="font-mono font-bold w-12 text-right">&plusmn;{dateToleranceDays}d</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Permits ACH/Fedwire clearing latency across weekend bank cutoffs.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-medium block">
                Fuzzy Beneficiary Text Match (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="70"
                  max="99"
                  step="1"
                  value={fuzzyThreshold}
                  onChange={(e) => setFuzzyThreshold(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="font-mono font-bold w-12 text-right">{fuzzyThreshold}%</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Levenshtein string distance threshold for matching bank wire descriptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar when Reconciling */}
      {isReconciling && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-900 dark:text-emerald-200 mb-1.5">
            <span>
              {reconciliationProgress < 30
                ? 'Step 1/4: Ingesting & normalizing GL lines from SAP, QuickBooks, and bKash API...'
                : reconciliationProgress < 60
                ? 'Step 2/4: Executing exact 1:1 token & amount match...'
                : reconciliationProgress < 90
                ? 'Step 3/4: Evaluating subset-sum wire bundling and intermediary fee variance...'
                : 'Step 4/4: Generating SHA-256 block hash for reconciled ledger batch...'}
            </span>
            <span className="font-mono tabular-nums font-bold">{reconciliationProgress}%</span>
          </div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-200"
              style={{ width: `${reconciliationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. High-Level Financial KPI Grid with Vibrant Domain Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Revenue */}
        <div className="p-4 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/15 dark:to-transparent bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/70 border-t-4 border-t-emerald-500 rounded-xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Revenue ({activeEntity.code})</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(dynamicFS.incomeStatement.revenue.reduce((s, r) => s + r.currentPeriod, 0), selectedCurrency, true)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +23.2%
            </span>
            <span aria-hidden="true">·</span>
            <span>Period: {selectedPeriod.replace('_', ' ')}</span>
          </div>
        </div>

        {/* KPI 2: Operating Net Income */}
        <div className="p-4 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/15 dark:to-transparent bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 border-t-4 border-t-indigo-500 rounded-xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Net Operating Income</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(dynamicFS.incomeStatement.netIncome, selectedCurrency, true)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              {((dynamicFS.incomeStatement.operatingIncome / Math.max(1, dynamicFS.incomeStatement.revenue.reduce((s, r) => s + r.currentPeriod, 0))) * 100).toFixed(1)}% EBIT Margin
            </span>
            <span aria-hidden="true">·</span>
            <span>IFRS / GAAP</span>
          </div>
        </div>

        {/* KPI 3: Cash & Equivalents */}
        <div className="p-4 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent dark:from-teal-500/15 dark:to-transparent bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/70 border-t-4 border-t-teal-500 rounded-xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Cash &amp; Treasury Liquid</span>
            <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(dynamicFS.cashFlow.endingCash, selectedCurrency, true)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-teal-600 dark:text-teal-400 font-semibold">Quick: 1.84x</span>
            <span aria-hidden="true">·</span>
            <span>Current: 2.14x</span>
          </div>
        </div>

        {/* KPI 4: Reconciliation Velocity */}
        <div className="p-4 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent dark:from-violet-500/15 dark:to-transparent bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800/70 border-t-4 border-t-violet-500 rounded-xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Auto-Match Velocity</span>
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {recVelocityPct}%
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">{matchedCount} matched</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {totalRecItems - matchedCount} need review
            </span>
          </div>
        </div>
      </div>

      {/* 3. Centerpiece: D3 Financial Drift Analysis Chart */}
      <FinancialDriftChart
        selectedCurrency={selectedCurrency}
        selectedEntityId={selectedEntityId}
        selectedPeriod={selectedPeriod}
      />

      {/* 4. Structured Executive Workflows (Clean Segmented Tab System) */}
      <div className="space-y-4">
        {/* Navigation Tabs for Executive Workflows */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setExecutiveViewTab('discrepancies')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                executiveViewTab === 'discrepancies'
                  ? 'bg-amber-600 text-white font-bold shadow-xs ring-2 ring-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${executiveViewTab === 'discrepancies' ? 'text-white' : 'text-amber-500'}`} />
              <span>Priority Discrepancies ({openAlerts.length})</span>
            </button>

            <button
              onClick={() => setExecutiveViewTab('ratios')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                executiveViewTab === 'ratios'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${executiveViewTab === 'ratios' ? 'text-white' : 'text-emerald-500'}`} />
              <span>Analytical Procedures (ISA 520)</span>
            </button>

            <button
              onClick={() => setExecutiveViewTab('three_way')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                executiveViewTab === 'three_way'
                  ? 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <FileCheck2 className={`w-3.5 h-3.5 ${executiveViewTab === 'three_way' ? 'text-white' : 'text-blue-500'}`} />
              <span>Three-Way Procurement Matching</span>
            </button>

            <button
              onClick={() => setExecutiveViewTab('integrations')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                executiveViewTab === 'integrations'
                  ? 'bg-purple-600 text-white font-bold shadow-xs ring-2 ring-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${executiveViewTab === 'integrations' ? 'text-white' : 'text-purple-500'}`} />
              <span>ERP &amp; Bank Feeds Health</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Executive Audit Cockpit
          </span>
        </div>

        {/* View 1: Priority Discrepancies */}
        {executiveViewTab === 'discrepancies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {alert.severity} RISK
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{alert.entityName}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{alert.detectedAt}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(alert.amount, selectedCurrency)}
                  </span>
                  <button
                    onClick={() => onNavigateToTab('audit')}
                    className="px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors"
                  >
                    Investigate in Audit Hub &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 2: Substantive Analytical Procedures & Ratios */}
        {executiveViewTab === 'ratios' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AUDIT_RATIOS.map((ratio) => {
              const isOptimal = ratio.status === 'OPTIMAL';
              const isAttention = ratio.status === 'ATTENTION_REQUIRED';

              return (
                <div
                  key={ratio.id}
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-500 uppercase">{ratio.category}</span>
                      <span
                        className={`font-bold ${
                          isOptimal
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isAttention
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {ratio.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {ratio.name}
                    </div>

                    <div className="mt-2 flex items-baseline gap-2 font-mono">
                      <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {ratio.currentValue}
                        {ratio.unit === 'PERCENT' ? '%' : ratio.unit === 'DAYS' ? ' d' : 'x'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Prior: {ratio.priorValue}
                        {ratio.unit === 'PERCENT' ? '%' : ratio.unit === 'DAYS' ? ' d' : 'x'}
                      </span>
                      <span className="text-xs text-slate-400">
                        (Target: &gt;{ratio.benchmark})
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    {ratio.auditorGuidance}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 3: Three-Way Procurement Matching */}
        {executiveViewTab === 'three_way' && (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Three-Way Procurement Matching (PO vs GRN vs Invoice)
                </h3>
                <p className="text-xs text-slate-500">
                  Automated line-item validation before accounts payable disbursement
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('reconciliation')}
                className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1"
              >
                <span>Full Ledger View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 font-medium">Vendor</th>
                    <th className="py-2 font-medium">PO Ref</th>
                    <th className="py-2 font-medium">GRN Ref</th>
                    <th className="py-2 font-medium text-right">PO Total</th>
                    <th className="py-2 font-medium text-right">Invoice Total</th>
                    <th className="py-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {THREE_WAY_MATCH_RECORDS.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                        {rec.vendorName}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{rec.poNumber}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{rec.grnNumber}</td>
                      <td className="py-2.5 text-right text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(rec.totalPoAmount, selectedCurrency)}
                      </td>
                      <td className="py-2.5 text-right text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(rec.totalInvoiceAmount, selectedCurrency)}
                      </td>
                      <td className="py-2.5 text-center font-sans">
                        {rec.status === 'MATCHED' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Matched</span>
                        )}
                        {rec.status === 'WITHIN_TOLERANCE' && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">Within Tol. (0.77%)</span>
                        )}
                        {rec.status === 'FLAGGED_MISMATCH' && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">Hold (Overbilled)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 4: ERP & Bank Feeds Telemetry */}
        {executiveViewTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">ERP Core Connectors</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">SAP S/4HANA Cloud (Enterprise GL)</div>
                    <div className="text-slate-400">84,210 rows synced · Latency 142ms</div>
                  </div>
                  <span className="text-emerald-600 font-semibold">Connected</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">QuickBooks Enterprise NA Operations</div>
                    <div className="text-slate-400">31,400 rows synced · Latency 215ms</div>
                  </div>
                  <span className="text-emerald-600 font-semibold">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Tally Prime &amp; Xero Cloud</div>
                    <div className="text-slate-400">34,050 rows synced · Latency 240ms</div>
                  </div>
                  <span className="text-emerald-600 font-semibold">Connected</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Direct Bank Ingestion Feeds</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">J.P. Morgan Chase Host-to-Host</div>
                    <div className="text-slate-400">ISO 20022 CAMT.053 Feed · Latency 98ms</div>
                  </div>
                  <span className="text-emerald-600 font-semibold">Live Webhook</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">HSBC London Treasury Liquidity</div>
                    <div className="text-slate-400">MT940 End-of-Day Swift · Latency 112ms</div>
                  </div>
                  <span className="text-emerald-600 font-semibold">Live Webhook</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Audit Trail Integrity</div>
                    <div className="text-slate-400">SHA-256 Merkle Chain Cryptographic Status</div>
                  </div>
                  <span className="text-emerald-600 font-mono font-bold">100% VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
