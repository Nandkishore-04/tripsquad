import { Platform } from 'react-native';

// On web we go through the same-origin Vercel function (jsonblob has no
// CORS). Native apps have no CORS restrictions, so they hit the store
// directly.
const BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019eb6f0-7b35-7030-a7d2-121c8a972694';
const SYNC_URL = Platform.OS === 'web' ? '/api/trip' : BLOB_URL;

export async function fetchShared() {
  try {
    const r = await fetch(SYNC_URL, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function pushShared(doc) {
  try {
    const r = await fetch(SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return r.ok;
  } catch {
    return false;
  }
}
