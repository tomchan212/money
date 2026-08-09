/**
 * Lightweight validation for offline sync queue failure handling.
 * Run: node scripts/validate-sync-manager.mjs
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const storage = new Map();
const localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

const timers = new Set();
const trackedSetTimeout = (fn, ms, ...args) => {
  const id = setTimeout(() => {
    timers.delete(id);
    fn(...args);
  }, ms);
  timers.add(id);
  return id;
};
const trackedClearTimeout = (id) => {
  timers.delete(id);
  clearTimeout(id);
};

const context = {
  console,
  localStorage,
  navigator: { onLine: true },
  window: {
    addEventListener() {},
    setTimeout: trackedSetTimeout,
    clearTimeout: trackedClearTimeout,
  },
  setTimeout: trackedSetTimeout,
  clearTimeout: trackedClearTimeout,
};

vm.createContext(context);
for (const file of ['offlineQueue.js', 'syncManager.js']) {
  const code = readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(code, context, { filename: file });
}

const OfflineQueue = vm.runInContext('OfflineQueue', context);
const SyncManager = vm.runInContext('SyncManager', context);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clearAllTimers() {
  for (const id of [...timers]) trackedClearTimeout(id);
}

async function withHooks(handlers) {
  clearAllTimers();
  storage.clear();
  OfflineQueue.init('test');
  while (OfflineQueue.size() > 0) OfflineQueue.dequeue();

  const events = [];
  SyncManager.init({
    beginServerApply: () => 1,
    applyServerDataWithQueue: () => true,
    syncAddTransaction: async () => ({ status: 'SUCCESS' }),
    syncEditTransaction: async () => ({ status: 'SUCCESS' }),
    syncDeleteTransaction: async () => ({ status: 'SUCCESS' }),
    syncBudgets: async () => ({ status: 'SUCCESS' }),
    syncClearAllTransactions: async () => ({ status: 'SUCCESS' }),
    updateSyncStatusFromQueue: (mode) => events.push(['status', mode || null]),
    isSyncBlocked: () => false,
    onSyncPermanentFailure: (op, err) => events.push(['permanent', op.type, String(err?.message || err)]),
    onSyncDropped: (op, err) => events.push(['dropped', op.type, String(err?.message || err)]),
    onSyncIdempotentSkip: (op) => events.push(['idempotent', op.type]),
    onSyncRecoveredAsCreate: (op) => events.push(['recovered', op.type]),
    ...handlers,
  });
  return events;
}

async function testDeleteMissingIsIdempotent() {
  const events = await withHooks({
    syncDeleteTransaction: async () => {
      throw new Error('找不到該筆紀錄：TXN-1');
    },
  });
  OfflineQueue.enqueue({
    type: 'delete',
    clientId: 'c1',
    payload: { transaction_id: 'TXN-1', clientId: 'c1' },
  });
  OfflineQueue.enqueue({
    type: 'create',
    clientId: 'c2',
    payload: {
      client_id: 'c2',
      date: '2026-08-09',
      category: '雜項',
      description: 'ok',
      currency: 'JPY',
      amount: 100,
      payer: 'A',
      split_mode: 'SPLIT_5050',
    },
  });

  await SyncManager.flushQueue();
  await sleep(20);

  assert.equal(OfflineQueue.size(), 0, 'delete-missing should not block later creates');
  assert.ok(
    events.some((e) => e[0] === 'idempotent' && e[1] === 'delete'),
    'should emit idempotent skip for delete'
  );
}

async function testEditMissingRecoversAsCreate() {
  let createCalls = 0;
  const events = await withHooks({
    syncEditTransaction: async () => {
      throw new Error('找不到該筆紀錄：TXN-9');
    },
    syncAddTransaction: async () => {
      createCalls += 1;
      return { status: 'SUCCESS' };
    },
  });

  OfflineQueue.enqueue({
    type: 'edit',
    clientId: 'edit-1',
    payload: {
      transaction_id: 'TXN-9',
      clientId: 'edit-1',
      tx: {
        date: '2026-08-09',
        category: '雜項',
        description: 'edited',
        currency: 'JPY',
        amount: 50,
        payer: 'B',
        split_mode: 'FOR_B',
      },
    },
  });

  await SyncManager.flushQueue();
  await sleep(20);

  assert.equal(OfflineQueue.size(), 0, 'recovered create should sync');
  assert.equal(createCalls, 1, 'edit-missing should become one create');
  assert.ok(events.some((e) => e[0] === 'recovered' && e[1] === 'edit'));
}

async function testPermanentFailureToastsOnce() {
  let calls = 0;
  const events = await withHooks({
    syncAddTransaction: async () => {
      calls += 1;
      throw new Error('連線逾時（>55s）');
    },
  });

  OfflineQueue.enqueue({
    type: 'create',
    clientId: 'slow-1',
    payload: {
      client_id: 'slow-1',
      date: '2026-08-09',
      category: '雜項',
      description: 'slow',
      currency: 'JPY',
      amount: 10,
      payer: 'A',
      split_mode: 'SPLIT_5050',
    },
  });

  // Jump straight to the permanent-failure threshold.
  const head = OfflineQueue.peek();
  head.retryCount = 4;
  head.nextRetryAt = 0;
  OfflineQueue.updateHead(head);

  await SyncManager.flushQueue();
  await sleep(20);

  // Second attempt after permanent should not toast again.
  const head2 = OfflineQueue.peek();
  head2.nextRetryAt = 0;
  OfflineQueue.updateHead(head2);
  await SyncManager.flushQueue();
  await sleep(20);

  const permanentToasts = events.filter((e) => e[0] === 'permanent');
  assert.equal(permanentToasts.length, 1, 'permanent failure toast should fire once');
  assert.equal(OfflineQueue.size(), 1, 'failed create remains queued for later retry');
  assert.ok(calls >= 2, 'should have attempted sync more than once');
}

async function main() {
  await testDeleteMissingIsIdempotent();
  await testEditMissingRecoversAsCreate();
  await testPermanentFailureToastsOnce();
  clearAllTimers();
  console.log('validate-sync-manager: all checks passed');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    clearAllTimers();
    process.exit(1);
  });
