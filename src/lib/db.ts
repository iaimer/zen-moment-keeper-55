import {
  DayData,
  StoredImage,
  AppSettings,
  DEFAULT_QUANTIFIED_HABITS,
  DEFAULT_CHECKBOX_HABITS,
} from '@/types/journal';

const DB_NAME = 'zenjournal';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('days')) {
        db.createObjectStore('days', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getDefaultDayData(date: string, settings?: AppSettings): DayData {
  const customHabits = settings?.customHabits ?? DEFAULT_CHECKBOX_HABITS;
  return {
    date,
    habits: {
      quantified: DEFAULT_QUANTIFIED_HABITS.map((h) => ({ ...h, value: 0 })),
      checkboxes: customHabits.map((h) => ({ ...h, checked: false })),
    },
    highlight: { text: '' },
    timeline: [],
    reflection: { awareness: '', tomorrow: '' },
  };
}

export async function getDayData(date: string): Promise<DayData> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('days', 'readonly');
    const req = tx.objectStore('days').get(date);
    req.onsuccess = () => resolve(req.result ?? getDefaultDayData(date));
  });
}

export async function saveDayData(data: DayData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('days', 'readwrite');
    tx.objectStore('days').put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllDays(): Promise<DayData[]> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('days', 'readonly');
    const req = tx.objectStore('days').getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

export async function saveImage(image: StoredImage): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    tx.objectStore('images').put(image);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('images', 'readonly');
    const req = tx.objectStore('images').get(id);
    req.onsuccess = () => resolve(req.result);
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const req = tx.objectStore('settings').get('app');
    req.onsuccess = () =>
      resolve(req.result ?? { id: 'app', customHabits: DEFAULT_CHECKBOX_HABITS });
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ id: 'app', ...settings });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
