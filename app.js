// ==========================================
// 1. 設定與全域變數
// ==========================================
// 預留 GAS 連線 URL（替換為你部署後的 Web App URL）
const GAS_WEB_APP_URL = 'YOUR_APPS_SCRIPT_URL';

// 本地測試資料庫與初始預算
const INITIAL_BUDGETS = {
  A: { JPY: 150000, HKD: 5000 },
  B: { JPY: 150000, HKD: 5000 }
};

let transactions = JSON.parse(localStorage.getItem('japan_expenses')) || [];

// 類別圖示對應
const CATEGORY_ICONS = {
  '餐飲': '🍱',
  '交通': '🚃',
  '住宿': '🏨',
  '購物': '🛍️',
  '景點': '🎟️',
  '雜項': '📦'
};

// ==========================================
// 2. 初始化與事件監聽
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 設定預設日期為今天 (YYYY-MM-DD)
  document.getElementById('date').valueToDate = new Date();
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  initNavigation();
  initFormValidation();
  renderApp();
});

// Tab 頁面切換
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // 重置資料按鈕
  document.getElementById('clear-local-btn').addEventListener('click', () => {
    if (confirm('確定要清空本地測試資料嗎？')) {
      transactions = [];
      localStorage.removeItem('japan_expenses');
      renderApp();
    }
  });
}

// 幣別輸入防呆 (日元整數 / 港幣小數)
function initFormValidation() {
  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  const amountInput = document.getElementById('amount');

  currencyRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'JPY') {
        amountInput.step = "1";
        amountInput.placeholder = "0";
      } else {
        amountInput.step = "0.1";
        amountInput.placeholder = "0.0";
      }
    });
  });
}

// ==========================================
// 3. 核心拆帳邏輯演算法
// ==========================================
function calculateShares(amount, payer, splitMode) {
  let aShare = 0;
  let bShare = 0;

  if (splitMode === 'SPLIT_5050') {
    aShare = amount / 2;
    bShare = amount / 2;
  } else if (splitMode === 'FOR_A') {
    aShare = amount;
    bShare = 0;
  } else if (splitMode === 'FOR_B') {
    aShare = 0;
    bShare = amount;
  }

  // 對 A 而言的淨債務變動：
  // 若 Payer 是 A -> B 欠 A，增加 positive (bShare)
  // 若 Payer 是 B -> A 欠 B，減少 negative (-aShare)
  const netBOwesA = (payer === 'A') ? bShare : -aShare;

  return { aShare, bShare, netBOwesA };
}

// ==========================================
// 4. 表單提交處理
// ==========================================
const form = document.getElementById('expense-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');

  // UI Loading 狀態
  btnText.textContent = "處理中...";
  spinner.classList.remove('hidden');
  submitBtn.disabled = true;

  // 取得表單值
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const currency = document.querySelector('input[name="currency"]:checked').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const payer = document.querySelector('input[name="payer"]:checked').value;
  const splitMode = document.querySelector('input[name="split_mode"]:checked').value;

  // 計算分攤
  const { aShare, bShare, netBOwesA } = calculateShares(amount, payer, splitMode);

  const newTransaction = {
    transaction_id: `TXN-${Date.now()}`,
    date,
    category,
    description,
    currency,
    amount,
    payer,
    split_mode: splitMode,
    a_share: aShare,
    b_share: bShare,
    net_b_owes_a: netBOwesA
  };

  // 嘗試發送到 Google Apps Script，若無 URL 則備用存到 localStorage
  if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== 'YOUR_APPS_SCRIPT_URL') {
    await submitExpenseToGAS(newTransaction);
  } else {
    // 模擬網路延遲 400ms
    await new Promise(resolve => setTimeout(resolve, 400));
    transactions.unshift(newTransaction);
    localStorage.setItem('japan_expenses', JSON.stringify(transactions));
  }

  // 還原按鈕狀態 & 重置表單
  btnText.textContent = "儲存消費";
  spinner.classList.add('hidden');
  submitBtn.disabled = false;

  form.reset();
  document.getElementById('date').value = date; // 保持日期

  // 重新渲染 UI 並切換到明細頁
  renderApp();
  document.querySelector('.nav-btn[data-tab="tab-transactions"]').click();
});

