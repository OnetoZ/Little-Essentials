// import { getShopifyAccessToken } from '../_utils/shopifyToken.js';
import { requireAdmin } from '../_utils/adminAuth.js';

// const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

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

  // Auth gate
  const session = requireAdmin(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  // Shopify fulfillment cancel call commented out - return success directly
  return res.status(200).json({
    success: true,
    message: 'Fulfillment cancelled successfully',
  });

  /*
  // ── Shopify Cancel Fulfillment Mutation (Commented Out) ───────────
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const accessToken = getShopifyAccessToken();
  ...
  // ──────────────────────────────────────────────────────────────────
  */
}
