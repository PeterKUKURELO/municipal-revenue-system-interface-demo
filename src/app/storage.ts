import seedDatabase from '../../db.json';
import type { AppData } from './types';

export const APP_STORAGE_KEY = 'municipal-revenue-demo-state';

function cloneSeedData(): AppData {
  return JSON.parse(JSON.stringify(seedDatabase)) as AppData;
}

export function loadAppData(): AppData {
  if (typeof window === 'undefined') {
    return cloneSeedData();
  }

  const raw = window.localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) {
    return cloneSeedData();
  }

  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return cloneSeedData();
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
}

export function cloneAppData(data: AppData): AppData {
  return JSON.parse(JSON.stringify(data)) as AppData;
}
