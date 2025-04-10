import { openDB } from 'idb';

const dbPromise = openDB('harmonic-archive', 1, {
  upgrade(db) {
    db.createObjectStore('musicSheets', { keyPath: 'id' });
    db.createObjectStore('musicSheetDetails', { keyPath: 'id' }); // Store for detailed data
  },
});

// Cache a list of music sheets
export const addMusicSheet = async (sheet) => {
  const db = await dbPromise;
  await db.put('musicSheets', sheet);
};

// Get all cached music sheets
export const getMusicSheets = async () => {
  const db = await dbPromise;
  return db.getAll('musicSheets');
};

// Cache detailed information about a music sheet
export const addMusicSheetDetail = async (detail) => {
  const db = await dbPromise;
  await db.put('musicSheetDetails', detail);
};

// Get detailed information about a specific music sheet
export const getMusicSheetDetail = async (id) => {
  const db = await dbPromise;
  return db.get('musicSheetDetails', id);
};

export const addToSyncQueue = async (operation) => {
  const db = await dbPromise;
  await db.add('syncQueue', operation);
};

export const getSyncQueue = async () => {
  const db = await dbPromise;
  return db.getAll('syncQueue');
};

export const clearSyncQueue = async () => {
  const db = await dbPromise;
  await db.clear('syncQueue');
};