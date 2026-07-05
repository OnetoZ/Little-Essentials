import crypto from 'crypto';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'change-me';
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('hex');
}

/**
 * Create a stateless session token: base64(payload).hmac
 */
export function createSessionToken(email) {
  const payload = { email, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

/**
 * Verify a session token. Returns the payload if valid, else null.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  const [payloadB64, sig] = token.split('.');
  const expected = sign(payloadB64);

  // Constant-time compare
  const a = Buffer.from(sig || '', 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract + verify the bearer token from a request. Returns payload or null.
 */
export function requireAdmin(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  return verifySessionToken(token);
}
