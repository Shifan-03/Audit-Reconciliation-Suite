import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Code2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Building,
  Copy,
  Check
} from 'lucide-react';
import { CurrencyCode, UserRole } from '../types';
import { FINANCIAL_STATEMENTS_DATA, ENTITIES, BANK_RECONCILIATION_DATA } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface ReportBuilderExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: CurrencyCode;
  selectedEntityId: string;
  activeRole: UserRole;
}

export const ReportBuilderExportModal: React.FC<ReportBuilderExportModalProps> = ({
  isOpen,
  onClose,
  selectedCurrency,
  selectedEntityId,
  activeRole,
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xbrl' | 'excel'>('pdf');
  const [includeAuditOpinion, setIncludeAuditOpinion] = useState(true);
  const [includeReconciliationStatus, setIncludeReconciliationStatus] = useState(true);
  const [copiedXbrl, setCopiedXbrl] = useState(false);

  if (!isOpen) return null;

  const entity = ENTITIES.find((e) => e.id === selectedEntityId) || ENTITIES[0];
  const fs = FINANCIAL_STATEMENTS_DATA;

  // Generate XBRL instance XML snippet
  const xbrlXmlSnippet = `<?xml version="1.0" encoding="utf-8"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance"
            xmlns:link="http://www.xbrl.org/2003/linkbase"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:us-gaap="http://fasb.org/us-gaap/2026-01-31"
            xmlns:ifrs-full="http://xbrl.ifrs.org/taxonomy/2026-03-31/ifrs-full"
            xmlns:iso4217="http://www.xbrl.org/2003/iso4217"
            xmlns:entity="http://meridianglobal.com/20261031">

  <!-- Entity Reporting Context -->
  <xbrli:context id="AsOf_20261031_Consolidated">
    <xbrli:entity>
      <xbrli:identifier scheme="http://standards.iso.org/iso/17442">${entity.taxId}</xbrli:identifier>
    </xbrli:entity>
    <xbrli:period>
      <xbrli:instant>2026-10-31</xbrli:instant>
    </xbrli:period>
  </xbrli:context>

  <xbrli:unit id="${selectedCurrency}">
    <xbrli:measure>iso4217:${selectedCurrency}</xbrli:measure>
  </xbrli:unit>

  <!-- Tagged Balance Sheet Items -->
  <us-gaap:CashAndCashEquivalentsAtCarryingValue
    contextRef="AsOf_20261031_Consolidated"
    unitRef="${selectedCurrency}"
    decimals="-3">${fs.balanceSheet.assets[0]?.currentPeriod || 14820000}</us-gaap:CashAndCashEquivalentsAtCarryingValue>

  <us-gaap:AccountsReceivableNetCurrent
    contextRef="AsOf_20261031_Consolidated"
    unitRef="${selectedCurrency}"
    decimals="-3">${fs.balanceSheet.assets[1]?.currentPeriod || 8640000}</us-gaap:AccountsReceivableNetCurrent>

  <us-gaap:Assets
    contextRef="AsOf_20261031_Consolidated"
    unitRef="${selectedCurrency}"
    decimals="-3">${fs.balanceSheet.totalAssets}</us-gaap:Assets>

  <!-- Tagged Statement of Operations -->
  <us-gaap:Revenues
    contextRef="AsOf_20261031_Consolidated"
    unitRef="${selectedCurrency}"
    decimals="-3">${fs.incomeStatement.revenue.reduce((s, r) => s + r.currentPeriod, 0)}</us-gaap:Revenues>

  <us-gaap:NetIncomeLoss
    contextRef="AsOf_20261031_Consolidated"
    unitRef="${selectedCurrency}"
    decimals="-3">${fs.incomeStatement.netIncome}</us-gaap:NetIncomeLoss>

</xbrli:xbrl>`;

  const handleCopyXbrl = () => {
    navigator.clipboard.writeText(xbrlXmlSnippet);
    setCopiedXbrl(true);
    setTimeout(() => setCopiedXbrl(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'Category,Line Item,Account Code,Current Period,Prior Period\n' +
      fs.balanceSheet.assets
        .map((a) => `"Asset","${a.lineTitle}","${a.accountCode}",${a.currentPeriod},${a.priorPeriod}`)
        .join('\n') +
      '\n' +
      fs.balanceSheet.liabilities
        .map((l) => `"Liability","${l.lineTitle}","${l.accountCode}",${l.currentPeriod},${l.priorPeriod}`)
        .join('\n') +
      '\n' +
      fs.balanceSheet.equity
        .map((e) => `"Equity","${e.lineTitle}","${e.accountCode}",${e.currentPeriod},${e.priorPeriod}`)
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Financial_Statement_${entity.code}_20261031.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Report Builder &amp; Regulatory Filing Export</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Export certified GAAP/IFRS financial dossiers, SEC XBRL instances, or detailed Excel workbooks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Export Format:</span>
            <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`px-3 py-1 font-semibold rounded transition-colors flex items-center gap-1.5 ${
                  exportFormat === 'pdf'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Certified PDF Dossier</span>
              </button>
              <button
                onClick={() => setExportFormat('xbrl')}
                className={`px-3 py-1 font-semibold rounded transition-colors flex items-center gap-1.5 ${
                  exportFormat === 'xbrl'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>SEC / IFRS XBRL XML</span>
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`px-3 py-1 font-semibold rounded transition-colors flex items-center gap-1.5 ${
                  exportFormat === 'excel'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.CSV)</span>
              </button>
            </div>
          </div>

          {exportFormat === 'pdf' && (
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeAuditOpinion}
                  onChange={(e) => setIncludeAuditOpinion(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span>Include Auditor Opinion</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeReconciliationStatus}
                  onChange={(e) => setIncludeReconciliationStatus(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span>Include Reconciliation Seal</span>
              </label>
            </div>
          )}
        </div>

        {/* Content View Area */}
        <div className="overflow-y-auto flex-1 border border-slate-200 dark:border-slate-800 rounded p-4 bg-slate-50/30 dark:bg-slate-950/40">
          {/* FORMAT 1: PDF PRINTABLE DOSSIER PREVIEW */}
          {exportFormat === 'pdf' && (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md max-w-3xl mx-auto space-y-6 text-slate-900 dark:text-white font-sans">
              {/* Report Header */}
              <div className="border-b-2 border-slate-900 dark:border-white pb-4 flex justify-between items-start">
                <div>
                  <div className="text-xl font-bold tracking-tight">ACCURECON AUDIT REPORT</div>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    ENTITY: {entity.name} · TAX ID: {entity.taxId}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    REPORTING PERIOD END: OCTOBER 31, 2026 · CURRENCY: {selectedCurrency}
                  </div>
                </div>

                <div className="text-right">
                  <div className="p-2 border border-slate-300 dark:border-slate-700 rounded text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      DIGITAL AUDIT SEAL
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      IFRS / GAAP VERIFIED
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">SHA256: 0x9f4a...88b2</div>
                  </div>
                </div>
              </div>

              {/* Independent Auditor Opinion Statement */}
              {includeAuditOpinion && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded text-xs space-y-1.5 leading-relaxed">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Report of Independent Certified Public Accountants (PwC Liaison &amp; Internal Audit)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    In our opinion, the accompanying consolidated balance sheet of {entity.name} as of October 31, 2026, and the related consolidated statements of operations, stockholders’ equity, and cash flows present fairly, in all material respects, the financial position of the Company in conformity with International Financial Reporting Standards (IFRS) and U.S. Generally Accepted Accounting Principles (US-GAAP).
                  </p>
                  <div className="text-slate-500 font-mono text-[11px] pt-1">
                    Auditor Sign-off: Elena Rostova, CPA · Senior Audit Director · SOX 404 Compliant
                  </div>
                </div>
              )}

              {/* Balance Sheet Highlights */}
              <div className="space-y-2 text-xs">
                <div className="font-bold border-b border-slate-200 dark:border-slate-800 pb-1">
                  Summary Financial Highlights (in {selectedCurrency})
                </div>
                <div className="grid grid-cols-2 gap-4 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-sans text-slate-600 dark:text-slate-400">Total Consolidated Assets:</span>
                    <span className="font-bold">{formatCurrency(fs.balanceSheet.totalAssets, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-sans text-slate-600 dark:text-slate-400">Total Liabilities:</span>
                    <span className="font-bold">{formatCurrency(28750000, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-sans text-slate-600 dark:text-slate-400">Consolidated Gross Revenue:</span>
                    <span className="font-bold">{formatCurrency(43200000, selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-sans text-slate-600 dark:text-slate-400">Total Stockholders Equity:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(19900000, selectedCurrency)}</span>
                  </div>
                </div>
              </div>

              {/* Reconciliation Status */}
              {includeReconciliationStatus && (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                      Reconciliation Certification
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                      General Ledger matched to J.P. Morgan and HSBC host-to-host feeds with $0.00 unresolved material variance.
                    </span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* FORMAT 2: XBRL INSTANCE XML */}
          {exportFormat === 'xbrl' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>US-GAAP &amp; IFRS Taxonomy Standard XBRL 2.1 Instance Document</span>
                <button
                  onClick={handleCopyXbrl}
                  className="flex items-center gap-1 text-slate-800 dark:text-slate-200 hover:text-slate-900 font-semibold"
                >
                  {copiedXbrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedXbrl ? 'Copied XML' : 'Copy XML'}</span>
                </button>
              </div>
              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded border border-slate-800 overflow-x-auto leading-relaxed max-h-[400px]">
                <pre>{xbrlXmlSnippet}</pre>
              </div>
            </div>
          )}

          {/* FORMAT 3: EXCEL CSV WORKBOOK */}
          {exportFormat === 'excel' && (
            <div className="py-12 text-center space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Export Full Financial Workbook (.CSV)
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Includes all Balance Sheet line items, Chart of Accounts codes, current vs. prior period variances, and reconciliation audit tags.
              </p>
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Financial_Statement.csv</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 font-mono">
            Generated by AccuRecon Enterprise · Active Role: {activeRole}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Close
            </button>
            {exportFormat === 'pdf' && (
              <button
                onClick={handlePrintPdf}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF Dossier</span>
              </button>
            )}
            {exportFormat === 'xbrl' && (
              <button
                onClick={handleCopyXbrl}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export XBRL File</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
