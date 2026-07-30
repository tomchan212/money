/* ===== Configuration ===== */
const API_ENDPOINTS = {
  production: {
    label: '正式試算表',
    // 部署 apps-script/Code.production.gs 後，把 URL 貼這裡
    url: 'https://script.google.com/macros/s/AKfycbxC_nylccOpfsamVmhDfoCBUQ-zkHy2HBhTHhsRTnVg1TEUdbhnaCk_pKPJdVl9RzTs4g/exec',
    spreadsheetId: '1zOCbb5gvBsom2p7KVSjFx3-SVyN6G5wQFBvI4cOWWh0',
    sheetGid: '48656539',
    spreadsheetUrl:
      'https://docs.google.com/spreadsheets/d/1zOCbb5gvBsom2p7KVSjFx3-SVyN6G5wQFBvI4cOWWh0/edit?gid=48656539#gid=48656539',
  },
  tester: {
    label: '測試試算表',
    // 部署 apps-script/Code.tester.gs 後，把「測試專案」的部署 URL 貼這裡（必須與正式不同）
    url: 'https://script.google.com/macros/s/AKfycbxs43cCa82KcZst-Tf867nLHBqwsTzOuD21rKy23aPEvwQbq_LFQdM9A3mYb66XlIv9SQ/exec',
    spreadsheetId: '1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU',
    sheetGid: '48656539',
    spreadsheetUrl:
      'https://docs.google.com/spreadsheets/d/1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU/edit?gid=48656539#gid=48656539',
  },
};

const API_STORAGE_KEY = 'money-api-endpoint';
const THEME_STORAGE_KEY = 'money-theme';
const LIST_DETAIL_STORAGE_KEY = 'money-list-detail-expanded';
const PARTICLE_COLORS_LIGHT = ['#ff758c', '#ff7eb3', '#ffc2d1', '#fff0f3', '#f7c948', '#ffffff'];
const PARTICLE_COLORS_CYBER = ['#ff2bd6', '#00f6ff', '#7a3cff', '#39ff14', '#ffffff', '#ff9f1c'];
let PARTICLE_COLORS = PARTICLE_COLORS_LIGHT;

function resolveApiEndpoint() {
  const saved = localStorage.getItem(API_STORAGE_KEY);
  return saved === 'tester' ? 'tester' : 'production';
}

function getActiveEndpoint() {
  return API_ENDPOINTS[apiEndpointKey] || API_ENDPOINTS.production;
}

function getApiUrl() {
  return getActiveEndpoint().url;
}

let apiEndpointKey = resolveApiEndpoint();
let API_URL = getApiUrl();

const CATEGORY_EMOJI = {
  餐飲: '🍱',
  '餐飲-早餐': '🌅',
  '餐飲-午餐': '☀️',
  '餐飲-晚餐': '🌙',
  交通: '🚗',
  住宿: '🏨',
  購物: '🛍️',
  景點: '🎟️',
  便利店: '🏪',
  雜項: '📦',
  還錢: '🤝🏻',
  借錢: '💸',
};

const CATEGORY_ICONS = {
  餐飲: 'icons/meal.png',
  '餐飲-早餐': 'icons/breakfast.png',
  '餐飲-午餐': 'icons/lunch.png',
  '餐飲-晚餐': 'icons/dinner.png',
  交通: 'icons/transport.png',
  住宿: 'icons/hotel.png',
  購物: 'icons/shopping.png',
  景點: 'icons/ticket.png',
  便利店: 'icons/convenience.png',
  雜項: 'icons/misc.png',
  還錢: 'icons/repayment.png',
  借錢: 'icons/expense.png',
};

const PREDEFINED_CATEGORIES = Object.keys(CATEGORY_EMOJI);
const CUSTOM_CATEGORY = '__custom__';

const CATEGORY_PICKER_GROUPS = [
  {
    label: '餐飲',
    items: [
      { value: '餐飲', label: '餐飲' },
      { value: '餐飲-早餐', label: '早餐' },
      { value: '餐飲-午餐', label: '午餐' },
      { value: '餐飲-晚餐', label: '晚餐' },
    ],
  },
  {
    items: [
      { value: '交通', label: '交通' },
      { value: '住宿', label: '住宿' },
      { value: '購物', label: '購物' },
      { value: '景點', label: '景點' },
      { value: '便利店', label: '便利店' },
      { value: '雜項', label: '雜項' },
      { value: CUSTOM_CATEGORY, label: '自定', custom: true },
    ],
  },
];

const FILTER_CATEGORY_GROUPS = [
  {
    items: [
      { value: '', label: '全部', all: true },
      { value: '餐飲', label: '餐飲' },
      { value: '餐飲-早餐', label: '早餐' },
      { value: '餐飲-午餐', label: '午餐' },
      { value: '餐飲-晚餐', label: '晚餐' },
    ],
  },
  {
    items: [
      { value: '交通', label: '交通' },
      { value: '住宿', label: '住宿' },
      { value: '購物', label: '購物' },
      { value: '景點', label: '景點' },
      { value: '便利店', label: '便利店' },
      { value: '雜項', label: '雜項' },
      { value: '還錢', label: '還錢' },
      { value: '借錢', label: '借錢' },
      { value: CUSTOM_CATEGORY, label: '自定', custom: true },
    ],
  },
];

const FILTER_SPLIT_ITEMS = [
  { value: '', label: '樣嘢點計', all: true },
  { value: 'FOR_A', label: '自己嘅', person: 'A' },
  { value: 'FOR_B', label: '自己嘅', person: 'B' },
  { value: 'SPLIT_5050', label: '一人一半', split: 'SPLIT_5050' },
];

const QUICK_SPLIT_CYCLE = ['', 'FOR_A', 'FOR_B', 'SPLIT_5050'];

const SPLIT_ICONS = {
  SPLIT_5050: 'icons/split-half.png?v=20260729cx',
};

const UI_ICON_CACHE = '20260730ds';

const UI_ICONS = {
  creditCard: 'icons/credit-card.png',
  savings: 'icons/savings.png',
  expense: 'icons/expense.png',
  budget: 'icons/budget.png',
  date: 'icons/date.png',
  tag: 'icons/tag.png',
  notes: 'icons/notes.png',
  exchange: 'icons/exchange.png',
  jpy: 'icons/jpy.png',
  hkd: 'icons/hkd.png',
  edit: 'icons/edit.png',
  detail: 'icons/detail.png',
  delete: 'icons/delete.png',
  save: 'icons/save.png',
  confirm: 'icons/confirm.png',
  success: 'icons/success.png',
  theme: 'icons/theme.png',
  empty: 'icons/empty.png',
  sortTime: 'icons/sort-time.png',
  list: 'icons/list.png',
  helpPay: 'icons/help-pay.png',
  addRecord: 'icons/add-record.png',
};

const PERSON = {
  A: { src: 'boy.png', label: '男孩' },
  B: { src: 'girl.png', label: '女生' },
};

function personName(person) {
  return (PERSON[person] || PERSON.A).label;
}

function personImg(person, size = 'inline') {
  const meta = PERSON[person] || PERSON.A;
  return `<img class="person-avatar person-avatar-${size}" src="${meta.src}" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
}

function personImgPair(from, to, size = 'inline') {
  return `${personImg(from, size)}<span class="person-pair-arrow" aria-hidden="true">→</span>${personImg(to, size)}`;
}

const SPLIT_LABELS = {
  SPLIT_5050: '一人一半',
  FOR_A: '自己嘅',
  FOR_B: '自己嘅',
  REPAY: '還錢',
  LOAN: '借錢',
};

const REPAY_CATEGORY = '還錢';
const LOAN_CATEGORY = '借錢';

const DEFAULT_BUDGETS = {
  A: { JPY: 150000, HKD: 5000 },
  B: { JPY: 150000, HKD: 5000 },
};

const API_TIMEOUT_MS = 55000;
const API_MAX_RETRIES = 1;

const CURRENCY_SYMBOL = {
  JPY: '¥',
  HKD: '$',
};

let detailModalKey = null;
/** 詳情層級：由還錢「對應消費」再入另一筆時，關閉可返回上一層 */
let detailModalStack = [];

/* ===== State ===== */
let transactions = [];
let budgets = structuredClone(DEFAULT_BUDGETS);
let summary = null;
let toastTimer = null;
let isMutating = false;
let loadingCount = 0;
let loadingHideTimer = null;
let serverApplySeq = 0;
let lastAppliedServerSeq = 0;
let openModalCount = 0;
let lastSyncedAt = null;
let currencyView = 'jpy';
let loadingProgressTimer = null;
let loadingProgressValue = 0;
let listViewExpanded = false;

const listFilters = {
  dayFrom: '',
  dayTo: '',
  currency: '',
  payer: '',
  sortAmount: '',
  sortDate: 'desc',
  category: '',
  splitMode: '',
  pageSize: 10,
  currentPage: 1,
};

/** 總覽「點計出嚟？」scroll 區最大高度（約 5–6 行） */
const EXPLAIN_SCROLL_MAX = 260;

/** 'delete-one' | 'clear-all' */
let deleteConfirmMode = 'delete-one';

/** 人頭格 → 個人用左明細 */
const personSpendView = {
  person: null,
  currency: null,
  category: '',
  sort: 'date-desc',
};

/* ===== DOM References ===== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  toast: $('#toast'),
  syncBanner: $('#sync-banner'),
  syncRefreshBtn: $('#sync-refresh-btn'),
  transactionList: $('#transaction-list'),
  expenseForm: $('#expense-form'),
  expenseDate: $('#expense-date'),
  budgetForm: $('#budget-form'),
  editForm: $('#edit-form'),
  budgetModal: $('#budget-modal'),
  editModal: $('#edit-modal'),
  detailModal: $('#detail-modal'),
  personSpendModal: $('#person-spend-modal'),
  repayModal: $('#repay-modal'),
  loanModal: $('#loan-modal'),
  deleteConfirmModal: $('#delete-confirm-modal'),
  dayRangeModal: $('#day-range-modal'),
};

/* ===== Utilities ===== */
function showToast(message, type = 'info') {
  els.toast.className = `toast ${type}`;
  els.toast.classList.remove('hidden');
  if (/<\s*(img|span|svg)\b/i.test(String(message))) {
    els.toast.innerHTML = message;
  } else {
    els.toast.textContent = message;
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 2800);
}

function setLoadingProgress(percent) {
  loadingProgressValue = Math.max(0, Math.min(100, Math.round(percent)));
  const label = $('#loading-percent');
  if (label) label.textContent = `${loadingProgressValue}%`;
  const bar = $('#loading-progress-bar');
  if (bar) bar.style.width = `${loadingProgressValue}%`;
}

function stopLoadingProgress() {
  if (loadingProgressTimer) {
    clearInterval(loadingProgressTimer);
    loadingProgressTimer = null;
  }
}

function startLoadingProgress() {
  stopLoadingProgress();
  setLoadingProgress(0);
  loadingProgressTimer = setInterval(() => {
    if (loadingProgressValue >= 92) return;
    const step = loadingProgressValue < 40 ? 7 : loadingProgressValue < 70 ? 4 : 2;
    setLoadingProgress(loadingProgressValue + step);
  }, 180);
}

function isSyncBusy() {
  return isMutating || loadingCount > 0 || (typeof SyncManager !== 'undefined' && SyncManager.isSyncing());
}

function isRefreshBlocked() {
  return isMutating;
}

function updateMutationControls() {
  const mutateBlocked = isMutating;
  const refreshBlocked = isRefreshBlocked();

  if (els.syncRefreshBtn) els.syncRefreshBtn.disabled = refreshBlocked;
  const listRefreshBtn = $('#btn-refresh');
  if (listRefreshBtn) listRefreshBtn.disabled = refreshBlocked;

  els.expenseForm?.querySelector('[type="submit"]')?.toggleAttribute('disabled', mutateBlocked);
  els.budgetForm?.querySelector('[type="submit"]')?.toggleAttribute('disabled', mutateBlocked);
  els.editForm?.querySelector('[type="submit"]')?.toggleAttribute('disabled', mutateBlocked);
  $('#repay-submit-btn')?.toggleAttribute('disabled', mutateBlocked);
  $('#loan-submit-btn')?.toggleAttribute('disabled', mutateBlocked);
  $('#delete-confirm-btn')?.toggleAttribute('disabled', mutateBlocked);
}

function beginMutation() {
  if (isMutating) return false;
  isMutating = true;
  updateMutationControls();
  return true;
}

function endMutation() {
  isMutating = false;
  updateMutationControls();
  updateSyncStatusFromQueue();
}

const SUBMIT_LOADING_MIN_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function showSubmitLoading() {
  const overlay = $('#submit-loading-overlay');
  overlay?.classList.remove('hidden');
  document.body.classList.add('submit-loading-open');
}

function hideSubmitLoading() {
  const overlay = $('#submit-loading-overlay');
  overlay?.classList.add('hidden');
  document.body.classList.remove('submit-loading-open');
}

async function withSubmitLoading(task) {
  const startedAt = Date.now();
  showSubmitLoading();
  try {
    return await task();
  } finally {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, SUBMIT_LOADING_MIN_MS - elapsed);
    if (remaining > 0) await sleep(remaining);
    hideSubmitLoading();
  }
}

function beginServerApply() {
  return ++serverApplySeq;
}

function setLoading(show) {
  if (show) {
    if (loadingHideTimer) {
      clearTimeout(loadingHideTimer);
      loadingHideTimer = null;
    }
    loadingCount += 1;
    if (loadingCount === 1) {
      startLoadingProgress();
      els.syncBanner?.classList.remove('hidden');
      updateSyncStatus('syncing');
    }
    updateMutationControls();
    return;
  }

  loadingCount = Math.max(0, loadingCount - 1);
  updateMutationControls();
  if (loadingCount > 0) return;

  stopLoadingProgress();
  setLoadingProgress(100);
  loadingHideTimer = window.setTimeout(() => {
    loadingHideTimer = null;
    if (loadingCount > 0) return;
    els.syncBanner?.classList.add('hidden');
    setLoadingProgress(0);
    const statusEl = $('#sync-status');
    if (statusEl?.classList.contains('syncing')) {
      if (lastSyncedAt) {
        updateSyncStatus('success', lastSyncedAt);
      } else {
        updateSyncStatus('error');
      }
    }
  }, 180);
}

function roundMoney(amount, currency) {
  const num = Number(amount) || 0;
  if (currency === 'HKD') return Math.round(num * 100) / 100;
  return Math.round(num);
}

function formatNumber(n, currency = 'JPY') {
  const rounded = roundMoney(n, currency);
  if (currency === 'HKD') {
    return rounded.toLocaleString('zh-Hant', {
      minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }
  return rounded.toLocaleString('zh-Hant');
}

function formatMoney(amount, currency) {
  return `${getCurrencySymbol(currency)}${formatNumber(amount, currency)}`;
}

/** JPY uses whole yen; HKD can be .5 from 一人一半. */
function moneyEpsilon(currency) {
  return currency === 'HKD' ? 0.005 : 0.5;
}

function isNegligibleMoney(amount, currency) {
  return Math.abs(Number(amount) || 0) < moneyEpsilon(currency);
}

function moneyFigHtml(amount, currency, extraClass = '') {
  const curClass = currency === 'JPY' ? 'money-jpy' : currency === 'HKD' ? 'money-hkd' : '';
  const cls = ['money-fig', curClass, extraClass].filter(Boolean).join(' ');
  return `<span class="${cls}">${escapeHtml(formatMoney(amount, currency))}</span>`;
}

function formatRecordTime(timeStr) {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  const hm = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hm) {
    return `${String(hm[1]).padStart(2, '0')}:${hm[2]}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('zh-Hant', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  return str.slice(0, 5);
}

function formatTransactionMeta(tx) {
  const timePart = tx.time ? ` · ${formatRecordTime(tx.time)}` : '';
  return `${tx.date}${timePart} · ${escapeHtml(getCategoryLabel(tx.category))}`;
}

function formatTransactionLocationHtml(tx) {
  const location = getLocationText(tx);
  if (!location) return '';
  const mapsUrl = locationMapsUrl(location);
  return `<div class="tx-location"><a class="tx-location-link" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">📍 ${escapeHtml(location)}</a></div>`;
}

function getLocationText(tx) {
  return String(tx?.location || '').trim();
}

function locationMapsUrl(location) {
  const s = String(location || '').trim();
  if (!s) return '';
  const coords = s.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coords) {
    return `https://maps.apple.com/?ll=${coords[1]},${coords[2]}&q=${coords[1]},${coords[2]}`;
  }
  return `https://maps.apple.com/?q=${encodeURIComponent(s)}`;
}

/** Auto-capture GPS for new records. Never blocks save if denied/unavailable. */
function captureCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        resolve(`${lat}, ${lng}`);
      },
      () => resolve(''),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  });
}

function isPredefinedCategory(category) {
  return PREDEFINED_CATEGORIES.includes(category);
}

