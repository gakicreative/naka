import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressImage } from './utils';

const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

/**
 * Upload a file and return its public URL.
 * In mock mode, compresses images to a data URL; other files become object URLs.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (MOCK) {
    if (file.type.startsWith('image/')) {
      return compressImage(file);
    }
    return URL.createObjectURL(file);
  }
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
