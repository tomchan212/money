/**
 * Seed 50 dummy Japan trip transactions into the tester spreadsheet.
 * Usage: node scripts/seed-tester-dummy.mjs
 */

const TESTER = {
  url: 'https://script.google.com/macros/s/AKfycbx5hB2nxPILCM5AMn5V1tIZfU50c0yHUYHeokPjprYk9ITs3ffECHhobh_1RxghiawvqA/exec',
  spreadsheetId: '1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU',
  sheetGid: '48656539',
};

const DATE_START = '2026-07-19';
const DATE_END = '2026-07-29';
const COUNT = 50;

const TEMPLATES = [
  { category: '餐飲-早餐', descriptions: ['Lawson 飯團+咖啡', '7-Eleven 三明治', '酒店自助早餐', '松屋牛丼'], amounts: [480, 650, 890, 1200, 2800], locations: ['新宿', '東京駅', '大阪梅田', '京都駅'] },
  { category: '餐飲-午餐', descriptions: ['一蘭拉麵', '敘敘苑燒肉', '天婦羅定食', '壽司套餐', '牛丼'], amounts: [980, 1500, 2200, 3800, 5200], locations: ['澀谷', '銀座', '道頓堀', '築地場外'] },
  { category: '餐飲-晚餐', descriptions: ['居酒屋', '燒鳥', '河豚料理', '懷石料理', '拉麵'], amounts: [3200, 4800, 6500, 8800, 12000], locations: ['淺草', '祇園', '心齋橋', '箱根'] },
  { category: '交通', descriptions: ['Suica 增值', 'JR 新幹線', '地鐵一日券', '的士', '關西機場快线'], amounts: [1000, 2800, 3500, 4200, 6800], locations: ['東京駅', '京都駅', '大阪駅', '成田機場', '關西機場'] },
  { category: '住宿', descriptions: ['東京酒店', '京都旅館', '大阪商務酒店', '箱根溫泉旅館'], amounts: [12000, 18000, 22000, 35000], locations: ['新宿', '京都四条', '心齋橋', '箱根湯本'] },
  { category: '購物', descriptions: ['藥妝店', 'Uniqlo', '伴手禮', '模型店', '百貨公司'], amounts: [1500, 3200, 4500, 6800, 9800], locations: ['銀座', '心齋橋', '表參道', '秋葉原'] },
  { category: '景點', descriptions: ['環球影城門票', 'teamLab', '富士山一日遊', '奈良餵鹿', '清水寺'], amounts: [5800, 3800, 12000, 800, 600], locations: ['大阪 USJ', '豐洲', '富士五湖', '奈良公園', '京都'] },
  { category: '便利店', descriptions: ['Lawson 零食', '7-Eleven 飲料', 'FamilyMart 宵夜'], amounts: [380, 520, 780, 1100], locations: ['澀谷', '淺草', '京都駅', '道頓堀'] },
  { category: '雜項', descriptions: ['Locker 寄存', 'WiFi 蛋租借', '洗衣', '扭蛋'], amounts: [400, 800, 600, 500], locations: ['東京駅', '關西機場', '新宿', '秋葉原'] },
];

const JAPAN_LOCATIONS = [
  '東京駅', '新宿', '澀谷', '淺草', '銀座', '築地', '秋葉原', '表參道',
  '大阪心齋橋', '道頓堀', '京都駅', '伏見稻荷', '奈良公園', '箱根',
  '富士五湖', '環球影城', '成田機場', '關西機場', '明治神宮', '暢游池',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateBetween(start, end) {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startDay = Date.UTC(sy, sm - 1, sd);
  const endDay = Date.UTC(ey, em - 1, ed);
  const dayMs = 24 * 60 * 60 * 1000;
  const dayOffset = randInt(0, Math.round((endDay - startDay) / dayMs));
  const d = new Date(startDay + dayOffset * dayMs);
  return formatDateUtc(d);
}

function formatDateUtc(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function randomTime() {
  const h = randInt(7, 22);
  const m = randInt(0, 59);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function randomSplitMode() {
  const r = Math.random();
  if (r < 0.62) return 'SPLIT_5050';
  if (r < 0.78) return 'FOR_A';
  if (r < 0.94) return 'FOR_B';
  return 'SPLIT_5050';
}

function randomPayer(splitMode) {
  if (splitMode === 'FOR_A') return Math.random() < 0.55 ? 'A' : 'B';
  if (splitMode === 'FOR_B') return Math.random() < 0.55 ? 'B' : 'A';
  return Math.random() < 0.5 ? 'A' : 'B';
}

function buildTransactions() {
  const txs = [];
  for (let i = 0; i < COUNT; i += 1) {
    const tpl = pick(TEMPLATES);
    const splitMode = randomSplitMode();
    const payer = randomPayer(splitMode);
    const currency = Math.random() < 0.92 ? 'JPY' : 'HKD';
    let amount = pick(tpl.amounts);
    if (currency === 'HKD') amount = randInt(28, 680);

    txs.push({
      date: randomDateBetween(DATE_START, DATE_END),
      time: randomTime(),
      category: tpl.category,
      description: pick(tpl.descriptions),
      location: Math.random() < 0.85 ? pick(tpl.locations) : pick(JAPAN_LOCATIONS),
      currency,
      amount,
      payer,
      split_mode: splitMode,
    });
  }

  txs.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  return txs;
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
  const clearFirst = process.argv.includes('--clear');
  const txs = buildTransactions();
  console.log(`Adding ${txs.length} dummy records to tester (${DATE_START} ~ ${DATE_END})…`);

  const who = await apiRequest({ action: 'whoami' });
  console.log(`Connected: ${who.spreadsheet_name || who.spreadsheet_id}`);

  if (clearFirst) {
    console.log('Clearing existing tester transactions…');
    await apiRequest({ action: 'clearTransactions' });
  }

  let ok = 0;
  for (const tx of txs) {
    await apiRequest({ action: 'addTransaction', ...tx });
    ok += 1;
    process.stdout.write(`\r  ${ok}/${txs.length} added`);
    await sleep(350);
  }

  const final = await apiRequest({ action: 'fetch' });
  console.log(`\nDone. Tester now has ${final.transactions?.length || '?'} transactions.`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
