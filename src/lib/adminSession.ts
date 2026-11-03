import { createHmac, timingSafeEqual } from 'node:crypto';

// Admin login tokens: base64url(JSON payload) + "." + HMAC-SHA256 signature,
// signed with ADMIN_SECRET. Changing ADMIN_SECRET logs everyone out.
const SESSION_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createAdminToken(username: string): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not set');

  const payload = Buffer.from(
    JSON.stringify({ sub: username, exp: Date.now() + SESSION_LENGTH_MS })
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}
