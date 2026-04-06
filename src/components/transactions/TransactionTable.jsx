import { useStore } from '../../store/useFinFlowStore';
import { fmt } from '../../lib/utils';
import { useAppToast } from '../../App';
import { Search, TrendingDown, TrendingUp, Calendar, Trash2 } from 'lucide-react';

export default function TransactionTable() {
  const { state, deleteTx, setSort } = useStore();
  const toast = useAppToast();
  const { transactions, role, sortKey, sortDir, filterType, filterCat, search } = state;

  // Filter
  let txs = [...transactions];
  if (search)            txs = txs.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
  if (filterType !== 'all') txs = txs.filter(t => t.type === filterType);
  if (filterCat  !== 'all') txs = txs.filter(t => t.category === filterCat);

  // Sort
  txs.sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (sortKey === 'amount') { va = Number(va); vb = Number(vb); }
    if (sortKey === 'type') {
      // Sort income above expense if desc, or vice versa
      const scoreA = a.type === 'income' ? 1 : 0;
      const scoreB = b.type === 'income' ? 1 : 0;
      return sortDir === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1  : -1;
    return 0;
  });

  const handleSort = key => {
    let dir = 'desc';
    if (sortKey === key) dir = sortDir === 'asc' ? 'desc' : 'asc';
    setSort(key, dir);
  };

  const handleDelete = id => {
    if (role !== 'admin') { toast('Only admins can delete transactions.', 'error'); return; }
    deleteTx(id);
    toast('Transaction deleted successfully.', 'success');
  };

  const arrow = key => sortKey === key 
    ? (sortDir === 'asc' ? <TrendingUp size={14} style={{ color: 'var(--accent-purple)' }} /> : <TrendingDown size={14} style={{ color: 'var(--accent-purple)' }} />) 
    : <TrendingDown size={14} style={{ opacity: 0.2 }} />;

  return (
    <>
      {/* Desktop Table */}
      <div className="table-wrap premium-glow">
        <div className="table-inner">
          <table className="stitch-table">
            <thead>
              <tr>
                <th className={sortKey === 'date' ? 'sorted' : ''} onClick={() => handleSort('date')}>
                  <div className="th-content">Date {arrow('date')}</div>
                </th>
                <th className={sortKey === 'desc' ? 'sorted' : ''} onClick={() => handleSort('desc')}>
                  <div className="th-content">Description {arrow('desc')}</div>
                </th>
                <th className={sortKey === 'category' ? 'sorted' : ''} onClick={() => handleSort('category')}>
                  <div className="th-content">Category {arrow('category')}</div>
                </th>
                <th className={sortKey === 'type' ? 'sorted' : ''} onClick={() => handleSort('type')}>
                  <div className="th-content">Type {arrow('type')}</div>
                </th>
                <th className={sortKey === 'amount' ? 'sorted' : ''} onClick={() => handleSort('amount')}>
                  <div className="th-content">Amount {arrow('amount')}</div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="tx-tbody">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon"><Search size={48} color="var(--accent-purple)" /></div>
                      <h3>No Transactions</h3>
                      <p>Adjust filters to view records</p>
                    </div>
                  </td>
                </tr>
              ) : txs.map(t => {
                const dateStr = new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                return (
                  <tr key={t.id} className="premium-row">
                    <td><div className="cell-date"><Calendar size={12} /> {dateStr}</div></td>
                    <td><div className="cell-desc">{t.desc}</div></td>
                    <td><span className="cat-badge">{t.category}</span></td>
                    <td>
                      <span className={`type-pill ${t.type}`}>
                        {t.type === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {t.type}
                      </span>
                    </td>
                    <td className={`amount-cell ${t.type}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {role === 'admin' && (
                        <button className="delete-icon-btn" onClick={() => handleDelete(t.id)}>
                          <Trash2 size={16} />
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

      {/* Mobile Card List */}
      <div className="tx-card-list">
        {txs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={32} /></div>
            <h3>No Transactions Found</h3>
          </div>
        ) : txs.map(t => {
          const dateStr = new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          return (
            <div key={t.id} className="tx-card">
              <div className="tx-card-header">
                <div>
                  <div className="tx-card-desc">{t.desc}</div>
                  <div className="tx-card-cat">{t.category}</div>
                </div>
                <div className={`tx-card-amount ${t.type === 'income' ? 'tx-amount-income' : 'tx-amount-expense'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
              <div className="tx-card-footer">
                <div className="tx-card-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {dateStr}</div>
                {role === 'admin' && (
                  <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDelete(t.id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-footer">
        <span id="tx-count">{txs.length} transaction{txs.length !== 1 ? 's' : ''}</span>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>💾 Auto-saved to LocalStorage</span>
      </div>
    </>
  );
}