// 發送 Fetch POST 至 GAS
async function submitExpenseToGAS(data) {
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      mode: 'no-cors' // GAS Web App 預設跨域處理
    });
    // no-cors 模式下更新本地快照
    transactions.unshift(data);
    localStorage.setItem('japan_expenses', JSON.stringify(transactions));
  } catch (error) {
    console.error('儲存至 Apps Script 失敗:', error);
    alert('無法連線至雲端資料庫，已儲存於本地。');
  }
}

// ==========================================
// 5. 渲染明細與 Summary 統計
// ==========================================
function renderApp() {
  renderTransactions();
  renderSummary();
}

function renderTransactions() {
  const listContainer = document.getElementById('transactions-list');
  listContainer.innerHTML = '';

  if (transactions.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px;">尚無消費記錄</p>';
    return;
  }

  transactions.forEach(item => {
    const icon = CATEGORY_ICONS[item.category] || '💰';
    
    // 債務文字描述
    let debtText = '';
    if (item.net_b_owes_a > 0) {
      debtText = `B 欠 A ${item.net_b_owes_a.toLocaleString()} ${item.currency}`;
    } else if (item.net_b_owes_a < 0) {
      debtText = `A 欠 B ${Math.abs(item.net_b_owes_a).toLocaleString()} ${item.currency}`;
    } else {
      debtText = '各自負擔';
    }

    const card = document.createElement('div');
    card.className = 'txn-card';
    card.innerHTML = `
      <div class="txn-left">
        <div class="txn-icon">${icon}</div>
        <div>
          <div class="txn-title">${escapeHtml(item.description)}</div>
          <div class="txn-sub">${item.date} · ${item.payer} 付款 (${item.split_mode})</div>
        </div>
      </div>
      <div class="txn-right">
        <div class="txn-amount">${item.amount.toLocaleString()} ${item.currency}</div>
        <div class="txn-debt">${debtText}</div>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

function renderSummary() {
  // 統計總支出與淨債務
  let spentA = { JPY: 0, HKD: 0 };
  let spentB = { JPY: 0, HKD: 0 };
  let netBOwesA = { JPY: 0, HKD: 0 };

  transactions.forEach(t => {
    const cur = t.currency;
    spentA[cur] += t.a_share;
    spentB[cur] += t.b_share;
    netBOwesA[cur] += t.net_b_owes_a;
  });

  // 1. 更新結算結果
  updateSettlementUI('settlement-jpy', 'JPY', netBOwesA.JPY);
  updateSettlementUI('settlement-hkd', 'HKD', netBOwesA.HKD);

  // 2. 更新預算進度
  document.getElementById('spent-a-jpy').textContent = spentA.JPY.toLocaleString();
  document.getElementById('rem-a-jpy').textContent = (INITIAL_BUDGETS.A.JPY - spentA.JPY).toLocaleString();

  document.getElementById('spent-b-jpy').textContent = spentB.JPY.toLocaleString();
  document.getElementById('rem-b-jpy').textContent = (INITIAL_BUDGETS.B.JPY - spentB.JPY).toLocaleString();

  document.getElementById('spent-a-hkd').textContent = spentA.HKD.toLocaleString();
  document.getElementById('rem-a-hkd').textContent = (INITIAL_BUDGETS.A.HKD - spentA.HKD).toLocaleString();

  document.getElementById('spent-b-hkd').textContent = spentB.HKD.toLocaleString();
  document.getElementById('rem-b-hkd').textContent = (INITIAL_BUDGETS.B.HKD - spentB.HKD).toLocaleString();
}

function updateSettlementUI(elementId, currency, netValue) {
  const container = document.getElementById(elementId);
  const textSpan = container.querySelector('.result-text');

  if (netValue > 0) {
    textSpan.innerHTML = `👉 <strong style="color:#d97706;">B 需給 A ${netValue.toLocaleString()} ${currency}</strong>`;
  } else if (netValue < 0) {
    textSpan.innerHTML = `👉 <strong style="color:#d97706;">A 需給 B ${Math.abs(netValue).toLocaleString()} ${currency}</strong>`;
  } else {
    textSpan.textContent = `✅ 雙方金額平衡，互不相欠`;
  }
}

// XSS 防護輔助函式
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
