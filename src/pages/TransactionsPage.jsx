/* ═══════════════════════════════════════════════════════════
   FinFlow — Transactions Page  |  src/pages/TransactionsPage.jsx
   ═══════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { useStore } from '../store/useFinFlowStore';
import { CATEGORIES } from '../lib/constants';
import { download } from '../lib/utils';
import TransactionTable from '../components/transactions/TransactionTable';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import { useAppToast } from '../App';

export default function TransactionsPage() {
  const { state, setFilter } = useStore();
  const toast = useAppToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const isActive = state.activeSection === 'transactions';
  const isAdmin  = state.role === 'admin';

  const exportCSV = () => {
    const { transactions } = state;
    const headers = ['Date','Description','Category','Type','Amount'];
    const rows = transactions.map(t => [t.date, `"${t.desc}"`, t.category, t.type, t.amount]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    download('finflow_transactions.csv', csv, 'text/csv');
    toast('Exported as CSV! 📄', 'success');
    setExportOpen(false);
  };

  const exportJSON = () => {
    download('finflow_transactions.json', JSON.stringify(state.transactions, null, 2), 'application/json');
    toast('Exported as JSON! 📦', 'success');
    setExportOpen(false);
  };

  return (
    <>
      <section className={`section${isActive ? ' active' : ''}`} id="section-transactions">
        <div className="section-header">
          <div>
            <h2>Transactions</h2>
            <p>Your complete financial record</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {isAdmin && (
              <div className="export-menu-wrap admin-only">
                <button className="btn btn-outline" id="btn-export" onClick={e => { e.stopPropagation(); setExportOpen(v => !v); }}>
                  📤 Export ▾
                </button>
                <div className={`export-menu${exportOpen ? ' open' : ''}`} id="export-menu">
                  <div className="export-option" id="export-csv" onClick={exportCSV}>📄 Export CSV</div>
                  <div className="export-option" id="export-json" onClick={exportJSON}>📦 Export JSON</div>
                </div>
              </div>
            )}
            {isAdmin && (
              <button className="btn btn-primary admin-only" id="btn-add-tx" onClick={() => setModalOpen(true)}>
                + Add Transaction
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="tx-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              id="tx-search"
              placeholder="Search by description or category…"
              value={state.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>
          <select id="filter-type" className="filter-select" value={state.filterType} onChange={e => setFilter('filterType', e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select id="filter-cat" className="filter-select" value={state.filterCat} onChange={e => setFilter('filterCat', e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <TransactionTable />
      </section>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Close export menu on outside click */}
      {exportOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setExportOpen(false)} />}
    </>
  );
}
