import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function domainToBrandName(domain: string): string {
  // e.g. "acme-studio.com" → "Acme Studio"
  const base = domain.split('.')[0];
  return base
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function extractBrandFromUrl(url: string): Promise<{
  logo: string | null;
  brandName: string;
  colors: string[];
} | null> {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const brandName = domainToBrandName(domain);
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    const response = await fetch(logoUrl, { method: 'HEAD' });
    if (!response.ok) {
      return { logo: null, brandName, colors: [] };
    }

    // Dynamically import color extraction to keep initial bundle lean
    const { extractDominantColors } = await import('./colorUtils');
    const colors = await extractDominantColors(logoUrl, 4);

    return { logo: logoUrl, brandName, colors };
  } catch (error) {
    console.error('Error extracting brand:', error);
    return null;
  }
}

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
