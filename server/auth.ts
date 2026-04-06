import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import type { Context } from 'hono';
import type { Env } from './types.js';

const COOKIE_NAME = 'naka_token';
const TOKEN_TTL   = 30 * 24 * 60 * 60; // 30 dias em segundos

// ── Middleware de autenticação ────────────────────────────────────────────────
export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256') as { userId: string; role: string; orgId: string };
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    c.set('orgId', payload.orgId ?? '');
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// ── Helpers de token/cookie ───────────────────────────────────────────────────
export async function setToken(c: Context<Env>, userId: string, role: string, orgId: string) {
  const exp   = Math.floor(Date.now() / 1000) + TOKEN_TTL;
  const token = await sign({ userId, role, orgId, exp }, c.env.JWT_SECRET, 'HS256');
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure:   true,
    sameSite: 'None',   // necessário para cross-domain (Pages ↔ Worker)
    maxAge:   TOKEN_TTL,
    path:     '/',
  });
}

export function clearToken(c: Context<Env>) {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
}
