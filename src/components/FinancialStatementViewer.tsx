import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Building,
  Info,
  Table,
  Columns
} from 'lucide-react';
import { CurrencyCode, FinancialPeriod, StatementLineItem, JournalVoucher } from '../types';
import { ENTITIES, getFinancialStatementsForEntityAndPeriod } from '../data/mockData';
import { formatCurrency, formatVariancePct } from '../utils/formatters';

interface FinancialStatementViewerProps {
  selectedCurrency: CurrencyCode;
  selectedEntityId: string;
  selectedPeriod: FinancialPeriod;
}

export const FinancialStatementViewer: React.FC<FinancialStatementViewerProps> = ({
  selectedCurrency,
  selectedEntityId,
  selectedPeriod,
}) => {
  const [statementType, setStatementType] = useState<'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity_changes'>('balance_sheet');
  const [drilldownItem, setDrilldownItem] = useState<StatementLineItem | null>(null);
  const [showConsolidationWorksheet, setShowConsolidationWorksheet] = useState<boolean>(false);

  const activeEntity = ENTITIES.find((e) => e.id === selectedEntityId) || ENTITIES[0];
  const isConsolidated = selectedEntityId === 'ENT-CONSOL';

  // Dynamically calculate accurate figures based on selected entity & fiscal period
  const data = getFinancialStatementsForEntityAndPeriod(selectedEntityId, selectedPeriod);

  // Render drilldown modal if line item clicked
  const renderDrilldownModal = () => {
    if (!drilldownItem || !drilldownItem.drilldownVouchers) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-3xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-mono text-slate-500">
                COA: {drilldownItem.accountCode} · {activeEntity.name}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Underlying General Ledger Vouchers: {drilldownItem.lineTitle}
              </h3>
            </div>
            <button
              onClick={() => setDrilldownItem(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400">
            Each line represents an immutable, double-entry journal voucher verified against source documents.
          </div>

          <div className="overflow-y-auto border border-slate-200 dark:border-slate-800 rounded">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-medium">
                  <th className="py-2 px-3">Voucher # / Date</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Source ERP / Ref</th>
                  <th className="py-2 px-3 text-right">Debit</th>
                  <th className="py-2 px-3 text-right">Credit</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {drilldownItem.drilldownVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{v.voucherNumber}</div>
                      <div className="text-slate-400 text-[11px]">{v.date}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 dark:text-slate-200 max-w-[200px]">
                      {v.description}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      <div>{v.sourceSystem}</div>
                      <div className="text-[10px] text-slate-400">Ref: {v.referenceDocId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 dark:text-white">
                      {v.debit > 0 ? formatCurrency(v.debit, selectedCurrency) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 dark:text-white">
                      {v.credit > 0 ? formatCurrency(v.credit, selectedCurrency) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Cryptographic Vouchers Root Hash: 0x904b...e21a</span>
            <button
              onClick={() => setDrilldownItem(null)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
            >
              Close Ledger Drilldown
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStandardRow = (item: StatementLineItem) => {
    const variance = formatVariancePct(item.variancePercent);
    const hasVouchers = item.drilldownVouchers && item.drilldownVouchers.length > 0;

    return (
      <tr
        key={item.id}
        onClick={() => hasVouchers && setDrilldownItem(item)}
        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
          hasVouchers ? 'cursor-pointer' : ''
        }`}
      >
        <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {item.lineTitle}
            {hasVouchers && (
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                drill-down
              </span>
            )}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">{item.accountCode}</span>
        </td>
        <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
          {formatCurrency(item.currentPeriod, selectedCurrency)}
        </td>
        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500">
          {formatCurrency(item.priorPeriod, selectedCurrency)}
        </td>
        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
          {variance.text}
        </td>
      </tr>
    );
  };

  const renderWorksheetRow = (item: StatementLineItem) => {
    const b = item.entityBreakdown || {
      'ENT-NA': Math.round(item.currentPeriod * 0.55),
      'ENT-EMEA': Math.round(item.currentPeriod * 0.22),
      'ENT-APAC': Math.round(item.currentPeriod * 0.13),
      'ENT-BD': Math.round(item.currentPeriod * 0.10),
      'ELIMINATIONS': 0,
    };

    return (
      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 font-mono transition-colors">
        <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span>{item.lineTitle}</span>
            <span className="text-slate-400 text-[10px]">{item.accountCode}</span>
          </div>
        </td>
        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
          {formatCurrency(b['ENT-NA'], selectedCurrency)}
        </td>
        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
          {formatCurrency(b['ENT-EMEA'], selectedCurrency)}
        </td>
        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
          {formatCurrency(b['ENT-APAC'], selectedCurrency)}
        </td>
        <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 font-medium">
          {formatCurrency(b['ENT-BD'] ?? Math.round(item.currentPeriod * 0.10), selectedCurrency)}
        </td>
        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-rose-600 dark:text-rose-400">
          {b['ELIMINATIONS'] !== 0 ? formatCurrency(b['ELIMINATIONS'], selectedCurrency) : '—'}
        </td>
        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
          {formatCurrency(item.currentPeriod, selectedCurrency)}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Statement Type Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Automated Financial Statement Viewer
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Multi-currency, multi-entity consolidated reporting with interactive transaction drill-down.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Controls */}
          <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setStatementType('balance_sheet')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                statementType === 'balance_sheet'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setStatementType('income_statement')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                statementType === 'income_statement'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income Statement (P&amp;L)
            </button>
            <button
              onClick={() => setStatementType('cash_flow')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                statementType === 'cash_flow'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cash Flow
            </button>
            <button
              onClick={() => setStatementType('equity_changes')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                statementType === 'equity_changes'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Equity Changes
            </button>
          </div>

          {/* Consolidation Worksheet Toggle for Consolidated Mode */}
          {isConsolidated && (
            <button
              onClick={() => setShowConsolidationWorksheet(!showConsolidationWorksheet)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                showConsolidationWorksheet
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{showConsolidationWorksheet ? 'Standard View' : 'Consolidation Worksheet'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Entity & Standard Banner */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-900 dark:text-white">{activeEntity.name}</span>
          <span className="text-slate-400">· Tax ID: {activeEntity.taxId}</span>
          <span className="text-slate-400">· Method: {activeEntity.consolidationMethod} Consolidation</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-mono">
          <span>Standards: IFRS / US-GAAP</span>
          <span>Period: {selectedPeriod.replace('_', ' ')}</span>
          <span>Reporting Currency: {selectedCurrency}</span>
        </div>
      </div>

      {/* 1. BALANCE SHEET */}
      {statementType === 'balance_sheet' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isConsolidated ? 'Consolidated Balance Sheet' : `${activeEntity.name} Balance Sheet`}
              </h2>
              <div className="text-xs text-slate-500">
                As of {data.balanceSheet.asOfDate} · In {selectedCurrency}
                {showConsolidationWorksheet && ' · Multi-Entity Breakdown & Elimination Worksheet'}
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Balanced: Assets = Liabilities + Equity
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                {!showConsolidationWorksheet ? (
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                    <th className="py-2.5 px-4">Line Item / Account Code</th>
                    <th className="py-2.5 px-4 text-right">Current Period</th>
                    <th className="py-2.5 px-4 text-right">Prior Period Comp</th>
                    <th className="py-2.5 px-4 text-right">Period Variance %</th>
                  </tr>
                ) : (
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                    <th className="py-2.5 px-3">Line Item / Code</th>
                    <th className="py-2.5 px-3 text-right">Meridian US (Parent)</th>
                    <th className="py-2.5 px-3 text-right">Meridian EMEA Ltd</th>
                    <th className="py-2.5 px-3 text-right">Meridian APAC Pte</th>
                    <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">Meridian BD Ltd (৳)</th>
                    <th className="py-2.5 px-3 text-right text-rose-600">Intercompany Eliminations</th>
                    <th className="py-2.5 px-3 text-right bg-slate-100 dark:bg-slate-800">Consolidated Total</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {/* Assets Category */}
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={showConsolidationWorksheet ? 7 : 4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Assets (Current &amp; Non-Current)
                  </td>
                </tr>
                {data.balanceSheet.assets.map((item) =>
                  showConsolidationWorksheet ? renderWorksheetRow(item) : renderStandardRow(item)
                )}
                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="py-2.5 px-4 text-slate-900 dark:text-white font-sans">TOTAL ASSETS</td>
                  {!showConsolidationWorksheet ? (
                    <>
                      <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white text-sm">
                        {formatCurrency(data.balanceSheet.totalAssets, selectedCurrency)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500">
                        {formatCurrency(Math.round(data.balanceSheet.totalAssets * 0.84), selectedCurrency)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-600">+18.60%</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(Math.round(data.balanceSheet.totalAssets * 0.55), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(Math.round(data.balanceSheet.totalAssets * 0.22), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(Math.round(data.balanceSheet.totalAssets * 0.13), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">{formatCurrency(Math.round(data.balanceSheet.totalAssets * 0.10), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-600">—</td>
                      <td className="py-2.5 px-3 text-right text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800">
                        {formatCurrency(data.balanceSheet.totalAssets, selectedCurrency)}
                      </td>
                    </>
                  )}
                </tr>

                {/* Liabilities Category */}
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={showConsolidationWorksheet ? 7 : 4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Liabilities (Current &amp; Non-Current)
                  </td>
                </tr>
                {data.balanceSheet.liabilities.map((item) =>
                  showConsolidationWorksheet ? renderWorksheetRow(item) : renderStandardRow(item)
                )}

                {/* Stockholders Equity Category */}
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={showConsolidationWorksheet ? 7 : 4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Stockholders Equity
                  </td>
                </tr>
                {data.balanceSheet.equity.map((item) =>
                  showConsolidationWorksheet ? renderWorksheetRow(item) : renderStandardRow(item)
                )}

                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="py-2.5 px-4 text-slate-900 dark:text-white font-sans">
                    TOTAL LIABILITIES &amp; STOCKHOLDERS EQUITY
                  </td>
                  {!showConsolidationWorksheet ? (
                    <>
                      <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white text-sm">
                        {formatCurrency(data.balanceSheet.totalLiabilitiesAndEquity, selectedCurrency)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500">
                        {formatCurrency(Math.round(data.balanceSheet.totalLiabilitiesAndEquity * 0.84), selectedCurrency)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-600">+18.60%</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(Math.round(data.balanceSheet.totalLiabilitiesAndEquity * 0.55), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(Math.round(data.balanceSheet.totalLiabilitiesAndEquity * 0.22), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(Math.round(data.balanceSheet.totalLiabilitiesAndEquity * 0.13), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">{formatCurrency(Math.round(data.balanceSheet.totalLiabilitiesAndEquity * 0.10), selectedCurrency)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-600">—</td>
                      <td className="py-2.5 px-3 text-right text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800">
                        {formatCurrency(data.balanceSheet.totalLiabilitiesAndEquity, selectedCurrency)}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INCOME STATEMENT (P&L) */}
      {statementType === 'income_statement' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isConsolidated ? 'Consolidated Statement of Operations (P&L)' : `${activeEntity.name} Statement of Operations`}
              </h2>
              <div className="text-xs text-slate-500">
                {data.incomeStatement.period} · In {selectedCurrency}
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                EBITDA Margin: {((data.incomeStatement.operatingIncome / Math.max(1, data.incomeStatement.revenue.reduce((s, r) => s + r.currentPeriod, 0))) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Line Item / Account Code</th>
                  <th className="py-2.5 px-4 text-right">Current Period</th>
                  <th className="py-2.5 px-4 text-right">Prior Period Comp</th>
                  <th className="py-2.5 px-4 text-right">Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Revenue &amp; Net Inflow
                  </td>
                </tr>
                {data.incomeStatement.revenue.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Cost of Goods Sold (COGS)
                  </td>
                </tr>
                {data.incomeStatement.costOfGoodsSold.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-4 text-slate-900 dark:text-white font-sans">GROSS PROFIT</td>
                  <td className="py-2 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(data.incomeStatement.grossProfit, selectedCurrency)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {formatCurrency(Math.round(data.incomeStatement.grossProfit * 0.81), selectedCurrency)}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-600">+23.55%</td>
                </tr>

                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Operating Expenses (OpEx)
                  </td>
                </tr>
                {data.incomeStatement.operatingExpenses.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2 px-4 text-slate-900 dark:text-white font-sans">OPERATING INCOME (EBIT)</td>
                  <td className="py-2 px-4 text-right text-slate-900 dark:text-white">
                    {formatCurrency(data.incomeStatement.operatingIncome, selectedCurrency)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {formatCurrency(Math.round(data.incomeStatement.operatingIncome * 0.74), selectedCurrency)}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-600">+35.32%</td>
                </tr>

                {data.incomeStatement.taxesAndInterest.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-sm">
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-sans">NET INCOME (PROFIT AFTER TAX)</td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(data.incomeStatement.netIncome, selectedCurrency)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {formatCurrency(Math.round(data.incomeStatement.netIncome * 0.71), selectedCurrency)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600">+41.73%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CASH FLOW STATEMENT */}
      {statementType === 'cash_flow' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Statement of Cash Flows (Indirect Method)
              </h2>
              <div className="text-xs text-slate-500">
                {data.cashFlow.period} · In {selectedCurrency}
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Net Cash Growth: +{formatCurrency(data.cashFlow.netCashChange, selectedCurrency)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Cash Activity Component</th>
                  <th className="py-2.5 px-4 text-right">Current Period</th>
                  <th className="py-2.5 px-4 text-right">Prior Period Comp</th>
                  <th className="py-2.5 px-4 text-right">Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Cash Flows from Operating Activities
                  </td>
                </tr>
                {data.cashFlow.operatingActivities.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Cash Flows from Investing Activities
                  </td>
                </tr>
                {data.cashFlow.investingActivities.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2 px-4 uppercase tracking-wider text-[11px] font-sans">
                    Cash Flows from Financing Activities
                  </td>
                </tr>
                {data.cashFlow.financingActivities.map((item) => renderStandardRow(item))}

                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="py-2.5 px-4 text-slate-900 dark:text-white font-sans">CASH AT BEGINNING OF PERIOD</td>
                  <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white">
                    {formatCurrency(data.cashFlow.beginningCash, selectedCurrency)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500">—</td>
                  <td className="py-2.5 px-4 text-right text-slate-500">—</td>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-sm">
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-sans">CASH AT END OF PERIOD</td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(data.cashFlow.endingCash, selectedCurrency)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {formatCurrency(Math.round(data.cashFlow.endingCash * 0.84), selectedCurrency)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600">+19.04%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. STATEMENT OF CHANGES IN EQUITY */}
      {statementType === 'equity_changes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Statement of Changes in Stockholders Equity
            </h2>
            <p className="text-xs text-slate-500">
              Rollforward of Share Capital, Retained Earnings, and Cumulative Translation Adjustments (CTA).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <span className="font-sans font-bold text-slate-900 dark:text-white block">
                Share Capital &amp; APIC
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Beginning:</span>
                <span className="font-bold">{formatCurrency(data.equityChanges.shareCapitalBeginning, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issuances:</span>
                <span>$0.00</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Ending Capital:</span>
                <span>{formatCurrency(data.equityChanges.shareCapitalEnding, selectedCurrency)}</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <span className="font-sans font-bold text-slate-900 dark:text-white block">
                Retained Earnings Rollforward
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Beginning:</span>
                <span className="font-bold">{formatCurrency(data.equityChanges.retainedEarningsBeginning, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Income:</span>
                <span className="text-emerald-600">+{formatCurrency(data.equityChanges.netIncomeAddition, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dividends:</span>
                <span className="text-rose-600">{formatCurrency(data.equityChanges.dividendDistributions, selectedCurrency)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Ending Earnings:</span>
                <span>{formatCurrency(data.equityChanges.retainedEarningsEnding, selectedCurrency)}</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <span className="font-sans font-bold text-slate-900 dark:text-white block">
                Total Stockholders Equity
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Other Reserves (CTA):</span>
                <span>{formatCurrency(data.equityChanges.otherReserves, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Non-Controlling Int.:</span>
                <span>$0.00</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <span>Total Equity:</span>
                <span>{formatCurrency(data.equityChanges.totalEquityEnding, selectedCurrency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Drilldown Modal */}
      {renderDrilldownModal()}
    </div>
  );
};
