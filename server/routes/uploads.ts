import { Hono } from 'hono';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';
import fs from 'fs';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const UPLOAD_DIR = './uploads';

// Garante que a pasta de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const router = new Hono<Env>();

// POST /api/upload — salva arquivo no disco local
router.post('/', requireAuth, async (c) => {
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: 'Requisição inválida' }, 400);
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return c.json({ error: 'Nenhum arquivo enviado' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: 'Tipo de arquivo não permitido' }, 400);
  }

  const buffer = await file.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) {
    return c.json({ error: 'Arquivo maior que 20MB' }, 400);
  }

  const dotIndex = file.name.lastIndexOf('.');
  const ext = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';
  const key = `${crypto.randomUUID()}${ext}`;

  const filePath = path.join(UPLOAD_DIR, key);
  fs.writeFileSync(filePath, Buffer.from(buffer));

  return c.json({ url: `/uploads/${key}` });
});

export default router;
