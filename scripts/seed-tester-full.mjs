/**
 * Clear tester spreadsheet and seed 120 comprehensive test transactions.
 * Usage: node scripts/seed-tester-full.mjs
 *        node scripts/seed-tester-full.mjs --clear   (default: always clears)
 */

const TESTER = {
  url: 'https://script.google.com/macros/s/AKfycbxs43cCa82KcZst-Tf867nLHBqwsTzOuD21rKy23aPEvwQbq_LFQdM9A3mYb66XlIv9SQ/exec',
  spreadsheetId: '1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU',
  sheetGid: '48656539',
};

const DATE_START = '2026-07-19';
const DATE_END = '2026-07-31';
const COUNT = 120;
const REQUEST_GAP_MS = 320;

const EXPENSE_BLUEPRINTS = [
  { n: 8, category: '餐飲-早餐', descriptions: ['Lawson 飯團', '7-Eleven 三明治', '酒店自助早餐', '松屋牛丼', '便利商店御飯'], amountsJpy: [480, 650, 890, 1200, 2800], amountsHkd: [28, 45, 68] },
  { n: 10, category: '餐飲-午餐', descriptions: ['一蘭拉麵', '敘敘苑燒肉', '天婦羅定食', '壽司套餐', '牛丼'], amountsJpy: [980, 1500, 2200, 3800, 5200], amountsHkd: [88, 120, 168] },
  { n: 10, category: '餐飲-晚餐', descriptions: ['居酒屋', '燒鳥', '河豚料理', '懷石料理', '拉麵'], amountsJpy: [3200, 4800, 6500, 8800, 12000], amountsHkd: [220, 380, 520] },
  { n: 4, category: '餐飲', descriptions: ['便利商店套餐', '車站便當', '咖啡輕食'], amountsJpy: [780, 1100, 1500], amountsHkd: [55, 72] },
  { n: 12, category: '交通', descriptions: ['Suica 增值', 'JR 新幹線', '地鐵一日券', '的士', '關西機場快线', '巴士'], amountsJpy: [1000, 2800, 3500, 4200, 6800, 320], amountsHkd: [45, 88, 120] },
  { n: 6, category: '住宿', descriptions: ['東京酒店', '京都旅館', '大阪商務酒店', '箱根溫泉旅館'], amountsJpy: [12000, 18000, 22000, 35000], amountsHkd: [680, 980] },
  { n: 10, category: '購物', descriptions: ['藥妝店', 'Uniqlo', '伴手禮', '模型店', '百貨公司'], amountsJpy: [1500, 3200, 4500, 6800, 9800], amountsHkd: [99, 168, 288] },
  { n: 8, category: '景點', descriptions: ['環球影城門票', 'teamLab', '富士山一日遊', '奈良餵鹿', '清水寺'], amountsJpy: [5800, 3800, 12000, 800, 600], amountsHkd: [420, 280] },
  { n: 8, category: '便利店', descriptions: ['Lawson 零食', '7-Eleven 飲料', 'FamilyMart 宵夜'], amountsJpy: [380, 520, 780, 1100], amountsHkd: [25, 38, 55] },
  { n: 6, category: '雜項', descriptions: ['Locker 寄存', 'WiFi 蛋租借', '洗衣', '扭蛋機'], amountsJpy: [400, 800, 600, 500], amountsHkd: [30, 48] },
  { n: 6, category: '溫泉', descriptions: ['箱根日歸溫泉', '有馬溫泉入場'], amountsJpy: [2800, 3500], amountsHkd: [180], custom: true },
  { n: 3, category: '扭蛋', descriptions: ['秋葉原扭蛋', '車站扭蛋'], amountsJpy: [300, 500, 800], amountsHkd: [22], custom: true },
  { n: 3, category: '藥妝', descriptions: ['松本清', '唐吉訶德藥妝'], amountsJpy: [2200, 4500, 6800], amountsHkd: [128, 220], custom: true },
  { n: 3, category: '和服租借', descriptions: ['京都和服半日', '清水寺和服'], amountsJpy: [4500, 6800], amountsHkd: [320], custom: true },
  { n: 2, category: '機場行李', descriptions: ['寄艙服務', '超重行李'], amountsJpy: [1800, 3200], amountsHkd: [150], custom: true },
  { n: 3, category: '紀念品', descriptions: ['神社御守', '車站限定'], amountsJpy: [800, 1500], amountsHkd: [68], custom: true },
];