function getCategoryEmoji(category) {
  if (CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
  if (String(category).startsWith('餐飲')) return '🍱';
  return '✏️';
}

function getCategoryIconSrc(category) {
  if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
  if (String(category).startsWith('餐飲')) return CATEGORY_ICONS['餐飲'];
  return null;
}

function categoryIconHtml(category, size = 'inline', alt) {
  const src = getCategoryIconSrc(category);
  if (!src) return null;
  const label = alt || getCategoryLabel(category);
  return `<img class="category-icon category-icon-${size}" src="${src}" alt="${escapeHtml(label)}" loading="lazy" decoding="async">`;
}

function splitIconHtml(splitMode, size = 'inline', alt = '一人一半') {
  const src = SPLIT_ICONS[splitMode];
  if (!src) return null;
  return `<img class="split-icon split-icon-${size}" src="${src}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
}

function uiIconHtml(key, size = 'label', alt = '') {
  const src = UI_ICONS[key];
  if (!src) return '';
  const altAttr = alt ? ` alt="${escapeHtml(alt)}"` : ' alt="" aria-hidden="true"';
  return `<img class="ui-icon ui-icon-${size}" src="${src}?v=${UI_ICON_CACHE}"${altAttr} loading="lazy" decoding="async">`;
}

function currencyUiIconHtml(currency, size = 'sm') {
  if (currency === 'JPY') return uiIconHtml('jpy', size);
  if (currency === 'HKD') return uiIconHtml('hkd', size);
  return uiIconHtml('exchange', size);
}

function transactionIconHtml(tx, size = 'list') {
  if (isRepayTransaction(tx)) return categoryIconHtml('還錢', size, '還錢');
  if (isLoanTransaction(tx)) return categoryIconHtml('借錢', size, '借錢');
  const icon = categoryIconHtml(tx.category, size);
  if (icon) return icon;
  return `<span class="category-emoji-fallback" aria-hidden="true">${getCategoryEmoji(tx.category)}</span>`;
}

function getSplitBeneficiary(tx) {
  if (tx.split_mode === 'FOR_A') return 'A';
  if (tx.split_mode === 'FOR_B') return 'B';
  return null;
}

function isSelfSplit(tx) {
  if (isCashTransferTransaction(tx)) return false;
  const beneficiary = getSplitBeneficiary(tx);
  return beneficiary && tx.payer === beneficiary;
}

function isHelpPaySplit(tx) {
  if (isCashTransferTransaction(tx)) return false;
  const beneficiary = getSplitBeneficiary(tx);
  return beneficiary && tx.payer !== beneficiary;
}

function usesCombinedSplitTag(tx) {
  if (isCashTransferTransaction(tx)) return false;
  return tx.split_mode === 'SPLIT_5050' || isSelfSplit(tx) || isHelpPaySplit(tx);
}

function splitFlowComboHtml(leftHtml, rightHtml, variant, ariaLabel) {
  return `<span class="split-flow-combo split-flow-combo-${variant}" aria-label="${escapeHtml(ariaLabel)}">
    ${leftHtml}
    <span class="split-flow-arrow" aria-hidden="true">→</span>
    ${rightHtml}
  </span>`;
}

function split5050PayerTagHtml(tx, variant = 'tag') {
  const payerName = tx.payer === 'A' ? '男孩' : '女生';
  const payerSize = variant === 'compact' ? 'xs' : 'inline';
  const splitSize = variant === 'compact' ? 'combo-sm' : 'combo';
  return splitFlowComboHtml(
    personImg(tx.payer, payerSize),
    splitIconHtml('SPLIT_5050', splitSize),
    variant,
    `一人一半 · ${payerName}畀`
  );
}

function selfSplitTagHtml(tx, variant = 'tag') {
  const person = tx.payer;
  const name = person === 'A' ? '男孩' : '女生';
  const size = variant === 'compact' ? 'xs' : 'inline';
  return `<span class="split-self-combo split-self-combo-${variant}" aria-label="${name}自己嘅">
    ${personImg(person, size)}<span class="split-self-label">自己嘅</span>
  </span>`;
}

function helpPaySplitTagHtml(tx, variant = 'tag') {
  const beneficiary = getSplitBeneficiary(tx);
  const payerName = tx.payer === 'A' ? '男孩' : '女生';
  const benName = beneficiary === 'A' ? '男孩' : '女生';
  const size = variant === 'compact' ? 'xs' : 'inline';
  return splitFlowComboHtml(
    personImg(tx.payer, size),
    personImg(beneficiary, size),
    variant,
    `${payerName}幫${benName}畀`
  );
}

function combinedSplitTagHtml(tx, variant = 'tag') {
  if (tx.split_mode === 'SPLIT_5050') return split5050PayerTagHtml(tx, variant);
  if (isSelfSplit(tx)) return selfSplitTagHtml(tx, variant);
  if (isHelpPaySplit(tx)) return helpPaySplitTagHtml(tx, variant);
  return '';
}

function combinedSplitTagClass(tx) {
  if (tx.split_mode === 'SPLIT_5050') return 'split-5050';
  if (isSelfSplit(tx)) return 'split-self';
  if (isHelpPaySplit(tx)) return 'split-help';
  return '';
}

function compactCreamChipHtml(innerHtml, ariaLabel = '') {
  const labelAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : '';
  return `<span class="compact-cream-chip"${labelAttr}>${innerHtml}</span>`;
}

function repayFlowTagHtml(tx, variant = 'tag') {
  const payee = tx.payer === 'A' ? 'B' : 'A';
  const payerName = tx.payer === 'A' ? '男孩' : '女生';
  const payeeName = payee === 'A' ? '男孩' : '女生';
  const size = variant === 'compact' ? 'xs' : 'inline';
  return splitFlowComboHtml(
    personImg(tx.payer, size),
    personImg(payee, size),
    variant,
    `${payerName}還俾${payeeName}`
  );
}

function loanFlowTagHtml(tx, variant = 'tag') {
  const borrower = getLoanBorrower(tx);
  const payerName = tx.payer === 'A' ? '男孩' : '女生';
  const borrowerName = borrower === 'A' ? '男孩' : '女生';
  const size = variant === 'compact' ? 'xs' : 'inline';
  return splitFlowComboHtml(
    personImg(tx.payer, size),
    personImg(borrower, size),
    variant,
    `${payerName}借畀${borrowerName}`
  );
}

function compactTitleSuffixHtml(tx) {
  if (isLoanTransaction(tx)) {
    return `<span class="compact-inline-chip compact-loan-chip" aria-label="借錢">${loanFlowTagHtml(tx, 'compact')}</span>`;
  }
  if (isRepayTransaction(tx)) {
    return `<span class="compact-inline-chip compact-repay-chip" aria-label="還錢">${repayFlowTagHtml(tx, 'compact')}</span>`;
  }
  if (usesCombinedSplitTag(tx)) {
    return combinedSplitTagHtml(tx, 'compact');
  }
  const payerName = tx.payer === 'A' ? '男孩付款' : '女生付款';
  return compactCreamChipHtml(personImg(tx.payer, 'xs'), payerName);
}

function formatListRecordTime(tx) {
  return formatRecordTime(tx.time) || '--:--';
}

function formatDayHeader(dateStr) {
  if (!dateStr) return '未填日期';
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${dateStr}（星期${weekdays[d.getDay()]}）`;
}

function groupTransactionsByDate(items) {
  const groups = [];
  const indexByDate = new Map();
  for (const tx of items) {
    const date = tx.date || '';
    if (!indexByDate.has(date)) {
      indexByDate.set(date, groups.length);
      groups.push({ date, items: [] });
    }
    groups[indexByDate.get(date)].items.push(tx);
  }
  for (const group of groups) {
    group.items.sort((a, b) => {
      const ta = formatRecordTime(a.time) || '00:00';
      const tb = formatRecordTime(b.time) || '00:00';
      return tb.localeCompare(ta);
    });
  }
  return groups;
}

function listRecordSplitIconHtml(tx) {
  if (isLoanTransaction(tx) || isRepayTransaction(tx) || usesCombinedSplitTag(tx)) {
    return compactTitleSuffixHtml(tx);
  }
  return `<span class="tx-list-split-badge">${splitTagHtml(tx)}</span>`;
}

function listRecordPayerHtml(tx) {
  const name = tx.payer === 'A' ? '男孩' : '女生';
  return `<span class="tx-list-payer" aria-label="${name}付款">${personImg(tx.payer, 'xs')}</span>`;
}

function buildTransactionLocationInlineHtml(tx) {
  const location = getLocationText(tx);
  if (!location) return '';
  const mapsUrl = locationMapsUrl(location);
  return `<span class="tx-record-location"><a class="tx-location-link" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">📍 ${escapeHtml(location)}</a></span>`;
}

function buildTransactionItemHtml(tx) {
  const curClass = tx.currency === 'JPY' ? 'jpy' : 'hkd';
  const txKey = getTxKey(tx);
  const isRepay = isRepayTransaction(tx);
  const isLoan = isLoanTransaction(tx);
  const specialClass = isRepay ? ' repay-item' : isLoan ? ' loan-item' : '';
  const title = getTransactionTitle(tx);
  const iconHtml = transactionIconHtml(tx, 'list');
  const splitBadgeHtml = listRecordSplitIconHtml(tx);

  return `
    <li class="transaction-item${specialClass}" data-key="${escapeHtml(txKey)}" data-detail-key="${escapeHtml(txKey)}" tabindex="0" role="button" aria-label="查看 ${escapeHtml(title)} 詳情">
      <div class="tx-icon">${iconHtml}</div>
      <div class="tx-record-body">
      <div class="tx-record-primary">
        <span class="tx-record-time">${escapeHtml(formatListRecordTime(tx))}</span>
        <span class="tx-record-desc-group">
          <span class="tx-record-desc">${escapeHtml(title)}</span>
          <span class="tx-record-split">${splitBadgeHtml}</span>
          ${buildTransactionLocationInlineHtml(tx)}
        </span>
      </div>
      <div class="tx-record-secondary">
        <span class="tx-record-amount">
          <span class="tx-currency ${curClass}">${tx.currency}</span>
          <span class="tx-amount ${curClass}">${formatMoney(tx.amount, tx.currency)}</span>
        </span>
        ${listRecordPayerHtml(tx)}
        <button type="button" class="btn-edit edit-btn" data-key="${escapeHtml(txKey)}" aria-label="編輯">
          <span class="btn-edit-icon" aria-hidden="true">✏️</span>
          <span class="btn-edit-text">編輯</span>
        </button>
      </div>
      </div>
    </li>`;
}

function splitTagHtml(tx) {
  if (isRepayTransaction(tx)) {
    const payee = tx.payer === 'A' ? 'B' : 'A';
    const payerName = tx.payer === 'A' ? '男孩' : '女生';
    const payeeName = payee === 'A' ? '男孩' : '女生';
    return `<span class="detail-split-help" aria-label="${payerName}還俾${payeeName}">${personImg(tx.payer, 'inline')} 還俾 ${personImg(payee, 'inline')}</span>`;
  }
  if (isLoanTransaction(tx)) {
    const borrower = getLoanBorrower(tx);
    const payerName = tx.payer === 'A' ? '男孩' : '女生';
    const borrowerName = borrower === 'A' ? '男孩' : '女生';
    return `<span class="detail-split-help" aria-label="${payerName}借畀${borrowerName}">${personImg(tx.payer, 'inline')} 借畀 ${personImg(borrower, 'inline')}</span>`;
  }
  if (isHelpPaySplit(tx)) {
    const beneficiary = getSplitBeneficiary(tx);
    const payerName = tx.payer === 'A' ? '男孩' : '女生';
    const benName = beneficiary === 'A' ? '男孩' : '女生';
    return `<span class="detail-split-help" aria-label="${payerName}幫${benName}畀">${personImg(tx.payer, 'inline')} 幫 ${personImg(beneficiary, 'inline')} 畀</span>`;
  }
  if (tx.split_mode === 'FOR_A') {
    return `${personImg('A', 'inline')} 自己嘅`;
  }
  if (tx.split_mode === 'FOR_B') {
    return `${personImg('B', 'inline')} 自己嘅`;
  }
  if (tx.split_mode === 'SPLIT_5050') {
    return `${splitIconHtml('SPLIT_5050', 'inline')} 一人一半`;
  }
  return escapeHtml(SPLIT_LABELS[tx.split_mode] || tx.split_mode);
}

function getCategoryLabel(category) {
  if (String(category).startsWith('餐飲-')) return category.slice(3);
  return category;
}

function getTransactionTitle(tx) {
  if (isRepayTransaction(tx)) return '還錢';
  if (isLoanTransaction(tx)) return '借錢';
  const desc = String(tx.description || '').trim();
  if (desc) return desc;
  return getCategoryLabel(tx.category) || '（無描述）';
}

function isRepayTransaction(tx) {
  return tx.split_mode === 'REPAY' || tx.category === REPAY_CATEGORY;
}

function isLoanTransaction(tx) {
  return tx.split_mode === 'LOAN' || tx.category === LOAN_CATEGORY;
}

function isCashTransferTransaction(tx) {
  return isRepayTransaction(tx) || isLoanTransaction(tx);
}

function getLoanBorrower(tx) {
  return tx.payer === 'A' ? 'B' : 'A';
}

function matchesCategoryFilter(txCategory, filterValue) {
  if (!filterValue) return true;
  if (filterValue === '餐飲') {
    return txCategory === '餐飲' || String(txCategory).startsWith('餐飲-');
  }
  return txCategory === filterValue;
}

function resolveCategory(categoryInputEl, customInputEl) {
  if (categoryInputEl.value === CUSTOM_CATEGORY) {
    return customInputEl.value.trim();
  }
  return categoryInputEl.value;
}

function getCategoryPickerItem(value) {
  for (const group of CATEGORY_PICKER_GROUPS) {
    const found = group.items.find((item) => item.value === value);
    if (found) return found;
  }
  return null;
}

function getCategoryPickerLabel(value) {
  const item = getCategoryPickerItem(value);
  if (item) return item.label;
  if (value === CUSTOM_CATEGORY) return '自定';
  return getCategoryLabel(value) || '選擇分類';
}

function buildCategoryPickerCard(item) {
  const iconHtml = item.custom
    ? uiIconHtml('edit', 'label')
    : categoryIconHtml(item.value, 'picker') ||
      `<span class="category-picker-emoji" aria-hidden="true">${getCategoryEmoji(item.value)}</span>`;
  return `<button type="button" class="category-picker-card" data-value="${escapeHtml(item.value)}" role="radio" aria-checked="false" aria-label="${escapeHtml(item.label)}">
    <span class="category-picker-icon">${iconHtml}</span>
    <span class="category-picker-label">${escapeHtml(item.label)}</span>
  </button>`;
}

function buildCategoryPickerHtml() {
  return CATEGORY_PICKER_GROUPS.map((group) => {
    let html = '';
    if (group.label) {
      html += `<div class="category-picker-group-label">${escapeHtml(group.label)}</div>`;
    }
    html += group.items.map((item) => buildCategoryPickerCard(item)).join('');
    return html;
  }).join('');
}

function getCategoryPickerWrap(categoryInputId) {
  return document.querySelector(`.category-picker-wrap[data-category-input="${categoryInputId}"]`);
}

function syncCategoryPickerTrigger(wrapEl, value) {
  if (!wrapEl) return;
  const iconEl = wrapEl.querySelector('.category-picker-trigger-icon');
  const textEl = wrapEl.querySelector('.category-picker-trigger-text');
  if (!iconEl || !textEl) return;

  const item = getCategoryPickerItem(value);
  const label = getCategoryPickerLabel(value);
  textEl.textContent = label;

  if (item?.custom || value === CUSTOM_CATEGORY) {
    iconEl.innerHTML = uiIconHtml('edit', 'label');
  } else {
    iconEl.innerHTML =
      categoryIconHtml(value, 'inline') ||
      `<span class="category-picker-emoji" aria-hidden="true">${getCategoryEmoji(value)}</span>`;
  }
}

function setCategoryPickerOpen(wrapEl, open) {
  if (!wrapEl) return;
  const pickerEl = wrapEl.querySelector('.category-picker');
  const triggerEl = wrapEl.querySelector('.category-picker-trigger');
  if (!pickerEl || !triggerEl) return;
  pickerEl.classList.toggle('hidden', !open);
  wrapEl.classList.toggle('is-open', open);
  triggerEl.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function syncCategoryPicker(pickerEl, value) {
  if (!pickerEl) return;
  pickerEl.querySelectorAll('.category-picker-card').forEach((card) => {
    const selected = card.dataset.value === value;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-checked', selected ? 'true' : 'false');
  });
  const wrapEl = pickerEl.closest('.category-picker-wrap');
  syncCategoryPickerTrigger(wrapEl, value);
}

function setCategoryFields(categoryInputEl, customInputEl, customRowEl, category) {
  const wrapEl = getCategoryPickerWrap(categoryInputEl.id);
  const pickerEl = wrapEl?.querySelector('.category-picker');
  if (isPredefinedCategory(category)) {
    categoryInputEl.value = category;
    customInputEl.value = '';
    customRowEl.classList.add('hidden');
    syncCategoryPicker(pickerEl, category);
  } else {
    categoryInputEl.value = CUSTOM_CATEGORY;
    customInputEl.value = category;
    customRowEl.classList.remove('hidden');
    syncCategoryPicker(pickerEl, CUSTOM_CATEGORY);
  }
  setCategoryPickerOpen(wrapEl, false);
}

function setupCategoryPicker(categoryInputId, customRowId, customInputId) {
  const categoryInput = $(categoryInputId);
  const wrapEl = getCategoryPickerWrap(categoryInputId.slice(1));
  const pickerEl = wrapEl?.querySelector('.category-picker');
  const triggerEl = wrapEl?.querySelector('.category-picker-trigger');
  const row = $(customRowId);
  const input = $(customInputId);
  if (!categoryInput || !wrapEl || !pickerEl || !triggerEl) return;

  pickerEl.innerHTML = buildCategoryPickerHtml();
  syncCategoryPicker(pickerEl, categoryInput.value);
  setCategoryPickerOpen(wrapEl, false);

  triggerEl.addEventListener('click', () => {
    const willOpen = pickerEl.classList.contains('hidden');
    setCategoryPickerOpen(wrapEl, willOpen);
  });

  pickerEl.addEventListener('click', (e) => {
    const card = e.target.closest('.category-picker-card');
    if (!card) return;
    categoryInput.value = card.dataset.value;
    syncCategoryPicker(pickerEl, categoryInput.value);
    const isCustom = categoryInput.value === CUSTOM_CATEGORY;
    row.classList.toggle('hidden', !isCustom);
    setCategoryPickerOpen(wrapEl, false);
    if (isCustom) input.focus();
  });
}

function filterItemIconHtml(item, size = 'picker') {
  const uiSize = size === 'picker' ? 'picker' : size === 'inline' ? 'inline' : 'label';
  if (item.all) {
    return uiIconHtml('success', uiSize);
  }
  if (item.custom) {
    return uiIconHtml('edit', uiSize);
  }
  if (item.split) {
    return (
      splitIconHtml(item.split, size) ||
      `<span class="category-picker-emoji" aria-hidden="true">👥</span>`
    );
  }
  if (item.emoji) {
    return `<span class="category-picker-emoji" aria-hidden="true">${item.emoji}</span>`;
  }
  if (item.person) {
    return personImg(item.person, size === 'picker' ? 'picker' : 'inline');
  }
  const category = item.category || item.value;
  return (
    categoryIconHtml(category, size) ||
    `<span class="category-picker-emoji" aria-hidden="true">${getCategoryEmoji(category)}</span>`
  );
}

function buildFilterPickerCard(item) {
  return `<button type="button" class="category-picker-card" data-value="${escapeHtml(item.value)}" role="radio" aria-checked="false" aria-label="${escapeHtml(item.label)}">
    <span class="category-picker-icon">${filterItemIconHtml(item, 'picker')}</span>
    <span class="category-picker-label">${escapeHtml(item.label)}</span>
  </button>`;
}

function findFilterItem(itemsOrGroups, value) {
  if (Array.isArray(itemsOrGroups) && itemsOrGroups[0]?.items) {
    for (const group of itemsOrGroups) {
      const found = group.items.find((item) => item.value === value);
      if (found) return found;
    }
    return null;
  }
  return itemsOrGroups.find((item) => item.value === value) || null;
}

function buildFilterPickerHtml(itemsOrGroups) {
  if (Array.isArray(itemsOrGroups) && itemsOrGroups[0]?.items) {
    return itemsOrGroups
      .map((group) => {
        let html = '';
        if (group.label) {
          html += `<div class="category-picker-group-label">${escapeHtml(group.label)}</div>`;
        }
        html += group.items.map((item) => buildFilterPickerCard(item)).join('');
        return html;
      })
      .join('');
  }
  return itemsOrGroups.map((item) => buildFilterPickerCard(item)).join('');
}

function getFilterPickerWrap(inputId) {
  return document.querySelector(`.category-picker-wrap[data-filter-picker="${inputId}"]`);
}

function syncFilterPickerTrigger(wrapEl, item) {
  if (!wrapEl || !item) return;
  const iconEl = wrapEl.querySelector('.category-picker-trigger-icon');
  const textEl = wrapEl.querySelector('.category-picker-trigger-text');
  if (!iconEl || !textEl) return;
  textEl.textContent = item.label;
  iconEl.innerHTML = filterItemIconHtml(item, 'inline');
}

function syncFilterPicker(wrapEl, itemsOrGroups, value) {
  if (!wrapEl) return;
  const pickerEl = wrapEl.querySelector('.category-picker');
  if (!pickerEl) return;
  pickerEl.querySelectorAll('.category-picker-card').forEach((card) => {
    const selected = card.dataset.value === value;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-checked', selected ? 'true' : 'false');
  });
  const item = findFilterItem(itemsOrGroups, value) || findFilterItem(itemsOrGroups, '');
  syncFilterPickerTrigger(wrapEl, item);
}

function getFilterCategoryLabel(value) {
  return findFilterItem(FILTER_CATEGORY_GROUPS, value)?.label || '全部分類';
}

function getFilterSplitLabel(value) {
  if (value === 'FOR_A') return '男孩自己嘅';
  if (value === 'FOR_B') return '女生自己嘅';
  if (value === 'SPLIT_5050') return '一人一半';
  return findFilterItem(FILTER_SPLIT_ITEMS, value)?.label || '樣嘢點計';
}

function setupFilterIconPicker(inputId, itemsOrGroups, onChange) {
  const inputEl = $(`#${inputId}`);
  const wrapEl = getFilterPickerWrap(inputId);
  const pickerEl = wrapEl?.querySelector('.category-picker');
  const triggerEl = wrapEl?.querySelector('.category-picker-trigger');
  if (!inputEl || !wrapEl || !pickerEl || !triggerEl) return;

  pickerEl.innerHTML = buildFilterPickerHtml(itemsOrGroups);
  syncFilterPicker(wrapEl, itemsOrGroups, inputEl.value);
  setCategoryPickerOpen(wrapEl, false);

  triggerEl.addEventListener('click', () => {
    const willOpen = pickerEl.classList.contains('hidden');
    setCategoryPickerOpen(wrapEl, willOpen);
  });

  pickerEl.addEventListener('click', (e) => {
    const card = e.target.closest('.category-picker-card');
    if (!card) return;
    inputEl.value = card.dataset.value;
    syncFilterPicker(wrapEl, itemsOrGroups, inputEl.value);
    setCategoryPickerOpen(wrapEl, false);
    onChange?.(inputEl.value);
  });
}

function setupListFilterPickers(onChange) {
  setupFilterIconPicker('filter-category', FILTER_CATEGORY_GROUPS, (value) => {
    listFilters.category = value;
    onChange?.();
  });
}

function parseDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const isoDay = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) return `${isoDay[1]}-${isoDay[2]}-${isoDay[3]}`;

  const d = new Date(str);
  if (isNaN(d.getTime())) return str.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nowLocalTimeHM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

const EXPENSE_CURRENCY_CYCLE = ['JPY', 'HKD'];
const EXPENSE_PAYER_CYCLE = ['A', 'B'];
const EXPENSE_SPLIT_CYCLE = ['SPLIT_5050', 'FOR_A', 'FOR_B'];

function cycleExpenseValue(order, current) {
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

function getExpenseSplitModeValue(prefix = 'expense') {
  return $(`#${prefix}-split-mode`)?.value || 'SPLIT_5050';
}

function syncExpenseEssentialsUi(prefix = 'expense') {
  const currency = $(`#${prefix}-currency`)?.value || 'JPY';
  const payer = $(`#${prefix}-payer`)?.value || 'A';
  const split = getExpenseSplitModeValue(prefix);
  const payerName = payer === 'A' ? '男孩' : '女生';

  const currencyIconEl = $(`#${prefix}-currency-chip-icon`);
  const currencyChip = $(`#${prefix}-currency-chip`);
  if (currencyIconEl) currencyIconEl.innerHTML = currencyUiIconHtml(currency, 'currency');
  currencyChip?.setAttribute('aria-label', `幣別：${currency}`);

  const payerIconEl = $(`#${prefix}-payer-chip-icon`);
  const payerChip = $(`#${prefix}-payer-chip`);
  if (payerIconEl) payerIconEl.innerHTML = personImg(payer, 'lg');
  payerChip?.setAttribute('aria-label', `邊個畀錢：${payerName}`);

  const splitIconEl = $(`#${prefix}-split-chip-icon`);
  const splitChip = $(`#${prefix}-split-chip`);
  if (split === 'SPLIT_5050') {
    if (splitIconEl) splitIconEl.innerHTML = splitIconHtml('SPLIT_5050', 'cycle');
    splitChip?.setAttribute('aria-label', '樣嘢點計：一人一半');
  } else if (split === 'FOR_A') {
    if (splitIconEl) splitIconEl.innerHTML = personImg('A', 'lg');
    splitChip?.setAttribute('aria-label', '樣嘢點計：男孩自己嘅');
  } else {
    if (splitIconEl) splitIconEl.innerHTML = personImg('B', 'lg');
    splitChip?.setAttribute('aria-label', '樣嘢點計：女生自己嘅');
  }

  if (prefix === 'expense') updateExpenseSplitHint();
}

function setExpenseEssentials(prefix, { currency, payer, split } = {}) {
  if (currency) $(`#${prefix}-currency`).value = currency;
  if (payer) $(`#${prefix}-payer`).value = payer;
  if (split) $(`#${prefix}-split-mode`).value = split;
  syncExpenseEssentialsUi(prefix);
}

function setupExpenseEssentials(prefix, { onCurrencyChange } = {}) {
  $(`#${prefix}-currency-chip`)?.addEventListener('click', () => {
    const input = $(`#${prefix}-currency`);
    if (!input) return;
    input.value = cycleExpenseValue(EXPENSE_CURRENCY_CYCLE, input.value);
    if (onCurrencyChange) onCurrencyChange(input.value);
    syncExpenseEssentialsUi(prefix);
  });

  $(`#${prefix}-payer-chip`)?.addEventListener('click', () => {
    const input = $(`#${prefix}-payer`);
    if (!input) return;
    input.value = cycleExpenseValue(EXPENSE_PAYER_CYCLE, input.value);
    syncExpenseEssentialsUi(prefix);
  });

  $(`#${prefix}-split-chip`)?.addEventListener('click', () => {
    const input = $(`#${prefix}-split-mode`);
    if (!input) return;
    input.value = cycleExpenseValue(EXPENSE_SPLIT_CYCLE, input.value);
    syncExpenseEssentialsUi(prefix);
  });

  syncExpenseEssentialsUi(prefix);
}

function hasDayRangeFilter() {
  return Boolean(listFilters.dayFrom || listFilters.dayTo);
}

function formatDayRangeLabel() {
  const from = listFilters.dayFrom;
  const to = listFilters.dayTo;
  if (from && to) {
    return from === to ? from : `${from} ～ ${to}`;
  }
  if (from) return `${from} 起`;
  if (to) return `至 ${to}`;
  return '';
}

function formatDayRangeBarLabel(from, to) {
  if (!from && !to) return '';
  if (from && to && from === to) return `[${formatShortDayLabel(from)}]`;
  if (from && to) return `[${formatShortDayLabel(from)}～${formatShortDayLabel(to)}]`;
  if (from) return `[${formatShortDayLabel(from)}起]`;
  if (to) return `[至${formatShortDayLabel(to)}]`;
  return '';
}

function formatShortDayLabel(iso) {
  if (!iso || iso.length < 10) return iso || '';
  return `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;
}

function parseISODateParts(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function isoFromParts(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

const dayRangePickerState = {
  viewYear: 0,
  viewMonth: 0, // 1-12
  anchor: null,
  onChange: null,
};

function initListDayFilter() {
  listFilters.dayFrom = '';
  listFilters.dayTo = '';
  const today = parseISODateParts(todayISO());
  dayRangePickerState.viewYear = today?.y || new Date().getFullYear();
  dayRangePickerState.viewMonth = today?.m || new Date().getMonth() + 1;
  dayRangePickerState.anchor = null;
  updateDayScopeToggle();
}

function getQuickDayScope() {
  const today = todayISO();
  const { dayFrom, dayTo } = listFilters;
  if (!dayFrom && !dayTo) return 'all';
  if (dayFrom === today && dayTo === today) return 'today';
  return 'custom';
}

function getQuickDayValueLabel() {
  const scope = getQuickDayScope();
  if (scope === 'all') return '全部';
  if (scope === 'today') return '今日';
  return '自定範圍';
}

function openDayRangePicker() {
  const seed = listFilters.dayFrom || listFilters.dayTo || todayISO();
  const parts = parseISODateParts(seed) || parseISODateParts(todayISO());
  dayRangePickerState.viewYear = parts.y;
  dayRangePickerState.viewMonth = parts.m;
  dayRangePickerState.anchor = null;
  renderDayRangePicker();
  openModal(els.dayRangeModal);
}

function closeDayRangePicker() {
  dayRangePickerState.anchor = null;
  closeModal(els.dayRangeModal);
}

function applyDayRangeSelection(from, to, { close = true } = {}) {
  setDayRange(from, to);
  syncQuickFilterChips();
  dayRangePickerState.onChange?.();
  if (close) closeDayRangePicker();
  else renderDayRangePicker();
}

function updateDayRangeStatus() {
  const status = $('#day-range-status');
  if (!status) return;
  const anchor = dayRangePickerState.anchor;
  if (anchor) {
    status.textContent = `開始：${anchor}｜再撳結束日`;
    return;
  }
  const label = formatDayRangeLabel();
  status.textContent = label
    ? `目前：${label}｜撳兩下揀新範圍`
    : '先撳開始日，再撳結束日';
}

function renderDayRangePicker() {
  const { viewYear: y, viewMonth: m, anchor } = dayRangePickerState;
  const monthLabel = $('#day-range-month-label');
  if (monthLabel) monthLabel.textContent = `${y}年${m}月`;

  const from = anchor || listFilters.dayFrom || '';
  const to = anchor ? '' : listFilters.dayTo || '';
  const draftFrom = from && to ? (from <= to ? from : to) : from;
  const draftTo = from && to ? (from <= to ? to : from) : '';

  $$('.day-range-quick-btn').forEach((btn) => {
    const quick = btn.dataset.dayQuick;
    const scope = getQuickDayScope();
    const active =
      !anchor &&
      ((quick === 'all' && scope === 'all') || (quick === 'today' && scope === 'today'));
    btn.classList.toggle('is-active', active);
  });

  const cal = $('#day-range-calendar');
  if (!cal) return;
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const totalDays = daysInMonth(y, m);
  const today = todayISO();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push('<span class="day-range-day is-empty" aria-hidden="true"></span>');
  }

  for (let d = 1; d <= totalDays; d += 1) {
    const iso = isoFromParts(y, m, d);
    const classes = ['day-range-day'];
    if (iso === today) classes.push('is-today');
    if (anchor === iso) classes.push('is-anchor', 'is-selected');
    if (draftFrom && draftTo && iso >= draftFrom && iso <= draftTo) classes.push('is-in-range');
    if (draftFrom && iso === draftFrom) classes.push('is-selected', 'is-range-start');
    if (draftTo && iso === draftTo) classes.push('is-selected', 'is-range-end');
    if (draftFrom && !draftTo && iso === draftFrom) classes.push('is-selected');
    cells.push(
      `<button type="button" class="${classes.join(' ')}" data-day="${iso}" aria-label="${iso}">${d}</button>`
    );
  }

  cal.innerHTML = cells.join('');
  updateDayRangeStatus();
}

function handleDayRangeDayClick(iso) {
  if (!iso) return;
  if (!dayRangePickerState.anchor) {
    dayRangePickerState.anchor = iso;
    renderDayRangePicker();
    return;
  }
  const start = dayRangePickerState.anchor;
  dayRangePickerState.anchor = null;
  applyDayRangeSelection(start, iso, { close: true });
}

function setupDayRangePicker(onChange) {
  dayRangePickerState.onChange = onChange;
  $$('[data-close-day-range]').forEach((el) => {
    el.addEventListener('click', closeDayRangePicker);
  });
  $('#day-range-prev-month')?.addEventListener('click', () => {
    let { viewYear: y, viewMonth: m } = dayRangePickerState;
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    dayRangePickerState.viewYear = y;
    dayRangePickerState.viewMonth = m;
    renderDayRangePicker();
  });
  $('#day-range-next-month')?.addEventListener('click', () => {
    let { viewYear: y, viewMonth: m } = dayRangePickerState;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    dayRangePickerState.viewYear = y;
    dayRangePickerState.viewMonth = m;
    renderDayRangePicker();
  });
  $$('.day-range-quick-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const quick = btn.dataset.dayQuick;
      if (quick === 'today') applyDayRangeSelection(todayISO(), todayISO(), { close: true });
      else applyDayRangeSelection('', '', { close: true });
    });
  });
  $('#day-range-calendar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-day]');
    if (!btn || !els.dayRangeModal?.contains(btn)) return;
    handleDayRangeDayClick(btn.dataset.day);
  });
}

function cycleQuickCurrencyFilter(onChange) {
  const order = ['', 'JPY', 'HKD'];
  const cur = listFilters.currency || '';
  const next = order[(order.indexOf(cur) + 1) % order.length];
  listFilters.currency = next;
  syncQuickFilterChips();
  onChange();
}

function cycleQuickPayerFilter(onChange) {
  const order = ['', 'A', 'B'];
  const cur = listFilters.payer || '';
  const next = order[(order.indexOf(cur) + 1) % order.length];
  listFilters.payer = next;
  syncQuickFilterChips();
  onChange();
}

function cycleQuickSplitFilter(onChange) {
  const cur = QUICK_SPLIT_CYCLE.includes(listFilters.splitMode)
    ? listFilters.splitMode
    : '';
  const next = QUICK_SPLIT_CYCLE[(QUICK_SPLIT_CYCLE.indexOf(cur) + 1) % QUICK_SPLIT_CYCLE.length];
  listFilters.splitMode = next;
  syncQuickFilterChips();
  updateFilterActiveSummary();
  onChange();
}

function syncQuickFilterChips() {
  const dayLabelEl = $('#filter-day-chip-label');
  const dayIconEl = $('#filter-day-chip-icon');
  const dayChip = $('#filter-day-chip');
  if (dayIconEl) dayIconEl.innerHTML = uiIconHtml('date', 'md');
  if (dayLabelEl) dayLabelEl.textContent = getQuickDayValueLabel();
  const dayActive = hasDayRangeFilter();
  const dayScope = getQuickDayScope();
  dayChip?.classList.toggle('is-active', dayActive);
  dayChip?.setAttribute('aria-pressed', dayActive ? 'true' : 'false');
  const rangeBarLabel = dayScope === 'custom'
    ? formatDayRangeBarLabel(listFilters.dayFrom, listFilters.dayTo)
    : '';
  dayChip?.setAttribute(
    'aria-label',
    dayScope === 'custom' && rangeBarLabel
      ? `日子：自定範圍 ${rangeBarLabel}`
      : `日子：${getQuickDayValueLabel()}`
  );

  const rangeBar = $('#filter-day-range-bar');
  const rangeBarText = $('#filter-day-range-bar-text');
  if (rangeBar && rangeBarText) {
    if (dayScope === 'custom' && rangeBarLabel) {
      rangeBarText.textContent = rangeBarLabel;
      rangeBar.classList.remove('hidden');
      rangeBar.setAttribute('aria-label', `自定日期範圍 ${rangeBarLabel}`);
    } else {
      rangeBarText.textContent = '';
      rangeBar.classList.add('hidden');
      rangeBar.setAttribute('aria-label', '自定日期範圍');
    }
  }

  const currency = listFilters.currency || '';
  const currencyIconEl = $('#filter-currency-chip-icon');
  const currencyChip = $('#filter-currency-chip');
  if (currencyIconEl) {
    if (currency === 'JPY') currencyIconEl.innerHTML = currencyUiIconHtml('JPY', 'md');
    else if (currency === 'HKD') currencyIconEl.innerHTML = currencyUiIconHtml('HKD', 'md');
    else currencyIconEl.innerHTML = uiIconHtml('exchange', 'md');
  }
  currencyChip?.classList.toggle('is-active', Boolean(currency));
  currencyChip?.setAttribute('aria-pressed', currency ? 'true' : 'false');
  currencyChip?.setAttribute('aria-label', currency ? `幣別：${currency}` : '幣別：全部');

  const payer = listFilters.payer || '';
  const payerIconEl = $('#filter-payer-chip-icon');
  const payerLabelEl = $('#filter-payer-chip-label');
  const payerChip = $('#filter-payer-chip');
  if (payerIconEl) {
    if (payer === 'A') payerIconEl.innerHTML = personImg('A', 'md');
    else if (payer === 'B') payerIconEl.innerHTML = personImg('B', 'md');
    else payerIconEl.innerHTML = uiIconHtml('creditCard', 'md');
  }
  if (payerLabelEl) payerLabelEl.textContent = '邊個畀';
  payerChip?.classList.toggle('is-active', Boolean(payer));
  payerChip?.setAttribute('aria-pressed', payer ? 'true' : 'false');
  payerChip?.setAttribute(
    'aria-label',
    payer === 'A' ? '邊個畀：男孩' : payer === 'B' ? '邊個畀：女生' : '邊個畀：全部'
  );

  const splitMode = QUICK_SPLIT_CYCLE.includes(listFilters.splitMode)
    ? listFilters.splitMode
    : '';
  const splitIconEl = $('#filter-split-chip-icon');
  const splitLabelEl = $('#filter-split-chip-label');
  const splitChip = $('#filter-split-chip');
  if (splitMode === 'FOR_A') {
    if (splitIconEl) splitIconEl.innerHTML = personImg('A', 'md');
    if (splitLabelEl) splitLabelEl.textContent = '自己嘅';
    splitChip?.setAttribute('aria-label', '樣嘢點計：男孩自己嘅');
  } else if (splitMode === 'FOR_B') {
    if (splitIconEl) splitIconEl.innerHTML = personImg('B', 'md');
    if (splitLabelEl) splitLabelEl.textContent = '自己嘅';
    splitChip?.setAttribute('aria-label', '樣嘢點計：女生自己嘅');
  } else if (splitMode === 'SPLIT_5050') {
    if (splitIconEl) {
      splitIconEl.innerHTML =
        splitIconHtml('SPLIT_5050', 'md', '一人一半') || uiIconHtml('expense', 'md');
    }
    if (splitLabelEl) splitLabelEl.textContent = '一人一半';
    splitChip?.setAttribute('aria-label', '樣嘢點計：一人一半');
  } else {
    if (splitIconEl) splitIconEl.innerHTML = uiIconHtml('expense', 'md');
    if (splitLabelEl) splitLabelEl.textContent = '樣嘢點計';
    splitChip?.setAttribute('aria-label', '樣嘢點計：全部');
  }
  splitChip?.classList.toggle('is-active', Boolean(splitMode));
  splitChip?.setAttribute('aria-pressed', splitMode ? 'true' : 'false');

  const currencyHidden = $('#filter-currency');
  if (currencyHidden) currencyHidden.value = currency;
  const payerHidden = $('#filter-payer');
  if (payerHidden) payerHidden.value = payer;
  const splitHidden = $('#filter-split');
  if (splitHidden) splitHidden.value = splitMode;
}

function setupQuickFilterToggles(onChange) {
  $('#filter-day-chip')?.addEventListener('click', () => openDayRangePicker());
  $('#filter-day-range-bar')?.addEventListener('click', () => openDayRangePicker());
  $('#filter-currency-chip')?.addEventListener('click', () => cycleQuickCurrencyFilter(onChange));
  $('#filter-payer-chip')?.addEventListener('click', () => cycleQuickPayerFilter(onChange));
  $('#filter-split-chip')?.addEventListener('click', () => cycleQuickSplitFilter(onChange));
  syncQuickFilterChips();
}

function updateDayScopeToggle() {
  syncQuickFilterChips();
}

function updateFilterActiveSummary() {
  const parts = [];
  if (listFilters.category) {
    parts.push(getFilterCategoryLabel(listFilters.category));
  }
  if (listFilters.sortAmount === 'asc') parts.push('價錢↑');
  if (listFilters.sortAmount === 'desc') parts.push('價錢↓');
  if (listFilters.sortDate === 'asc') parts.push('最舊優先');

  const hint = $('#filter-active-hint');
  const panel = $('#filter-panel-advanced');
  if (!hint) return;
  if (parts.length) {
    hint.textContent = parts.join(' · ');
    hint.classList.remove('hidden');
    panel?.classList.add('has-active');
  } else {
    hint.textContent = '';
    hint.classList.add('hidden');
    panel?.classList.remove('has-active');
  }
}

function setupListFilterToggle(groupId, hiddenId, attr, filterKey, onChange) {
  const group = $(groupId);
  const hidden = $(hiddenId);
  if (!group || !hidden) return;

  group.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.toggle-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const raw = btn.dataset[attr];
      hidden.value = raw === 'all' ? '' : raw;
      listFilters[filterKey] = hidden.value;
      onChange();
    });
  });
}

function setDayRange(from, to) {
  let dayFrom = from || '';
  let dayTo = to || '';
  if (dayFrom && dayTo && dayFrom > dayTo) {
    const tmp = dayFrom;
    dayFrom = dayTo;
    dayTo = tmp;
  }
  listFilters.dayFrom = dayFrom;
  listFilters.dayTo = dayTo;
  updateDayScopeToggle();
}

function setDayFilter(day) {
  const value = day || '';
  setDayRange(value, value);
}

/**
 * 錢嘅記分板（好似兩個人共用一個玻璃樽）：
 * - 正數 net_b_owes_a = B 欠 A
 * - 負數 = A 欠 B
 * - 接近 0 = 大家唔欠（一段數完結）
 *
 * 每筆點計（computeShares）：
 * - 一人一半：畀錢嗰個墊咗一半 → 另一個欠一半
 * - 幫 A / 幫 B：邊個幫邊個畀，邊個就要還
 * - 還錢 / 借錢：淨係搬欠數，唔入旅費預算；借幾多欠幾多（唔會除二）
 */
function resolveSplitModeForCompute(tx) {
  if (tx.split_mode === 'LOAN' || tx.category === LOAN_CATEGORY) return 'LOAN';
  if (tx.split_mode === 'REPAY' || tx.category === REPAY_CATEGORY) return 'REPAY';
  return tx.split_mode || 'SPLIT_5050';
}

function enrichTransaction(tx) {
  const splitMode = resolveSplitModeForCompute(tx);
  const trustStoredShares =
    splitMode !== 'LOAN' &&
    splitMode !== 'REPAY' &&
    tx.a_share !== '' &&
    tx.a_share != null &&
    !isNaN(Number(tx.a_share));

  const shares = trustStoredShares
    ? {
        a_share: Number(tx.a_share),
        b_share: Number(tx.b_share),
        net_b_owes_a: Number(tx.net_b_owes_a),
      }
    : computeShares(tx.amount, tx.payer, splitMode);

  return {
    ...tx,
    split_mode: splitMode,
    ...shares,
    date: parseDate(tx.date),
    time: formatRecordTime(tx.time),
    location: String(tx.location || '').trim(),
  };
}

function computeShares(amount, payer, splitMode) {
  const amt = Number(amount) || 0;
  switch (splitMode) {
    case 'FOR_A':
      return {
        a_share: amt,
        b_share: 0,
        net_b_owes_a: payer === 'A' ? 0 : -amt,
      };
    case 'FOR_B':
      return {
        a_share: 0,
        b_share: amt,
        net_b_owes_a: payer === 'A' ? amt : 0,
      };
    case 'REPAY':
    case 'LOAN':
      return {
        a_share: 0,
        b_share: 0,
        net_b_owes_a: payer === 'B' ? -amt : amt,
      };
    default:
      return {
        a_share: amt / 2,
        b_share: amt / 2,
        net_b_owes_a: payer === 'A' ? amt / 2 : -amt / 2,
      };
  }
}

function getTxKey(tx) {
  return tx.transaction_id || tx._uid;
}

function findTransactionByKey(key) {
  return transactions.find((t) => t.transaction_id === key || t._uid === key);
}

function normalizeTransactions(rawList) {
  return rawList
    .filter((tx) => Number(tx.amount) > 0)
    .map((tx) => {
      const enriched = enrichTransaction(tx);
      enriched._uid = enriched.transaction_id || enriched.client_id || enriched._uid;
      if (enriched.client_id) {
        enriched._uid = enriched._uid || enriched.client_id;
      }
      return enriched;
    });
}

function budgetsFromApi(apiBudgets) {
  const result = structuredClone(DEFAULT_BUDGETS);
  if (!Array.isArray(apiBudgets)) return result;
  for (const b of apiBudgets) {
    const person = String(b.person || '').trim();
    const currency = String(b.currency || '').trim();
    if (result[person] && result[person][currency] !== undefined) {
      result[person][currency] = Number(b.initial_budget) || 0;
    }
  }
  return result;
}

function budgetsToApi(b) {
  return [
    { person: 'A', currency: 'JPY', initial_budget: b.A.JPY },
    { person: 'B', currency: 'JPY', initial_budget: b.B.JPY },
    { person: 'A', currency: 'HKD', initial_budget: b.A.HKD },
    { person: 'B', currency: 'HKD', initial_budget: b.B.HKD },
  ];
}

function summaryFromApi(apiSummary) {
  if (!Array.isArray(apiSummary) || apiSummary.length === 0) return null;

  const result = { A: {}, B: {} };
  for (const row of apiSummary) {
    const person = String(row.person || '').trim();
    const currency = String(row.currency || '').trim();
    if (!result[person] || !currency) continue;
    result[person][currency] = {
      initial_budget: Number(row.initial_budget) || 0,
      total_spent: Number(row.total_spent) || 0,
      remaining_budget: Number(row.remaining_budget) || 0,
      net_balance: Number(row.net_balance) || 0,
    };
  }
  return result;
}

function getSummaryRow(person, currency) {
  return summary && summary[person] ? summary[person][currency] : null;
}

function buildLocalSummary() {
  const { spent, net } = calcSummary();
  const result = { A: {}, B: {} };

  ['A', 'B'].forEach((person) => {
    ['JPY', 'HKD'].forEach((currency) => {
      const initial = budgets[person][currency];
      const totalSpent = spent[person][currency];
      result[person][currency] = {
        initial_budget: initial,
        total_spent: totalSpent,
        remaining_budget: initial - totalSpent,
        net_balance: net[currency],
      };
    });
  });

  return result;
}

function updateSyncStatus(state, syncedAt) {
  const el = $('#sync-status');
  const refreshBtn = els.syncRefreshBtn || $('#sync-refresh-btn');
  if (!el) return;

  const endpoint = getActiveEndpoint();
  const sheetHint = apiEndpointKey === 'tester' ? ' · 測試' : '';
  const pending = typeof OfflineQueue !== 'undefined' ? OfflineQueue.size() : 0;

  if (refreshBtn) refreshBtn.disabled = isRefreshBlocked();

  if (state === 'offline') {
    el.textContent = `📴 已離線（${pending} 筆待同步）${sheetHint}`;
    el.className = 'sync-status offline';
    el.disabled = false;
    return;
  }

  if (state === 'pending' || (state === 'syncing' && pending > 0)) {
    el.textContent = `☁️ 同步中（${pending} 筆）${sheetHint}`;
    el.className = 'sync-status syncing';
    el.disabled = true;
    return;
  }

  if (state === 'retry') {
    el.textContent = `⚠️ 同步失敗，稍後自動重試${sheetHint}`;
    el.className = 'sync-status error';
    el.disabled = false;
    if (refreshBtn) refreshBtn.disabled = isRefreshBlocked();
    return;
  }

  if (state === 'syncing') {
    el.textContent = `☁️ 同步中…${sheetHint}`;
    el.className = 'sync-status syncing';
    el.disabled = true;
    return;
  }

  if (state === 'error') {
    el.textContent = `⚠️ 無法連線試算表${sheetHint}`;
    el.className = 'sync-status error';
    el.disabled = false;
    if (refreshBtn) refreshBtn.disabled = isRefreshBlocked();
    return;
  }

  const timeSource = syncedAt || lastSyncedAt || new Date().toISOString();
  const time = new Date(timeSource).toLocaleTimeString('zh-Hant', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  el.textContent = `✅ 已同步 ${time}${sheetHint}`;
  el.className = 'sync-status synced';
  el.disabled = false;
  if (refreshBtn) refreshBtn.disabled = isRefreshBlocked();
  el.title = endpoint.spreadsheetUrl
    ? `${endpoint.label}\n${endpoint.spreadsheetUrl}`
    : endpoint.label;
}

function updateSyncStatusFromQueue(mode) {
  const pending = typeof OfflineQueue !== 'undefined' ? OfflineQueue.size() : 0;
  const online = typeof SyncManager !== 'undefined' ? SyncManager.isNetworkOnline() : navigator.onLine;

  if (!online) {
    updateSyncStatus('offline');
    return;
  }
  if (mode === 'retry') {
    updateSyncStatus('retry');
    return;
  }
  if (mode === 'syncing' && pending > 0) {
    updateSyncStatus('pending');
    return;
  }
  if (pending > 0) {
    updateSyncStatus('pending');
    return;
  }
  if (lastSyncedAt) {
    updateSyncStatus('success', lastSyncedAt);
  } else {
    updateSyncStatus('syncing');
  }
}

async function manualSync() {
  if (isRefreshBlocked()) return;
  try {
    if (typeof SyncManager !== 'undefined') {
      await SyncManager.flushQueue();
    }
    if (typeof OfflineQueue !== 'undefined' && OfflineQueue.size() > 0) {
      updateSyncStatusFromQueue();
      showToast('部分變更尚未同步，稍後會自動重試', 'info');
      return;
    }
    await fetchAllData({ showSuccessToast: true });
  } catch (err) {
    showToast(formatApiError(err), 'error');
  }
}

function getOtherEndpointKey() {
  return apiEndpointKey === 'tester' ? 'production' : 'tester';
}

function isCyberpunkTheme() {
  return document.documentElement.classList.contains('theme-cyberpunk');
}

function updateThemeControls() {
  const cyber = isCyberpunkTheme();
  const btn = $('#btn-toggle-theme');
  const desc = $('#theme-switcher-desc');
  if (btn) {
    btn.innerHTML = cyber
      ? `${uiIconHtml('list', 'btn')} 切回日間模式`
      : `${uiIconHtml('list', 'btn')} 啟用賽博龐克`;
    btn.setAttribute('aria-pressed', cyber ? 'true' : 'false');
  }
  if (desc) {
    desc.textContent = cyber ? '目前：賽博龐克深色模式' : '目前：日間模式';
  }
  PARTICLE_COLORS = cyber ? PARTICLE_COLORS_CYBER : PARTICLE_COLORS_LIGHT;
}

function applyTheme(theme) {
  const cyber = theme === 'cyberpunk';
  document.documentElement.classList.toggle('theme-cyberpunk', cyber);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, cyber ? 'cyberpunk' : 'light');
  } catch (_) {}
  updateThemeControls();
}

function toggleTheme() {
  applyTheme(isCyberpunkTheme() ? 'light' : 'cyberpunk');
  showToast(
    isCyberpunkTheme()
      ? `${uiIconHtml('list', 'btn')} 已切換賽博龐克模式`
      : `${uiIconHtml('theme', 'btn')} 已切回日間模式`,
    'success'
  );
}

function setupThemeToggle() {
  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) === 'cyberpunk' ? 'cyberpunk' : 'light');
  $('#btn-toggle-theme')?.addEventListener('click', toggleTheme);
}

function openSheetSwitcher() {
  const otherKey = getOtherEndpointKey();
  const current = getActiveEndpoint();
  const other = API_ENDPOINTS[otherKey];
  const msg = $('#sheet-switcher-message');
  const hint = $('#sheet-switcher-hint');
  const link = $('#sheet-switcher-link');
  const confirmBtn = $('#sheet-switcher-confirm');

  if (msg) {
    msg.textContent = `目前使用「${current.label}」。要改用「${other.label}」嗎？`;
  }

  if (hint) {
    if (otherKey === 'tester') {
      hint.textContent = '將連線測試試算表（下方連結），用來驗證功能，唔會影響正式資料。';
    } else {
      hint.textContent = '將切回正式試算表（下方連結）。';
    }
  }

  if (link) {
    if (other.spreadsheetUrl) {
      link.href = other.spreadsheetUrl;
      link.textContent = otherKey === 'tester' ? '開啟測試試算表 ↗' : '開啟正式試算表 ↗';
      link.classList.remove('hidden');
    } else {
      link.removeAttribute('href');
      link.textContent = '';
      link.classList.add('hidden');
    }
  }

  if (confirmBtn) {
    confirmBtn.innerHTML = `改用${other.label} ${uiIconHtml('confirm', 'btn')}`;
    confirmBtn.dataset.target = otherKey;
  }

  const clearHint = $('#sheet-clear-hint');
  if (clearHint) {
    clearHint.innerHTML = `清空<strong>目前「${escapeHtml(current.label)}」</strong>試算表嘅全部消費／還錢紀錄（預算保留）。刪除後無法復原。`;
  }

  updateThemeControls();
  openModal($('#sheet-switcher-modal'));
}

async function switchApiEndpoint(targetKey) {
  if (!API_ENDPOINTS[targetKey] || targetKey === apiEndpointKey) {
    closeModal($('#sheet-switcher-modal'));
    return;
  }

  apiEndpointKey = targetKey;
  API_URL = getApiUrl();
  localStorage.setItem(API_STORAGE_KEY, apiEndpointKey);
  closeModal($('#sheet-switcher-modal'));

  const endpoint = getActiveEndpoint();
  showToast(`已切換至${endpoint.label}`, 'success');

  if (typeof SyncManager !== 'undefined') {
    SyncManager.reinitEndpoint(apiEndpointKey);
  } else if (typeof OfflineQueue !== 'undefined') {
    OfflineQueue.init(apiEndpointKey);
  }

  // Reset local view before loading the selected spreadsheet.
  transactions = [];
  budgets = structuredClone(DEFAULT_BUDGETS);
  summary = null;
  lastSyncedAt = null;
  renderAll();
  updateSyncStatus('syncing');

  try {
    await fetchAllData();
    SyncManager.scheduleSync();
  } catch (err) {
    if (OfflineQueue.size() > 0) {
      reapplyPendingFromQueue();
      updateSyncStatusFromQueue();
    } else {
      showToast(formatApiError(err), 'error');
    }
  }
}

function isModalOpen() {
  return !els.budgetModal.classList.contains('hidden') ||
    !els.editModal.classList.contains('hidden') ||
    !els.detailModal.classList.contains('hidden') ||
    (els.personSpendModal && !els.personSpendModal.classList.contains('hidden')) ||
    !els.repayModal.classList.contains('hidden') ||
    (els.loanModal && !els.loanModal.classList.contains('hidden')) ||
    !els.deleteConfirmModal.classList.contains('hidden') ||
    (els.dayRangeModal && !els.dayRangeModal.classList.contains('hidden')) ||
    !$('#sheet-switcher-modal').classList.contains('hidden');
}

function formatApiError(err) {
  const msg = String(err?.message || err || '').trim();
  if (!msg) return '同步失敗，請稍後再試';
  if (msg.includes('逾時') || err?.name === 'AbortError') {
    return `${msg.replace('AbortError', '連線逾時')}（Google 試算表回應較慢，通常再試一次就得）`;
  }
  if (
    msg.includes('部署') ||
    msg.includes('Apps Script') ||
    msg.includes('舊版腳本') ||
    msg.includes('連錯後端') ||
    msg.includes('試算表')
  ) {
    return msg;
  }
  if (msg.startsWith('無法連線 API') || msg.startsWith('API HTTP')) {
    return `${msg}（請檢查網絡，或稍後再試）`;
  }
  return msg;
}

function apiRequestShouldRetry(err, res, attempt) {
  if (attempt >= API_MAX_RETRIES) return false;
  if (err?.name === 'AbortError') return true;
  if (res && [502, 503, 504].includes(res.status)) return true;
  return false;
}

/* ===== API ===== */
async function apiRequest(payload = {}, attempt = 0) {
  API_URL = getApiUrl();
  const endpoint = getActiveEndpoint();
  const url = new URL(API_URL);

  Object.entries(payload).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });

  // Always pin requests to the selected spreadsheet when configured.
  if (endpoint.spreadsheetId) {
    url.searchParams.set('spreadsheetId', endpoint.spreadsheetId);
  }
  if (endpoint.sheetGid) {
    url.searchParams.set('gid', endpoint.sheetGid);
  }
  url.searchParams.set('source', apiEndpointKey);

  const controller = new AbortController();
  const timeoutMs = API_TIMEOUT_MS;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (err) {
    window.clearTimeout(timeoutId);
    if (apiRequestShouldRetry(err, null, attempt)) {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      return apiRequest(payload, attempt + 1);
    }
    if (err && err.name === 'AbortError') {
      throw new Error(`連線逾時（>${timeoutMs / 1000}s）`);
    }
    throw new Error(`無法連線 API（${err.message}）`);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!res.ok) {
    if (apiRequestShouldRetry(null, res, attempt)) {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      return apiRequest(payload, attempt + 1);
    }
    throw new Error(`API HTTP ${res.status}`);
  }

  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error('API 回傳網頁而非 JSON，請檢查 Apps Script 部署 URL');
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('API 回傳格式錯誤');
  }

  if (data.status === 'ERROR') {
    throw new Error(data.message || 'API 錯誤');
  }

  const expectedSheetId = endpoint.spreadsheetId;
  const actualSheetId = data.spreadsheet_id || data.actual_spreadsheet_id || '';

  // 新版腳本一定會回 source；冇就代表仲用緊舊部署
  if (!data.source) {
    throw new Error(
      `「${endpoint.label}」API 仲係舊版腳本（冇 source 欄位）。請用 apps-script/Code.${apiEndpointKey}.gs 重新部署「新版本」，並更新 app.js 嘅 URL。`
    );
  }

  if (data.source !== apiEndpointKey) {
    throw new Error(
      `連錯後端：期望 ${apiEndpointKey}，實際 ${data.source}。請檢查 app.js 嘅 ${apiEndpointKey}.url 係咪貼錯部署連結。`
    );
  }

  if (expectedSheetId && actualSheetId && actualSheetId !== expectedSheetId) {
    throw new Error(
      `連到錯誤試算表（期望 ${expectedSheetId.slice(0, 8)}…，實際 ${String(actualSheetId).slice(0, 8)}…）。請確認 Apps Script 係喺正確試算表入面部署。`
    );
  }

  return data;
}

function applyServerData(data, applySeq) {
  if (data.status !== 'SUCCESS') throw new Error('API 回傳失敗');
  if (applySeq != null && applySeq < lastAppliedServerSeq) return false;

  if (applySeq != null) lastAppliedServerSeq = applySeq;

  transactions = normalizeTransactions(data.transactions || []);
  budgets = budgetsFromApi(data.budgets);

  const apiSummary = summaryFromApi(data.summary);
  if (apiSummary) {
    ['A', 'B'].forEach((person) => {
      ['JPY', 'HKD'].forEach((currency) => {
        const row = apiSummary[person]?.[currency];
        if (row && row.initial_budget >= 0) {
          budgets[person][currency] = row.initial_budget;
        }
      });
    });
  }

  summary = buildLocalSummary();
  lastSyncedAt = data.synced_at || new Date().toISOString();
  renderAll();
  return true;
}

function applyLocalCreate(tx) {
  const cid = tx.client_id || tx._uid;
  transactions = transactions.filter((t) => t.client_id !== cid && t._uid !== cid);
  const enriched = enrichTransaction({
    ...tx,
    _uid: cid,
    client_id: cid,
  });
  transactions = normalizeTransactions([...transactions, enriched]);
  summary = buildLocalSummary();
  renderAll();
}

function applyLocalEdit(key, updated) {
  transactions = transactions.map((t) => {
    if (getTxKey(t) !== key && t.client_id !== key) return t;
    return enrichTransaction({
      ...t,
      ...updated,
      transaction_id: updated.transaction_id || t.transaction_id,
      client_id: t.client_id || t._uid,
      _uid: t._uid || t.client_id,
    });
  });
  summary = buildLocalSummary();
  renderAll();
}

function applyLocalDelete(key) {
  transactions = transactions.filter(
    (t) => getTxKey(t) !== key && t.client_id !== key
  );
  summary = buildLocalSummary();
  renderAll();
}

function applyLocalBudget(newBudgets) {
  budgets = structuredClone(newBudgets);
  summary = buildLocalSummary();
  renderAll();
}

function applyLocalClearTransactions() {
  transactions = [];
  summary = buildLocalSummary();
  renderAll();
}

function reapplyPendingFromQueue() {
  for (const op of OfflineQueue.getAll()) {
    switch (op.type) {
      case 'create':
        applyLocalCreate({
          ...op.payload,
          client_id: op.clientId,
          _uid: op.clientId,
        });
        break;
      case 'edit': {
        const key = op.payload.transaction_id || op.payload.clientId || op.clientId;
        applyLocalEdit(key, op.payload.tx);
        break;
      }
      case 'delete': {
        const key = op.payload.transaction_id || op.payload.clientId || op.clientId;
        applyLocalDelete(key);
        break;
      }
      case 'updateBudget':
        applyLocalBudget(op.payload.budgets);
        break;
      case 'clearTransactions':
        applyLocalClearTransactions();
        break;
      default:
        break;
    }
  }
}

function applyServerDataWithQueue(data, applySeq) {
  const hadPending = OfflineQueue.size() > 0;
  const applied = applyServerData(data, applySeq);
  if (applied && hadPending) {
    reapplyPendingFromQueue();
  }
  return applied;
}

function enqueueCreate(tx) {
  const clientId = tx.client_id || OfflineQueue.generateId();
  const payload = {
    ...tx,
    client_id: clientId,
    _uid: clientId,
    time: tx.time || nowLocalTimeHM(),
  };
  OfflineQueue.enqueue({
    type: 'create',
    clientId,
    payload,
  });
  applyLocalCreate(payload);
  return clientId;
}

function enqueueEdit(existing, updated) {
  const clientId = existing.client_id || existing._uid || '';
  OfflineQueue.enqueue({
    type: 'edit',
    clientId: clientId || OfflineQueue.generateId(),
    payload: {
      transaction_id: existing.transaction_id || '',
      clientId,
      tx: {
        ...updated,
        location: updated.location ?? getLocationText(existing),
      },
    },
  });
  applyLocalEdit(getTxKey(existing), {
    ...updated,
    transaction_id: existing.transaction_id || '',
    client_id: clientId,
    _uid: clientId || existing._uid,
  });
}

function enqueueDelete(existing) {
  const clientId = existing.client_id || existing._uid || '';
  OfflineQueue.enqueue({
    type: 'delete',
    clientId: clientId || OfflineQueue.generateId(),
    payload: {
      transaction_id: existing.transaction_id || '',
      clientId,
    },
  });
  applyLocalDelete(getTxKey(existing));
}

function enqueueBudgetUpdate(newBudgets) {
  OfflineQueue.enqueue({
    type: 'updateBudget',
    clientId: OfflineQueue.generateId(),
    payload: { budgets: structuredClone(newBudgets) },
  });
  applyLocalBudget(newBudgets);
}

function enqueueClearAll() {
  OfflineQueue.enqueue({
    type: 'clearTransactions',
    clientId: OfflineQueue.generateId(),
    payload: {},
  });
  applyLocalClearTransactions();
}

async function fetchAllData(options = {}) {
  const { silent = false, showSuccessToast = false } = options;
  const applySeq = beginServerApply();
  if (!silent) setLoading(true);
  else updateSyncStatus('syncing');

  try {
    const data = await apiRequest({ action: 'fetch' });
    const hasPending = typeof OfflineQueue !== 'undefined' && OfflineQueue.size() > 0;
    if (hasPending) {
      if (applyServerDataWithQueue(data, applySeq)) {
        updateSyncStatusFromQueue();
        if (showSuccessToast) showToast('已刷新資料 🔄', 'success');
      }
    } else if (applyServerData(data, applySeq)) {
      updateSyncStatus('success', data.synced_at);
      if (showSuccessToast) showToast('已刷新資料 🔄', 'success');
    }
    return data;
  } catch (err) {
    if (typeof OfflineQueue !== 'undefined' && OfflineQueue.size() > 0) {
      updateSyncStatusFromQueue();
    } else {
      updateSyncStatus('error');
    }
    throw err;
  } finally {
    if (!silent) setLoading(false);
  }
}

async function syncAddTransaction(tx) {
  return apiRequest({
    action: 'addTransaction',
    date: tx.date,
    time: tx.time || nowLocalTimeHM(),
    category: tx.category,
    description: tx.description,
    location: tx.location || '',
    currency: tx.currency,
    amount: tx.amount,
    payer: tx.payer,
    split_mode: tx.split_mode,
    client_id: tx.client_id || '',
  });
}

async function syncEditTransaction(tx) {
  return apiRequest({
    action: 'editTransaction',
    transaction_id: tx.transaction_id || '',
    client_id: tx.client_id || '',
    date: tx.date,
    category: tx.category,
    description: tx.description,
    location: tx.location || '',
    currency: tx.currency,
    amount: tx.amount,
    payer: tx.payer,
    split_mode: tx.split_mode,
  });
}

async function syncDeleteTransaction(ids) {
  const transactionId = typeof ids === 'string' ? ids : ids.transaction_id;
  const clientId = typeof ids === 'object' ? ids.client_id : '';
  return apiRequest({
    action: 'deleteTransaction',
    transaction_id: transactionId || '',
    client_id: clientId || '',
  });
}

async function syncBudgets(b) {
  return apiRequest({
    action: 'updateBudget',
    budgets: JSON.stringify(budgetsToApi(b)),
    A_JPY: b.A.JPY,
    B_JPY: b.B.JPY,
    A_HKD: b.A.HKD,
    B_HKD: b.B.HKD,
  });
}

async function syncClearAllTransactions() {
  return apiRequest({
    action: 'clearTransactions',
  });
}

/* ===== Calculations ===== */
function calcSummary() {
  const spent = {
    A: { JPY: 0, HKD: 0 },
    B: { JPY: 0, HKD: 0 },
  };
  const net = { JPY: 0, HKD: 0 };

  for (const tx of transactions) {
    const cur = tx.currency;
    if (cur !== 'JPY' && cur !== 'HKD') continue;
    spent.A[cur] += tx.a_share;
    spent.B[cur] += tx.b_share;
    net[cur] += tx.net_b_owes_a;
  }

  return { spent, net };
}

function getSortedCurrencyTxs(currency) {
  return transactions
    .filter((t) => t.currency === currency)
    .slice()
    .sort((a, b) => {
      const da = `${a.date || ''}T${formatRecordTime(a.time) || '00:00'}`;
      const db = `${b.date || ''}T${formatRecordTime(b.time) || '00:00'}`;
      const cmp = da.localeCompare(db);
      if (cmp !== 0) return cmp;
      return String(a.transaction_id || '').localeCompare(String(b.transaction_id || ''));
    });
}

/** Transactions after the last time this currency was fully settled. */
function getSettlementCycleTxs(currency) {
  const txs = getSortedCurrencyTxs(currency);
  let running = 0;
  let start = 0;
  for (let i = 0; i < txs.length; i++) {
    running += Number(txs[i].net_b_owes_a) || 0;
    if (isNegligibleMoney(running, currency)) start = i + 1;
  }
  return txs.slice(start);
}

/** Cycle (一段數) that contains this transaction — works even after settled. */
function getCycleContainingTransaction(tx) {
  if (!tx) return [];
  const currency = tx.currency;
  const txs = getSortedCurrencyTxs(currency);
  const key = getTxKey(tx);
  let start = 0;
  let running = 0;

  for (let i = 0; i < txs.length; i++) {
    running += Number(txs[i].net_b_owes_a) || 0;
    const hitZero = isNegligibleMoney(running, currency);
    const segment = txs.slice(start, i + 1);
    const contains = segment.some((t) => getTxKey(t) === key);
    if (hitZero) {
      if (contains) return segment;
      start = i + 1;
      running = 0;
    } else if (i === txs.length - 1 && contains) {
      return txs.slice(start);
    }
  }

  const open = getSettlementCycleTxs(currency);
  if (open.some((t) => getTxKey(t) === key)) return open;
  return [tx];
}

function getHelpPayColumns(tx) {
  if (isCashTransferTransaction(tx)) return { aHelpedB: 0, bHelpedA: 0 };
  const amt = Number(tx.amount) || 0;
  switch (tx.split_mode) {
    case 'FOR_A':
      return { aHelpedB: 0, bHelpedA: tx.payer === 'B' ? amt : 0 };
    case 'FOR_B':
      return { aHelpedB: tx.payer === 'A' ? amt : 0, bHelpedA: 0 };
    default:
      if (tx.payer === 'A') return { aHelpedB: amt / 2, bHelpedA: 0 };
      if (tx.payer === 'B') return { aHelpedB: 0, bHelpedA: amt / 2 };
      return { aHelpedB: 0, bHelpedA: 0 };
  }
}

function calcHelpPaidInTxs(txs) {
  let bHelpedA = 0;
  let aHelpedB = 0;
  for (const tx of txs) {
    const cols = getHelpPayColumns(tx);
    aHelpedB += cols.aHelpedB;
    bHelpedA += cols.bHelpedA;
  }
  return { bHelpedA, aHelpedB };
}

function buildHelpPayMatrixHtml(txs, currency, options = {}) {
  const rows = txs
    .map((tx) => ({ tx, ...getHelpPayColumns(tx) }))
    .filter((row) => row.aHelpedB > 0 || row.bHelpedA > 0);

  if (!rows.length) return '';

  let aTotal = 0;
  let bTotal = 0;
  const bodyRows = rows
    .map(({ tx, aHelpedB, bHelpedA }) => {
      aTotal += aHelpedB;
      bTotal += bHelpedA;
      const title = escapeHtml(getTransactionTitle(tx));
      const aCell = aHelpedB > 0 ? escapeHtml(formatMoney(aHelpedB, currency)) : '—';
      const bCell = bHelpedA > 0 ? escapeHtml(formatMoney(bHelpedA, currency)) : '—';
      const txKey = escapeHtml(getTxKey(tx));
      return `<tr class="help-pay-matrix-row" data-detail-key="${txKey}" tabindex="0" role="button" aria-label="查看詳情">
        <td class="help-pay-matrix-desc">${title}</td>
        <td class="help-pay-matrix-amt">${aCell}</td>
        <td class="help-pay-matrix-amt">${bCell}</td>
      </tr>`;
    })
    .join('');

  const helpNet = helpNetBOwesA(aTotal, bTotal);
  const netFormula = `${escapeHtml(formatMoney(aTotal, currency))} − ${escapeHtml(formatMoney(bTotal, currency))} = ${formatNetDirectionHtml(helpNet, currency)}`;
  const netLabel = options.finalSectionFollows ? '消費對消：' : '而家要還：';

  const scrollTable = `<div class="explain-scroll-wrap explain-scroll-matrix" style="max-height:${EXPLAIN_SCROLL_MAX}px">
    <table class="help-pay-matrix" aria-label="幫畀對照表">
      <thead>
        <tr>
          <th scope="col">記錄</th>
          <th scope="col">${personImgPair('A', 'B', 'xs')}</th>
          <th scope="col">${personImgPair('B', 'A', 'xs')}</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </div>`;

  const footer = `<div class="help-pay-matrix-footer">
    <div class="help-pay-matrix-total-row">
      <span>小計</span>
      <span>${escapeHtml(formatMoney(aTotal, currency))}</span>
      <span>${escapeHtml(formatMoney(bTotal, currency))}</span>
    </div>
    <div class="help-pay-matrix-net-row"><strong>${netLabel}</strong>${netFormula}</div>
  </div>`;

  return scrollTable + footer + buildExplainScrollHint(rows.length);
}

function calcHelpPaidInCycle(currency) {
  return calcHelpPaidInTxs(getSettlementCycleTxs(currency));
}

function helpNetBOwesA(aHelpedB, bHelpedA) {
  return (Number(aHelpedB) || 0) - (Number(bHelpedA) || 0);
}

function formatItemWhyLine(tx) {
  const explained = explainTransactionNet(tx);
  if (!explained.netLabel || isNegligibleMoney(explained.net, tx.currency)) {
    return null;
  }
  const title = getTransactionTitle(tx);
  const amount = formatMoney(tx.amount, tx.currency);
  const date = tx.date || '';
  const kind = isRepayTransaction(tx) ? '還錢' : isLoanTransaction(tx) ? '借錢' : getCategoryLabel(tx.category);
  return {
    title,
    meta: `${date}${date ? ' · ' : ''}${kind} · ${amount}`,
    netLabel: explained.netLabel,
    netClass: explained.netClass || '',
    key: getTxKey(tx),
  };
}

/** 還錢詳情用：搵呢筆所屬嗰一段數（已清嗰段／而家未清嗰段）。 */
function getRepayWhyCalcCycle(tx) {
  if (!tx) return [];
  const currency = tx.currency;
  const key = getTxKey(tx);
  const open = getSettlementCycleTxs(currency);
  if (open.some((t) => getTxKey(t) === key)) return open;
  return getCycleContainingTransaction(tx);
}

/**
 * 呢筆還錢獨立切片：段初 → 呢筆之前 / 呢筆本身 / 還之後欠數。
 * 唔會挾更遲嘅消費／還錢入「呢筆」故事。
 */
function getRepayIndependentSlice(tx) {
  const cycle = getRepayWhyCalcCycle(tx);
  const key = getTxKey(tx);
  const idx = cycle.findIndex((t) => getTxKey(t) === key);
  if (idx < 0) {
    const net = Number(tx.net_b_owes_a) || 0;
    return { cycle, before: [], self: tx, beforeNet: 0, afterNet: net };
  }
  const before = cycle.slice(0, idx);
  const self = cycle[idx];
  const beforeNet = before.reduce((sum, t) => sum + (Number(t.net_b_owes_a) || 0), 0);
  const afterNet = beforeNet + (Number(self.net_b_owes_a) || 0);
  return { cycle, before, self, beforeNet, afterNet };
}

/**
 * 每筆還錢獨立計：
 * ① 呢筆做咗咩
 * ② 還之前欠幾多
 * ③ 還之後欠幾多
 * ④ 若之後仲有數，註明而家最新
 */
function buildWhyCalcItemsHtml(tx) {
  if (!isRepayTransaction(tx)) return '';

  const currency = tx.currency;
  const { cycle, before, self, beforeNet, afterNet } = getRepayIndependentSlice(tx);
  const expensesBefore = before.filter(
    (t) => !isCashTransferTransaction(t) && !isNegligibleMoney(t.net_b_owes_a, currency)
  );
  const latestNet = cycle.reduce((sum, t) => sum + (Number(t.net_b_owes_a) || 0), 0);
  const payee = self.payer === 'A' ? 'B' : 'A';
  const payer = personImg(self.payer, 'inline');
  const amount = formatMoney(Math.abs(Number(self.amount) || 0), currency);
  const latestDiffers = !isNegligibleMoney(latestNet - afterNet, currency);

  let html = `<div class="detail-why-items">`;
  html += `<div class="detail-why-heading">① 呢筆做咗咩</div>`;
  html += `<div class="detail-why-calc-line is-current">
    <span class="detail-why-calc-label">${payer} 還咗 ${escapeHtml(amount)} 俾 ${personImg(payee, 'inline')}</span>
  </div>`;

  html += `<div class="detail-why-heading">② 呢筆還之前</div>`;
  if (expensesBefore.length) {
    html += `<ul class="detail-why-list">`;
    expensesBefore.forEach((item) => {
      const line = formatItemWhyLine(item);
      if (!line) return;
      html += `<li class="detail-why-row">
        <button type="button" class="detail-why-btn" data-detail-key="${escapeHtml(line.key)}">
          <span class="detail-why-main">
            <span class="detail-why-title">${escapeHtml(line.title)}</span>
            <span class="detail-why-meta">${escapeHtml(line.meta)}</span>
          </span>
          <span class="detail-why-net ${line.netClass}">${line.netLabel}</span>
        </button>
      </li>`;
    });
    html += `</ul>`;
    html += `<div class="detail-why-calc-note">只列到呢筆之前會產生欠數嘅消費；更早嘅還錢已計入當時欠數</div>`;
  } else {
    html += `<p class="detail-why-empty">呢筆之前未有要互相還嘅消費（或淨係有更早還錢）</p>`;
  }
  html += `<div class="detail-why-calc-line">
    <span class="detail-why-calc-label">當時欠數</span>
    <span class="detail-why-calc-value">${formatNetDirectionHtml(beforeNet, currency)}</span>
  </div>`;

  html += `<div class="detail-why-heading">③ 呢筆還之後</div>`;
  html += `<div class="detail-why-result"><strong>變成：</strong>${formatNetDirectionHtml(afterNet, currency)}</div>`;

  if (latestDiffers) {
    html += `<div class="detail-why-calc-note">之後仲有消費／還錢。而家最新：${formatNetDirectionHtml(latestNet, currency)}</div>`;
  }

  html += `</div>`;
  return html;
}

/** 總覽「邊個幫邊個畀」：未有互相幫畀時嘅空狀態。 */
function helpPayEmptyHtml(currency) {
  return `<div class="help-pay-stack help-pay-empty-state">
    <div class="help-pay-row help-pay-empty">${personImg('A', 'inline')} 同 ${personImg('B', 'inline')} 暫時未有互相幫畀</div>
    <div class="help-pay-row help-pay-net help-pay-net-settled">
      <span class="help-pay-net-label">對消後（未計還錢）</span>
      <span class="help-pay-net-result">大家唔欠 ${moneyFigHtml(0, currency)}</span>
    </div>
  </div>`;
}

/** 總覽「邊個幫邊個畀」：每行一條，避免金額換行。 */
function helpPayText(bHelpedA, aHelpedB, currency) {
  const rows = [];
  if (aHelpedB > 0) {
    rows.push(`${personImg('A', 'inline')} 幫 ${personImg('B', 'inline')} 畀咗 ${moneyFigHtml(aHelpedB, currency)}`);
  }
  if (bHelpedA > 0) {
    rows.push(`${personImg('B', 'inline')} 幫 ${personImg('A', 'inline')} 畀咗 ${moneyFigHtml(bHelpedA, currency)}`);
  }
  if (!rows.length) return '';

  const helpNet = helpNetBOwesA(aHelpedB, bHelpedA);
  const netResult = isNegligibleMoney(helpNet, currency)
    ? '大家唔欠'
    : formatNetDirectionHtml(helpNet, currency);
  const netLine = `<span class="help-pay-net-label">對消後（未計還錢）</span><span class="help-pay-net-result">${netResult}</span>`;

  return `<div class="help-pay-stack">
    ${rows.map((row) => `<div class="help-pay-row">${row}</div>`).join('')}
    <div class="help-pay-row help-pay-net">${netLine}</div>
  </div>`;
}

function getDebtInfo(currency) {
  const net = calcSummary().net[currency];
  if (isNegligibleMoney(net, currency)) return null;
  const exactAmount = Math.abs(net);
  const displayAmount = roundMoney(exactAmount, currency);
  if (net > 0) {
    return { payer: 'B', payee: 'A', amount: displayAmount, exactAmount };
  }
  return { payer: 'A', payee: 'B', amount: displayAmount, exactAmount };
}

function pickRepayCurrency() {
  if (currencyView === 'jpy') return 'JPY';
  if (currencyView === 'hkd') return 'HKD';
  if (getDebtInfo('JPY')) return 'JPY';
  if (getDebtInfo('HKD')) return 'HKD';
  return 'JPY';
}

function settlementText(netAmount, currency) {
  if (isNegligibleMoney(netAmount, currency)) {
    return {
      text: '🎉 而家大家唔欠，條數清晒！',
      html: '🎉 而家大家唔欠，條數清晒！',
      balanced: true,
    };
  }
  if (netAmount > 0) {
    return {
      text: `${personName('B')} 要還俾 ${personName('A')}：${formatMoney(netAmount, currency)}`,
      html: `${personImg('B', 'inline')} 要還俾 ${personImg('A', 'inline')}：${moneyFigHtml(netAmount, currency, 'money-debt')}`,
      balanced: false,
    };
  }
  return {
    text: `${personName('A')} 要還俾 ${personName('B')}：${formatMoney(Math.abs(netAmount), currency)}`,
    html: `${personImg('A', 'inline')} 要還俾 ${personImg('B', 'inline')}：${moneyFigHtml(Math.abs(netAmount), currency, 'money-debt')}`,
    balanced: false,
  };
}

function explainTransactionNet(tx) {
  const amount = escapeHtml(formatMoney(tx.amount, tx.currency));
  const half = escapeHtml(formatMoney(tx.amount / 2, tx.currency));
  const payer = personImg(tx.payer, 'inline');
  const split = SPLIT_LABELS[tx.split_mode] || tx.split_mode;

  let formula = '';
  if (isRepayTransaction(tx)) {
    const payee = personImg(tx.payer === 'A' ? 'B' : 'A', 'inline');
    formula = `${payer} 還咗 ${amount} 俾 ${payee}（唔計入消費，淨係用嚟還數）`;
  } else if (isLoanTransaction(tx)) {
    const payee = personImg(getLoanBorrower(tx), 'inline');
    formula = `${payer} 借咗 ${amount} 現金畀 ${payee}（唔計消費，淨係增加欠數）`;
  } else switch (tx.split_mode) {
    case 'FOR_A':
      formula =
        tx.payer === 'A'
          ? `${personImg('A', 'inline')} 自己嘅嘢，自己畀 → 唔使互相還`
          : `${payer} 幫 ${personImg('A', 'inline')} 畀咗 ${amount} → ${personImg('A', 'inline')} 要還返 ${payer}`;
      break;
    case 'FOR_B':
      formula =
        tx.payer === 'B'
          ? `${personImg('B', 'inline')} 自己嘅嘢，自己畀 → 唔使互相還`
          : `${payer} 幫 ${personImg('B', 'inline')} 畀咗 ${amount} → ${personImg('B', 'inline')} 要還返 ${payer}`;
      break;
    default:
      formula =
        tx.payer === 'A'
          ? `${payer} 先畀 ${amount}，一人一半 → ${personImg('B', 'inline')} 要還一半 ${half}`
          : `${payer} 先畀 ${amount}，一人一半 → ${personImg('A', 'inline')} 要還一半 ${half}`;
  }

  const net = tx.net_b_owes_a;
  let netClass = '';
  let netLabel = '';
  if (isRepayTransaction(tx)) {
    if (net > 0) {
      netClass = 'positive';
      netLabel = `${personImg('A', 'inline')} 還咗 ${escapeHtml(formatMoney(Math.abs(net), tx.currency))}`;
    } else if (net < 0) {
      netClass = 'negative';
      netLabel = `${personImg('B', 'inline')} 還咗 ${escapeHtml(formatMoney(Math.abs(net), tx.currency))}`;
    }
  } else if (isLoanTransaction(tx)) {
    if (net > 0) {
      netClass = 'positive';
      netLabel = `${personImg('B', 'inline')} 欠 ${personImg('A', 'inline')} ${escapeHtml(formatMoney(Math.abs(net), tx.currency))}`;
    } else if (net < 0) {
      netClass = 'negative';
      netLabel = `${personImg('A', 'inline')} 欠 ${personImg('B', 'inline')} ${escapeHtml(formatMoney(Math.abs(net), tx.currency))}`;
    }
  } else if (net > 0) {
    netClass = 'positive';
    netLabel = `${personImg('B', 'inline')} 欠 ${personImg('A', 'inline')} ${escapeHtml(formatMoney(net, tx.currency))}`;
  } else if (net < 0) {
    netClass = 'negative';
    netLabel = `${personImg('A', 'inline')} 欠 ${personImg('B', 'inline')} ${escapeHtml(formatMoney(Math.abs(net), tx.currency))}`;
  }

  return { formula, net, netClass, netLabel, split };
}

function buildTransactionDetailHtml(tx) {
  const { formula, netClass, netLabel } = explainTransactionNet(tx);
  const payerLabel = personImg(tx.payer, 'inline');
  const timePart = tx.time ? ` · ${formatRecordTime(tx.time)}` : '';
  const desc = getTransactionTitle(tx);
  const rawDesc = String(tx.description || '').trim();
  const showDesc = !isCashTransferTransaction(tx) && rawDesc && rawDesc !== desc;
  const curClass = tx.currency === 'JPY' ? 'jpy' : 'hkd';
  const isRepay = isRepayTransaction(tx);
  const isLoan = isLoanTransaction(tx);
  const emojiHtml = transactionIconHtml(tx, 'detail');
  const splitHtml = splitTagHtml(tx);

  let html = `
    <div class="detail-hero">
      <span class="detail-emoji">${emojiHtml}</span>
      <div class="detail-hero-text">
        <div class="detail-title">${escapeHtml(desc)}</div>
        <div class="detail-amount ${curClass}">${formatMoney(tx.amount, tx.currency)}</div>
      </div>
    </div>
    <dl class="detail-grid">
      <dt>${uiIconHtml('date', 'label')} 日期</dt>
      <dd>${escapeHtml(tx.date)}${escapeHtml(timePart)}</dd>
      <dt>${uiIconHtml('tag', 'label')} 分類</dt>
      <dd>${escapeHtml(getCategoryLabel(tx.category))}</dd>`;

  if (showDesc) {
    html += `
      <dt>${uiIconHtml('notes', 'label')} 描述</dt>
      <dd>${escapeHtml(rawDesc)}</dd>`;
  }

  const location = getLocationText(tx);
  if (location) {
    const mapsUrl = locationMapsUrl(location);
    html += `
      <dt>📍 地點</dt>
      <dd><a class="detail-location-link" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(location)}</a></dd>`;
  }

  html += `
      <dt>${uiIconHtml('creditCard', 'label')} 邊個畀錢</dt>
      <dd>${payerLabel}</dd>
      <dt>${uiIconHtml('expense', 'label')} 樣嘢點計</dt>
      <dd>${splitHtml}</dd>`;

  if (isRepay || isLoan) {
    html += `
      <dt>📌 備註</dt>
      <dd>${rawDesc ? escapeHtml(rawDesc) : '—'}</dd>`;
  } else {
    html += `
      <dt>${personImg('A', 'inline')} 分攤</dt>
      <dd>${moneyFigHtml(tx.a_share, tx.currency)}</dd>
      <dt>${personImg('B', 'inline')} 分攤</dt>
      <dd>${moneyFigHtml(tx.b_share, tx.currency)}</dd>`;
  }

  html += `</dl>`;

  if (isRepay) {
    html += `
    <div class="detail-formula">
      <div class="detail-formula-label">點解咁計</div>
      <div class="detail-formula-text">${formula}</div>`;
    if (netLabel) {
      html += `<div class="explain-step-net ${netClass}">${netLabel}</div>`;
    }
    html += buildWhyCalcItemsHtml(tx);
    html += '</div>';
  } else if (isLoan) {
    html += `
    <div class="detail-formula">
      <div class="detail-formula-label">點解咁計</div>
      <div class="detail-formula-text">${formula}</div>`;
    if (netLabel) {
      html += `<div class="explain-step-net ${netClass}">${netLabel}</div>`;
    }
    html += '</div>';
  }

  return html;
}

function showDetailContent(key) {
  const tx = findTransactionByKey(key);
  if (!tx) {
    dismissDetailModal();
    return;
  }

  detailModalKey = key;
  $('#detail-modal-body').innerHTML = buildTransactionDetailHtml(tx);
  bindDetailTriggers($('#detail-modal-body'));
  const closeBtn = els.detailModal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.setAttribute('aria-label', detailModalStack.length ? '返回上一層詳情' : '關閉');
  }
  openModal(els.detailModal);
}

function openDetailModal(key) {
  const isOpen = !els.detailModal.classList.contains('hidden');
  if (isOpen && detailModalKey && detailModalKey !== key) {
    detailModalStack.push(detailModalKey);
  } else if (!isOpen) {
    detailModalStack = [];
  }
  showDetailContent(key);
}

function dismissDetailModal() {
  detailModalStack = [];
  detailModalKey = null;
  closeModal(els.detailModal);
}

/** 有上一層詳情就返回；否則關閉 modal */
function closeDetailModal() {
  if (detailModalStack.length) {
    const prevKey = detailModalStack.pop();
    showDetailContent(prevKey);
    return;
  }
  dismissDetailModal();
}

function bindDetailTriggers(container) {
  if (!container) return;
  container.querySelectorAll('[data-detail-key]').forEach((el) => {
    const open = () => openDetailModal(el.dataset.detailKey);
    el.addEventListener('click', (e) => {
      if (e.target.closest('.edit-btn, .tx-location-link')) return;
      open();
    });
    if (el.classList.contains('transaction-item') || el.classList.contains('help-pay-matrix-row')) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    }
  });
}

function buildExplainScrollHint(count) {
  if (count <= 5) return '';
  return `<div class="explain-scroll-hint">共 ${count} 筆 · 向下滑查看更多 ↓</div>`;
}

function renderExplainStepList(txs, cur, section) {
  let itemsHtml = '';
  txs.forEach((tx) => {
    itemsHtml += renderExplainStepItem(tx);
  });

  return `<div class="explain-scroll-wrap" style="max-height:${EXPLAIN_SCROLL_MAX}px">
    <ol class="explain-steps" aria-label="${cur} ${section} 明細">${itemsHtml}</ol>
  </div>${buildExplainScrollHint(txs.length)}`;
}

function renderExplainStepItem(tx) {
  const { netClass, netLabel } = explainTransactionNet(tx);
  const txKey = escapeHtml(getTxKey(tx));
  const tag = isRepayTransaction(tx)
    ? '<span class="explain-step-tag explain-step-tag-repay">還錢</span>'
    : isLoanTransaction(tx)
      ? '<span class="explain-step-tag explain-step-tag-loan">借錢</span>'
      : '';
  const desc = isRepayTransaction(tx)
    ? `${personImg(tx.payer, 'inline')} 還咗 ${escapeHtml(formatMoney(tx.amount, tx.currency))} 俾 ${personImg(tx.payer === 'A' ? 'B' : 'A', 'inline')}`
    : isLoanTransaction(tx)
      ? `${personImg(tx.payer, 'inline')} 借咗 ${escapeHtml(formatMoney(tx.amount, tx.currency))} 畀 ${personImg(getLoanBorrower(tx), 'inline')}`
      : escapeHtml(getTransactionTitle(tx));
  return `<li class="explain-step-item">
    <button type="button" class="explain-step-btn" data-detail-key="${txKey}" aria-label="查看詳情">
      <span class="explain-step-desc">${tag}${desc}</span>
      <span class="explain-step-net ${netClass}">${netLabel}</span>
      <span class="explain-step-chevron" aria-hidden="true">›</span>
    </button>
  </li>`;
}

function formatNetDirection(amount, currency) {
  if (isNegligibleMoney(amount, currency)) {
    return `大家唔欠 ${formatMoney(0, currency)}`;
  }
  if (amount > 0) {
    return `${personName('B')} 要還俾 ${personName('A')} ${formatMoney(amount, currency)}`;
  }
  return `${personName('A')} 要還俾 ${personName('B')} ${formatMoney(Math.abs(amount), currency)}`;
}

function formatNetDirectionHtml(amount, currency) {
  if (isNegligibleMoney(amount, currency)) {
    return `大家唔欠 ${moneyFigHtml(0, currency)}`;
  }
  if (amount > 0) {
    return `${personImg('B', 'inline')} 要還俾 ${personImg('A', 'inline')} ${moneyFigHtml(amount, currency)}`;
  }
  return `${personImg('A', 'inline')} 要還俾 ${personImg('B', 'inline')} ${moneyFigHtml(Math.abs(amount), currency)}`;
}

/** 同方向未還清時：(對消後 − 已還) = 仲欠 */
function formatRemainAfterRepayFormula(helpNet, netTotal, currency) {
  if (isNegligibleMoney(netTotal, currency) || isNegligibleMoney(helpNet, currency)) {
    return '';
  }
  const sameDir = (helpNet > 0 && netTotal > 0) || (helpNet < 0 && netTotal < 0);
  if (!sameDir) return '';

  const before = Math.abs(helpNet);
  const remain = Math.abs(netTotal);
  if (remain > before + moneyEpsilon(currency)) return '';

  const repaid = before - remain;
  if (isNegligibleMoney(repaid, currency)) return '';

  return `(${formatMoney(before, currency)} − ${formatMoney(repaid, currency)}) = ${formatMoney(remain, currency)}`;
}

function renderSettlementExplain() {
  const detailsEl = $('#settlement-explain-details');
  let anyOpenDebt = false;

  ['JPY', 'HKD'].forEach((cur) => {
    const el = $(`#settlement-explain-${cur.toLowerCase()}`);
    if (!el) return;

    const badge = currencyUiIconHtml(cur, 'sm');
    const netTotal = calcSummary().net[cur];
    const settled = isNegligibleMoney(netTotal, cur);
    if (!settled) anyOpenDebt = true;

    // 還清：提示去明細睇舊帳，並提供一鍵跳轉
    if (settled) {
      el.innerHTML = `<div class="explain-currency-label">${badge} ${cur}</div>
        <p class="explain-empty">而家數清晒。想睇舊帳／還錢詳情，去「紀錄」撳嗰筆就得。</p>
        <button type="button" class="btn btn-ghost btn-block explain-go-list-btn" data-go-list>${uiIconHtml('list', 'btn')} 去紀錄</button>`;
      return;
    }

    const cycleTxs = getSettlementCycleTxs(cur);
    const expenseContrib = cycleTxs.filter(
      (t) => !isCashTransferTransaction(t) && !isNegligibleMoney(t.net_b_owes_a, cur)
    );
    const loanContrib = cycleTxs.filter(
      (t) => isLoanTransaction(t) && !isNegligibleMoney(t.net_b_owes_a, cur)
    );
    const repayContrib = cycleTxs.filter(
      (t) => isRepayTransaction(t) && !isNegligibleMoney(t.net_b_owes_a, cur)
    );
    const { bHelpedA, aHelpedB } = calcHelpPaidInCycle(cur);
    const helpNet = helpNetBOwesA(aHelpedB, bHelpedA);
    const hasCashAdjust = loanContrib.length > 0 || repayContrib.length > 0;
    const netDiffersFromHelp = !isNegligibleMoney(netTotal - helpNet, cur);
    const showFinalSection = hasCashAdjust || netDiffersFromHelp;

    let html = `<div class="explain-currency-label">${badge} ${cur}</div>`;
    html += `<p class="explain-rules-compact">而家呢段未還清嘅數，點樣計出嚟</p>`;

    html += `<div class="explain-section">
      <div class="explain-section-title">① 邊個幫邊個畀</div>`;
    if (expenseContrib.length === 0) {
      html += `<p class="explain-empty">未有要互相還嘅消費</p>`;
    } else {
      const matrixHtml = buildHelpPayMatrixHtml(expenseContrib, cur, {
        finalSectionFollows: showFinalSection,
      });
      if (matrixHtml) html += matrixHtml;
    }
    html += `</div>`;

    if (loanContrib.length) {
      html += `<div class="explain-section">
        <div class="explain-section-title">② 借錢（現金）</div>
        ${renderExplainStepList(loanContrib, cur, 'loan')}</div>`;
    }

    if (repayContrib.length) {
      html += `<div class="explain-section">
        <div class="explain-section-title">${loanContrib.length ? '③' : '②'} 還錢紀錄</div>
        ${renderExplainStepList(repayContrib, cur, 'repay')}</div>`;
    }

    if (showFinalSection) {
      const remainFormula = formatRemainAfterRepayFormula(helpNet, netTotal, cur);
      html += `<div class="explain-sum-line explain-sum-final">
        <div><strong>而家仲要還</strong>${remainFormula ? ` ${escapeHtml(remainFormula)}` : ''}</div>
        <div class="explain-sum-result">${formatNetDirectionHtml(netTotal, cur)}</div>
      </div>`;
    }

    el.innerHTML = html;
    bindDetailTriggers(el);
  });

  detailsEl?.querySelectorAll('[data-go-list]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab('list'));
  });

  if (detailsEl) {
    detailsEl.classList.remove('hidden');
    if (!anyOpenDebt) detailsEl.open = false;
  }

  updateExplainPreview();
}

