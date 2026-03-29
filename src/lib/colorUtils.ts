export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rp - k) / (1 - k)) * 100),
    m: Math.round(((1 - gp - k) / (1 - k)) * 100),
    y: Math.round(((1 - bp - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function formatRgb(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '';
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatCmyk(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '';
  const { c, m, y, k } = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  return `C:${c} M:${m} Y:${y} K:${k}`;
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Extract top N dominant colors from an image URL using canvas pixel sampling.
// Returns array of hex color strings. Falls back to [] on error.
export async function extractDominantColors(imageUrl: string, count = 4): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 80; // sample at 80×80 for performance
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve([]); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Collect non-transparent, non-white, non-black pixels
        const pixels: [number, number, number][] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue; // skip transparent
          const brightness = (r + g + b) / 3;
          if (brightness > 240 || brightness < 15) continue; // skip near-white and near-black
          pixels.push([r, g, b]);
        }

        if (pixels.length === 0) { resolve([]); return; }

        // Simple k-means-like clustering: greedily pick centers far from each other
        const centers: [number, number, number][] = [];
        const TOLERANCE = 60;

        for (const px of pixels) {
          const tooClose = centers.some(c => colorDistance(px[0], px[1], px[2], c[0], c[1], c[2]) < TOLERANCE);
          if (!tooClose) {
            centers.push(px);
            if (centers.length >= count) break;
          }
        }

        resolve(centers.map(([r, g, b]) => rgbToHex(r, g, b)));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}
