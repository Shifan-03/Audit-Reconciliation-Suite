import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Scan,
  RefreshCw,
  CheckCircle,
  Database,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  Edit2,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ErpConnection, ChartOfAccount } from '../types';
import { ERP_CONNECTIONS, CHART_OF_ACCOUNTS, OCR_SAMPLE_DOCUMENTS } from '../data/mockData';

export const DataHub: React.FC = () => {
  const [connections, setConnections] = useState<ErpConnection[]>(ERP_CONNECTIONS);
  const [coaList, setCoaList] = useState<ChartOfAccount[]>(CHART_OF_ACCOUNTS);
  const [activeTab, setActiveTab] = useState<'connectors' | 'file_ingest' | 'coa_mapping'>('connectors');
  const [searchCOA, setSearchCOA] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // OCR state
  const [selectedSampleDoc, setSelectedSampleDoc] = useState(OCR_SAMPLE_DOCUMENTS[0]);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [editableOcr, setEditableOcr] = useState({
    vendor: OCR_SAMPLE_DOCUMENTS[0].vendor,
    invoiceNo: OCR_SAMPLE_DOCUMENTS[0].invoiceNo,
    date: OCR_SAMPLE_DOCUMENTS[0].date,
    total: OCR_SAMPLE_DOCUMENTS[0].total,
    category: OCR_SAMPLE_DOCUMENTS[0].category,
  });
  const [ocrCommitSuccess, setOcrCommitSuccess] = useState<string | null>(null);

  // COA inline edit state
  const [editingCOAId, setEditingCOAId] = useState<string | null>(null);
  const [editCOATag, setEditCOATag] = useState('');

  const handleSyncConnector = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                lastSyncTime: 'Just now (Synced 420 new ledger records)',
                recordsIngested: c.recordsIngested + 420,
              }
            : c
        )
      );
      setSyncingId(null);
    }, 1200);
  };

  const handleSelectSample = (doc: typeof OCR_SAMPLE_DOCUMENTS[0]) => {
    setSelectedSampleDoc(doc);
    setOcrScanning(true);
    setOcrCommitSuccess(null);
    setTimeout(() => {
      setOcrScanning(false);
      setEditableOcr({
        vendor: doc.vendor,
        invoiceNo: doc.invoiceNo,
        date: doc.date,
        total: doc.total,
        category: doc.category,
      });
    }, 800);
  };

  const handleCommitOcrToLedger = () => {
    const isBDT = selectedSampleDoc?.fileName.includes('Dhaka') || editableOcr.category.includes('Dhaka');
    const symbol = isBDT ? '৳' : '$';
    setOcrCommitSuccess(
      `Successfully posted invoice ${editableOcr.invoiceNo} (${symbol}${editableOcr.total.toLocaleString()}) to General Ledger and queued for Three-Way Matching.`
    );
    setTimeout(() => setOcrCommitSuccess(null), 4000);
  };

  const handleSaveCOA = (id: string) => {
    setCoaList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, standardMapping: editCOATag, confidenceScore: 100 } : c))
    );
    setEditingCOAId(null);
  };

  const filteredCOA = coaList.filter(
    (c) =>
      c.code.toLowerCase().includes(searchCOA.toLowerCase()) ||
      c.name.toLowerCase().includes(searchCOA.toLowerCase()) ||
      c.standardMapping.toLowerCase().includes(searchCOA.toLowerCase())
  );

  const getConnectorBorderColor = (conn: typeof connections[0]) => {
    if (conn.type === 'MFS_BKASH') return 'border-t-4 border-t-pink-500 hover:border-pink-400';
    if (conn.id === 'ERP-BEFTN') return 'border-t-4 border-t-teal-500 hover:border-teal-400';
    if (conn.type === 'SAP') return 'border-t-4 border-t-blue-500 hover:border-blue-400';
    if (conn.type === 'QUICKBOOKS') return 'border-t-4 border-t-emerald-500 hover:border-emerald-400';
    if (conn.type === 'TALLY') return 'border-t-4 border-t-amber-500 hover:border-amber-400';
    if (conn.type === 'XERO') return 'border-t-4 border-t-cyan-500 hover:border-cyan-400';
    return 'border-t-4 border-t-indigo-500 hover:border-indigo-400';
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Data Ingestion &amp; Integration Hub
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time ERP API connectors (including Bangladesh bKash MFS &amp; BEFTN/NPSB), ISO 20022 bank feed pipelines, OCR document extraction, and Chart of Accounts alignment.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
          <button
            onClick={() => setActiveTab('connectors')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'connectors'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ERP &amp; Bank Connectors ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('file_ingest')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'file_ingest'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            OCR Document AI &amp; Ingestion
          </button>
          <button
            onClick={() => setActiveTab('coa_mapping')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'coa_mapping'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            COA Mapping Workbench
          </button>
        </div>
      </div>

      {/* Tab 1: Connectors */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${getConnectorBorderColor(conn)}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{conn.type}</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {conn.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {conn.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Auth Protocol:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{conn.authType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Protocol:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{conn.apiVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Latency:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{conn.latencyMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Records Ingested:</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {conn.recordsIngested.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate max-w-[170px]">{conn.lastSyncTime}</span>
                  <button
                    onClick={() => handleSyncConnector(conn.id)}
                    disabled={syncingId === conn.id}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingId === conn.id ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Connection Integration Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enterprise Direct Connector Protocols
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Supports automated ISO 20022 CAMT.053 / MT940 Swift bank messaging, SAP NetWeaver RFC, QuickBooks Online OAuth 2.0 PKCE, and Tally Prime XML-RPC.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">TLS 1.3 / mTLS Enforced</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: File Ingestion & OCR */}
      {activeTab === 'file_ingest' && (
        <div className="space-y-6">
          {/* Commit Success Alert */}
          {ocrCommitSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{ocrCommitSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Zone & Selectable Sample Documents */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Format Ingestion &amp; Document AI
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a sample enterprise voucher or upload a document to simulate LayoutLMv3 optical extraction.
                </p>
              </div>

              {/* Sample Document Library */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Sample Enterprise Document
                </span>
                {OCR_SAMPLE_DOCUMENTS.map((doc) => {
                  const isSelected = selectedSampleDoc.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectSample(doc)}
                      className={`w-full text-left p-3 rounded text-xs transition-colors border ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{doc.title}</span>
                        <span className="font-mono text-[11px]">${doc.total.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] opacity-80 mt-1">
                        <span>{doc.fileName}</span>
                        <span>·</span>
                        <span>Conf: {doc.confidence}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Drag & drop visual placeholder */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-5 text-center hover:border-slate-400 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Drop custom PDF or CSV statement here
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Auto-classifies into standard COA taxonomy nodes
                </div>
              </div>
            </div>

            {/* OCR Neural Vision Extraction & Editable Nodes */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scan className="w-4 h-4 text-emerald-600" />
                    <span>Neural OCR Extracted Nodes: {selectedSampleDoc.fileName}</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Confidence: {selectedSampleDoc.confidence}%
                  </span>
                </div>

                {ocrScanning ? (
                  <div className="py-16 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Neural layout analysis: Tokenizing optical bounding boxes...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    {/* Bounding Box Tokens Visual */}
                    <div className="p-3 bg-slate-950 text-slate-100 rounded text-xs font-mono space-y-2">
                      <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                        DOCUMENT BOUNDING BOX MAPPINGS (LAYOUTLMV3)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSampleDoc.boundingNodes.map((node, i) => (
                          <div key={i} className="p-1.5 border border-emerald-500/50 bg-emerald-950/20 rounded">
                            <span className="text-slate-400 text-[9px] block uppercase">{node.field}</span>
                            <span className="font-bold text-white text-[11px] truncate block">{node.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editable Document Fields */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-500 block text-[10px]">VENDOR NAME</label>
                          <input
                            type="text"
                            value={editableOcr.vendor}
                            onChange={(e) => setEditableOcr({ ...editableOcr, vendor: e.target.value })}
                            className="w-full mt-0.5 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block text-[10px]">INVOICE REFERENCE</label>
                          <input
                            type="text"
                            value={editableOcr.invoiceNo}
                            onChange={(e) => setEditableOcr({ ...editableOcr, invoiceNo: e.target.value })}
                            className="w-full mt-0.5 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block text-[10px]">DATE</label>
                          <input
                            type="date"
                            value={editableOcr.date}
                            onChange={(e) => setEditableOcr({ ...editableOcr, date: e.target.value })}
                            className="w-full mt-0.5 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block text-[10px]">GROSS AMOUNT ($)</label>
                          <input
                            type="number"
                            value={editableOcr.total}
                            onChange={(e) => setEditableOcr({ ...editableOcr, total: parseFloat(e.target.value) || 0 })}
                            className="w-full mt-0.5 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-bold font-mono text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="text-slate-500 block text-[10px]">ASSIGNED CHART OF ACCOUNTS (COA)</label>
                        <input
                          type="text"
                          value={editableOcr.category}
                          onChange={(e) => setEditableOcr({ ...editableOcr, category: e.target.value })}
                          className="w-full mt-0.5 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={handleCommitOcrToLedger}
                  disabled={ocrScanning}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Commit to General Ledger &amp; 3-Way Queue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Chart of Accounts Mapping */}
      {activeTab === 'coa_mapping' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search account code, name, or taxonomy tag..."
                value={searchCOA}
                onChange={(e) => setSearchCOA(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredCOA.length} of {coaList.length} Accounts
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">Local Account Code</th>
                  <th className="py-2.5 px-3">Account Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Standard IFRS / US-GAAP Taxonomy Tag</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredCOA.map((coa) => {
                  const isEditing = editingCOAId === coa.id;
                  return (
                    <tr key={coa.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {coa.code}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-800 dark:text-slate-200">
                        {coa.name}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-slate-600 dark:text-slate-400">
                          {coa.category} · {coa.subcategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCOATag}
                            onChange={(e) => setEditCOATag(e.target.value)}
                            className="px-2 py-0.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full"
                          />
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{coa.standardMapping}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        {coa.confidenceScore}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveCOA(coa.id)}
                            className="px-2 py-0.5 text-[11px] font-semibold text-white bg-emerald-600 rounded"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingCOAId(coa.id);
                              setEditCOATag(coa.standardMapping);
                            }}
                            className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center mx-auto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
