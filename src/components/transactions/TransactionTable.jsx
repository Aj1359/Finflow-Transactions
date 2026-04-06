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

  const arrow = key => sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕';

  return (
    <>
      {/* Desktop Table */}
      <div className="table-wrap">
        <div className="table-inner">
          <table>
            <thead>
              <tr>
                <th className={sortKey === 'date'   ? 'sorted' : ''} onClick={() => handleSort('date')}>Date <span className="sort-arrow">{arrow('date')}</span></th>
                <th className={sortKey === 'desc'   ? 'sorted' : ''} onClick={() => handleSort('desc')}>Description <span className="sort-arrow">{arrow('desc')}</span></th>
                <th className={sortKey === 'category' ? 'sorted' : ''} onClick={() => handleSort('category')}>Category <span className="sort-arrow">{arrow('category')}</span></th>
                <th className={sortKey === 'type'   ? 'sorted' : ''} onClick={() => handleSort('type')}>Type <span className="sort-arrow">{arrow('type')}</span></th>
                <th className={sortKey === 'amount' ? 'sorted' : ''} onClick={() => handleSort('amount')}>Amount <span className="sort-arrow">{arrow('amount')}</span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="tx-tbody">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={32} /></div>
                      <h3>No Transactions Found</h3>
                      <p>Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : txs.map(t => {
                const dateStr = new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                return (
                  <tr key={t.id} data-id={t.id}>
                    <td>{dateStr}</td>
                    <td>{t.desc}</td>
                    <td><span className="cat-pill">{t.category}</span></td>
                    <td><span className={`tx-type-badge type-${t.type}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {t.type}</span></td>
                    <td className={t.type === 'income' ? 'tx-amount-income' : 'tx-amount-expense'}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                    <td>
                      {role === 'admin'
                        ? <button className="btn btn-danger" onClick={() => handleDelete(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14} /> Delete</button>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                      }
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
