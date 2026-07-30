/**
 * 日本旅遊記帳 — Google Apps Script 後端（測試 / Tester）
 * 對應試算表分頁：Transactions / Budgets / Summary
 *
 * 試算表：
 * https://docs.google.com/spreadsheets/d/1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU/edit?gid=48656539#gid=48656539
 *
 * 部署步驟：
 * 1. 在「測試」專用 Apps Script 專案貼上此檔案（不要跟正式共用同一個專案）
 * 2. 確認 SPREADSHEET_ID 正確
 * 3. 部署 → 新增部署（或管理部署 → 新版本）→ 網頁應用程式
 * 4. 執行身分：我；存取權：任何人
 * 5. 若為全新部署，複製 URL 更新 app.js → API_ENDPOINTS.tester.url
 *    若只更新程式碼，用「管理部署 → 新版本」即可，URL 唔使改
 *
 * 注意：除此檔案頂部 SOURCE / SPREADSHEET_ID 外，其餘程式邏輯必須與 Code.production.gs 完全一致。
 */

const SPREADSHEET_ID = '1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU';
const SOURCE = 'tester';

const SHEET_TX = 'Transactions';
const SHEET_BUDGET = 'Budgets';
const SHEET_SUMMARY = 'Summary';

const TX_HEADERS = [
  'transaction_id', 'date', 'time', 'category', 'description', 'currency',
  'amount', 'payer', 'split_mode', 'a_share', 'b_share', 'net_b_owes_a',
  'location', 'client_id',
];

function doGet(e) {
  return handleRequest_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  try {
    const params = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : (e && e.parameter ? e.parameter : {});
    return handleRequest_(params);
  } catch (err) {
    return json_({ status: 'ERROR', message: String(err) });
  }
}

function handleRequest_(params) {
  try {
    const action = params.action || 'fetch';
    switch (action) {
      case 'whoami':
        return json_(whoAmI_());
      case 'fetch':
        return json_(getAllData_());
      case 'addTransaction':
        return json_(addTransaction_(params));
      case 'editTransaction':
        return json_(editTransaction_(params));
      case 'deleteTransaction':
        return json_(deleteTransaction_(params));
      case 'updateBudget':
        return json_(updateBudget_(params));
      case 'clearTransactions':
        return json_(clearTransactions_());
      default:
        return json_(getAllData_());
    }
  } catch (err) {
    return json_({ status: 'ERROR', message: String(err) });
  }
}

function whoAmI_() {
  var ss = getSpreadsheet_();
  return {
    status: 'SUCCESS',
    source: SOURCE,
    spreadsheet_id: SPREADSHEET_ID,
    actual_spreadsheet_id: ss.getId(),
    spreadsheet_name: ss.getName(),
    synced_at: new Date().toISOString(),
  };
}

function getAllData_() {
  const ss = getSpreadsheet_();
  const transactions = readTransactions_();
  const budgets = readBudgets_();
  return {
    status: 'SUCCESS',
    spreadsheet_id: ss.getId(),
    configured_spreadsheet_id: SPREADSHEET_ID,
    source: SOURCE,
    spreadsheet_name: ss.getName(),
    transactions: transactions,
    budgets: budgets,
    summary: buildSummary_(transactions, budgets),
    synced_at: new Date().toISOString(),
  };
}

function getHeaderIndexMap_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach(function(h, i) {
    var key = String(h || '').trim();
    if (key) map[key] = i;
  });
  return map;
}

function readTransactions_() {
  const sheet = getSheet_(SHEET_TX);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const map = getHeaderIndexMap_(sheet);
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  const displays = sheet.getRange(2, 1, lastRow, lastCol).getDisplayValues();

  return values
    .map(function(row, idx) { return parseTransactionRow_(row, map, displays[idx]); })
    .filter(function(tx) { return tx.amount > 0; });
}

