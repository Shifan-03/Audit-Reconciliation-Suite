import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  ShieldCheck,
  GitBranch,
  Layers,
  Code2,
  Copy,
  Check,
  Terminal,
  Workflow,
  Network,
  Lock
} from 'lucide-react';

export const SystemArchitectureSpecs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stack' | 'database' | 'workflows' | 'raw_spec'>('stack');
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('journal_lines');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaTables = [
    {
      id: 'journal_lines',
      name: 'journal_lines',
      description: 'Granular double-entry transaction debits and credits tied to immutable vouchers.',
      columns: [
        { name: 'id', type: 'UUID PRIMARY KEY', note: 'Default gen_random_uuid()' },
        { name: 'entry_id', type: 'UUID NOT NULL REFERENCES journal_entries(id)', note: 'FK to voucher header' },
        { name: 'account_code', type: 'VARCHAR(32) NOT NULL REFERENCES chart_of_accounts(code)', note: 'COA account' },
        { name: 'entity_id', type: 'VARCHAR(32) NOT NULL REFERENCES entities(id)', note: 'Reporting entity' },
        { name: 'debit', type: 'NUMERIC(18, 4) NOT NULL DEFAULT 0.0000', note: 'Positive debit amount' },
        { name: 'credit', type: 'NUMERIC(18, 4) NOT NULL DEFAULT 0.0000', note: 'Positive credit amount' },
        { name: 'currency', type: 'VARCHAR(3) NOT NULL', note: 'ISO 4217 code (USD, EUR, etc)' },
        { name: 'fx_rate_to_base', type: 'NUMERIC(12, 6) NOT NULL DEFAULT 1.000000', note: 'Spot rate at entry date' },
        { name: 'line_description', type: 'TEXT', note: 'Narrative description' },
        { name: 'created_at', type: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()', note: 'System receipt timestamp' },
      ],
      indexes: [
        'CREATE INDEX idx_jlines_entry ON journal_lines(entry_id);',
        'CREATE INDEX idx_jlines_acct_entity ON journal_lines(account_code, entity_id);',
        'CREATE INDEX idx_jlines_created ON journal_lines(created_at);',
      ],
      constraints: [
        'CHECK (debit >= 0 AND credit >= 0)',
        'CHECK (debit > 0 OR credit > 0)',
        'CHECK (NOT (debit > 0 AND credit > 0)) -- Single line cannot have both debit and credit',
      ],
    },
    {
      id: 'bank_feed_transactions',
      name: 'bank_feed_transactions',
      description: 'Host-to-host and MT940 bank statement records ingested for reconciliation.',
      columns: [
        { name: 'id', type: 'UUID PRIMARY KEY', note: 'Unique bank record identifier' },
        { name: 'account_number_hash', type: 'VARCHAR(64) NOT NULL', note: 'Hashed IBAN / Account #' },
        { name: 'booking_date', type: 'DATE NOT NULL', note: 'Value/Booking date from bank' },
        { name: 'amount', type: 'NUMERIC(18, 4) NOT NULL', note: 'Positive = credit, Negative = debit' },
        { name: 'currency', type: 'VARCHAR(3) NOT NULL', note: 'Currency of bank account' },
        { name: 'bank_reference', type: 'VARCHAR(128)', note: 'Bank wire / ACH transaction ID' },
        { name: 'narrative_raw', type: 'TEXT NOT NULL', note: 'Raw unstructured bank feed string' },
        { name: 'reconciliation_status', type: 'VARCHAR(24) DEFAULT \'UNMATCHED\'', note: '\'MATCHED\', \'PROBABLE\', \'UNMATCHED\'' },
        { name: 'reconciled_voucher_id', type: 'UUID REFERENCES journal_entries(id)', note: 'Matched internal GL voucher' },
      ],
      indexes: [
        'CREATE INDEX idx_bfeed_status ON bank_feed_transactions(reconciliation_status);',
        'CREATE INDEX idx_bfeed_date_amount ON bank_feed_transactions(booking_date, amount);',
      ],
      constraints: [
        'CHECK (reconciliation_status IN (\'MATCHED\', \'PROBABLE\', \'UNMATCHED\', \'ADJUSTED\'))',
      ],
    },
    {
      id: 'reconciliation_matches',
      name: 'reconciliation_matches',
      description: 'Audit linkage records between General Ledger entries and Bank Statement records.',
      columns: [
        { name: 'id', type: 'UUID PRIMARY KEY', note: 'Match session identifier' },
        { name: 'gl_line_id', type: 'UUID NOT NULL REFERENCES journal_lines(id)', note: 'GL line item' },
        { name: 'bank_tx_id', type: 'UUID NOT NULL REFERENCES bank_feed_transactions(id)', note: 'Bank feed item' },
        { name: 'variance_amount', type: 'NUMERIC(18, 4) NOT NULL DEFAULT 0.0000', note: 'Difference if within tolerance' },
        { name: 'match_algorithm_rule', type: 'VARCHAR(64) NOT NULL', note: 'e.g. \'EXACT_1_TO_1\', \'FUZZY_REF\'' },
        { name: 'confidence_score', type: 'NUMERIC(5, 2) NOT NULL', note: 'Match score 0.00 to 100.00' },
        { name: 'approved_by_user_id', type: 'UUID NOT NULL REFERENCES system_users(id)', note: 'Sign-off user' },
        { name: 'audit_log_hash', type: 'VARCHAR(64) NOT NULL', note: 'SHA-256 integrity hash' },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_rec_gl_bank ON reconciliation_matches(gl_line_id, bank_tx_id);',
      ],
      constraints: [],
    },
    {
      id: 'three_way_matches',
      name: 'three_way_matches',
      description: 'Procurement cross-verification between Purchase Orders, Receipts, and Vendor Invoices.',
      columns: [
        { name: 'id', type: 'UUID PRIMARY KEY', note: 'Unique 3-way match header' },
        { name: 'vendor_id', type: 'VARCHAR(64) NOT NULL', note: 'Vendor identifier' },
        { name: 'po_number', type: 'VARCHAR(64) NOT NULL', note: 'Purchase Order number' },
        { name: 'grn_number', type: 'VARCHAR(64)', note: 'Goods/Services Receipt Note number' },
        { name: 'invoice_number', type: 'VARCHAR(64) NOT NULL', note: 'Vendor Invoice number' },
        { name: 'po_total_amount', type: 'NUMERIC(18, 4) NOT NULL', note: 'Authorized PO amount' },
        { name: 'invoice_total_amount', type: 'NUMERIC(18, 4) NOT NULL', note: 'Billed invoice amount' },
        { name: 'tolerance_pct_applied', type: 'NUMERIC(5, 2) NOT NULL DEFAULT 1.00', note: 'e.g. 1.00% allowed variance' },
        { name: 'match_status', type: 'VARCHAR(32) NOT NULL', note: '\'MATCHED\', \'FLAGGED_MISMATCH\', \'WITHIN_TOLERANCE\'' },
      ],
      indexes: [
        'CREATE INDEX idx_3wm_vendor ON three_way_matches(vendor_id);',
        'CREATE INDEX idx_3wm_status ON three_way_matches(match_status);',
      ],
      constraints: [],
    },
    {
      id: 'immutable_audit_logs',
      name: 'immutable_audit_logs',
      description: 'Tamper-evident cryptographically chained audit log for regulatory compliance.',
      columns: [
        { name: 'sequence_id', type: 'BIGSERIAL PRIMARY KEY', note: 'Monotonically increasing sequence' },
        { name: 'timestamp', type: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()', note: 'Clock-synced RFC 3339' },
        { name: 'actor_user_id', type: 'UUID NOT NULL REFERENCES system_users(id)', note: 'Action performer' },
        { name: 'actor_role', type: 'VARCHAR(32) NOT NULL', note: 'Active role at execution time' },
        { name: 'module_code', type: 'VARCHAR(32) NOT NULL', note: 'BANK_REC, THREE_WAY, AJE_POST' },
        { name: 'action_type', type: 'VARCHAR(32) NOT NULL', note: 'INSERT, UPDATE, APPROVE, RECONCILE' },
        { name: 'payload_snapshot', type: 'JSONB NOT NULL', note: 'Full delta state before/after' },
        { name: 'previous_block_hash', type: 'VARCHAR(64) NOT NULL', note: 'SHA-256 of block (n-1)' },
        { name: 'current_block_hash', type: 'VARCHAR(64) NOT NULL', note: 'SHA-256(prev_hash + payload + time)' },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_audit_seq ON immutable_audit_logs(sequence_id);',
        'CREATE INDEX idx_audit_time_module ON immutable_audit_logs(timestamp, module_code);',
      ],
      constraints: [
        'CHECK (current_block_hash IS NOT NULL AND length(current_block_hash) = 64)',
      ],
    },
  ];

  const fullMarkdownSpec = `# Automated Financial Statement & Audit Reconciliation Tool
## Enterprise Technical Architecture & System Specification

### 1. Executive Summary & Objective
The AccuRecon platform is an automated, enterprise-grade accounting integration, financial statement generation, multi-tier reconciliation, and forensic auditing system. It ingests accounting data from disparate ERPs (SAP S/4HANA, QuickBooks Enterprise, Tally Prime, Xero) and direct bank feeds (ISO 20022 / MT940), normalizes transactions into a canonical Chart of Accounts (COA), executes multi-factor automated reconciliation algorithms, generates GAAP/IFRS financial statements with transaction drill-downs, detects anomalies via Benford's Law and heuristic models, and maintains an immutable cryptographic SHA-256 hash-chained audit trail.

---

### 2. Recommended Enterprise Tech Stack

#### 2.1 Frontend Architecture
- **Framework**: React 19 SPA with TypeScript 5.8+ and Vite 6+
- **Styling**: Tailwind CSS v4 with dark mode token pairing and zero-pill typographic discipline
- **Data Grid & Tables**: High-density virtualization via TanStack Virtual supporting 50,000+ ledger rows at 60fps
- **Typography & Numerals**: Inter-free typographic system: 'Plus Jakarta Sans' for display hierarchy and 'JetBrains Mono' for tabular figures ('tabular-nums')
- **State & Worker Offloading**: Web Workers for local Benford's Law Chi-Square computations and SHA-256 Merkle tree verification

#### 2.2 Backend & Microservices
- **Core API Gateway**: Go (Golang) / Node.js 22 LTS with Fastify or Express
- **Reconciliation Engine**: High-throughput Go worker services processing 10,000 tx/sec with in-memory double-entry balance validation
- **Data Ingestion & Streaming**: Apache Kafka or RabbitMQ for idempotent ingestion of bank webhooks and ERP OData sync
- **Distributed Locking**: Redis 7.2 Cluster for distributed mutex locks preventing duplicate reconciliation sessions across distributed nodes

#### 2.3 Database & Storage Tier
- **Relational Primary Store**: PostgreSQL 16+ partitioned by 'fiscal_year' and 'entity_id'
- **TimescaleDB Extension**: Optimized hypertable partitioning for immutable audit log telemetry and historical FX rates
- **Object Storage**: S3-compatible storage with WORM (Write Once, Read Many) Object Lock for signed PDF dossiers and XBRL filings
- **In-Memory Cache**: Redis for transient matching matrices and active session permissions

#### 2.4 OCR & Machine Learning Forensic Engine
- **Document OCR**: Google Document AI / AWS Textract / Tesseract 5 with LayoutLMv3 for invoice bounding-box tokenization
- **Benford's Law & Anomaly Engine**: Python FastAPI microservice utilizing SciPy and scikit-learn for:
  - First-digit and second-digit logarithmic frequency testing
  - Isolation Forests for multi-dimensional outlier detection (amount, day-of-week, time-of-day, vendor frequency)
  - Levenshtein Distance & Token Sort Ratio (90%+ threshold) for fuzzy bank narrative matching

---

### 3. Step-by-Step Reconciliation & Audit Workflow

\`\`\`
[ERP Sync (SAP, QB, Tally, Xero)]        [Bank Feeds (ISO 20022 / MT940)]
               │                                         │
               ▼                                         ▼
   [Normalization & COA Mapping]             [Bank Feed Ingestion Queue]
               │                                         │
               └───────────────────┬─────────────────────┘
                                   ▼
                   [Phase 1: Exact 1-to-1 Match]
                   (Ref Token + Booking Date + Amount = 0)
                                   │
                           (Unmatched pool)
                                   ▼
                   [Phase 2: One-to-Many Bundle Match]
                   (Single wire vs multiple invoice batches)
                                   │
                           (Unmatched pool)
                                   ▼
                   [Phase 3: Fuzzy Heuristic & Fee Match]
                   (Levenshtein text > 85%, Variance <= $50 wire fee)
                                   │
                                   ├───────────────► Auto-Generate AJE Suggestion
                                   ▼
                   [Phase 4: Three-Way Procurement Match]
                   (PO Price/Qty vs GRN Received vs Vendor Inv)
                                   │
                                   ▼
                   [Phase 5: AI Anomaly & Benford Test]
                   (Duplicate check, threshold split, weekend entries)
                                   │
                                   ▼
                   [Phase 6: SHA-256 Hash Chain Logging]
                   (Block n = Hash(Block n-1 + Action + Timestamp))
\`\`\`
`;

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            System Architecture &amp; Technical Specifications
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Comprehensive system specification, relational database schemas, tech stack justification, and algorithmic workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setActiveSubTab('stack')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                activeSubTab === 'stack'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Recommended Stack
            </button>
            <button
              onClick={() => setActiveSubTab('database')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                activeSubTab === 'database'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Database Schema &amp; ERD
            </button>
            <button
              onClick={() => setActiveSubTab('workflows')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                activeSubTab === 'workflows'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Engine Workflows
            </button>
            <button
              onClick={() => setActiveSubTab('raw_spec')}
              className={`px-3 py-1.5 font-medium rounded transition-colors ${
                activeSubTab === 'raw_spec'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Full Spec Markdown
            </button>
          </div>

          <button
            onClick={() => copyToClipboard(fullMarkdownSpec)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Spec' : 'Copy Full Spec'}</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Recommended Tech Stack */}
      {activeSubTab === 'stack' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Frontend */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Frontend Web Client
                </h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-white">React 19 &amp; TypeScript:</strong> Strict static type checking across financial vouchers and balance invariants.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Tailwind CSS v4:</strong> Domain-specific enterprise styling with zero-pill metadata discipline and dark-mode pairing.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">TanStack Virtual:</strong> High-density DOM virtualization rendering 100,000+ line items with 60 FPS scrolling.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Web Workers:</strong> Client-side cryptographic hash verification and Benford’s Law Chi-Square distribution calculation off the main thread.
                </li>
              </ul>
            </div>

            {/* Backend & Microservices */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Backend Microservices
                </h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-white">Go (Golang) Matching Worker:</strong> High-throughput, memory-efficient reconciliation engine capable of 10,000 record pairs/sec.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Node.js / Express API Gateway:</strong> REST &amp; GraphQL federation for ERP connectors and statement exports.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Apache Kafka:</strong> Distributed, fault-tolerant message streaming for bank webhooks and ERP change-data-capture (CDC).
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Redis Cluster:</strong> Ephemeral matching state and distributed Redlock locks to prevent race conditions during book closes.
                </li>
              </ul>
            </div>

            {/* Database & Storage */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Database &amp; Immutable Storage
                </h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-white">PostgreSQL 16+:</strong> Partitioned by <code className="font-mono text-slate-800 dark:text-slate-200">fiscal_year</code> and <code className="font-mono text-slate-800 dark:text-slate-200">entity_id</code> with strict foreign keys and check constraints.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">TimescaleDB:</strong> Time-series hypertables for high-frequency audit logs and continuous FX spot quotes.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">WORM Cloud Storage (S3/GCS):</strong> Write-Once-Read-Many object lock compliance for exported SEC XBRL dossiers and certified audit PDFs.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">SHA-256 Merkle Chaining:</strong> Linear cryptographic hash linked records for all journal edits.
                </li>
              </ul>
            </div>

            {/* OCR & Document AI */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  4. OCR &amp; Document AI Engine
                </h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-white">LayoutLMv3 / Document AI:</strong> Multi-modal document understanding extracting vendor names, dates, subtotals, and line-item tables.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Tesseract 5 Fallback:</strong> Local edge OCR for air-gapped on-premise deployments.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Confidence Scoring:</strong> Automated flagging of any document field extracted with &lt;95% confidence for human auditor review.
                </li>
              </ul>
            </div>

            {/* Anomaly & ML Forensics */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  5. AI Anomaly &amp; Fraud Detection
                </h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-white">Benford’s Law Chi-Square Engine:</strong> Automated first and second digit tests flagging statistical anomalies at p &lt; 0.01.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Isolation Forest:</strong> Unsupervised multi-variable anomaly scoring identifying out-of-band weekend manual journal entries.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Threshold Evasion Classifier:</strong> Pattern matcher for split requisitions ($9,950 + $9,900) bypassing $10k CFO approval thresholds.
                </li>
              </ul>
            </div>

            {/* Security & Compliance */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  6. Enterprise Security &amp; SOX 404
                </h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-white">mTLS &amp; TLS 1.3:</strong> Mutual TLS certificate pinning on all ERP and banking host-to-host links.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">AES-256-GCM Column Encryption:</strong> Bank account IBANs and tax IDs encrypted at rest with envelope KMS keys.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Segregation of Duties (SoD):</strong> Hardcoded enforcement preventing entry preparers from authorizing their own reconciliations.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Database Schema & ERD */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Table Selector Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Relational Schema Tables
              </div>
              {schemaTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`w-full text-left p-3 rounded text-xs transition-colors border ${
                    selectedTable === t.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent font-bold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-mono">{t.name}</div>
                  <div className="text-[11px] font-sans opacity-80 mt-0.5 line-clamp-1">{t.description}</div>
                </button>
              ))}
            </div>

            {/* Table Details & DDL */}
            <div className="lg:col-span-3 space-y-4">
              {(() => {
                const current = schemaTables.find((t) => t.id === selectedTable) || schemaTables[0];
                return (
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                          TABLE {current.name}
                        </span>
                        <span className="text-xs text-slate-400">· PostgreSQL DDL</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {current.description}
                      </p>
                    </div>

                    {/* Columns Table */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-medium">
                            <th className="py-2 px-3 font-mono">Column Name</th>
                            <th className="py-2 px-3 font-mono">Data Type &amp; Key</th>
                            <th className="py-2 px-3">Description / Semantic Invariant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                          {current.columns.map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{c.type}</td>
                              <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">{c.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Indexes & Constraints */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                        <div className="font-sans font-bold text-slate-800 dark:text-slate-200 mb-2">
                          Performance Indexes
                        </div>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {current.indexes.map((idx, i) => (
                            <li key={i}>{idx}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                        <div className="font-sans font-bold text-slate-800 dark:text-slate-200 mb-2">
                          Data Integrity Constraints
                        </div>
                        {current.constraints.length > 0 ? (
                          <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                            {current.constraints.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-slate-400">No custom check constraints.</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Reconciliation Engine Workflows */}
      {activeSubTab === 'workflows' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow 1: Multi-Factor Reconciliation Engine */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Automated Bank Reconciliation Execution Pipeline</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 1: Normalization &amp; Canonical Cleansing
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Parse MT940 / CAMT.053 XML and ERP journal vouchers into standard float representation. Strip non-alphanumeric punctuation from reference tokens.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 2: Tier 1 Exact 1:1 Matching
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Match where: <code className="font-mono text-emerald-600">GL.amount == Bank.amount</code> AND <code className="font-mono text-emerald-600">GL.ref == Bank.ref</code> within &plusmn;3 days window. Reconciled items are immediately marked and removed from pool.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 3: Tier 2 One-to-Many Bundle Matching
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Evaluates single wire batch disbursements from clearing accounts against multiple individual accounts payable vouchers using recursive knapsack subset-sum algorithm.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 4: Tier 3 Fuzzy Text &amp; Intermediary Fee Detection
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Levenshtein distance calculation on beneficiary narratives (&gt;85% match). If amount differs by $15–$50, tag as "Probable Match" and generate a 1-click Bank Wire Fee Adjusting Journal Entry.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow 2: Cryptographic Audit Trail */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Immutable Cryptographic Audit Trail Architecture</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 1: Event Interception &amp; Mutex
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Whenever an accountant or system worker reconciles an item, posts an AJE, or approves an elimination, an immutable transactional event is created inside a PostgreSQL database transaction.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 2: Linear Hash Chaining
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    <code className="font-mono text-emerald-600">CurrentHash = SHA256(PrevHash + ActorID + Action + PayloadJSON + Timestamp)</code>. Any alteration of row n invalidates all subsequent rows n+1, guaranteeing tamper-evidence.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Step 3: Periodic Merkle Root Anchoring
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    At midnight UTC, the daily Merkle Root of all audit hashes is signed with the enterprise RSA-4096 private key and pushed to an external WORM object store for external PCAOB / PwC auditor verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Raw Spec Markdown Preview */}
      {activeSubTab === 'raw_spec' && (
        <div className="p-6 bg-slate-950 text-slate-200 border border-slate-800 rounded font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
          <pre>{fullMarkdownSpec}</pre>
        </div>
      )}
    </div>
  );
};
