import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Layers,
  Search,
  Filter,
  AlertOctagon,
  RefreshCw,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { AuditTrailEntry, UserProfile, UserRole } from '../types';
import { SYSTEM_USERS } from '../data/mockData';

interface AuditTrailRBACProps {
  auditEntries: AuditTrailEntry[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onVerifyHashChain: () => void;
  isVerifyingChain: boolean;
  chainVerificationStatus: 'UNVERIFIED' | 'VALID' | 'CORRUPT';
}

export const AuditTrailRBAC: React.FC<AuditTrailRBACProps> = ({
  auditEntries,
  activeRole,
  setActiveRole,
  onVerifyHashChain,
  isVerifyingChain,
  chainVerificationStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'audit_log' | 'rbac'>('audit_log');
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tamper simulation state
  const [tamperedBlockId, setTamperedBlockId] = useState<string | null>(null);
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<AuditTrailEntry | null>(null);

  const currentUser = SYSTEM_USERS.find((u) => u.role === activeRole) || SYSTEM_USERS[0];

  const handleSimulateTamper = (id: string) => {
    setTamperedBlockId(id);
  };

  const handleRestoreTamper = () => {
    setTamperedBlockId(null);
    onVerifyHashChain();
  };

  const effectiveStatus = tamperedBlockId ? 'CORRUPT' : chainVerificationStatus;

  const filteredEntries = auditEntries.filter((e) => {
    const matchesModule = filterModule === 'ALL' || e.module === filterModule;
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.currentHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Immutable Audit Trail &amp; Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Cryptographic SHA-256 hash chaining, tamper-evident audit logs, and granular SOC 2 / SOX segregation of duties.
          </p>
        </div>

        <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeTab === 'audit_log'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cryptographic Audit Log
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeTab === 'rbac'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            RBAC &amp; Permission Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: Audit Log */}
      {activeTab === 'audit_log' && (
        <div className="space-y-4">
          {/* Hash Chain Verification Strip */}
          <div
            className={`p-4 border rounded transition-colors ${
              effectiveStatus === 'CORRUPT'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Lock
                  className={`w-4 h-4 ${
                    effectiveStatus === 'CORRUPT' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  SHA-256 Cryptographic Hash Chain Status
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {effectiveStatus === 'CORRUPT' ? (
                  <span className="text-rose-600 font-bold">
                    CRITICAL: Unverified block hash detected at {tamperedBlockId}. Subsequent hash tree broken!
                  </span>
                ) : (
                  'Each journal voucher and reconciliation action is hashed with the previous record’s hash to ensure zero backdated edits.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {effectiveStatus === 'VALID' && (
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Chain Integrity Verified
                </span>
              )}

              {effectiveStatus === 'CORRUPT' ? (
                <button
                  onClick={handleRestoreTamper}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors whitespace-nowrap shadow-sm"
                >
                  Restore Legitimate State &amp; Re-verify
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleSimulateTamper('LOG-002')}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded hover:bg-rose-100 transition-colors whitespace-nowrap"
                  >
                    Simulate Backdated Edit Attack
                  </button>
                  <button
                    onClick={onVerifyHashChain}
                    disabled={isVerifyingChain}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors whitespace-nowrap shadow-sm"
                  >
                    {isVerifyingChain ? 'Verifying Merkle Tree...' : 'Verify Cryptographic Ledger Hash'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit descriptions, actors, or hash strings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Module:</span>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1 text-xs"
              >
                <option value="ALL">All Modules</option>
                <option value="BANK_REC">Bank Reconciliation</option>
                <option value="INTERCOMPANY">Intercompany</option>
                <option value="THREE_WAY">Three-Way Matching</option>
                <option value="FINANCIAL_STMT">Financial Statements</option>
              </select>
            </div>
          </div>

          {/* Audit Entries Timeline / Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">Log ID / Timestamp</th>
                  <th className="py-2.5 px-3">Actor &amp; Role</th>
                  <th className="py-2.5 px-3">Action &amp; Module</th>
                  <th className="py-2.5 px-3">Audit Narrative</th>
                  <th className="py-2.5 px-3">Cryptographic Block Hash</th>
                  <th className="py-2.5 px-3 text-center">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredEntries.map((log) => {
                  const isTamperedRow = tamperedBlockId === log.id;
                  const isRowCorruptedByParent =
                    tamperedBlockId !== null &&
                    filteredEntries.findIndex((e) => e.id === log.id) >
                      filteredEntries.findIndex((e) => e.id === tamperedBlockId);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedEntryDetail(log)}
                      className={`cursor-pointer transition-colors ${
                        isTamperedRow
                          ? 'bg-rose-100/60 dark:bg-rose-950/60'
                          : isRowCorruptedByParent
                          ? 'bg-amber-50/40 dark:bg-amber-950/30'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{log.id}</div>
                        <div className="text-slate-400 text-[10px]">{log.timestamp}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{log.action}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{log.module}</div>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-sm text-slate-700 dark:text-slate-300">
                        {isTamperedRow ? (
                          <span className="text-rose-600 font-bold block">
                            [TAMPERED CONTENT]: Entry payload altered without re-signing hash!
                          </span>
                        ) : null}
                        {log.description}
                      </td>
                      <td className="py-3 px-3 max-w-[140px]">
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate" title={log.currentHash}>
                          {log.currentHash}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate" title={`Prev: ${log.previousHash}`}>
                          &larr; {log.previousHash.substring(0, 14)}...
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isTamperedRow || isRowCorruptedByParent ? (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                            CORRUPT
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            VERIFIED
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

      {/* Entry Detail Modal */}
      {selectedEntryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>Audit Block Payload: {selectedEntryDetail.id}</span>
              </h3>
              <button
                onClick={() => setSelectedEntryDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 text-emerald-400 rounded overflow-x-auto">
                <pre>{JSON.stringify(selectedEntryDetail, null, 2)}</pre>
              </div>
              <p className="font-sans text-slate-500 text-[11px]">
                Calculated Hash: SHA256({selectedEntryDetail.previousHash.substring(0, 8)}... + {selectedEntryDetail.action} + {selectedEntryDetail.timestamp})
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEntryDetail(null)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC & Segregation of Duties Matrix */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Active Persona Banner */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                <span>Active Profile</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">{currentUser.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{currentUser.title}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Switch Active Role:</span>
              <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
                {SYSTEM_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setActiveRole(u.role)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeRole === u.role
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {u.role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Granular Permission Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-x-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                SOX 404 Segregation of Duties (SoD) Permission Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensures that individuals preparing adjusting journal entries cannot unilaterally sign-off or approve financial statements.
              </p>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">System Capability / Control Action</th>
                  {SYSTEM_USERS.map((u) => (
                    <th
                      key={u.id}
                      className={`py-2.5 px-4 text-center ${
                        activeRole === u.role ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white' : ''
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Run Automated Matching &amp; Reconciliation Engine
                  </td>
                  {SYSTEM_USERS.map((u) => (
                    <td key={u.id} className="py-3 px-4 text-center">
                      {u.permissions.canRunReconciliation ? (
                        <span className="text-emerald-600 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Post Adjusting Journal Entries (Bank Charges / Accruals)
                  </td>
                  {SYSTEM_USERS.map((u) => (
                    <td key={u.id} className="py-3 px-4 text-center">
                      {u.permissions.canPostAdjustingEntries ? (
                        <span className="text-emerald-600 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Modify Chart of Accounts (COA) Taxonomy Mappings
                  </td>
                  {SYSTEM_USERS.map((u) => (
                    <td key={u.id} className="py-3 px-4 text-center">
                      {u.permissions.canModifyCOAMapping ? (
                        <span className="text-emerald-600 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Approve Consolidated Financial Statements
                  </td>
                  {SYSTEM_USERS.map((u) => (
                    <td key={u.id} className="py-3 px-4 text-center">
                      {u.permissions.canApproveStatements ? (
                        <span className="text-emerald-600 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Formal Audit Opinion Sign-Off (Lead Auditor / CPA)
                  </td>
                  {SYSTEM_USERS.map((u) => (
                    <td key={u.id} className="py-3 px-4 text-center">
                      {u.permissions.canSignOffAudit ? (
                        <span className="text-emerald-600 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    Generate &amp; Export SEC XBRL / PDF Dossiers
                  </td>
                  {SYSTEM_USERS.map((u) => (
                    <td key={u.id} className="py-3 px-4 text-center">
                      {u.permissions.canExportXBRL ? (
                        <span className="text-emerald-600 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
