import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign,
  PlusCircle,
  FileCheck2,
  Check,
  ShieldAlert
} from 'lucide-react';
import {
  BankReconciliationItem,
  CurrencyCode,
  IntercompanyBalance,
  ThreeWayMatchRecord,
  UserRole
} from '../types';
import {
  BANK_RECONCILIATION_DATA,
  INTERCOMPANY_BALANCES,
  THREE_WAY_MATCH_RECORDS
} from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface ReconciliationWorkspaceProps {
  selectedCurrency: CurrencyCode;
  activeRole: UserRole;
  onPostAdjustingEntry: (entry: {
    description: string;
    amount: number;
    accountCode: string;
    module: string;
  }) => void;
}

export const ReconciliationWorkspace: React.FC<ReconciliationWorkspaceProps> = ({
  selectedCurrency,
  activeRole,
  onPostAdjustingEntry,
}) => {
  const [workspaceTab, setWorkspaceTab] = useState<'bank' | 'intercompany' | 'three_way'>('bank');
  const [bankItems, setBankItems] = useState<BankReconciliationItem[]>(BANK_RECONCILIATION_DATA);
  const [intercompanyItems, setIntercompanyItems] = useState<IntercompanyBalance[]>(INTERCOMPANY_BALANCES);
  const [threeWayRecords, setThreeWayRecords] = useState<ThreeWayMatchRecord[]>(THREE_WAY_MATCH_RECORDS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'MATCHED' | 'PROBABLE_MATCH' | 'UNMATCHED'>('all');
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(1.0);

  // Suggested adjustment modal state
  const [selectedAdjustment, setSelectedAdjustment] = useState<BankReconciliationItem | null>(null);
  const [adjustingSuccessId, setAdjustingSuccessId] = useState<string | null>(null);

  // Intercompany elimination modal state
  const [eliminationSuccessId, setEliminationSuccessId] = useState<string | null>(null);

  const filteredBankItems = bankItems.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const handleApplyAdjustment = (item: BankReconciliationItem) => {
    if (!item.suggestedAdjustment) return;

    // Post adjusting entry
    onPostAdjustingEntry({
      description: item.suggestedAdjustment.description,
      amount: item.suggestedAdjustment.amount,
      accountCode: item.suggestedAdjustment.accountCode,
      module: 'BANK_REC',
    });

    // Update item status to MATCHED
    setBankItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'MATCHED',
              variance: 0,
              matchScore: 100,
              matchRuleApplied: `Adjusted: ${item.suggestedAdjustment?.type} posted`,
              suggestedAdjustment: undefined,
            }
          : i
      )
    );

    setAdjustingSuccessId(item.id);
    setSelectedAdjustment(null);
    setTimeout(() => setAdjustingSuccessId(null), 3000);
  };

  const handleApproveIntercompanyElimination = (ic: IntercompanyBalance) => {
    setIntercompanyItems((prev) =>
      prev.map((item) =>
        item.id === ic.id
          ? { ...item, status: 'RECONCILED', fxConvertedDifferenceUSD: 0, eliminationVoucherReady: true }
          : item
      )
    );

    onPostAdjustingEntry({
      description: `Automated Intercompany Elimination Voucher for ${ic.entityAName} & ${ic.entityBName}`,
      amount: ic.balanceInEntityACurrency,
      accountCode: '2900-00 (Intercompany Elimination Clearing)',
      module: 'INTERCOMPANY',
    });

    setEliminationSuccessId(ic.id);
    setTimeout(() => setEliminationSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Audit &amp; Reconciliation Workspace
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Side-by-side General Ledger vs. Bank Feed verification, Intercompany eliminations, and Three-Way Procurement Matching.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
          <button
            onClick={() => setWorkspaceTab('bank')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              workspaceTab === 'bank'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Bank vs GL Side-by-Side
          </button>
          <button
            onClick={() => setWorkspaceTab('intercompany')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              workspaceTab === 'intercompany'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Intercompany Reconciliation
          </button>
          <button
            onClick={() => setWorkspaceTab('three_way')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              workspaceTab === 'three_way'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Three-Way Match (PO/GRN/Inv)
          </button>
        </div>
      </div>

      {/* Success notification banner */}
      {adjustingSuccessId && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Adjusting Journal Entry successfully posted to General Ledger and hashed into audit chain!
          </span>
        </div>
      )}

      {eliminationSuccessId && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Intercompany Elimination Voucher posted and verified across consolidation ledgers!
          </span>
        </div>
      )}

      {/* TAB 1: Bank vs GL Side-by-Side Comparison View */}
      {workspaceTab === 'bank' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
              <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({bankItems.length})
                </button>
                <button
                  onClick={() => setStatusFilter('MATCHED')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    statusFilter === 'MATCHED'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Matched ({bankItems.filter((i) => i.status === 'MATCHED').length})
                </button>
                <button
                  onClick={() => setStatusFilter('PROBABLE_MATCH')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    statusFilter === 'PROBABLE_MATCH'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Probable Match ({bankItems.filter((i) => i.status === 'PROBABLE_MATCH').length})
                </button>
                <button
                  onClick={() => setStatusFilter('UNMATCHED')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    statusFilter === 'UNMATCHED'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Unmatched ({bankItems.filter((i) => i.status === 'UNMATCHED').length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">Legend:</span>
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Matched
              </span>
              <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Probable / Variance
              </span>
              <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Unmatched
              </span>
            </div>
          </div>

          {/* Dual Side-by-Side Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
                  <th colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    Internal General Ledger (GL Book)
                  </th>
                  <th colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    Bank Statement Feed (Host-to-Host)
                  </th>
                  <th colSpan={3} className="py-2.5 px-3 font-bold uppercase tracking-wider text-[11px]">
                    Reconciliation Diagnostics &amp; Action
                  </th>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <th className="py-2 px-3">Date / Ref</th>
                  <th className="py-2 px-3">GL Description</th>
                  <th className="py-2 px-3 text-right border-r border-slate-200 dark:border-slate-800">GL Amount</th>

                  <th className="py-2 px-3">Date / Ref</th>
                  <th className="py-2 px-3">Bank Narrative</th>
                  <th className="py-2 px-3 text-right border-r border-slate-200 dark:border-slate-800">Bank Amount</th>

                  <th className="py-2 px-3 text-right">Variance</th>
                  <th className="py-2 px-3 text-center">Score</th>
                  <th className="py-2 px-3 text-right">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredBankItems.map((item) => {
                  const isMatched = item.status === 'MATCHED';
                  const isProbable = item.status === 'PROBABLE_MATCH';
                  const isUnmatched = item.status === 'UNMATCHED';

                  const rowBg = isMatched
                    ? 'hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20'
                    : isProbable
                    ? 'bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/50'
                    : 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50';

                  return (
                    <tr key={item.id} className={`${rowBg} transition-colors`}>
                      {/* GL Side */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.glRef}</div>
                        <div className="text-slate-400 text-[11px]">{item.glDate}</div>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-[200px] truncate text-slate-700 dark:text-slate-300" title={item.glDescription}>
                        {item.glDescription}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-200 dark:border-slate-800 font-bold tabular-nums text-slate-900 dark:text-white">
                        {item.glAmount !== 0 ? formatCurrency(item.glAmount, selectedCurrency) : '—'}
                      </td>

                      {/* Bank Side */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.bankRef}</div>
                        <div className="text-slate-400 text-[11px]">{item.bankDate}</div>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-[200px] truncate text-slate-700 dark:text-slate-300" title={item.bankDescription}>
                        {item.bankDescription}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-200 dark:border-slate-800 font-bold tabular-nums text-slate-900 dark:text-white">
                        {item.bankAmount !== 0 ? formatCurrency(item.bankAmount, selectedCurrency) : '—'}
                      </td>

                      {/* Variance & Status */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        {item.variance === 0 ? (
                          <span className="text-slate-400">{formatCurrency(0, selectedCurrency)}</span>
                        ) : (
                          <span className={`font-bold ${item.variance > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {formatCurrency(item.variance, selectedCurrency)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-bold ${
                            isMatched
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isProbable
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.matchScore}%
                        </span>
                      </td>

                      {/* Resolution Action */}
                      <td className="py-3 px-3 text-right font-sans">
                        {isMatched && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                          </span>
                        )}

                        {item.suggestedAdjustment && (
                          <button
                            onClick={() => setSelectedAdjustment(item)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded transition-colors whitespace-nowrap shadow-sm"
                          >
                            Suggest Adjustment
                          </button>
                        )}

                        {!isMatched && !item.suggestedAdjustment && (
                          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                            Manual Audit
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Intercompany Reconciliation Matrix */}
      {workspaceTab === 'intercompany' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Multi-Entity Intercompany Balances &amp; Elimination Worktable
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cross-entity receivables/payables matrix ensuring full consolidation netting under IFRS 10 / US-GAAP ASC 810.
            </p>

            <div className="space-y-4">
              {intercompanyItems.map((ic) => (
                <div
                  key={ic.id}
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{ic.transferPricingDocRef}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">ID: {ic.id}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                        <span>{ic.entityAName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ic.entityBName}</span>
                      </div>
                    </div>

                    {/* Balances */}
                    <div className="flex items-center gap-6 text-xs font-mono">
                      <div>
                        <div className="text-slate-400 text-[10px]">ENTITY A BOOK ({ic.currencyA})</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {ic.currencyA} {ic.balanceInEntityACurrency.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px]">ENTITY B BOOK ({ic.currencyB})</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {ic.currencyB} {ic.balanceInEntityBCurrency.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px]">FX DISCREPANCY</div>
                        <div className={`font-bold tabular-nums ${ic.fxConvertedDifferenceUSD === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          ${ic.fxConvertedDifferenceUSD.toFixed(2)} USD
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 font-sans">
                        {ic.status === 'RECONCILED' ? (
                          <span className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eliminated
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveIntercompanyElimination(ic)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors whitespace-nowrap shadow-sm"
                          >
                            Post Elimination Voucher
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Three-Way Matching (PO vs GRN vs Vendor Invoice) */}
      {workspaceTab === 'three_way' && (
        <div className="space-y-4">
          {/* Tolerance Threshold Config */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Three-Way Procurement Matching Engine
              </h3>
              <p className="text-xs text-slate-500">
                Line-item comparison between Purchase Order, Goods/Services Receipt, and Supplier Invoice.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">Variance Tolerance Threshold:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={toleranceThreshold}
                  onChange={(e) => setToleranceThreshold(parseFloat(e.target.value))}
                  className="w-24 accent-slate-900 dark:accent-white"
                />
                <span className="font-mono font-bold text-slate-900 dark:text-white w-10">
                  {toleranceThreshold.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Three-Way Records */}
          <div className="space-y-4">
            {threeWayRecords.map((record) => {
              const variancePct =
                record.totalPoAmount > 0
                  ? (record.varianceAmount / record.totalPoAmount) * 100
                  : 0;
              const isWithinUserTolerance = variancePct <= toleranceThreshold;

              return (
                <div
                  key={record.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{record.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{record.date}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {record.vendorName}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block">PO NUMBER</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{record.poNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">GRN NUMBER</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{record.grnNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">INVOICE NUMBER</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{record.invoiceNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">VARIANCE</span>
                        <span className={`font-bold tabular-nums ${record.varianceAmount === 0 ? 'text-slate-500' : 'text-rose-600'}`}>
                          {formatCurrency(record.varianceAmount, selectedCurrency)} ({variancePct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Line items table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                          <th className="py-1.5 px-2">Item Code &amp; Description</th>
                          <th className="py-1.5 px-2 text-right">PO Qty / Price</th>
                          <th className="py-1.5 px-2 text-right">GRN Received Qty</th>
                          <th className="py-1.5 px-2 text-right">Invoice Qty / Price</th>
                          <th className="py-1.5 px-2 text-right">Variance</th>
                          <th className="py-1.5 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {record.lines.map((l, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2 font-sans">
                              <div className="font-semibold text-slate-900 dark:text-white">{l.itemCode}</div>
                              <div className="text-slate-500 text-[11px]">{l.description}</div>
                            </td>
                            <td className="py-2 px-2 text-right">
                              {l.poQty} units @ ${l.poUnitPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {l.grnQty === 0 ? (
                                <span className="text-rose-600 font-bold">0 (Not Received)</span>
                              ) : (
                                <span>{l.grnQty} units</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {l.invoiceQty} units @ ${l.invoiceUnitPrice.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right font-bold tabular-nums">
                              {l.priceVariance === 0 ? '$0.00' : `+$${l.priceVariance.toLocaleString()}`}
                            </td>
                            <td className="py-2 px-2 text-center font-sans">
                              {l.isMatched ? (
                                <span className="text-emerald-600 font-semibold">Matched</span>
                              ) : isWithinUserTolerance ? (
                                <span className="text-amber-600 font-semibold">Within Tol.</span>
                              ) : (
                                <span className="text-rose-600 font-semibold">Mismatch</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {record.resolutionNotes && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>Audit Diagnostic: {record.resolutionNotes}</span>
                      {record.status === 'FLAGGED_MISMATCH' && (
                        <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Payment Hold Enforced
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Adjustment Modal */}
      {selectedAdjustment && selectedAdjustment.suggestedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Automated Adjusting Journal Entry Suggestion</span>
              </h3>
              <button
                onClick={() => setSelectedAdjustment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The AI Reconciliation Engine analyzed the bank feed discrepancy and prepared a compliant GAAP/IFRS adjusting voucher:
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">ADJUSTMENT TYPE:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedAdjustment.suggestedAdjustment.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ACCOUNT CODE:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedAdjustment.suggestedAdjustment.accountCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VOUCHER AMOUNT:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedAdjustment.suggestedAdjustment.amount, selectedCurrency)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                  {selectedAdjustment.suggestedAdjustment.description}
                </div>
              </div>

              <div className="text-slate-500 text-[11px]">
                Upon approval, this voucher will be assigned an immutable SHA-256 hash and posted to the General Ledger.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedAdjustment(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyAdjustment(selectedAdjustment)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              >
                Approve &amp; Post Adjusting Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
