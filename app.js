// Initial sample transactions matching the Excel structure
let transactions = [
  { id: "TXN-20260722-001", date: "2026-07-22", category: "餐飲", desc: "敘敘苑燒肉", currency: "JPY", amount: 18000, payer: "A", split: "SPLIT_5050", aShare: 9000, bShare: 9000, netBowesA: 9000 },
  { id: "TXN-20260722-002", date: "2026-07-22", category: "購物", desc: "藥妝店面膜 (B獨用)", currency: "JPY", amount: 3500, payer: "A", split: "FOR_B", aShare: 0, bShare: 3500, netBowesA: 3500 },
  { id: "TXN-20260722-003", date: "2026-07-22", category: "交通", desc: "Suica 卡增值 (A自己)", currency: "JPY", amount: 5000, payer: "A", split: "FOR_A", aShare: 5000, bShare: 0, netBowesA: 0 },
  { id: "TXN-20260722-004", date: "2026-07-23", category: "住宿", desc: "東京飯店兩晚住宿", currency: "HKD", amount: 2400, payer: "B", split: "SPLIT_5050", aShare: 1200, bShare: 1200, netBowesA: -1200 },
  { id: "TXN-20260722-005", date: "2026-07-23", category: "餐飲", desc: "築地市場海鮮丼", currency: "JPY", amount: 6000, payer: "B", split: "SPLIT_5050", aShare: 3000, bShare: 3000, netBowesA: -3000 }
];

// Budget settings state
let budgets = JSON.parse(localStorage.getItem('trip_budgets')) || {
  A: { JPY: 150000, HKD: 5000 },
  B: { JPY: 150000, HKD: 5000 }
};

const categoryIcons = {
  '餐飲': '🍱',
  '交通': '🚗',
  '住宿': '🏨',
  '購物': '🛍️',
  '景點': '🎟️',
  '雜項': '📦'
};

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  document.getElementById('txn-date').valueAsDate = new Date();

  initModalEvents();
  renderAll();

  // Add transaction form submission
  document.getElementById('txn-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const date = document.getElementById('txn-date').value;
    const category = document.getElementById('txn-category').value;
    const desc = document.getElementById('txn-desc').value;
    const currency = document.getElementById('txn-currency').value;
    const amount = parseFloat(document.getElementById('txn-amount').value);
    const payer = document.getElementById('txn-payer').value;
    const split = document.getElementById('txn-split').value;

    let aShare = 0, bShare = 0, netBowesA = 0;

    if (split === 'SPLIT_5050') {
      aShare = amount / 2;
      bShare = amount / 2;
    } else if (split === 'FOR_A') {
      aShare = amount;
      bShare = 0;
    } else if (split === 'FOR_B') {
      aShare = 0;
      bShare = amount;
    }

    if (payer === 'A') {
      netBowesA = bShare;
    } else {
      netBowesA = -aShare;
    }

    const newTxn = {
      id: `TXN-${date.replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`,
      date, category, desc, currency, amount, payer, split, aShare, bShare, netBowesA
    };

    transactions.unshift(newTxn);
    renderAll();

    // Reset fields
    document.getElementById('txn-desc').value = '';
    document.getElementById('txn-amount').value = '';
  });
});

function renderAll() {
  renderSummary();
  renderTxnList();
}

function renderSummary() {
  let spentA = { JPY: 0, HKD: 0 };
  let spentB = { JPY: 0, HKD: 0 };
  let netOwes = { JPY: 0, HKD: 0 };

  transactions.forEach(t => {
    if (t.currency === 'JPY') {
      spentA.JPY += t.aShare;
      spentB.JPY += t.bShare;
      netOwes.JPY += t.netBowesA;
    } else if (t.currency === 'HKD') {
      spentA.HKD += t.aShare;
      spentB.HKD += t.bShare;
      netOwes.HKD += t.netBowesA;
    }
  });

  // Update JPY UI
  document.getElementById('spent-a-jpy').textContent = spentA.JPY.toLocaleString();
  document.getElementById('rem-a-jpy').textContent = (budgets.A.JPY - spentA.JPY).toLocaleString();
  document.getElementById('spent-b-jpy').textContent = spentB.JPY.toLocaleString();
  document.getElementById('rem-b-jpy').textContent = (budgets.B.JPY - spentB.JPY).toLocaleString();

  // Update HKD UI
  document.getElementById('spent-a-hkd').textContent = spentA.HKD.toLocaleString();
  document.getElementById('rem-a-hkd').textContent = (budgets.A.HKD - spentA.HKD).toLocaleString();
  document.getElementById('spent-b-hkd').textContent = spentB.HKD.toLocaleString();
  document.getElementById('rem-b-hkd').textContent = (budgets.B.HKD - spentB.HKD).toLocaleString();

  // Update settlement text
  let settlementHTML = [];
  ['JPY', 'HKD'].forEach(curr => {
    let val = netOwes[curr];
    if (val > 0) {
      settlementHTML.push(`👧 B 需給 👦 A: <b>${val.toLocaleString()} ${curr}</b>`);
    } else if (val < 0) {
      settlementHTML.push(`👦 A 需給 👧 B: <b>${Math.abs(val).toLocaleString()} ${curr}</b>`);
    }
  });

  document.getElementById('net-settlement-text').innerHTML = 
    settlementHTML.length > 0 ? settlementHTML.join('<br>') : '🎉 目前雙方完全平帳，互不相欠！';
}

function renderTxnList() {
  const container = document.getElementById('txn-list');
  if (transactions.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:var(--muted); padding:16px;">尚無記帳紀錄 📝</div>';
    return;
  }

  container.innerHTML = transactions.map(t => `
    <div class="txn-item">
      <div class="txn-info">
        <div class="txn-icon">${categoryIcons[t.category] || '📦'}</div>
        <div>
          <div class="txn-desc">${t.desc}</div>
          <div class="txn-sub">${t.date} · ${t.payer === 'A' ? '👦 A 付款' : '👧 B 付款'}</div>
        </div>
      </div>
      <div class="txn-amount">
        <div class="txn-val">${t.amount.toLocaleString()} ${t.currency}</div>
        <div class="txn-sub">${getSplitBadge(t.split)}</div>
      </div>
    </div>
  `).join('');
}

function getSplitBadge(split) {
  if (split === 'SPLIT_5050') return '👥 50/50 平分';
  if (split === 'FOR_A') return '👦 A 獨用';
  if (split === 'FOR_B') return '👧 B 獨用';
  return '';
}

function initModalEvents() {
  const modal = document.getElementById('budget-modal');
  const openBtn = document.getElementById('open-budget-modal');
  const closeBtn = document.getElementById('close-budget-modal');
  const budgetForm = document.getElementById('budget-form');

  openBtn.addEventListener('click', () => {
    document.getElementById('budget-a-jpy-input').value = budgets.A.JPY;
    document.getElementById('budget-b-jpy-input').value = budgets.B.JPY;
    document.getElementById('budget-a-hkd-input').value = budgets.A.HKD;
    document.getElementById('budget-b-hkd-input').value = budgets.B.HKD;
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    budgets.A.JPY = parseFloat(document.getElementById('budget-a-jpy-input').value) || 0;
    budgets.B.JPY = parseFloat(document.getElementById('budget-b-jpy-input').value) || 0;
    budgets.A.HKD = parseFloat(document.getElementById('budget-a-hkd-input').value) || 0;
    budgets.B.HKD = parseFloat(document.getElementById('budget-b-hkd-input').value) || 0;

    localStorage.setItem('trip_budgets', JSON.stringify(budgets));
    renderSummary();
    modal.classList.add('hidden');
  });
}
