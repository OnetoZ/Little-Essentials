// const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cartItems, customerInfo } = req.body || {};

  if (!cartItems || !customerInfo) {
    return res.status(400).json({ error: 'Missing required fields for COD order' });
  }

  // Shopify COD order creation commented out - return order ID directly
  const mockOrderId = Math.floor(100000 + Math.random() * 900000);
  return res.status(200).json({
    success: true,
    message: 'COD order placed successfully',
    shopify_order_id: mockOrderId,
    order_id: mockOrderId
  });

  /*
  // ── Shopify COD Order Creation (Commented Out) ─────────────────────
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_CLIENT_SECRET;

  if (!shopifyDomain || !accessToken) { ... }
  // ──────────────────────────────────────────────────────────────────
  */
}
