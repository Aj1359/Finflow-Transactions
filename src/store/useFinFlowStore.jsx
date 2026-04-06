
import { createContext, useContext, useReducer, useCallback } from 'react';
import { SEED_DATA, LS_KEYS } from '../lib/constants';

/* ── Initial State ── */
function loadState() {
  try {
    const savedTx    = localStorage.getItem(LS_KEYS.TX);
    const savedRole  = localStorage.getItem(LS_KEYS.ROLE);
    const savedTheme = localStorage.getItem(LS_KEYS.THEME);
    const savedBudgets = localStorage.getItem(LS_KEYS.BUDGETS);
    return {
      transactions:  savedTx ? JSON.parse(savedTx) : [...SEED_DATA],
      role:          savedRole  || 'admin',
      theme:         savedTheme || 'light',
      budgets:       savedBudgets ? JSON.parse(savedBudgets) : {},
      sortKey:       'date',
      sortDir:       'desc',
      filterType:    'all',
      filterCat:     'all',
      search:        '',
      activeSection: 'dashboard',
    };
  } catch {
    return {
      transactions: [...SEED_DATA],
      role: 'admin', theme: 'light', budgets: {},
      sortKey: 'date', sortDir: 'desc',
      filterType: 'all', filterCat: 'all', search: '', activeSection: 'dashboard',
    };
  }
}

function persist(state) {
  localStorage.setItem(LS_KEYS.TX,    JSON.stringify(state.transactions));
  localStorage.setItem(LS_KEYS.ROLE,  state.role);
  localStorage.setItem(LS_KEYS.THEME, state.theme);
  localStorage.setItem(LS_KEYS.BUDGETS, JSON.stringify(state.budgets));
}

/* ── Reducer ── */
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TX': {
      const next = { ...state, transactions: [action.tx, ...state.transactions] };
      persist(next);
      return next;
    }
    case 'DELETE_TX': {
      const next = { ...state, transactions: state.transactions.filter(t => t.id !== action.id) };
      persist(next);
      return next;
    }
    case 'RESET_TX': {
      const next = { ...state, transactions: [...SEED_DATA] };
      persist(next);
      return next;
    }
    case 'SET_ROLE': {
      const next = { ...state, role: action.role };
      persist(next);
      return next;
    }
    case 'SET_THEME': {
      const next = { ...state, theme: action.theme };
      document.documentElement.setAttribute('data-theme', action.theme);
      persist(next);
      return next;
    }
    case 'SET_BUDGET': {
      const next = { ...state, budgets: { ...state.budgets, [action.category]: action.amount } };
      persist(next);
      return next;
    }
    case 'NAVIGATE':      return { ...state, activeSection: action.section };
    case 'SET_SORT':      return { ...state, sortKey: action.key, sortDir: action.dir };
    case 'SET_FILTER':    return { ...state, [action.field]: action.value };

    default:              return state;
  }
}

/* ── Context ── */
const StoreCtx = createContext(null);

export function FinFlowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Apply theme to DOM on mount
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  const addTx    = useCallback(tx  => dispatch({ type: 'ADD_TX',    tx }),   []);
  const deleteTx = useCallback(id  => dispatch({ type: 'DELETE_TX', id }),   []);
  const resetTx  = useCallback(()  => dispatch({ type: 'RESET_TX' }),         []);
  const setRole  = useCallback(role  => dispatch({ type: 'SET_ROLE',  role }),  []);
  const setTheme = useCallback(theme => dispatch({ type: 'SET_THEME', theme }), []);
  const setBudget = useCallback((category, amount) => dispatch({ type: 'SET_BUDGET', category, amount }), []);
  const navigate = useCallback(section => dispatch({ type: 'NAVIGATE', section }), []);
  const setSort  = useCallback((key, dir) => dispatch({ type: 'SET_SORT', key, dir }), []);
  const setFilter = useCallback((field, value) => dispatch({ type: 'SET_FILTER', field, value }), []);

  return (
    <StoreCtx.Provider value={{ state, addTx, deleteTx, resetTx, setRole, setTheme, setBudget, navigate, setSort, setFilter }}>

      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  return useContext(StoreCtx);
}
