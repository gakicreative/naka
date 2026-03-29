import { compressImage } from './utils';

const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

/**
 * Upload a file and return its public URL.
 * In mock mode, compresses images to a data URL; other files become object URLs.
 * In API mode, uploads to the Express server and returns the public URL.
 */
export async function uploadFile(file: File, _path?: string): Promise<string> {
  if (MOCK) {
    if (file.type.startsWith('image/')) {
      return compressImage(file);
    }
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  const { url } = await res.json();
  return url;
}
