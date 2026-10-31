import React from 'react';
import { Download, ShieldCheck, Sun, Moon, Sparkles } from 'lucide-react';
import { CurrencyCode, UserRole, FinancialPeriod } from '../types';
import { ENTITIES, SYSTEM_USERS } from '../data/mockData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEntityId: string;
  setSelectedEntityId: (id: string) => void;
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (curr: CurrencyCode) => void;
  selectedPeriod: FinancialPeriod;
  setSelectedPeriod: (p: FinancialPeriod) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenExportModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedEntityId,
  setSelectedEntityId,
  selectedCurrency,
  setSelectedCurrency,
  selectedPeriod,
  setSelectedPeriod,
  activeRole,
  setActiveRole,
  onOpenExportModal,
  isDarkMode,
  setIsDarkMode,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', color: 'hover:text-emerald-500' },
    { id: 'datahub', label: 'Data Hub & ERP', color: 'hover:text-cyan-500' },
    { id: 'reconciliation', label: 'Reconciliation', color: 'hover:text-blue-500' },
    { id: 'statements', label: 'Financial Statements', color: 'hover:text-indigo-500' },
    { id: 'audit', label: 'Audit & Compliance', color: 'hover:text-violet-500' },
    { id: 'architecture', label: 'System Specifications', color: 'hover:text-amber-500' },
  ];

  const roleColorMap: Record<UserRole, string> = {
    LEAD_AUDITOR: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700',
    SENIOR_ACCOUNTANT: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700',
    COMPLIANCE_OFFICER: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700',
    ADMIN: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700',
    VIEWER: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 3-Zone Top Bar Contract */}
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-emerald-500/20">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                AccuRecon Enterprise
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                BD &amp; Global Edition
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: 6 Concise Nav Links with Vibrant Active States */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap transition-all duration-150 py-1.5 px-1 relative ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Dossier</span>
          </button>
        </div>
      </header>

      {/* Sub-Bar: Workspace Controls & Filter Strip */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/70 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Entity & Currency Context */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Reporting Entity:</span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              {ENTITIES.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} [{ent.currency}]
                </option>
              ))}
            </select>

            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">|</span>

            <span className="text-slate-500 dark:text-slate-400 font-medium">Fiscal Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as FinancialPeriod)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="Q4_2026">Q4 2026 (YTD Oct 31)</option>
              <option value="Q3_2026">Q3 2026 (Ended Sep 30)</option>
              <option value="FY_2025">FY 2025 (Annual Audited)</option>
              <option value="TTM_2026">Trailing 12 Months (TTM)</option>
            </select>

            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">|</span>

            {/* Currency Selector with BDT and Interactive Color Highlights */}
            <span className="text-slate-500 dark:text-slate-400 font-medium">Currency:</span>
            <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
              {(['USD', 'EUR', 'GBP', 'JPY', 'INR', 'BDT'] as CurrencyCode[]).map((cur) => {
                const isSelected = selectedCurrency === cur;
                return (
                  <button
                    key={cur}
                    onClick={() => setSelectedCurrency(cur)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      isSelected
                        ? cur === 'BDT'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                          : 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cur === 'BDT' ? '৳ BDT' : cur}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Impersonation & Mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Simulate Role:</span>
            </div>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className={`border rounded-md px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs ${roleColorMap[activeRole]}`}
            >
              {SYSTEM_USERS.map((u) => (
                <option key={u.id} value={u.role}>
                  {u.role.replace('_', ' ')} — {u.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
