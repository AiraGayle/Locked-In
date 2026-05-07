import { openDB } from 'idb';

const DB_NAME = 'focus-room-db';
const DB_VERSION = 1;

export const initDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('rooms')) {
        db.createObjectStore('rooms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });

export const saveRooms = async (rooms) => {
  const db = await initDB();
  const tx = db.transaction('rooms', 'readwrite');
  await Promise.all(rooms.map((room) => tx.store.put(room)));
  await tx.done;
};

export const getRooms = async () => {
  const db = await initDB();
  return db.getAll('rooms');
};

export const saveMessages = async (messages) => {
  const db = await initDB();
  const tx = db.transaction('messages', 'readwrite');
  await Promise.all(messages.map((msg) => tx.store.put(msg)));
  await tx.done;
};

export const getMessages = async (roomId) => {
  const db = await initDB();
  const all = await db.getAll('messages');
  return roomId ? all.filter((m) => m.roomId === roomId) : all;
};

export const addToSyncQueue = async (action) => {
  const db = await initDB();
  await db.add('syncQueue', { ...action, timestamp: Date.now() });
};

export const getSyncQueue = async () => {
  const db = await initDB();
  return db.getAll('syncQueue');
};

export const removeSyncItem = async (id) => {
  const db = await initDB();
  await db.delete('syncQueue', id);
};

export const clearSyncQueue = async () => {
  const db = await initDB();
  await db.clear('syncQueue');
};