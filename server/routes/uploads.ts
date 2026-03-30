import { Hono } from 'hono';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const router = new Hono<Env>();

// POST /api/upload — salva arquivo no R2
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

  await c.env.BUCKET.put(key, buffer, {
    httpMetadata: { contentType: file.type },
  });

  return c.json({ url: `/uploads/${key}` });
});

export default router;
