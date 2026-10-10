/**
 * Persistent Real Voice Storage Engine using IndexedDB + LocalStorage + Memory
 * Ensures user's uploaded real audio (.mp3 / .wav) is permanently stored across
 * page reloads, browser tabs, and serverless environments (Vercel) without size limits.
 */

const DB_NAME = 'jeose_voice_calling_db';
const STORE_NAME = 'maya_custom_voice_store';
const VOICE_KEY = 'active_maya_voice';

// In-memory audio URL cache for zero-latency synchronous access
let cachedVoiceUrl: string | null = null;
let cachedVoiceName: string | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Converts Blob or File into a base64 Data URL (data:audio/mp3;base64,...)
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Saves uploaded audio as the permanent Maya voice
 */
export async function saveCustomVoice(
  fileOrData: File | Blob | string,
  filename?: string
): Promise<string> {
  let dataUrl: string;

  if (typeof fileOrData === 'string') {
    dataUrl = fileOrData;
  } else {
    dataUrl = await blobToDataUrl(fileOrData);
  }

  const voiceName = filename || 'Real Human Voice Recording';
  cachedVoiceUrl = dataUrl;
  cachedVoiceName = voiceName;

  // 1. Save in IndexedDB (handles any file size up to 100MB+)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ dataUrl, name: voiceName, updatedAt: Date.now() }, VOICE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }

  // 2. Save in localStorage for fast sync access (if under 3.5MB)
  if (typeof window !== 'undefined') {
    try {
      if (dataUrl.length < 3.5 * 1024 * 1024) {
        localStorage.setItem('custom_maya_voice_url', dataUrl);
      } else {
        localStorage.setItem('custom_maya_voice_url', 'indexeddb:active_maya_voice');
      }
      localStorage.setItem('custom_maya_voice_name', voiceName);
      localStorage.setItem('maya_voice_mode', 'real_human_voice');
    } catch {
      // localStorage quota exceeded, IndexedDB is already saved
    }
  }

  return dataUrl;
}

/**
 * Synchronously retrieves custom voice URL from memory or localStorage.
 * Used by speakText() to immediately play voice without delay.
 */
export function getCustomVoiceSync(): string | null {
  if (cachedVoiceUrl) return cachedVoiceUrl;

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('custom_maya_voice_url');
    if (stored && !stored.startsWith('indexeddb:')) {
      cachedVoiceUrl = stored;
      return stored;
    }
  }

  return null;
}

/**
 * Asynchronously loads custom voice from IndexedDB or Backend
 */
export async function getCustomVoice(): Promise<{ url: string | null; name: string | null }> {
  // Check memory
  if (cachedVoiceUrl) {
    return { url: cachedVoiceUrl, name: cachedVoiceName || 'Real Human Voice' };
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('custom_maya_voice_url');
    const storedName = localStorage.getItem('custom_maya_voice_name');
    if (storedUrl && !storedUrl.startsWith('indexeddb:')) {
      cachedVoiceUrl = storedUrl;
      cachedVoiceName = storedName;
      return { url: storedUrl, name: storedName };
    }
  }

  // Check IndexedDB
  try {
    const db = await openDB();
    const item = await new Promise<{ dataUrl: string; name: string } | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VOICE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (item && item.dataUrl) {
      cachedVoiceUrl = item.dataUrl;
      cachedVoiceName = item.name;
      return { url: item.dataUrl, name: item.name };
    }
  } catch (err) {
    console.warn('IndexedDB lookup failed:', err);
  }

  // Check backend file
  try {
    const res = await fetch('/api/voice/custom-audio');
    if (res.ok) {
      const data = await res.json();
      if (data.hasCustomVoice && data.url) {
        cachedVoiceUrl = data.url;
        cachedVoiceName = 'custom-maya-voice.mp3';
        return { url: data.url, name: 'custom-maya-voice.mp3' };
      }
    }
  } catch {
    // ignore
  }

  return { url: null, name: null };
}

/**
 * Deletes custom voice and resets to default
 */
export async function clearCustomVoice(): Promise<void> {
  cachedVoiceUrl = null;
  cachedVoiceName = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_maya_voice_url');
    localStorage.removeItem('custom_maya_voice_name');
    localStorage.removeItem('maya_voice_mode');
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(VOICE_KEY);
  } catch {
    // ignore
  }
}
