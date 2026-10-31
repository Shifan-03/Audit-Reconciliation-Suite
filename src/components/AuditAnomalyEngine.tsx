import React, { useState } from 'react';
import {
  ShieldAlert,
  BarChart3,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Undo2,
  Check,
  FileText
} from 'lucide-react';
import { AnomalyAlert, ComplianceRuleCheck, CurrencyCode, UserRole } from '../types';
import { ANOMALY_ALERTS, BENFORD_DISTRIBUTION, COMPLIANCE_RULES, BENFORD_VOUCHERS } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface AuditAnomalyEngineProps {
  selectedCurrency: CurrencyCode;
  activeRole: UserRole;
  onLogAuditAction: (action: string, description: string) => void;
}

export const AuditAnomalyEngine: React.FC<AuditAnomalyEngineProps> = ({
  selectedCurrency,
  activeRole,
  onLogAuditAction,
}) => {
  const [subTab, setSubTab] = useState<'anomalies' | 'benford' | 'compliance'>('anomalies');
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(ANOMALY_ALERTS);
  const [complianceRules, setComplianceRules] = useState<ComplianceRuleCheck[]>(COMPLIANCE_RULES);
  const [evaluatingRuleId, setEvaluatingRuleId] = useState<string | null>(null);

  // Benford interactive state
  const [selectedDigit, setSelectedDigit] = useState<number>(9);
  const [selectedSubledger, setSelectedSubledger] = useState<'ALL' | 'CONSULTING' | 'TE'>('ALL');

  // Investigation action feedback
  const [investigationMessage, setInvestigationMessage] = useState<string | null>(null);

  const handleResolveAlert = (alertId: string, status: 'RESOLVED' | 'FALSE_POSITIVE', customMsg?: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
    const msg = customMsg || `Audit resolution marked as ${status} for Anomaly Alert ${alertId}`;
    onLogAuditAction('UPDATE', `${msg} by ${activeRole}`);
    setInvestigationMessage(msg);
    setTimeout(() => setInvestigationMessage(null), 3500);
  };

  const handleReevaluateRule = (ruleId: string) => {
    setEvaluatingRuleId(ruleId);
    setTimeout(() => {
      setComplianceRules((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                status: 'PASS',
                lastEvaluated: 'Just now',
                findings: 'Automated test suite re-executed against all posted vouchers: 100% compliant with standard.',
              }
            : r
        )
      );
      setEvaluatingRuleId(null);
      onLogAuditAction('APPROVE', `Compliance rule ${ruleId} re-evaluated with PASS status.`);
    }, 1200);
  };

  // Filter vouchers by selected leading digit
  const filteredVouchers = BENFORD_VOUCHERS.filter((v) => {
    const digitMatch = v.leadingDigit === selectedDigit;
    if (selectedSubledger === 'CONSULTING') {
      return digitMatch && v.accountCategory.includes('Consulting');
    }
    if (selectedSubledger === 'TE') {
      return digitMatch && v.accountCategory.includes('Travel');
    }
    return digitMatch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            AI Audit, Anomaly &amp; Compliance Engine
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Statistical forensic auditing, Benford’s Law subledger analysis, duplicate payment detection, and IFRS/GAAP rules.
          </p>
        </div>

        <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setSubTab('anomalies')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              subTab === 'anomalies'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Fraud &amp; Anomaly Radar ({alerts.filter((a) => a.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setSubTab('benford')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              subTab === 'benford'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Benford’s Law Forensic Test
          </button>
          <button
            onClick={() => setSubTab('compliance')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              subTab === 'compliance'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            IFRS / US-GAAP Rules Engine
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {investigationMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {investigationMessage}
          </span>
        </div>
      )}

      {/* SUBTAB 1: Anomaly Radar */}
      {subTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              const isHigh = alert.severity === 'HIGH';
              const isResolved = alert.status === 'RESOLVED';

              return (
                <div
                  key={alert.id}
                  className={`p-4 bg-white dark:bg-slate-900 border rounded flex flex-col justify-between transition-colors ${
                    isResolved
                      ? 'border-slate-200 dark:border-slate-800 opacity-60'
                      : isHigh
                      ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                      : 'border-amber-300 dark:border-amber-900/60 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            isHigh ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {alert.severity} SEVERITY
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500 font-mono">{alert.type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {alert.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Risk Factors Bullet List */}
                    <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Detected Risk Vectors
                      </div>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                        {alert.riskFactors.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">FLAGGED AMOUNT</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(alert.amount, selectedCurrency)}
                      </span>
                    </div>

                    {!isResolved ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {alert.type === 'DUPLICATE_PAYMENT' && (
                          <button
                            onClick={() =>
                              handleResolveAlert(
                                alert.id,
                                'RESOLVED',
                                'Initiated clawback wire notice & payment credit memo of $14,250.00'
                              )
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors whitespace-nowrap"
                          >
                            Issue Clawback Memo
                          </button>
                        )}

                        {alert.type === 'SPLIT_TRANSACTION' && (
                          <button
                            onClick={() =>
                              handleResolveAlert(
                                alert.id,
                                'RESOLVED',
                                'Escalated split requisition to CFO & SOX Internal Controls Committee'
                              )
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors whitespace-nowrap"
                          >
                            Escalate to CFO Sign-Off
                          </button>
                        )}

                        {alert.type === 'WEEKEND_OFF_HOURS' && (
                          <button
                            onClick={() =>
                              handleResolveAlert(
                                alert.id,
                                'RESOLVED',
                                'Reversed unauthorized Sunday manual journal entry #10772 ($50,000)'
                              )
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors whitespace-nowrap"
                          >
                            Reverse Manual Voucher
                          </button>
                        )}

                        <button
                          onClick={() => handleResolveAlert(alert.id, 'RESOLVED')}
                          className="px-3 py-1 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors whitespace-nowrap"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Resolved &amp; Recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Benford's Law Forensic Test */}
      {subTab === 'benford' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>Benford’s Law Digit Frequency Analysis (First-Digit Test)</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Click any digit bar to inspect the underlying ledger vouchers. Under Benford’s Law: P(d) = log10(1 + 1/d).
                </p>
              </div>

              {/* Subledger filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Subledger Slice:</span>
                <select
                  value={selectedSubledger}
                  onChange={(e) => setSelectedSubledger(e.target.value as any)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs font-medium"
                >
                  <option value="ALL">All Expense Accounts (4,820 rows)</option>
                  <option value="CONSULTING">6030-00 Consulting &amp; Advisory</option>
                  <option value="TE">6020-00 Travel &amp; Entertainment</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono pt-1 flex-wrap">
              <span className="text-slate-500">Sample: 4,820 Vouchers</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">Chi-Square (&chi;&sup2;): 34.82</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">Degrees of Freedom (df): 8</span>
              <span className="text-slate-500">·</span>
              <span className="text-rose-600 font-bold">p-value: &lt; 0.001 (CRITICAL ANOMALY ON DIGIT 9)</span>
            </div>
          </div>

          {/* Bar Chart Visualization with Interactive Clickable Bars */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mb-6 gap-2">
              <span>Click any digit bar below to drill into transaction lines starting with that digit:</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <span>Expected %</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-600 rounded-xs" />
                  <span>Normal Observed %</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-rose-600 rounded-xs" />
                  <span>Anomalous Observed %</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-3 items-end h-64 pt-6 border-b border-slate-200 dark:border-slate-800 pb-2">
              {BENFORD_DISTRIBUTION.map((item) => {
                const isSelected = selectedDigit === item.digit;
                const isAnomaly = item.digit === 9;
                const expectedHeight = `${(item.expected / 35) * 100}%`;
                const observedHeight = `${(item.observed / 35) * 100}%`;

                return (
                  <button
                    key={item.digit}
                    onClick={() => setSelectedDigit(item.digit)}
                    className={`flex flex-col items-center h-full justify-end group transition-all p-1 rounded ${
                      isSelected ? 'bg-slate-100/80 dark:bg-slate-800/80 ring-2 ring-slate-400' : ''
                    }`}
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Expected Bar */}
                      <div
                        style={{ height: expectedHeight }}
                        className="w-1/2 bg-slate-200 dark:bg-slate-700 rounded-t-xs relative transition-all"
                        title={`Digit ${item.digit} Expected: ${item.expected}%`}
                      />

                      {/* Observed Bar */}
                      <div
                        style={{ height: observedHeight }}
                        className={`w-1/2 rounded-t-xs relative transition-all ${
                          isAnomaly ? 'bg-rose-600 shadow-sm shadow-rose-500/50' : 'bg-emerald-600'
                        }`}
                        title={`Digit ${item.digit} Observed: ${item.observed}%`}
                      >
                        {isAnomaly && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-600 whitespace-nowrap">
                            +6.8% Δ
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      Digit {item.digit}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.observed}%
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drilldown Table for Selected Digit */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Underlying Vouchers Starting with Digit {selectedDigit} ({filteredVouchers.length} sampled)
                  </span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedDigit === 9 ? 'FLAGGED HIGH AUDIT RISK' : 'NORMAL STATISTICAL POPULATION'}
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-medium">
                      <th className="py-2 px-3">Voucher Ref / Date</th>
                      <th className="py-2 px-3">Beneficiary Vendor</th>
                      <th className="py-2 px-3">Subledger Account</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3">Forensic Diagnostic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {filteredVouchers.map((v) => (
                      <tr
                        key={v.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${
                          v.flaggedReason ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{v.voucherNumber}</div>
                          <div className="text-slate-400 text-[10px]">{v.date}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                          {v.vendor}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                          {v.accountCategory}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900 dark:text-white">
                          {formatCurrency(v.amount, selectedCurrency)}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-[11px]">
                          {v.flaggedReason ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              {v.flaggedReason}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Normal baseline expense
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Compliance Rules Engine */}
      {subTab === 'compliance' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Automated IFRS, US-GAAP &amp; Bangladesh Statutory Regulatory Compliance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous validation against international accounting standards and local statutory requirements (NBR VAT Act 2012, Mushak 6.3 &amp; Bangladesh Bank FE).
            </p>
          </div>

          <div className="space-y-4">
            {complianceRules.map((rule) => {
              const isPass = rule.status === 'PASS';
              const isEvaluating = evaluatingRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                        <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[10px] ${
                          rule.framework === 'LOCAL_REGULATORY'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {rule.framework === 'LOCAL_REGULATORY' ? 'LOCAL (BANGLADESH NBR / BB)' : rule.framework}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{rule.standardRef}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">Last evaluated: {rule.lastEvaluated}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rule.ruleTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {rule.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {rule.status}
                      </span>
                      <button
                        onClick={() => handleReevaluateRule(rule.id)}
                        disabled={isEvaluating}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isEvaluating ? 'animate-spin' : ''}`} />
                        <span>Re-test</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded">
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Audit Findings:</div>
                      <div className="text-slate-600 dark:text-slate-400">{rule.findings}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded">
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Compliance Recommendation:</div>
                      <div className="text-slate-600 dark:text-slate-400">{rule.recommendation}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
