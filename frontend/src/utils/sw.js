import { getSyncQueue, removeSyncItem } from '../lib/offlineDB.js';

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('[sw] Registered:', reg.scope))
        .catch((err) => console.error('[sw] Registration failed:', err));
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('[sw] Registered:', reg.scope))
        .catch((err) => console.error('[sw] Registration failed:', err));
    }, 3000);
  }
};

export const isOnline = () => navigator.onLine;

export const onReconnect = (callback) => {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
};

export const onDisconnect = (callback) => {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
};

export const processSyncQueue = async (handlers) => {
  const queue = await getSyncQueue();
  if (queue.length === 0) return [];

  const results = [];

  for (const item of queue) {
    try {
      let result = null;

      if (handlers[item.type]) {
        result = await handlers[item.type](item.payload);
      }

      await removeSyncItem(item.id);
      results.push({ action: item, result });
    } catch (err) {
      results.push({ action: item, error: err.message });
    }
  }

  return results;
};

export { registerServiceWorker };