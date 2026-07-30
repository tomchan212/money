/**
 * FIFO offline sync — network detection, retry backoff, single-flight processing.
 */
const SyncManager = (function () {
  const RETRY_DELAYS_MS = [0, 5000, 15000, 30000];
  const SCHEDULE_DEBOUNCE_MS = 80;

  /** @type {Record<string, function>} */
  let hooks = {};
  let isSyncing = false;
  let scheduleTimer = null;
  let retryTimer = null;
  let online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  function init(h) {
    hooks = h || {};
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    OfflineQueue.onChange(() => refreshStatus());
    refreshStatus();
  }

  function reinitEndpoint(key) {
    OfflineQueue.init(key);
    refreshStatus();
    scheduleSync();
  }

  function onOnline() {
    online = true;
    scheduleSync();
  }

  function onOffline() {
    online = false;
    refreshStatus();
  }

  function isNetworkOnline() {
    return online && navigator.onLine;
  }

  function refreshStatus(mode) {
    if (hooks.updateSyncStatusFromQueue) {
      hooks.updateSyncStatusFromQueue(mode);
    }
  }

  function scheduleSync() {
    clearTimeout(scheduleTimer);
    scheduleTimer = setTimeout(() => {
      processQueue();
    }, SCHEDULE_DEBOUNCE_MS);
  }

  function scheduleRetry(delayMs) {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      processQueue();
    }, Math.max(delayMs, 0));
  }

  async function executeOperation(op) {
    switch (op.type) {
      case 'create':
        return hooks.syncAddTransaction({
          ...op.payload,
          client_id: op.clientId,
        });
      case 'edit':
        return hooks.syncEditTransaction({
          transaction_id: op.payload.transaction_id || '',
          client_id: op.payload.clientId || op.clientId || '',
          date: op.payload.tx.date,
          category: op.payload.tx.category,
          description: op.payload.tx.description,
          location: op.payload.tx.location || '',
          currency: op.payload.tx.currency,
          amount: op.payload.tx.amount,
          payer: op.payload.tx.payer,
          split_mode: op.payload.tx.split_mode,
        });
      case 'delete':
        return hooks.syncDeleteTransaction({
          transaction_id: op.payload.transaction_id || '',
          client_id: op.payload.clientId || op.clientId || '',
        });
      case 'updateBudget':
        return hooks.syncBudgets(op.payload.budgets);
      case 'clearTransactions':
        return hooks.syncClearAllTransactions();
      default:
        throw new Error('Unknown queue operation: ' + op.type);
    }
  }

  async function processQueue() {
    if (isSyncing) return;
    if (!isNetworkOnline()) {
      refreshStatus();
      return;
    }
    if (OfflineQueue.size() === 0) {
      refreshStatus();
      return;
    }
    if (hooks.isSyncBlocked && hooks.isSyncBlocked()) {
      scheduleSync();
      return;
    }

    isSyncing = true;
    refreshStatus('syncing');

    try {
      while (OfflineQueue.size() > 0 && isNetworkOnline()) {
        const op = OfflineQueue.peek();
        if (!op) break;

        if (op.nextRetryAt && Date.now() < op.nextRetryAt) {
          scheduleRetry(op.nextRetryAt - Date.now());
          break;
        }

        try {
          const data = await executeOperation(op);
          OfflineQueue.dequeue();
          const applySeq = hooks.beginServerApply();
          hooks.applyServerDataWithQueue(data, applySeq);
        } catch (err) {
          op.retryCount = (op.retryCount || 0) + 1;
          if (op.retryCount <= RETRY_DELAYS_MS.length) {
            op.nextRetryAt = Date.now() + RETRY_DELAYS_MS[op.retryCount - 1];
            OfflineQueue.updateHead(op);
            refreshStatus('retry');
            scheduleRetry(op.nextRetryAt - Date.now());
          } else {
            op.nextRetryAt = 0;
            OfflineQueue.updateHead(op);
            refreshStatus('retry');
          }
          console.warn('SyncManager: op failed', op.type, err);
          break;
        }
      }
    } finally {
      isSyncing = false;
      refreshStatus();
    }
  }

  return {
    init,
    reinitEndpoint,
    scheduleSync,
    processQueue,
    flushQueue: processQueue,
    isSyncing: () => isSyncing,
    isNetworkOnline,
  };
})();
