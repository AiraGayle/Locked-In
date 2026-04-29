import { getSyncQueue, removeSyncItem } from '../lib/offlineDB.js';
import { createRoom, joinRoom } from '../services/room-service.js';

export const isOnline = () => navigator.onLine;

export const onReconnect = (callback) => {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
};

export const onDisconnect = (callback) => {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
};

export const processSyncQueue = async () => {
  const queue = await getSyncQueue();
  if (queue.length === 0) return [];

  const results = [];

  for (const item of queue) {
    try {
      let result = null;

      if (item.type === 'CREATE_ROOM') {
        result = await createRoom(item.payload.name);
      } else if (item.type === 'JOIN_ROOM') {
        result = await joinRoom(item.payload.inviteCode);
      }

      await removeSyncItem(item.id);
      results.push({ action: item, result });
    } catch (err) {
      results.push({ action: item, error: err.message });
    }
  }

  return results;
};