function parseTransactionRow_(row, map, displayRow) {
  if (map.time !== undefined) {
    return {
      transaction_id: txCell_(row, map, 'transaction_id'),
      date: formatDate_(txCellRaw_(row, map, 'date')),
      time: txTime_(row, displayRow, map),
      category: txCell_(row, map, 'category'),
      description: txCell_(row, map, 'description'),
      currency: txCell_(row, map, 'currency'),
      amount: txNum_(txCellRaw_(row, map, 'amount')),
      payer: txCell_(row, map, 'payer'),
      split_mode: txCell_(row, map, 'split_mode') || 'SPLIT_5050',
      a_share: txNum_(txCellRaw_(row, map, 'a_share')),
      b_share: txNum_(txCellRaw_(row, map, 'b_share')),
      net_b_owes_a: txNum_(txCellRaw_(row, map, 'net_b_owes_a')),
      location: txLocation_(row, map),
      client_id: txCell_(row, map, 'client_id'),
    };
  }

  return {
    transaction_id: String(row[0] || '').trim(),
    date: formatDate_(row[1]),
    time: '',
    category: String(row[2] || '').trim(),
    description: String(row[3] || '').trim(),
    currency: String(row[4] || '').trim(),
    amount: Number(row[5]) || 0,
    payer: String(row[6] || '').trim(),
    split_mode: String(row[7] || 'SPLIT_5050').trim(),
    a_share: Number(row[8]) || 0,
    b_share: Number(row[9]) || 0,
    net_b_owes_a: Number(row[10]) || 0,
    location: String(row[12] || '').trim(),
    client_id: String(row[13] || '').trim(),
  };
}

function txLocation_(row, map) {
  return txCell_(row, map, 'location') || txCell_(row, map, '地點');
}

function txCellRaw_(row, map, name) {
  var i = map[name];
  return i === undefined ? '' : row[i];
}

function txCell_(row, map, name) {
  return String(txCellRaw_(row, map, name) || '').trim();
}

function txTime_(row, displayRow, map) {
  var i = map.time;
  if (i === undefined) return '';
  var display = displayRow ? String(displayRow[i] || '').trim() : '';
  if (/^\d{1,2}:\d{2}/.test(display)) {
    return formatTime_(display);
  }
  return formatTime_(row[i]);
}

function writeTimeCell_(sheet, rowNum, map, timeStr) {
  var col = map.time !== undefined ? map.time + 1 : 3;
  sheet.getRange(rowNum, col).setNumberFormat('@').setValue(String(timeStr));
}

function txNum_(value) {
  return Number(value) || 0;
}

function buildSummary_(transactions, budgets) {
  var budgetMap = {};
  budgets.forEach(function(b) {
    budgetMap[b.person + '_' + b.currency] = Number(b.initial_budget) || 0;
  });

  var spent = {
    A: { JPY: 0, HKD: 0 },
    B: { JPY: 0, HKD: 0 },
  };
  var net = { JPY: 0, HKD: 0 };

  transactions.forEach(function(tx) {
    var cur = tx.currency;
    if (cur !== 'JPY' && cur !== 'HKD') return;
    spent.A[cur] += tx.a_share;
    spent.B[cur] += tx.b_share;
    net[cur] += tx.net_b_owes_a;
  });

  var rows = [];
  ['A', 'B'].forEach(function(person) {
    ['JPY', 'HKD'].forEach(function(currency) {
      var initial = budgetMap[person + '_' + currency] || 0;
      var totalSpent = spent[person][currency];
      rows.push({
        person: person,
        currency: currency,
        initial_budget: initial,
        total_spent: totalSpent,
        remaining_budget: initial - totalSpent,
        net_balance: net[currency],
      });
    });
  });

  return rows;
}

function readSummary_() {
  const sheet = getSheet_(SHEET_SUMMARY);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange('A2:F' + lastRow).getValues();
  return values
    .filter((row) => row[0] && row[1])
    .map((row) => ({
      person: String(row[0]).trim(),
      currency: String(row[1]).trim(),
      initial_budget: Number(row[2]) || 0,
      total_spent: Number(row[3]) || 0,
      remaining_budget: Number(row[4]) || 0,
      net_balance: Number(row[5]) || 0,
    }));
}

function readBudgets_() {
  const sheet = getSheet_(SHEET_BUDGET);
  ensureHeaders_(sheet, ['person', 'currency', 'initial_budget']);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return defaultBudgets_();

  const values = sheet.getRange('A2:C' + lastRow).getValues();
  const budgets = values
    .filter((row) => row[0] && row[1])
    .map((row) => ({
      person: String(row[0]).trim(),
      currency: String(row[1]).trim(),
      initial_budget: Number(row[2]) || 0,
    }));

  return budgets.length ? budgets : defaultBudgets_();
}

