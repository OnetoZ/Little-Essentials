import { createSessionToken } from '../_utils/adminAuth.js';

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

  const { customerAccessToken } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!ADMIN_EMAIL || !customerAccessToken) {
    return res.status(400).json({ error: 'Missing token or config' });
  }

  // Shopify Storefront token exchange fetch commented out
  const token = createSessionToken(ADMIN_EMAIL);
  return res.status(200).json({ success: true, token, email: ADMIN_EMAIL });

  /*
  // ── Shopify Storefront Token Exchange (Commented Out) ─────────────
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  const storefrontRes = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, ...);
  // ──────────────────────────────────────────────────────────────────
  */
}
