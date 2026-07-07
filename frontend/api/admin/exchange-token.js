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

  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  try {
    const storefrontRes = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({
        query: `query getCustomer($customerAccessToken: String!) {
          customer(customerAccessToken: $customerAccessToken) {
            email
          }
        }`,
        variables: { customerAccessToken }
      })
    });

    const data = await storefrontRes.json();
    const customerEmail = data.data?.customer?.email;

    if (customerEmail && customerEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const token = createSessionToken(ADMIN_EMAIL);
      return res.status(200).json({ success: true, token, email: ADMIN_EMAIL });
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('[Token Exchange] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
