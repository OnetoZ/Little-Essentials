import crypto from 'crypto';
import { createSessionToken } from '../_utils/adminAuth.js';

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('[Admin] ADMIN_EMAIL / ADMIN_PASSWORD not configured');
    return res.status(500).json({ error: 'Admin login not configured on server' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailOk = safeEqual(String(email).trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const passOk = safeEqual(password, ADMIN_PASSWORD);

  if (!emailOk || !passOk) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = createSessionToken(ADMIN_EMAIL);
  return res.status(200).json({ success: true, token, email: ADMIN_EMAIL });
}