function updateExplainPreview() {
  const el = $('#settlement-explain-preview');
  const details = $('#settlement-explain-details');
  if (!el) return;
  el.textContent = details?.open ? '收起' : '打開睇睇';
}

/* ===== Render ===== */
function renderSummary() {
  const { spent, net } = calcSummary();

  ['JPY', 'HKD'].forEach((cur) => {
    const lower = cur.toLowerCase();
    ['A', 'B'].forEach((person) => {
      const p = person.toLowerCase();
      const used = spent[person][cur];
      const remaining = budgets[person][cur] - used;

      const spentText = formatMoney(used, cur);
      const remainText = `剩餘 ${formatMoney(remaining, cur)}`;

      document
        .querySelectorAll(`.spent-value[data-person="${p}"][data-currency="${lower}"]`)
        .forEach((el) => {
          el.textContent = spentText;
        });

      document
        .querySelectorAll(`.remain-value[data-person="${p}"][data-currency="${lower}"]`)
        .forEach((el) => {
          el.textContent = remainText;
          el.classList.toggle('over-budget', remaining < 0);
        });
    });

    const settled = isNegligibleMoney(net[cur], cur);
    const settlement = settlementText(net[cur], cur);
    const badge = currencyUiIconHtml(cur, 'sm');
    const el = $(`#settlement-${lower}`);
    el.innerHTML = `${badge} ${settlement.html}`;
    el.classList.remove('balanced', 'debt');
    el.classList.add(settlement.balanced ? 'balanced' : 'debt');

    const helpEl = $(`#help-pay-${lower}`);
    if (helpEl) {
      const { bHelpedA, aHelpedB } = calcHelpPaidInCycle(cur);
      const html = !settled ? helpPayText(bHelpedA, aHelpedB, cur) : '';
      helpEl.innerHTML = `${badge} ${html || helpPayEmptyHtml(cur)}`;
      helpEl.classList.toggle('is-settled-empty', !html);
    }
  });

  updateSettlementChromeVisibility(net);
  applyCurrencyView();
}

