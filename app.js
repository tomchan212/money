// 🔗 Google Apps Script Deployment URL
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw3_rdPUNs_QCFVZYDw9tp50sWuJ9P_BuJAUz8DyX4kwrpFJ-U101cquz2ZvMIm5j8mxQ/exec";

// Local State
let transactions = [];
let budgets = {
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

document.addEventListener('DOMContentLoaded', async () => {
  // Set default date picker to today
  document.getElementById('txn-date').valueAsDate = new Date();

  initModalEvents();

  // Load latest budget & transaction records from Google Sheets
  await loadDataFromGAS();

  // Handle new transaction form submission
  document.getElementById('txn-form').addEventListener('submit', async (e) => {
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

    // Optimistically update UI
    transactions.unshift(newTxn);
    renderAll();

    // Reset input fields
    document.getElementById('txn-desc').value = '';
    document.getElementById('txn-amount').value = '';

    // Async sync to Google Sheets
    await syncTransactionToGAS(newTxn);
  });
});

/**
 * 📡 Fetch initial data from Google Sheets (GET)
 */
async function loadDataFromGAS() {
  try {
    const res = await fetch(GAS_WEB_APP_URL);
    const data = await res.json();

    if (data.status === 'SUCCESS') {
      // Parse Budgets sheet data
      if (data.budgets && data.budgets.length > 0) {
        data.budgets.forEach(row => {
          if (row.person && row.currency) {
            budgets[row.person][row.currency] = parseFloat(row.budget) || 0;
          }
        });
      }

      // Parse Transactions sheet data
      if (data.transactions && data.transactions.length > 0) {
        transactions = data.transactions.map(row => ({
          id: row.transaction_id,
          date: row.date ? String(row.date).substring(0, 10) : '',
          category: row.category,
          desc: row.description,
          currency: row.currency,
          amount: parseFloat(row.amount) || 0,
          payer: row.payer,
          split: row.split_mode,
          aShare: parseFloat(row.a_share) || 0,
          bShare: parseFloat(row.b_share) || 0,
          netBowesA: parseFloat(row.net_b_owes_a) || 0
        })).reverse(); // Most recent first
      }
    }
  } catch (err) {
    console.warn("Unable to load cloud data, falling back to initial state:", err);
  } finally {
    renderAll();
  }
}

/**
 * 📤 Send a new transaction to Google Sheets (POST)
 */
async function syncTransactionToGAS(txn) {
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // Avoid CORS preflight OPTIONS request
      body: JSON.stringify({
        action: 'ADD_TXN',
        transaction_id: txn.id,
        date: txn.date,
        category: txn.category,
        description: txn.desc,
        currency: txn.currency,
        amount: txn.amount,
        payer: txn.payer,
        split_mode: txn.split,
        a_share: txn.aShare,
        b_share: txn.bShare,
        net_b_owes_a: txn.netBowesA
      })
    });
  } catch (err) {
    console.error("Failed to sync transaction to Google Sheets:", err);
  }
}

/**
 * 📤 Send updated budget to Google Sheets (POST)
 */
async function syncBudgetsToGAS() {
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'UPDATE_BUDGETS',
        budgets: budgets
      })
    });
  } catch (err) {
    console.error("Failed to sync budget to Google Sheets:", err);
  }
}

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

  // Render JPY Summary
  document.getElementById('spent-a-jpy').textContent = spentA.JPY.toLocaleString();
  document.getElementById('rem-a-jpy').textContent = (budgets.A.JPY - spentA.JPY).toLocaleString();
  document.getElementById('spent-b-jpy').textContent = spentB.JPY.toLocaleString();
  document.getElementById('rem-b-jpy').textContent = (budgets.B.JPY - spentB.JPY).toLocaleString();

  // Render HKD Summary
  document.getElementById('spent-a-hkd').textContent = spentA.HKD.toLocaleString();
  document.getElementById('rem-a-hkd').textContent = (budgets.A.HKD - spentA.HKD).toLocaleString();
  document.getElementById('spent-b-hkd').textContent = spentB.HKD.toLocaleString();
  document.getElementById('rem-b-hkd').textContent = (budgets.B.HKD - spentB.HKD).toLocaleString();

  // Render Settlement Status
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

  budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    budgets.A.JPY = parseFloat(document.getElementById('budget-a-jpy-input').value) || 0;
    budgets.B.JPY = parseFloat(document.getElementById('budget-b-jpy-input').value) || 0;
    budgets.A.HKD = parseFloat(document.getElementById('budget-a-hkd-input').value) || 0;
    budgets.B.HKD = parseFloat(document.getElementById('budget-b-hkd-input').value) || 0;

    renderSummary();
    modal.classList.add('hidden');

    // Async sync updated budget back to Google Sheets
    await syncBudgetsToGAS();
  });
}