function defaultBudgets_() {
  return [
    { person: 'A', currency: 'JPY', initial_budget: 150000 },
    { person: 'B', currency: 'JPY', initial_budget: 150000 },
    { person: 'A', currency: 'HKD', initial_budget: 5000 },
    { person: 'B', currency: 'HKD', initial_budget: 5000 },
  ];
}

function clearTransactions_() {
  const sheet = getSheet_(SHEET_TX);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return getAllData_();
}

function addTransaction_(params) {
  const sheet = getSheet_(SHEET_TX);
  ensureHeaders_(sheet, TX_HEADERS);

  const clientId = String(params.client_id || '').trim();
  if (clientId) {
    const existingRow = findTransactionByClientId_(sheet, clientId);
    if (existingRow > 0) {
      return getAllData_();
    }
  }

  const tx = normalizeTxInput_(params);
  const shares = computeShares_(tx.amount, tx.payer, tx.split_mode);
  const id = generateTransactionId_(sheet, tx.date);
  // Prefer device local time sent from app.js (params.time = HH:mm)
  const recordTime = resolveRecordTime_(params, new Date());

  sheet.appendRow([
    id,
    tx.date,
    recordTime,
    tx.category,
    tx.description,
    tx.currency,
    tx.amount,
    tx.payer,
    tx.split_mode,
    shares.a_share,
    shares.b_share,
    shares.net_b_owes_a,
    tx.location,
    clientId,
  ]);
  writeTimeCell_(sheet, sheet.getLastRow(), getHeaderIndexMap_(sheet), recordTime);

  return getAllData_();
}

function editTransaction_(params) {
  const sheet = getSheet_(SHEET_TX);
  ensureHeaders_(sheet, TX_HEADERS);
  const map = getHeaderIndexMap_(sheet);

  let id = String(params.transaction_id || '').trim();
  let rowIndex = id ? findTransactionRow_(sheet, id) : -1;

  if (rowIndex < 0) {
    const clientId = String(params.client_id || '').trim();
    if (clientId) {
      rowIndex = findTransactionByClientId_(sheet, clientId);
      if (rowIndex > 0) {
        id = String(sheet.getRange(rowIndex, 1).getValue() || '').trim();
      }
    }
  }

  if (!id) throw new Error('缺少 transaction_id');
  if (rowIndex < 0) throw new Error('找不到該筆紀錄：' + id);

  const tx = normalizeTxInput_(params);
  const shares = computeShares_(tx.amount, tx.payer, tx.split_mode);
  const existingRow = sheet.getRange(rowIndex, 1, 1, TX_HEADERS.length).getValues()[0];
  const recordTime = params.time
    ? resolveRecordTime_(params, existingRow[2] || new Date())
    : (existingRow[2] ? formatTime_(existingRow[2]) : formatTime_(new Date()));
  const existingClientId = txCell_(existingRow, map, 'client_id')
    || String(params.client_id || '').trim();

  sheet.getRange(rowIndex, 1, 1, TX_HEADERS.length).setValues([[
    id,
    tx.date,
    recordTime,
    tx.category,
    tx.description,
    tx.currency,
    tx.amount,
    tx.payer,
    tx.split_mode,
    shares.a_share,
    shares.b_share,
    shares.net_b_owes_a,
    tx.location,
    existingClientId,
  ]]);
  writeTimeCell_(sheet, rowIndex, map, recordTime);

  return getAllData_();
}

function updateBudget_(params) {
  let budgets = [];

  if (params.budgets) {
    budgets = typeof params.budgets === 'string'
      ? JSON.parse(params.budgets)
      : params.budgets;
  } else {
    budgets = [
      { person: 'A', currency: 'JPY', initial_budget: Number(params.A_JPY) },
      { person: 'B', currency: 'JPY', initial_budget: Number(params.B_JPY) },
      { person: 'A', currency: 'HKD', initial_budget: Number(params.A_HKD) },
      { person: 'B', currency: 'HKD', initial_budget: Number(params.B_HKD) },
    ];
  }

  const budgetSheet = getSheet_(SHEET_BUDGET);
  ensureHeaders_(budgetSheet, ['person', 'currency', 'initial_budget']);

  budgets.forEach((b) => {
    const rowIndex = findBudgetRow_(budgetSheet, b.person, b.currency);
    const amount = Number(b.initial_budget) || 0;
    if (rowIndex > 0) {
      budgetSheet.getRange(rowIndex, 3).setValue(amount);
    } else {
      budgetSheet.appendRow([b.person, b.currency, amount]);
    }
  });

  return getAllData_();
}