function updateSettlementChromeVisibility(net = calcSummary().net) {
  const jpyDebt = !isNegligibleMoney(net.JPY, 'JPY');
  const hkdDebt = !isNegligibleMoney(net.HKD, 'HKD');
  const showRepay =
    currencyView === 'jpy' ? jpyDebt : currencyView === 'hkd' ? hkdDebt : jpyDebt || hkdDebt;

  // 即使未有互相幫畀，都顯示空狀態，唔好成個 block 收埋
  $('#help-pay-block')?.classList.remove('hidden');
  $('#settlement-actions')?.classList.toggle('hidden', !showRepay);
}

function getFilteredTransactions() {
  let list = [...transactions];

  if (listFilters.category) {
    if (listFilters.category === CUSTOM_CATEGORY) {
      list = list.filter((tx) => !isPredefinedCategory(tx.category));
    } else {
      list = list.filter((tx) => matchesCategoryFilter(tx.category, listFilters.category));
    }
  }
  if (listFilters.splitMode) {
    list = list.filter((tx) => tx.split_mode === listFilters.splitMode);
  }
  if (listFilters.currency) {
    list = list.filter((tx) => tx.currency === listFilters.currency);
  }
  if (listFilters.payer) {
    list = list.filter((tx) => tx.payer === listFilters.payer);
  }
  if (listFilters.dayFrom) {
    list = list.filter((tx) => tx.date >= listFilters.dayFrom);
  }
  if (listFilters.dayTo) {
    list = list.filter((tx) => tx.date <= listFilters.dayTo);
  }

  list.sort((a, b) => {
    if (listFilters.sortAmount === 'asc') return a.amount - b.amount;
    if (listFilters.sortAmount === 'desc') return b.amount - a.amount;
    const da = `${a.date || ''}T${formatRecordTime(a.time) || '00:00'}`;
    const db = `${b.date || ''}T${formatRecordTime(b.time) || '00:00'}`;
    return listFilters.sortDate === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
  });

  return list;
}

