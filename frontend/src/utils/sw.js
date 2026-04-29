const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  // Defer SW registration to idle time for better performance
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('[sw] Registered:', reg.scope))
        .catch((err) => console.error('[sw] Registration failed:', err));
    }, { timeout: 2000 });
  } else {
    // Fallback: defer with setTimeout
    setTimeout(() => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('[sw] Registered:', reg.scope))
        .catch((err) => console.error('[sw] Registration failed:', err));
    }, 3000);
  }
};

const isOnline = () => navigator.onLine;

const onReconnect = (callback) => {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
};

const onDisconnect = (callback) => {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
};

export { registerServiceWorker, isOnline, onReconnect, onDisconnect };