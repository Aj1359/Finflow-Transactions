import { useState } from 'react';
import { uid, today, fmt, computeTotals } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import { useStore } from '../../store/useFinFlowStore';
import { useAppToast } from '../../App';

export default function AddTransactionModal({ open, onClose }) {
  const { state, addTx } = useStore();
  const toast = useAppToast();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ desc: '', amount: '', date: today(), type: '', category: '' });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    const { desc, amount, type, category, date } = form;
    const amt = parseFloat(amount);

    if (!desc || !amount || !type || !category || !date) {
      setError('All fields are required.'); return;
    }
    if (amt <= 0 || isNaN(amt)) {
      setError('Amount must be a positive number.'); return;
    }

    if (type === 'expense') {
      const { balance } = computeTotals(state.transactions);
      if (amt > balance) {
        setError(`❌ Insufficient balance! Available: ${fmt(balance)}. Cannot add expense of ${fmt(amt)}.`);
        toast(`Rejected: expense exceeds balance (${fmt(balance)})`, 'error');
        return;
      }
    }

    const tx = { id: uid(), date, desc, category, type, amount: amt };
    addTx(tx);
    onClose();
    toast(`Transaction "${desc}" added! ${type === 'income' ? '💰' : '💳'}`, 'success');
    setForm({ desc: '', amount: '', date: today(), type: '', category: '' });
    setError('');
  };

  const handleClose = () => {
    onClose();
    setError('');
    setForm({ desc: '', amount: '', date: today(), type: '', category: '' });
  };

  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} id="modal-add" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h3>➕ Add Transaction</h3>
          <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="error-msg show">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="add-desc">Description *</label>
            <input id="add-desc" type="text" placeholder="e.g. Monthly Salary, Grocery run…" value={form.desc} onChange={e => set('desc', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-amount">Amount (₹) *</label>
              <input id="add-amount" type="number" placeholder="0.00" min="1" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="add-date">Date *</label>
              <input id="add-date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-type">Type *</label>
              <select id="add-type" value={form.type} onChange={e => set('type', e.target.value)} required>
                <option value="">Select type</option>
                <option value="income">📈 Income</option>
                <option value="expense">📉 Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="add-cat">Category *</label>
              <select id="add-cat" value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn btn-outline" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-success">✅ Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}