function paginateList(list, options = {}) {
  const pageSize = options.pageSize !== undefined ? options.pageSize : listFilters.pageSize;
  const currentPage = options.currentPage !== undefined ? options.currentPage : listFilters.currentPage;

  if (pageSize === 'all') {
    return { items: list, totalPages: 1, page: 1, total: list.length };
  }

  const size = Number(pageSize) || 10;
  const totalPages = Math.max(1, Math.ceil(list.length / size));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * size;

  return {
    items: list.slice(start, start + size),
    totalPages,
    page,
    total: list.length,
  };
}

function getPageRange(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const addPage = (p) => {
    if (p >= 1 && p <= total && !pages.includes(p)) pages.push(p);
  };

  addPage(1);
  for (let p = current - 1; p <= current + 1; p++) addPage(p);
  addPage(total);

  pages.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) result.push('...');
    result.push(pages[i]);
  }
  return result;
}

function syncPageSizeSelects(value) {
  ['#filter-page-size', '#filter-page-size-bottom'].forEach((sel) => {
    const el = $(sel);
    if (el && el.value !== value) el.value = value;
  });
}

function loadListViewExpanded() {
  try {
    const saved = localStorage.getItem(LIST_DETAIL_STORAGE_KEY);
    if (saved === null) return false;
    return saved === '1';
  } catch (_) {
    return false;
  }
}

