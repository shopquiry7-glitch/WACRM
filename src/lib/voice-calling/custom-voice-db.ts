/**
 * Persistent Real Voice & Cloned Voice Storage Engine
 * Stores user's uploaded voice sample (.mp3 / .wav), cloned voice IDs (ElevenLabs / Neural),
 * and audio settings across page reloads and browser sessions.
 */

const DB_NAME = 'jeose_voice_calling_db';
const STORE_NAME = 'maya_custom_voice_store';
const VOICE_KEY = 'active_maya_voice';

export interface ClonedVoiceRecord {
  dataUrl: string; // The original audio sample for preview
  name: string;
  voiceId?: string; // Cloned voice ID (e.g. ElevenLabs voice_id)
  provider?: 'elevenlabs' | 'neural';
  apiKey?: string;
  updatedAt: number;
}

// In-memory cache for synchronous instant access
let cachedVoice: ClonedVoiceRecord | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 2);

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
 * Saves uploaded audio and registers/clones the voice
 */
export async function saveCustomVoice(
  fileOrData: File | Blob | string,
  filename?: string,
  options?: {
    apiKey?: string;
    voiceId?: string;
    provider?: 'elevenlabs' | 'neural';
  }
): Promise<ClonedVoiceRecord> {
  let dataUrl: string;

  if (typeof fileOrData === 'string') {
    dataUrl = fileOrData;
  } else {
    dataUrl = await blobToDataUrl(fileOrData);
  }

  const voiceName = filename || 'Real Human Voice Recording';
  let voiceId = options?.voiceId || 'neural_custom_clone';
  let provider = options?.provider || 'neural';
  const apiKey = options?.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('custom_maya_elevenlabs_key') || '' : '');

  // If no voiceId passed but we have an API key, attempt voice cloning via backend
  if (!options?.voiceId) {
    try {
      const res = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Audio: dataUrl,
          fileName: voiceName,
          apiKey: apiKey || undefined,
          voiceName: `Maya (${voiceName})`,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.voiceId) {
          voiceId = json.voiceId;
          provider = json.provider || provider;
        }
      }
    } catch (cloneErr) {
      console.warn('Backend voice clone notice:', cloneErr);
    }
  }

  const record: ClonedVoiceRecord = {
    dataUrl,
    name: voiceName,
    voiceId,
    provider,
    apiKey,
    updatedAt: Date.now(),
  };

  cachedVoice = record;

  // 1. Save in IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record, VOICE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }

  // 2. Save in localStorage
  if (typeof window !== 'undefined') {
    try {
      if (dataUrl.length < 3.5 * 1024 * 1024) {
        localStorage.setItem('custom_maya_voice_url', dataUrl);
      } else {
        localStorage.setItem('custom_maya_voice_url', 'indexeddb:active_maya_voice');
      }
      localStorage.setItem('custom_maya_voice_name', voiceName);
      localStorage.setItem('custom_maya_voice_id', voiceId);
      localStorage.setItem('custom_maya_voice_provider', provider);
      if (apiKey) {
        localStorage.setItem('custom_maya_elevenlabs_key', apiKey);
      }
      localStorage.setItem('maya_voice_mode', 'real_cloned_voice');
    } catch {
      // quota fallback handled by IndexedDB
    }
  }

  return record;
}

/**
 * Synchronously retrieves custom cloned voice info from memory or localStorage.
 */
export function getCustomVoiceSync(): ClonedVoiceRecord | null {
  if (cachedVoice) return cachedVoice;

  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('custom_maya_voice_url');
    const storedName = localStorage.getItem('custom_maya_voice_name');
    const storedVoiceId = localStorage.getItem('custom_maya_voice_id');
    const storedProvider = (localStorage.getItem('custom_maya_voice_provider') as 'elevenlabs' | 'neural') || 'neural';
    const storedApiKey = localStorage.getItem('custom_maya_elevenlabs_key') || '';

    if (storedUrl || storedVoiceId) {
      cachedVoice = {
        dataUrl: storedUrl && !storedUrl.startsWith('indexeddb:') ? storedUrl : '',
        name: storedName || 'Real Human Voice',
        voiceId: storedVoiceId || 'neural_custom_clone',
        provider: storedProvider,
        apiKey: storedApiKey,
        updatedAt: Date.now(),
      };
      return cachedVoice;
    }
  }

  return null;
}

/**
 * Asynchronously loads custom voice from IndexedDB or Backend
 */
export async function getCustomVoice(): Promise<{
  url: string | null;
  name: string | null;
  voiceId: string | null;
  provider: 'elevenlabs' | 'neural' | null;
  apiKey: string | null;
}> {
  if (cachedVoice) {
    return {
      url: cachedVoice.dataUrl || null,
      name: cachedVoice.name || null,
      voiceId: cachedVoice.voiceId || null,
      provider: cachedVoice.provider || null,
      apiKey: cachedVoice.apiKey || null,
    };
  }

  // Check localStorage first
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('custom_maya_voice_url');
    const storedName = localStorage.getItem('custom_maya_voice_name');
    const storedVoiceId = localStorage.getItem('custom_maya_voice_id');
    const storedProvider = (localStorage.getItem('custom_maya_voice_provider') as 'elevenlabs' | 'neural') || null;
    const storedApiKey = localStorage.getItem('custom_maya_elevenlabs_key') || null;

    if (storedUrl && !storedUrl.startsWith('indexeddb:')) {
      cachedVoice = {
        dataUrl: storedUrl,
        name: storedName || 'Real Human Voice',
        voiceId: storedVoiceId || undefined,
        provider: storedProvider || 'neural',
        apiKey: storedApiKey || undefined,
        updatedAt: Date.now(),
      };
      return {
        url: storedUrl,
        name: storedName,
        voiceId: storedVoiceId,
        provider: storedProvider,
        apiKey: storedApiKey,
      };
    }
  }

  // Check IndexedDB
  try {
    const db = await openDB();
    const item = await new Promise<ClonedVoiceRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VOICE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (item) {
      cachedVoice = item;
      return {
        url: item.dataUrl || null,
        name: item.name || null,
        voiceId: item.voiceId || null,
        provider: item.provider || null,
        apiKey: item.apiKey || null,
      };
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
        cachedVoice = {
          dataUrl: data.url,
          name: 'custom-maya-voice.mp3',
          voiceId: 'neural_custom_clone',
          provider: 'neural',
          updatedAt: Date.now(),
        };
        return {
          url: data.url,
          name: 'custom-maya-voice.mp3',
          voiceId: 'neural_custom_clone',
          provider: 'neural',
          apiKey: null,
        };
      }
    }
  } catch {
    // ignore
  }

  return { url: null, name: null, voiceId: null, provider: null, apiKey: null };
}

/**
 * Saves ElevenLabs API key in storage
 */
export function saveElevenLabsApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('custom_maya_elevenlabs_key', key);
    } else {
      localStorage.removeItem('custom_maya_elevenlabs_key');
    }
  }
  if (cachedVoice) {
    cachedVoice.apiKey = key;
  }
}

/**
 * Deletes custom voice and resets to default
 */
export async function clearCustomVoice(): Promise<void> {
  cachedVoice = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_maya_voice_url');
    localStorage.removeItem('custom_maya_voice_name');
    localStorage.removeItem('custom_maya_voice_id');
    localStorage.removeItem('custom_maya_voice_provider');
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