function deleteTransaction_(params) {
  const sheet = getSheet_(SHEET_TX);
  ensureHeaders_(sheet, TX_HEADERS);

  const id = String(params.transaction_id || '').trim();
  let rowIndex = id ? findTransactionRow_(sheet, id) : -1;

  if (rowIndex < 0) {
    const clientId = String(params.client_id || '').trim();
    if (clientId) {
      rowIndex = findTransactionByClientId_(sheet, clientId);
    }
  }

  if (rowIndex < 0) {
    const lookup = id || String(params.client_id || '').trim();
    throw new Error('找不到該筆紀錄：' + lookup);
  }

  sheet.deleteRow(rowIndex);
  return getAllData_();
}

function normalizeTxInput_(params) {
  const tx = {
    date: formatDate_(params.date || new Date()),
    category: String(params.category || '雜項').trim(),
    description: String(params.description || '').trim(),
    currency: String(params.currency || 'JPY').trim(),
    amount: Number(params.amount) || 0,
    payer: String(params.payer || 'A').trim(),
    split_mode: String(params.split_mode || 'SPLIT_5050').trim(),
    location: String(params.location || '').trim(),
  };

  if (tx.amount <= 0) throw new Error('金額必須大於 0');
  if (!['JPY', 'HKD'].includes(tx.currency)) throw new Error('幣別不正確');
  if (!['A', 'B'].includes(tx.payer)) throw new Error('付款人不正確');

  return tx;
}

function computeShares_(amount, payer, splitMode) {
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

function generateTransactionId_(sheet, dateStr) {
  const datePart = formatDate_(dateStr).replace(/-/g, '');
  const lastRow = Math.max(sheet.getLastRow(), 1);
  let seq = 1;

  if (lastRow >= 2) {
    const ids = sheet.getRange('A2:A' + lastRow).getValues().flat();
    ids.forEach((id) => {
      const match = String(id).match(new RegExp('^TXN-' + datePart + '-(\\d{3})$'));
      if (match) seq = Math.max(seq, Number(match[1]) + 1);
    });
  }

  return 'TXN-' + datePart + '-' + String(seq).padStart(3, '0');
}

function findTransactionRow_(sheet, transactionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange('A2:A' + lastRow).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === transactionId) return i + 2;
  }
  return -1;
}

function findTransactionByClientId_(sheet, clientId) {
  if (!clientId) return -1;
  const map = getHeaderIndexMap_(sheet);
  const col = map.client_id;
  if (col === undefined) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const values = sheet.getRange(2, col + 1, lastRow, col + 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === clientId) return i + 2;
  }
  return -1;
}

function findBudgetRow_(sheet, person, currency) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const values = sheet.getRange('A2:B' + lastRow).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === person && String(values[i][1]) === currency) {
      return i + 2;
    }
  }
  return -1;
}

/** Use client device time (HH:mm) when provided; otherwise fall back to script timezone. */
function resolveRecordTime_(params, fallbackValue) {
  var clientTime = params && params.time != null ? String(params.time).trim() : '';
  if (clientTime) {
    return formatTime_(clientTime);
  }
  return formatTime_(fallbackValue || new Date());
}

function formatTime_(value) {
  if (!value && value !== 0) return '';
  if (value instanceof Date) {
    var tz = getSpreadsheet_().getSpreadsheetTimeZone() || Session.getScriptTimeZone();
    return Utilities.formatDate(value, tz, 'HH:mm');
  }
  const str = String(value).trim();
  const hm = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hm) {
    return String(hm[1]).padStart(2, '0') + ':' + hm[2];
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'HH:mm');
  }
  return str;
}

function formatDate_(value) {
  if (!value) return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return str.slice(0, 10);
}

function ensureHeaders_(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsWrite = headers.some((h, i) => String(firstRow[i] || '') !== h);
  if (needsWrite || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function getSpreadsheet_() {
  // 若腳本係喺試算表入面建立（容器綁定），優先用綁定嗰份表
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('找不到工作表：' + name);
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