function updateListDetailToggleButtons() {
  const label = listViewExpanded ? '收起 ▲' : '展開 ▼';
  const ariaLabel = listViewExpanded ? '收起明細詳情' : '展開明細詳情';
  ['#btn-list-detail-toggle-top', '#btn-list-detail-toggle-bottom'].forEach((sel) => {
    const btn = $(sel);
    if (!btn) return;
    btn.textContent = label;
    btn.setAttribute('aria-expanded', listViewExpanded ? 'true' : 'false');
    btn.setAttribute('aria-label', ariaLabel);
  });
}

function applyListViewExpanded(expanded) {
  listViewExpanded = expanded;
  const card = $('#list-card');
  card?.classList.toggle('list-compact', !expanded);
  card?.classList.toggle('list-expanded', expanded);
  try {
    localStorage.setItem(LIST_DETAIL_STORAGE_KEY, expanded ? '1' : '0');
  } catch (_) {}
  updateListDetailToggleButtons();
}

function getPaginationInfoText(meta) {
  if (meta.total === 0) return '共 0 筆';
  if (listFilters.pageSize === 'all') return `共 ${meta.total} 筆（全部顯示）`;
  return `第 ${meta.page} / ${meta.totalPages} 頁，共 ${meta.total} 筆`;
}

function renderPaginationBar(meta, suffix = '') {
  const pageNumbers = $(`#page-numbers${suffix}`);
  const btnPrev = $(`#btn-prev${suffix}`);
  const btnNext = $(`#btn-next${suffix}`);

  if (!pageNumbers || !btnPrev || !btnNext) return;

  if (meta.total === 0 || listFilters.pageSize === 'all') {
    pageNumbers.innerHTML = '';
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }

  btnPrev.disabled = meta.page <= 1;
  btnNext.disabled = meta.page >= meta.totalPages;

  pageNumbers.innerHTML = getPageRange(meta.page, meta.totalPages)
    .map((p) => {
      if (p === '...') {
        return '<span class="page-num ellipsis">…</span>';
      }
      return `<button type="button" class="page-num ${p === meta.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    })
    .join('');

  pageNumbers.querySelectorAll('.page-num[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      listFilters.currentPage = Number(btn.dataset.page);
      renderTransactionList();
    });
  });
}

function renderPagination(meta) {
  const text = getPaginationInfoText(meta);
  const info = $('#pagination-info');
  const infoTop = $('#pagination-info-top');
  if (info) info.textContent = text;
  if (infoTop) infoTop.textContent = text;

  syncPageSizeSelects(listFilters.pageSize);

  if (meta.total === 0) {
    renderPaginationBar(meta, '');
    renderPaginationBar(meta, '-bottom');
    return;
  }

  if (listFilters.pageSize === 'all') {
    renderPaginationBar(meta, '');
    renderPaginationBar(meta, '-bottom');
    return;
  }

  renderPaginationBar(meta, '');
  renderPaginationBar(meta, '-bottom');
}

function renderTransactionList() {
  const list = els.transactionList;
  const filtered = getFilteredTransactions();
  const meta = paginateList(filtered);
  listFilters.currentPage = meta.page;

  renderPagination(meta);

  if (filtered.length === 0) {
    list.innerHTML =
      transactions.length === 0
        ? `<li class="empty-state">${uiIconHtml('empty', 'label')} 尚無消費紀錄，快記第一筆吧</li>`
        : hasDayRangeFilter()
          ? `<li class="empty-state">${uiIconHtml('empty', 'label')} ${escapeHtml(formatDayRangeLabel())} 沒有紀錄</li>`
          : `<li class="empty-state">${uiIconHtml('empty', 'label')} 沒有符合篩選條件的紀錄</li>`;
    return;
  }

  list.innerHTML = groupTransactionsByDate(meta.items)
    .map(
      (group) => `
        <li class="tx-day-header">${escapeHtml(formatDayHeader(group.date))}</li>
        ${group.items.map((tx) => buildTransactionItemHtml(tx)).join('')}`
    )
    .join('');

  list.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(btn.dataset.key);
    });
  });

  bindDetailTriggers(list);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getPersonShare(tx, person) {
  return person === 'B' ? Number(tx.b_share) || 0 : Number(tx.a_share) || 0;
}

function getPersonSpendRows() {
  const { person, currency, category, sort } = personSpendView;
  if (!person || !currency) return [];

  let rows = transactions.filter((tx) => {
    if (tx.currency !== currency) return false;
    if (isRepayTransaction(tx)) return false;
    if (isLoanTransaction(tx)) return false;
    const share = getPersonShare(tx, person);
    if (isNegligibleMoney(share, currency)) return false;
    if (!matchesCategoryFilter(tx.category, category)) return false;
    return true;
  });

  rows = rows.slice().sort((a, b) => {
    const shareA = getPersonShare(a, person);
    const shareB = getPersonShare(b, person);
    if (sort === 'amount-desc') return shareB - shareA;
    if (sort === 'amount-asc') return shareA - shareB;
    const da = `${a.date || ''}T${formatRecordTime(a.time) || '00:00'}`;
    const db = `${b.date || ''}T${formatRecordTime(b.time) || '00:00'}`;
    const cmp = da.localeCompare(db);
    return sort === 'date-asc' ? cmp : -cmp;
  });

  return rows;
}

function renderPersonSpendList() {
  const list = $('#person-spend-list');
  const totalEl = $('#person-spend-total');
  const titleEl = $('#person-spend-title');
  if (!list || !personSpendView.person || !personSpendView.currency) return;

  const person = personSpendView.person;
  const currency = personSpendView.currency;
  const rows = getPersonSpendRows();
  const total = rows.reduce((sum, tx) => sum + getPersonShare(tx, person), 0);

  if (titleEl) {
    titleEl.innerHTML = `${personImg(person, 'inline')} 用左明細 · ${escapeHtml(currency)}`;
  }
  if (totalEl) {
    totalEl.textContent = `合共用左 ${formatMoney(total, currency)} · ${rows.length} 筆`;
  }

  if (!rows.length) {
    list.innerHTML = `<li class="person-spend-empty">呢個篩選之下未有用左紀錄</li>`;
    return;
  }

  list.innerHTML = rows
    .map((tx) => {
      const share = getPersonShare(tx, person);
      const curClass = currency === 'JPY' ? 'jpy' : 'hkd';
      const key = escapeHtml(getTxKey(tx));
      return `<li class="person-spend-row">
        <button type="button" class="person-spend-row-btn" data-detail-key="${key}">
          <span class="person-spend-row-main">
            <span class="person-spend-row-title">${escapeHtml(getTransactionTitle(tx))}</span>
            <span class="person-spend-row-meta">${escapeHtml(tx.date || '')} · ${escapeHtml(getCategoryLabel(tx.category))}</span>
          </span>
          <span class="person-spend-row-amount ${curClass}">${escapeHtml(formatMoney(share, currency))}</span>
        </button>
      </li>`;
    })
    .join('');

  bindDetailTriggers(list);
}

function openPersonSpendModal(person, currency) {
  if (!person || !currency) return;
  personSpendView.person = person;
  personSpendView.currency = currency;
  personSpendView.category = '';
  personSpendView.sort = 'date-desc';

  const catEl = $('#person-spend-category');
  const sortEl = $('#person-spend-sort');
  if (catEl) catEl.value = '';
  if (sortEl) sortEl.value = 'date-desc';

  renderPersonSpendList();
  openModal(els.personSpendModal);
}

function closePersonSpendModal() {
  closeModal(els.personSpendModal);
  personSpendView.person = null;
  personSpendView.currency = null;
}

function setupPersonSpendUI() {
  $$('.person-spend-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      openPersonSpendModal(btn.dataset.person, btn.dataset.currency);
    });
  });

  $('#person-spend-category')?.addEventListener('change', (e) => {
    personSpendView.category = e.target.value;
    renderPersonSpendList();
  });

  $('#person-spend-sort')?.addEventListener('change', (e) => {
    personSpendView.sort = e.target.value;
    renderPersonSpendList();
  });

  $$('[data-close-person-spend]').forEach((el) => {
    el.addEventListener('click', closePersonSpendModal);
  });
}

function renderAll() {
  renderSummary();
  renderTransactionList();
  if (els.personSpendModal && !els.personSpendModal.classList.contains('hidden')) {
    renderPersonSpendList();
  }
}

function populateBudgetForm() {
  $('#budget-a-jpy').value = budgets.A.JPY;
  $('#budget-b-jpy').value = budgets.B.JPY;
  $('#budget-a-hkd').value = budgets.A.HKD;
  $('#budget-b-hkd').value = budgets.B.HKD;
}

/* ===== Toggle Helpers ===== */
function setupToggle(groupId, hiddenId, attr, defaultVal) {
  const group = $(groupId);
  const hidden = $(hiddenId);
  group.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.toggle-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      hidden.value = btn.dataset[attr];
    });
  });
  hidden.value = defaultVal;
}

function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOL[currency] || '$';
}

function sanitizeMoneyInputValue(value) {
  let v = String(value || '').replace(/[^\d.]/g, '');
  const dot = v.indexOf('.');
  if (dot === -1) return v;
  const head = v.slice(0, dot + 1);
  const tail = v.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return head + tail;
}

function bindMoneyInput(input) {
  input.addEventListener('input', () => {
    input.value = sanitizeMoneyInputValue(input.value);
  });
}

function updateMoneyPrefix(prefixEl, currency) {
  if (!prefixEl) return;
  prefixEl.textContent = getCurrencySymbol(currency);
  prefixEl.classList.toggle('prefix-jpy', currency === 'JPY');
  prefixEl.classList.toggle('prefix-hkd', currency === 'HKD');
}

function setupMoneyInputs() {
  $$('.money-input').forEach(bindMoneyInput);
  updateMoneyPrefix($('#expense-amount-prefix'), $('#expense-currency')?.value || 'JPY');
  updateMoneyPrefix($('#edit-amount-prefix'), $('#edit-currency')?.value || 'JPY');
}

function setToggleValue(groupId, hiddenId, attr, value) {
  const group = $(groupId);
  const hidden = $(hiddenId);
  group.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset[attr] === value);
  });
  hidden.value = value;
}

function updateExpenseSplitHint() {
  const hint = $('#expense-split-hint');
  if (!hint) return;

  const payer = $('#expense-payer').value;
  const split = getExpenseSplitModeValue('expense');

  if (split === 'FOR_B' && payer === 'A') {
    hint.innerHTML = `${personImg('A', 'inline')} 幫 ${personImg('B', 'inline')} 畀 → ${personImg('B', 'inline')} 要還全額`;
  } else if (split === 'FOR_A' && payer === 'B') {
    hint.innerHTML = `${personImg('B', 'inline')} 幫 ${personImg('A', 'inline')} 畀 → ${personImg('A', 'inline')} 要還全額`;
  } else if (split === 'SPLIT_5050') {
    hint.innerHTML =
      payer === 'A'
        ? `${personImg('A', 'inline')} 畀，${personImg('B', 'inline')} 還一半`
        : `${personImg('B', 'inline')} 畀，${personImg('A', 'inline')} 還一半`;
  } else if (split === 'FOR_A' && payer === 'A') {
    hint.innerHTML = `${personImg('A', 'inline')} 自己嘅，自己畀 → 唔使還`;
  } else if (split === 'FOR_B' && payer === 'B') {
    hint.innerHTML = `${personImg('B', 'inline')} 自己嘅，自己畀 → 唔使還`;
  } else {
    hint.innerHTML = '';
  }
}

/* ===== Modals ===== */
const MODAL_BASE_Z = 1000;
const MODAL_SWIPE_DOWN_TRIGGER_DY = 96;
const MODAL_SWIPE_DOWN_MAX_DX_RATIO = 0.9;

function openModal(modal) {
  if (!modal) return;
  openModalCount += 1;
  modal.style.zIndex = String(MODAL_BASE_Z + openModalCount * 10);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  const content = modal.querySelector('.modal-content');
  if (content) {
    content.style.transition = '';
    content.style.transform = '';
    content.classList.remove('is-swipe-closing');
  }
  modal.classList.add('hidden');
  modal.style.zIndex = '';
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) document.body.style.overflow = '';
}

function dismissModalCard(modal) {
  if (!modal || modal.classList.contains('hidden')) return;
  if (modal.id === 'detail-modal') {
    dismissDetailModal();
    return;
  }
  if (modal.id === 'person-spend-modal') {
    closePersonSpendModal();
    return;
  }
  if (modal.id === 'delete-confirm-modal') {
    deleteConfirmMode = 'delete-one';
    setDeleteConfirmButtonLabel('delete-one');
  }
  closeModal(modal);
}

function getModalScrollParent(content, startTarget) {
  let node = startTarget;
  while (node && node !== content) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const canScroll =
        /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
      if (canScroll) return node;
    }
    node = node.parentElement;
  }
  if (content instanceof HTMLElement && content.scrollHeight > content.clientHeight + 1) {
    return content;
  }
  return null;
}

function setupModalSwipeDownClose() {
  document.querySelectorAll('.modal').forEach((modal) => {
    const content = modal.querySelector('.modal-content');
    if (!content) return;

    let swipe = null;

    const resetSwipeVisual = (animate = false) => {
      if (animate) {
        content.style.transition = 'transform 0.2s ease';
      } else {
        content.style.transition = '';
      }
      content.style.transform = '';
      content.classList.remove('is-swipe-closing');
      if (animate) {
        window.setTimeout(() => {
          if (!content.classList.contains('is-swipe-closing')) {
            content.style.transition = '';
          }
        }, 220);
      }
    };

    content.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1 || modal.classList.contains('hidden')) {
          swipe = null;
          return;
        }
        const touch = e.touches[0];
        const scrollParent = getModalScrollParent(content, e.target);
        if (scrollParent && scrollParent.scrollTop > 0) {
          swipe = null;
          return;
        }
        swipe = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          armed: true,
          dragging: false,
        };
      },
      { passive: true }
    );

    content.addEventListener(
      'touchmove',
      (e) => {
        if (!swipe?.armed) return;
        const touch = [...e.touches].find((t) => t.identifier === swipe.id);
        if (!touch) return;
        const dx = Math.abs(touch.clientX - swipe.x);
        const dy = touch.clientY - swipe.y;
        if (!swipe.dragging) {
          if (dy < 10) return;
          if (dx > dy * MODAL_SWIPE_DOWN_MAX_DX_RATIO) {
            swipe.armed = false;
            return;
          }
          const scrollParent = getModalScrollParent(content, e.target);
          if (scrollParent && scrollParent.scrollTop > 0) {
            swipe.armed = false;
            return;
          }
          swipe.dragging = true;
          content.classList.add('is-swipe-closing');
        }
        if (e.cancelable) e.preventDefault();
        const pull = Math.max(0, dy);
        content.style.transition = 'none';
        content.style.transform = `translate3d(0, ${pull}px, 0)`;
      },
      { passive: false }
    );

    const endSwipe = (e) => {
      if (!swipe) return;
      const touch =
        (e.changedTouches && [...e.changedTouches].find((t) => t.identifier === swipe.id)) || null;
      const dy = touch ? touch.clientY - swipe.y : 0;
      const shouldClose = swipe.dragging && dy >= MODAL_SWIPE_DOWN_TRIGGER_DY;
      const wasDragging = swipe.dragging;
      swipe = null;
      if (shouldClose) {
        content.style.transition = 'transform 0.18s ease';
        content.style.transform = 'translate3d(0, 110%, 0)';
        window.setTimeout(() => {
          dismissModalCard(modal);
          resetSwipeVisual(false);
        }, 160);
        return;
      }
      if (wasDragging) resetSwipeVisual(true);
    };

    content.addEventListener('touchend', endSwipe, { passive: true });
    content.addEventListener('touchcancel', endSwipe, { passive: true });
  });
}

function setDeleteConfirmButtonLabel(mode) {
  const btn = $('#delete-confirm-btn');
  if (!btn) return;
  btn.innerHTML = mode === 'clear-all'
    ? `確定清空 ${uiIconHtml('delete', 'btn')}`
    : `確定刪除 ${uiIconHtml('delete', 'btn')}`;
}

function openBudgetModal() {
  populateBudgetForm();
  openModal(els.budgetModal);
}

function formatMoneyInputPreset(amount, currency) {
  const rounded = roundMoney(amount, currency);
  if (currency === 'HKD') {
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  }
  return String(rounded);
}

function updateRepayModalView() {
  const currency = $('#repay-currency').value;
  const debt = getDebtInfo(currency);
  const contextEl = $('#repay-context');
  const amountEl = $('#repay-amount');
  const payerEl = $('#repay-payer');
  const submitBtn = $('#repay-submit-btn');

  if (!debt) {
    contextEl.innerHTML = `${currencyUiIconHtml(currency, 'sm')} 呢個幣別已經還清，可以轉第二個幣別`;
    amountEl.value = '';
    amountEl.disabled = true;
    payerEl.value = '';
    submitBtn.disabled = true;
    return;
  }

  payerEl.value = debt.payer;
  amountEl.disabled = false;
  submitBtn.disabled = isMutating;
  contextEl.innerHTML = `目前 ${personImg(debt.payer, 'inline')} 欠 ${personImg(debt.payee, 'inline')} ${escapeHtml(formatMoney(debt.amount, currency))}`;
  if (!amountEl.dataset.touched) {
    amountEl.value = formatMoneyInputPreset(debt.amount, currency);
  }
  updateMoneyPrefix($('#repay-amount-prefix'), currency);
}

function openRepayModal() {
  const currency = pickRepayCurrency();
  setToggleValue('#repay-currency-toggle', '#repay-currency', 'currency', currency);
  $('#repay-note').value = '';
  const amountEl = $('#repay-amount');
  amountEl.value = '';
  delete amountEl.dataset.touched;
  updateRepayModalView();
  openModal(els.repayModal);
}

function getLoanDirection() {
  const raw = $('#loan-direction')?.value || 'A_TO_B';
  return raw === 'B_TO_A' ? 'B_TO_A' : 'A_TO_B';
}

function getLoanLender(direction = getLoanDirection()) {
  return direction === 'B_TO_A' ? 'B' : 'A';
}

function updateLoanModalView() {
  const currency = $('#loan-currency').value;
  const direction = getLoanDirection();
  const lender = getLoanLender(direction);
  const borrower = lender === 'A' ? 'B' : 'A';
  const contextEl = $('#loan-context');
  const submitBtn = $('#loan-submit-btn');

  if (contextEl) {
    contextEl.innerHTML = `${personImg(lender, 'inline')} 借現金畀 ${personImg(borrower, 'inline')}（借幾多欠幾多，唔會除二 · 唔計消費）· ${escapeHtml(currency)}`;
  }
  updateMoneyPrefix($('#loan-amount-prefix'), currency);
  if (submitBtn) submitBtn.disabled = isMutating;
}

function openLoanModal() {
  setToggleValue('#loan-currency-toggle', '#loan-currency', 'currency', currencyView === 'hkd' ? 'HKD' : 'JPY');
  setToggleValue('#loan-direction-toggle', '#loan-direction', 'direction', 'A_TO_B');
  $('#loan-note').value = '';
  $('#loan-amount').value = '';
  updateLoanModalView();
  openModal(els.loanModal);
}

function resolveEditSplitMode(existing) {
  if (existing.split_mode === 'REPAY' || isRepayTransaction(existing)) return 'REPAY';
  if (existing.split_mode === 'LOAN' || isLoanTransaction(existing)) return 'LOAN';
  return getExpenseSplitModeValue('edit') || existing.split_mode || 'SPLIT_5050';
}

function openEditModal(key) {
  const tx = findTransactionByKey(key);
  if (!tx) return;

  $('#edit-transaction-id').value = tx.transaction_id || '';
  $('#edit-transaction-key').value = getTxKey(tx);
  $('#edit-date').value = tx.date;
  setCategoryFields(
    $('#edit-category'),
    $('#edit-custom-category'),
    $('#edit-custom-category-row'),
    tx.category
  );
  $('#edit-description').value = tx.description;
  $('#edit-amount').value = tx.amount;
  const essentialsRow = $('#edit-essentials-row');
  if (isCashTransferTransaction(tx)) {
    essentialsRow?.classList.add('hidden');
    $('#edit-currency').value = tx.currency;
    $('#edit-payer').value = tx.payer;
  } else {
    essentialsRow?.classList.remove('hidden');
    setExpenseEssentials('edit', {
      currency: tx.currency,
      payer: tx.payer,
      split: tx.split_mode,
    });
  }
  updateMoneyPrefix($('#edit-amount-prefix'), tx.currency);

  openModal(els.editModal);
}

async function deleteTransactionRecord() {
  const key = $('#edit-transaction-key').value;
  const tx = findTransactionByKey(key);
  if (!tx) return;

  const title = getTransactionTitle(tx);
  const msg = $('#delete-confirm-message');
  const titleEl = $('#delete-confirm-title');
  if (titleEl) titleEl.innerHTML = `${uiIconHtml('delete', 'title')} 確認刪除`;
  if (msg) {
    msg.textContent = `確定要刪除「${title}」？刪除後無法復原。`;
  }
  deleteConfirmMode = 'delete-one';
  setDeleteConfirmButtonLabel('delete-one');
  openModal(els.deleteConfirmModal);
}

function openClearAllDataConfirm() {
  const endpoint = getActiveEndpoint();
  const msg = $('#delete-confirm-message');
  const titleEl = $('#delete-confirm-title');
  if (titleEl) titleEl.innerHTML = `${uiIconHtml('delete', 'title')} 清空全部紀錄`;
  if (msg) {
    msg.textContent = `確定清空「${endpoint.label}」全部消費／還錢紀錄？預算會保留，刪除後無法復原。`;
  }
  deleteConfirmMode = 'clear-all';
  setDeleteConfirmButtonLabel('clear-all');
  openModal(els.deleteConfirmModal);
}

async function confirmDeleteTransaction() {
  if (deleteConfirmMode === 'clear-all') {
    await confirmClearAllData();
    return;
  }

  if (!beginMutation()) return;

  const key = $('#edit-transaction-key').value;
  const tx = findTransactionByKey(key);
  if (!tx) {
    endMutation();
    closeModal(els.deleteConfirmModal);
    return;
  }

  closeModal(els.deleteConfirmModal);
  enqueueDelete(tx);
  endMutation();
  SyncManager.scheduleSync();
  closeModal(els.editModal);
  dismissDetailModal();
  showToast(`${uiIconHtml('delete', 'btn')} 紀錄已刪除`, 'success');
  onRecordSyncComplete();
}

async function confirmClearAllData() {
  if (!beginMutation()) return;

  closeModal(els.deleteConfirmModal);
  closeModal($('#sheet-switcher-modal'));
  enqueueClearAll();
  listFilters.currentPage = 1;
  dismissDetailModal();
  closePersonSpendModal();
  closeModal(els.editModal);
  endMutation();
  SyncManager.scheduleSync();
  showToast(`${uiIconHtml('delete', 'btn')} 已清空「${getActiveEndpoint().label}」全部紀錄`, 'success');
  deleteConfirmMode = 'delete-one';
  setDeleteConfirmButtonLabel('delete-one');
}

function setupListFilters() {
  const resetPage = () => {
    listFilters.currentPage = 1;
    updateFilterActiveSummary();
    renderTransactionList();
  };

  applyListViewExpanded(loadListViewExpanded());
  const toggleListDetail = () => applyListViewExpanded(!listViewExpanded);
  $('#btn-list-detail-toggle-top')?.addEventListener('click', toggleListDetail);
  $('#btn-list-detail-toggle-bottom')?.addEventListener('click', toggleListDetail);
  $('#settlement-explain-details')?.addEventListener('toggle', updateExplainPreview);

  setupQuickFilterToggles(resetPage);
  setupDayRangePicker(resetPage);

  $('#filter-sort-amount').addEventListener('change', (e) => {
    listFilters.sortAmount = e.target.value;
    resetPage();
  });

  $('#filter-sort-date').addEventListener('change', (e) => {
    listFilters.sortDate = e.target.value;
    resetPage();
  });

  setupListFilterPickers(resetPage);

  const onPageSizeChange = (e) => {
    listFilters.pageSize = e.target.value;
    syncPageSizeSelects(listFilters.pageSize);
    listFilters.currentPage = 1;
    renderTransactionList();
  };

  $('#filter-page-size').addEventListener('change', onPageSizeChange);
  $('#filter-page-size-bottom').addEventListener('change', onPageSizeChange);

  const goPrevPage = () => {
    if (listFilters.currentPage > 1) {
      listFilters.currentPage -= 1;
      renderTransactionList();
    }
  };

  const goNextPage = () => {
    const filtered = getFilteredTransactions();
    const meta = paginateList(filtered);
    if (listFilters.currentPage < meta.totalPages) {
      listFilters.currentPage += 1;
      renderTransactionList();
    }
  };

  $('#btn-prev').addEventListener('click', goPrevPage);
  $('#btn-prev-bottom').addEventListener('click', goPrevPage);
  $('#btn-next').addEventListener('click', goNextPage);
  $('#btn-next-bottom').addEventListener('click', goNextPage);

  updateFilterActiveSummary();
}

function switchTab(tabName) {
  $$('.tab-btn').forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  $$('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });
}

/** After a record mutation sync finishes, jump to 明細 and show the latest list. */
function onRecordSyncComplete() {
  listFilters.currentPage = 1;
  switchTab('list');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupTabs() {
  $$('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function applyCurrencyView() {
  document.querySelectorAll('[data-currency-view]').forEach((btn) => {
    const active = btn.dataset.currencyView === currencyView;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  document.querySelectorAll('[data-currency-panel]').forEach((panel) => {
    const show = currencyView === 'all' || panel.dataset.currencyPanel === currencyView;
    panel.classList.toggle('hidden', !show);
  });

  updateSettlementChromeVisibility();
  renderSettlementExplain();
}

function setupCurrencyViewSelector() {
  document.querySelectorAll('[data-currency-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currencyView = btn.dataset.currencyView;
      applyCurrencyView();
    });
  });
  applyCurrencyView();
}

/* ===== Event Handlers ===== */
function setupEventListeners() {
  setupExpenseEssentials('expense', {
    onCurrencyChange: (currency) => updateMoneyPrefix($('#expense-amount-prefix'), currency),
  });
  setupExpenseEssentials('edit', {
    onCurrencyChange: (currency) => updateMoneyPrefix($('#edit-amount-prefix'), currency),
  });

  setupListFilters();
  setupCategoryPicker('#expense-category', '#expense-custom-category-row', '#expense-custom-category');
  setupCategoryPicker('#edit-category', '#edit-custom-category-row', '#edit-custom-category');

  $('#btn-edit-budget').addEventListener('click', openBudgetModal);
  $('#btn-refresh').addEventListener('click', async () => {
    if (isRefreshBlocked()) return;
    try {
      await fetchAllData({ showSuccessToast: true });
    } catch (err) {
      showToast(formatApiError(err), 'error');
    }
  });

  $$('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      closeModal(els.budgetModal);
      closeModal(els.editModal);
      dismissDetailModal();
      closePersonSpendModal();
      closeModal(els.repayModal);
      closeModal(els.loanModal);
      closeModal(els.deleteConfirmModal);
      closeModal(els.dayRangeModal);
      closeModal($('#sheet-switcher-modal'));
    });
  });

  $$('[data-close-detail]').forEach((el) => {
    el.addEventListener('click', closeDetailModal);
  });

  $('#sync-status')?.addEventListener('click', () => {
    if ($('#sync-status').disabled) return;
    openSheetSwitcher();
  });

  els.syncRefreshBtn?.addEventListener('click', () => {
    if (isRefreshBlocked()) return;
    manualSync();
  });

  $('#sheet-switcher-confirm')?.addEventListener('click', () => {
    const target = $('#sheet-switcher-confirm').dataset.target;
    switchApiEndpoint(target);
  });

  $('#btn-clear-all-data')?.addEventListener('click', openClearAllDataConfirm);

  $('#delete-confirm-btn')?.addEventListener('click', () => {
    if (isMutating) return;
    confirmDeleteTransaction();
  });

  $$('[data-close-delete-confirm]').forEach((el) => {
    el.addEventListener('click', () => {
      deleteConfirmMode = 'delete-one';
      setDeleteConfirmButtonLabel('delete-one');
      closeModal(els.deleteConfirmModal);
    });
  });

  $('#btn-open-repay')?.addEventListener('click', openRepayModal);
  $('#btn-open-loan')?.addEventListener('click', openLoanModal);

  setupToggle('#repay-currency-toggle', '#repay-currency', 'currency', 'JPY');
  $('#repay-currency-toggle').querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      delete $('#repay-amount').dataset.touched;
      updateRepayModalView();
    });
  });
  $('#repay-amount')?.addEventListener('input', (e) => {
    e.target.dataset.touched = '1';
  });

  $('#repay-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!beginMutation()) return;

    const currency = $('#repay-currency').value;
    const debt = getDebtInfo(currency);
    if (!debt) {
      endMutation();
      showToast('呢個幣別已經還清啦', 'info');
      return;
    }

    const inputAmount = roundMoney($('#repay-amount').value, currency);
    if (inputAmount <= 0) {
      endMutation();
      showToast('請填寫有效金額', 'error');
      return;
    }
    if (inputAmount > debt.amount + moneyEpsilon(currency)) {
      endMutation();
      showToast(`還錢金額唔可以超過欠款 ${formatMoney(debt.amount, currency)}`, 'error');
      return;
    }

    const note = $('#repay-note').value.trim();
    const defaultDesc = '還錢';
    const repayAmount =
      inputAmount >= debt.amount - moneyEpsilon(currency) ? debt.exactAmount : inputAmount;
    const tx = {
      date: todayISO(),
      category: REPAY_CATEGORY,
      description: note || defaultDesc,
      currency,
      amount: repayAmount,
      payer: debt.payer,
      split_mode: 'REPAY',
      time: nowLocalTimeHM(),
    };

    closeModal(els.repayModal);
    try {
      tx.location = await captureCurrentLocation();
    } catch (_) {}
    enqueueCreate(tx);
    endMutation();
    SyncManager.scheduleSync();
    showToast(`${uiIconHtml('confirm', 'btn')} 還錢紀錄已加入`, 'success');
    onRecordSyncComplete();
  });

  setupToggle('#loan-currency-toggle', '#loan-currency', 'currency', 'JPY');
  setupToggle('#loan-direction-toggle', '#loan-direction', 'direction', 'A_TO_B');
  $('#loan-currency-toggle')?.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => updateLoanModalView());
  });
  $('#loan-direction-toggle')?.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => updateLoanModalView());
  });

  $('#loan-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!beginMutation()) return;

    const currency = $('#loan-currency').value;
    const amount = Number($('#loan-amount').value);
    if (amount <= 0) {
      endMutation();
      showToast('請填寫有效金額', 'error');
      return;
    }

    const lender = getLoanLender();
    const borrower = lender === 'A' ? 'B' : 'A';
    const note = $('#loan-note').value.trim();
    const defaultDesc = '借錢';
    const tx = {
      date: todayISO(),
      category: LOAN_CATEGORY,
      description: note || defaultDesc,
      currency,
      amount,
      payer: lender,
      split_mode: 'LOAN',
      time: nowLocalTimeHM(),
    };

    closeModal(els.loanModal);
    try {
      tx.location = await captureCurrentLocation();
    } catch (_) {}
    enqueueCreate(tx);
    endMutation();
    SyncManager.scheduleSync();
    showToast(`${uiIconHtml('expense', 'btn')} 借錢紀錄已加入`, 'success');
    onRecordSyncComplete();
  });

  $('#detail-edit-btn').addEventListener('click', () => {
    if (!detailModalKey) return;
    const key = detailModalKey;
    dismissDetailModal();
    openEditModal(key);
  });

  $('#edit-delete-btn')?.addEventListener('click', deleteTransactionRecord);

  els.expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!beginMutation()) return;

    const form = new FormData(els.expenseForm);
    const category = resolveCategory($('#expense-category'), $('#expense-custom-category'));
    if (!category) {
      endMutation();
      showToast('請輸入自定分類名稱', 'error');
      return;
    }

    const tx = {
      date: form.get('date'),
      category,
      description: form.get('description').trim(),
      currency: $('#expense-currency').value,
      amount: Number(form.get('amount')),
      payer: $('#expense-payer').value,
      split_mode: form.get('split_mode'),
      time: nowLocalTimeHM(),
    };

    if (tx.amount <= 0) {
      endMutation();
      showToast('請填寫有效金額', 'error');
      return;
    }

    try {
      await withSubmitLoading(async () => {
        try {
          tx.location = await captureCurrentLocation();
        } catch (_) {}
        enqueueCreate(tx);
      });

      els.expenseForm.reset();
      els.expenseDate.value = todayISO();
      $('#expense-category').value = '餐飲-午餐';
      syncCategoryPicker($('#expense-category-picker'), '餐飲-午餐');
      setCategoryPickerOpen(getCategoryPickerWrap('expense-category'), false);
      $('#expense-custom-category-row').classList.add('hidden');
      $('#expense-custom-category').value = '';
      setExpenseEssentials('expense', {
        currency: 'JPY',
        payer: 'A',
        split: 'SPLIT_5050',
      });
      updateMoneyPrefix($('#expense-amount-prefix'), 'JPY');
      updateExpenseSplitHint();
      showToast(`${uiIconHtml('success', 'btn')} 已新增`, 'success');
      SyncManager.scheduleSync();
      onRecordSyncComplete();
    } finally {
      endMutation();
    }
  });

  els.budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!beginMutation()) return;

    const newBudgets = {
      A: {
        JPY: Number($('#budget-a-jpy').value),
        HKD: Number($('#budget-a-hkd').value),
      },
      B: {
        JPY: Number($('#budget-b-jpy').value),
        HKD: Number($('#budget-b-hkd').value),
      },
    };

    enqueueBudgetUpdate(newBudgets);
    endMutation();
    SyncManager.scheduleSync();
    closeModal(els.budgetModal);
    showToast(`${uiIconHtml('save', 'btn')} 預算已更新`, 'success');
  });

  els.editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!beginMutation()) return;

    const key = $('#edit-transaction-key').value;
    const idx = transactions.findIndex(
      (t) => t.transaction_id === key || t._uid === key
    );
    if (idx === -1) {
      endMutation();
      return;
    }

    const category = resolveCategory($('#edit-category'), $('#edit-custom-category'));
    if (!category) {
      endMutation();
      showToast('請輸入自定分類名稱', 'error');
      return;
    }

    const existing = transactions[idx];
    const transactionId = $('#edit-transaction-id').value || existing.transaction_id || '';

    const amount = Number($('#edit-amount').value);
    if (amount <= 0) {
      endMutation();
      showToast('請填寫有效金額', 'error');
      return;
    }

    const updated = {
      transaction_id: transactionId,
      date: $('#edit-date').value,
      category,
      description: $('#edit-description').value.trim(),
      location: getLocationText(existing),
      currency: $('#edit-currency').value,
      amount,
      payer: $('#edit-payer').value,
      split_mode: resolveEditSplitMode(existing),
    };

    enqueueEdit(existing, updated);
    endMutation();
    SyncManager.scheduleSync();
    closeModal(els.editModal);
    dismissDetailModal();
    showToast(`${uiIconHtml('save', 'btn')} 已更新`, 'success');
    onRecordSyncComplete();
  });
}

/* ===== Particle Burst ===== */
let particleCtx = null;
let particleCanvas = null;
let particles = [];
let particleAnimId = 0;

function resizeParticleCanvas() {
  if (!particleCanvas) return;
  particleCanvas.width = window.innerWidth * (window.devicePixelRatio || 1);
  particleCanvas.height = window.innerHeight * (window.devicePixelRatio || 1);
  particleCanvas.style.width = `${window.innerWidth}px`;
  particleCanvas.style.height = `${window.innerHeight}px`;
  if (particleCtx) {
    particleCtx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  }
}

function spawnParticles(x, y, count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 1.6 + Math.random() * 3.4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 1,
      decay: 0.018 + Math.random() * 0.02,
      size: 2 + Math.random() * 3.5,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      gravity: 0.06 + Math.random() * 0.04,
    });
  }
  if (!particleAnimId) particleAnimId = requestAnimationFrame(drawParticles);
}

function drawParticles() {
  if (!particleCtx || !particleCanvas) {
    particleAnimId = 0;
    return;
  }

  particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((p) => p.life > 0);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.life -= p.decay;

    particleCtx.globalAlpha = Math.max(p.life, 0);
    particleCtx.fillStyle = p.color;
    particleCtx.beginPath();
    particleCtx.arc(p.x, p.y, p.size * Math.max(p.life, 0.2), 0, Math.PI * 2);
    particleCtx.fill();
  });

  particleCtx.globalAlpha = 1;

  if (particles.length) {
    particleAnimId = requestAnimationFrame(drawParticles);
  } else {
    particleAnimId = 0;
    particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function setupParticleEffects() {
  particleCanvas = $('#particle-canvas');
  if (!particleCanvas) return;
  particleCtx = particleCanvas.getContext('2d');
  resizeParticleCanvas();
  window.addEventListener('resize', resizeParticleCanvas);

  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target.closest(
        '.btn, .toggle-btn, .tab-btn, .currency-label, .btn-page, .btn-edit, .sync-status, .sync-refresh-btn, .split-option'
      );
      if (!target || target.disabled) return;
      spawnParticles(e.clientX, e.clientY, target.classList.contains('btn-primary') ? 18 : 12);
    },
    { passive: true }
  );
}

/* ===== Init ===== */
function playIconTapAnimation(icon) {
  if (!icon) return;
  icon.classList.remove('icon-tap-animate');
  void icon.offsetWidth;
  icon.classList.add('icon-tap-animate');
  icon.addEventListener(
    'animationend',
    () => icon.classList.remove('icon-tap-animate'),
    { once: true }
  );
}

function resolveTapIcon(target) {
  const icon = target.closest('.ui-icon, .person-avatar, .category-icon, .split-icon');
  if (!icon) return null;
  const host = icon.closest(
    'button, .tab-btn, [role="option"], .filter-quick-chip, label.split-option, .category-picker-card'
  );
  return host ? icon : null;
}

function setupIconTapFeedback() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return;
      playIconTapAnimation(resolveTapIcon(e.target));
    },
    { passive: true }
  );
}

async function init() {
  els.expenseDate.value = todayISO();
  initListDayFilter();
  setupTabs();
  setupCurrencyViewSelector();
  setupMoneyInputs();
  setupEventListeners();
  setupPersonSpendUI();
  setupParticleEffects();
  setupThemeToggle();
  setupIconTapFeedback();
  setupModalSwipeDownClose();

  OfflineQueue.init(apiEndpointKey);
  SyncManager.init({
    beginServerApply,
    applyServerDataWithQueue,
    syncAddTransaction,
    syncEditTransaction,
    syncDeleteTransaction,
    syncBudgets,
    syncClearAllTransactions,
    updateSyncStatusFromQueue,
    isSyncBlocked: () => isMutating || isModalOpen(),
  });

  try {
    await fetchAllData();
    SyncManager.scheduleSync();
  } catch (err) {
    console.error('fetchAllData failed:', err);
    if (OfflineQueue.size() > 0) {
      reapplyPendingFromQueue();
      updateSyncStatusFromQueue();
    } else {
      showToast(formatApiError(err), 'error');
    }
    renderAll();
    SyncManager.scheduleSync();
  }
  updateMutationControls();
}

document.addEventListener('DOMContentLoaded', init);