const LOCATIONS = [
  '東京駅', '新宿', '澀谷', '淺草', '銀座', '築地', '秋葉原', '表參道',
  '大阪心齋橋', '道頓堀', '京都駅', '伏見稻荷', '奈良公園', '箱根',
  '富士五湖', '環球影城', '成田機場', '關西機場', '明治神宮', '暢游池',
];

const REPAY_PLAN = [
  { date: '2026-07-24', time: '20:10', currency: 'JPY', amount: 3500, payer: 'B', description: '部分還 JPY' },
  { date: '2026-07-25', time: '09:30', currency: 'JPY', amount: 5000, payer: 'B', description: '再還一筆 JPY' },
  { date: '2026-07-26', time: '18:00', currency: 'HKD', amount: 120, payer: 'B', description: '部分還 HKD' },
  { date: '2026-07-27', time: '11:15', currency: 'JPY', amount: 8000, payer: 'B', description: 'JPY 還款' },
  { date: '2026-07-27', time: '21:40', currency: 'JPY', amount: 4200, payer: 'A', description: 'A 還 B JPY' },
  { date: '2026-07-28', time: '10:05', currency: 'HKD', amount: 88, payer: 'B', description: 'HKD 還款' },
  { date: '2026-07-28', time: '16:20', currency: 'JPY', amount: 12000, payer: 'B', description: '大額還 JPY' },
  { date: '2026-07-29', time: '08:50', currency: 'JPY', amount: 2500, payer: 'A', description: '小額還 JPY' },
  { date: '2026-07-30', time: '19:30', currency: 'HKD', amount: 200, payer: 'A', description: 'A 還 HKD' },
  { date: '2026-07-31', time: '12:00', currency: 'JPY', amount: 6800, payer: 'B', description: '出發前還清部分' },
];

const LOAN_PLAN = [
  { date: '2026-07-22', time: '14:00', currency: 'JPY', amount: 10000, payer: 'A', description: 'A 借現金俾 B' },
  { date: '2026-07-22', time: '20:30', currency: 'JPY', amount: 5000, payer: 'B', description: 'B 借現金俾 A' },
  { date: '2026-07-23', time: '11:00', currency: 'HKD', amount: 300, payer: 'A', description: 'A 借 HKD 俾 B' },
  { date: '2026-07-24', time: '09:45', currency: 'JPY', amount: 8000, payer: 'B', description: 'B 借 JPY 俾 A' },
  { date: '2026-07-25', time: '15:20', currency: 'JPY', amount: 15000, payer: 'A', description: 'A 再借 JPY' },
  { date: '2026-07-26', time: '13:10', currency: 'HKD', amount: 150, payer: 'B', description: 'B 借 HKD 俾 A' },
  { date: '2026-07-28', time: '22:00', currency: 'JPY', amount: 6000, payer: 'A', description: '深夜借現金' },
  { date: '2026-07-29', time: '07:30', currency: 'JPY', amount: 3000, payer: 'B', description: '早餐前借錢' },
];

function dateFromOffset(start, offsetDays) {
  const [y, m, d] = start.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function totalDays(start, end) {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000);
}

function pick(arr, index) {
  return arr[index % arr.length];
}

