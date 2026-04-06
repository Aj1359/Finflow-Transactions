

export const SEED_DATA = [
  { id:'t001', date:'2026-03-01', desc:'Monthly Salary',        category:'Salary',       type:'income',  amount:5500 },
  { id:'t002', date:'2026-03-03', desc:'Rent Payment',          category:'Housing',      type:'expense', amount:1400 },
  { id:'t003', date:'2026-03-05', desc:'Grocery Shopping',      category:'Food',         type:'expense', amount:230 },
  { id:'t004', date:'2026-03-07', desc:'Freelance Project',     category:'Freelance',    type:'income',  amount:1200 },
  { id:'t005', date:'2026-03-08', desc:'Electric Bill',         category:'Utilities',    type:'expense', amount:110 },
  { id:'t006', date:'2026-03-10', desc:'Netflix Subscription',  category:'Entertainment',type:'expense', amount:18 },
  { id:'t007', date:'2026-03-12', desc:'Fuel & Transport',      category:'Transport',    type:'expense', amount:95 },
  { id:'t008', date:'2026-03-14', desc:'Online Course',         category:'Education',    type:'expense', amount:79 },
  { id:'t009', date:'2026-03-15', desc:'Restaurant Dinner',     category:'Food',         type:'expense', amount:64 },
  { id:'t010', date:'2026-03-18', desc:'Health Insurance',      category:'Health',       type:'expense', amount:180 },
  { id:'t011', date:'2026-03-20', desc:'Dividend Payout',       category:'Investments',  type:'income',  amount:320 },
  { id:'t012', date:'2026-03-22', desc:'Gym Membership',        category:'Health',       type:'expense', amount:45 },
  { id:'t013', date:'2026-03-24', desc:'New Shoes',             category:'Shopping',     type:'expense', amount:120 },
  { id:'t014', date:'2026-03-26', desc:'Consulting Fee',        category:'Freelance',    type:'income',  amount:800 },
  { id:'t015', date:'2026-03-28', desc:'Coffee Shop',           category:'Food',         type:'expense', amount:32 },
  { id:'t016', date:'2026-02-01', desc:'Monthly Salary',        category:'Salary',       type:'income',  amount:5500 },
  { id:'t017', date:'2026-02-04', desc:'Rent Payment',          category:'Housing',      type:'expense', amount:1400 },
  { id:'t018', date:'2026-02-08', desc:'Grocery Shopping',      category:'Food',         type:'expense', amount:195 },
  { id:'t019', date:'2026-02-12', desc:'Car Repair',            category:'Transport',    type:'expense', amount:340 },
  { id:'t020', date:'2026-02-20', desc:'Bonus Payment',         category:'Salary',       type:'income',  amount:600 },
  { id:'t021', date:'2026-02-22', desc:'Internet Bill',         category:'Utilities',    type:'expense', amount:65 },
  { id:'t022', date:'2026-02-25', desc:'Weekend Trip',          category:'Entertainment',type:'expense', amount:290 },
  { id:'t023', date:'2026-01-01', desc:'Monthly Salary',        category:'Salary',       type:'income',  amount:5200 },
  { id:'t024', date:'2026-01-05', desc:'Rent Payment',          category:'Housing',      type:'expense', amount:1400 },
  { id:'t025', date:'2026-01-10', desc:'New Laptop',            category:'Shopping',     type:'expense', amount:1100 },
  { id:'t026', date:'2026-01-15', desc:'Grocery Shopping',      category:'Food',         type:'expense', amount:210 },
  { id:'t027', date:'2026-01-20', desc:'Freelance Project',     category:'Freelance',    type:'income',  amount:950 },
  { id:'t028', date:'2026-01-25', desc:'Doctor Visit',          category:'Health',       type:'expense', amount:75 },
];

export const CATEGORIES = [
  'Salary','Freelance','Investments','Housing','Food','Transport',
  'Utilities','Entertainment','Health','Education','Shopping','Other'
];

export const CAT_COLORS_LIGHT = {
  Salary:'#7c3aed',     Freelance:'#06b6d4',    Investments:'#10b981',
  Housing:'#f97316',    Food:'#f59e0b',          Transport:'#8b5cf6',
  Utilities:'#ec4899',  Entertainment:'#14b8a6', Health:'#ef4444',
  Education:'#6366f1',  Shopping:'#e879f9',      Other:'#94a3b8',
};

export const CAT_COLORS_DARK = {
  Salary:'#cdbdff',     Freelance:'#00daf3',     Investments:'#b9c7df',
  Housing:'#6833ea',    Food:'#948da2',           Transport:'#494456',
  Utilities:'#31394d',  Entertainment:'#2d3449',  Health:'#ffb4ab',
  Education:'#cebfff',  Shopping:'#abc3d9',       Other:'#64748b',
};

export const LS_KEYS = {
  TX:    'finflow_transactions',
  ROLE:  'finflow_role',
  THEME: 'finflow_theme',
  GEMINI:'finflow_gemini_key',
  BUDGETS: 'finflow_budgets',
};
