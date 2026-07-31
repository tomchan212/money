/**
 * Validate settlement / share logic against live tester data.
 * Usage: node scripts/validate-tester-logic.mjs
 */

const TESTER = {
  url: 'https://script.google.com/macros/s/AKfycbxs43cCa82KcZst-Tf867nLHBqwsTzOuD21rKy23aPEvwQbq_LFQdM9A3mYb66XlIv9SQ/exec',
  spreadsheetId: '1feUcrJ6_2HoJaWio22-rpycrFaLgaFThIcI0LBXaAzU',
  sheetGid: '48656539',
};

function moneyEpsilon(currency) {
  return currency === 'HKD' ? 0.005 : 0.5;
}

function isNegligible(v, currency) {
  return Math.abs(v) < moneyEpsilon(currency);
}

function computeShares(amount, payer, splitMode) {
  const amt = Number(amount) || 0;
  switch (splitMode) {
    case 'FOR_A':
      return { a_share: amt, b_share: 0, net_b_owes_a: payer === 'B' ? -amt : 0 };
    case 'FOR_B':
      return { a_share: 0, b_share: amt, net_b_owes_a: payer === 'A' ? amt : 0 };
    case 'REPAY':
      return { a_share: 0, b_share: 0, net_b_owes_a: payer === 'B' ? -amt : amt };
    case 'LOAN':
      return { a_share: 0, b_share: 0, net_b_owes_a: payer === 'B' ? -amt : amt };
    default:
      if (payer === 'A') return { a_share: amt / 2, b_share: amt - amt / 2, net_b_owes_a: amt / 2 };
      if (payer === 'B') return { a_share: amt / 2, b_share: amt - amt / 2, net_b_owes_a: -(amt / 2) };
      return { a_share: 0, b_share: 0, net_b_owes_a: 0 };
  }
}

function calcNet(transactions, currency) {
  return transactions
    .filter((t) => t.currency === currency)
    .reduce((s, t) => s + (Number(t.net_b_owes_a) || 0), 0);
}

function getSettlementCycleTxs(transactions, currency) {
  const txs = transactions
    .filter((t) => t.currency === currency)
    .slice()
    .sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`));

  let running = 0;
  let start = 0;
  for (let i = 0; i < txs.length; i++) {
    running += Number(txs[i].net_b_owes_a) || 0;
    if (isNegligible(running, currency)) {
      start = i + 1;
      running = 0;
    }
  }
  return txs.slice(start);
}

async function fetchData() {
  const url = new URL(TESTER.url);
  url.searchParams.set('action', 'fetch');
  url.searchParams.set('spreadsheetId', TESTER.spreadsheetId);
  url.searchParams.set('gid', TESTER.sheetGid);
  url.searchParams.set('source', 'tester');
  const res = await fetch(url.toString(), { redirect: 'follow' });
  const data = await res.json();
  if (data.status === 'ERROR') throw new Error(data.message);
  return data;
}

const issues = [];

function report(level, msg) {
  issues.push({ level, msg });
}

async function main() {
  const data = await fetchData();
  const txs = data.transactions || [];
  console.log(`Fetched ${txs.length} transactions from tester.`);

  for (const tx of txs) {
    const expected = computeShares(tx.amount, tx.payer, tx.split_mode);
    for (const key of ['a_share', 'b_share', 'net_b_owes_a']) {
      const got = Number(tx[key]) || 0;
      const exp = expected[key];
      if (Math.abs(got - exp) > moneyEpsilon(tx.currency)) {
        report('ERROR', `${tx.transaction_id || tx.client_id}: ${key} stored=${got} expected=${exp} (${tx.split_mode} ${tx.amount} ${tx.currency})`);
      }
    }
    if (tx.split_mode === 'SPLIT_5050') {
      const sum = (Number(tx.a_share) || 0) + (Number(tx.b_share) || 0);
      if (Math.abs(sum - Number(tx.amount)) > moneyEpsilon(tx.currency)) {
        report('WARN', `${tx.transaction_id}: a_share+b_share=${sum} != amount=${tx.amount} (${tx.currency})`);
      }
    }
  }

  for (const cur of ['JPY', 'HKD']) {
    const cycle = getSettlementCycleTxs(txs, cur);
    const cycleNet = cycle.reduce((s, t) => s + (Number(t.net_b_owes_a) || 0), 0);
    const totalNet = calcNet(txs, cur);
    const summaryRow = (data.summary || []).find((r) => r.person === 'A' && r.currency === cur);
    if (summaryRow && Math.abs(Number(summaryRow.net_balance) - totalNet) > moneyEpsilon(cur)) {
      report('ERROR', `${cur} summary net_balance=${summaryRow.net_balance} != computed=${totalNet}`);
    }

    const hasLoan = cycle.some((t) => t.split_mode === 'LOAN');
    const hasRepay = cycle.some((t) => t.split_mode === 'REPAY');
    if (hasLoan && !hasRepay && !isNegligible(cycleNet, cur)) {
      report('UX', `${cur}: open cycle has loans but no repays — explain panel may miss "而家仲要還" footer (cycleNet=${cycleNet})`);
    }
  }

  const byCat = {};
  for (const tx of txs) {
    if (tx.split_mode === 'REPAY' || tx.split_mode === 'LOAN') continue;
    byCat[tx.category] = (byCat[tx.category] || 0) + 1;
  }

  console.log('\n=== Validation Results ===');
  if (!issues.length) {
    console.log('No issues found in share/net validation.');
  } else {
    for (const i of issues) console.log(`[${i.level}] ${i.msg}`);
    console.log(`\nTotal: ${issues.length} issue(s)`);
  }
}

main().catch((e) => {
  console.error('Validation failed:', e.message);
  process.exit(1);
});
