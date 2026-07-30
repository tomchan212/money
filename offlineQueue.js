/**
 * Offline mutation queue — persisted in localStorage, FIFO, per API endpoint.
 */
const OfflineQueue = (function () {
  const STORAGE_PREFIX = 'money-offline-queue:';
  let endpointKey = 'production';
  /** @type {Array<object>} */
  let queue = [];
  const listeners = [];

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function storageKey() {
    return STORAGE_PREFIX + endpointKey;
  }

  function load() {
    try {
      const raw = localStorage.getItem(storageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      queue = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      queue = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(queue));
    } catch (err) {
      console.error('OfflineQueue: save failed', err);
    }
    listeners.forEach((fn) => {
      try {
        fn(queue.length);
      } catch (_) {}
    });
  }

  function init(key) {
    endpointKey = key || 'production';
    load();
  }

  function size() {
    return queue.length;
  }

  function getAll() {
    return queue.slice();
  }

  function peek() {
    return queue[0] || null;
  }

  function dequeue() {
    if (queue.length === 0) return;
    queue.shift();
    save();
  }

  function updateHead(op) {
    if (queue.length === 0) return;
    queue[0] = op;
    save();
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  /**
   * @returns {object|null} enqueued op, coalesced marker, or null
   */
  function enqueue(rawOp) {
    const op = {
      id: generateId(),
      clientId: rawOp.clientId || rawOp.payload?.clientId || generateId(),
      type: rawOp.type,
      payload: rawOp.payload,
      createdAt: Date.now(),
      retryCount: 0,
      nextRetryAt: 0,
    };

    if (op.type === 'clearTransactions') {
      queue = [op];
      save();
      return op;
    }

    if (op.type === 'delete') {
      const clientId = op.payload.clientId || op.clientId;
      const createIdx = queue.findIndex((q) => q.type === 'create' && q.clientId === clientId);
      if (createIdx >= 0) {
        queue.splice(createIdx, 1);
        queue = queue.filter((q) => {
          const cid = q.payload?.clientId || q.clientId;
          if (cid !== clientId) return true;
          return q.type !== 'edit' && q.type !== 'delete';
        });
        save();
        return { coalesced: true, clientId };
      }
    }

    if (op.type === 'edit') {
      const clientId = op.payload.clientId || op.clientId;
      const createOp = queue.find((q) => q.type === 'create' && q.clientId === clientId);
      if (createOp) {
        Object.assign(createOp.payload, op.payload.tx);
        save();
        return createOp;
      }
    }

    queue.push(op);
    save();
    return op;
  }

  return {
    init,
    enqueue,
    dequeue,
    updateHead,
    peek,
    getAll,
    size,
    onChange,
    generateId,
  };
})();