function timeForIndex(index) {
  const h = 7 + (index * 3) % 16;
  const m = (index * 11) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function splitModeForIndex(index) {
  const modes = ['SPLIT_5050', 'SPLIT_5050', 'SPLIT_5050', 'FOR_A', 'FOR_B'];
  return modes[index % modes.length];
}

function payerForSplit(splitMode, index) {
  if (splitMode === 'FOR_A') return index % 2 === 0 ? 'B' : 'A';
  if (splitMode === 'FOR_B') return index % 2 === 0 ? 'A' : 'B';
  return index % 2 === 0 ? 'A' : 'B';
}

function buildExpenseRecords() {
  const records = [];
  let index = 0;
  const daySpan = totalDays(DATE_START, DATE_END) + 1;

  for (const blueprint of EXPENSE_BLUEPRINTS) {
    for (let i = 0; i < blueprint.n; i += 1) {
      const useHkd = (index % 11 === 0) || (blueprint.category === '交通' && i === 1);
      const currency = useHkd ? 'HKD' : 'JPY';
      const amounts = currency === 'HKD' ? blueprint.amountsHkd : blueprint.amountsJpy;
      let amount = pick(amounts, index + i);
      if (currency === 'HKD' && index % 17 === 0) amount = 99;
      if (currency === 'JPY' && index % 23 === 0) amount = 1;
      if (currency === 'JPY' && index % 29 === 0) amount = 99999;

      const splitMode = splitModeForIndex(index);
      const payer = payerForSplit(splitMode, index);
      const dayOffset = index % daySpan;
      const description = pick(blueprint.descriptions, index + i);
      const location = index % 9 === 0 ? '' : pick(LOCATIONS, index);
      const desc = index % 13 === 0 ? '' : description;

      records.push({
        date: dateFromOffset(DATE_START, dayOffset),
        time: timeForIndex(index),
        category: blueprint.category,
        description: desc,
        location,
        currency,
        amount,
        payer,
        split_mode: splitMode,
        client_id: `seed-full-exp-${String(index + 1).padStart(3, '0')}`,
      });
      index += 1;
    }
  }

  return records;
}

function buildRepayRecords() {
  return REPAY_PLAN.map((row, i) => ({
    ...row,
    category: '還錢',
    split_mode: 'REPAY',
    location: pick(LOCATIONS, i),
    client_id: `seed-full-repay-${String(i + 1).padStart(2, '0')}`,
  }));
}

function buildLoanRecords() {
  return LOAN_PLAN.map((row, i) => ({
    ...row,
    category: '借錢',
    split_mode: 'LOAN',
    location: pick(LOCATIONS, i + 3),
    client_id: `seed-full-loan-${String(i + 1).padStart(2, '0')}`,
  }));
}

function buildTransactions() {
  const expenses = buildExpenseRecords();
  const repays = buildRepayRecords();
  const loans = buildLoanRecords();
  const all = [...expenses, ...repays, ...loans];

  if (all.length !== COUNT) {
    throw new Error(`Expected ${COUNT} records, got ${all.length} (expenses=${expenses.length}, repay=${repays.length}, loan=${loans.length})`);
  }

  all.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  return all;
}

async function apiRequest(payload) {
  const url = new URL(TESTER.url);
  Object.entries(payload).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  url.searchParams.set('spreadsheetId', TESTER.spreadsheetId);
  url.searchParams.set('gid', TESTER.sheetGid);
  url.searchParams.set('source', 'tester');

  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  if (text.trimStart().startsWith('<')) throw new Error('API returned HTML instead of JSON');
  const data = JSON.parse(text);
  if (data.status === 'ERROR') throw new Error(data.message || 'API error');
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const txs = buildTransactions();
  console.log(`Seeding ${txs.length} comprehensive tester records (${DATE_START} ~ ${DATE_END})…`);

  const who = await apiRequest({ action: 'whoami' });
  console.log(`Connected: ${who.spreadsheet_name || who.spreadsheet_id} [${who.source}]`);

  console.log('Clearing existing tester transactions…');
  await apiRequest({ action: 'clearTransactions' });

  console.log('Setting test budgets…');
  await apiRequest({
    action: 'updateBudget',
    A_JPY: 150000,
    B_JPY: 150000,
    A_HKD: 5000,
    B_HKD: 5000,
  });

  let ok = 0;
  for (const tx of txs) {
    await apiRequest({ action: 'addTransaction', ...tx });
    ok += 1;
    process.stdout.write(`\r  ${ok}/${txs.length} added`);
    await sleep(REQUEST_GAP_MS);
  }

  const final = await apiRequest({ action: 'fetch' });
  const summary = final.summary || [];
  console.log(`\nDone. Tester now has ${final.transactions?.length || '?'} transactions.`);
  console.log('Summary snapshot:');
  for (const row of summary) {
    console.log(`  ${row.person} ${row.currency}: spent=${row.total_spent}, remain=${row.remaining_budget}, net=${row.net_balance}`);
  }
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
