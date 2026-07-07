import { getShopifyAccessToken } from '../utils/shopifyToken.js';
import { requireAdmin } from '../utils/adminAuth.js';

const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

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

  // Ensure orderId is a proper Shopify global ID
  const globalOrderId = String(orderId).includes('gid://') 
    ? String(orderId) 
    : `gid://shopify/Order/${orderId}`;

  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const accessToken = getShopifyAccessToken();

  if (!shopifyDomain || !accessToken) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // 1. Get the fulfillment order ID
    const getFoQuery = `
      query getFulfillmentOrder($orderId: ID!) {
        order(id: $orderId) {
          fulfillmentOrders(first: 10) {
            edges {
              node {
                id
                status
              }
            }
          }
        }
      }
    `;

    const foRes = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: getFoQuery, variables: { orderId: globalOrderId } }),
    });

    const foData = await foRes.json();
    if (foData.errors) {
      const isAccessDenied = foData.errors.some(e => 
        e.extensions?.code === 'ACCESS_DENIED' || 
        e.message?.toLowerCase().includes('access denied')
      );
      if (isAccessDenied) {
        console.log('[Ship Order] Access denied for fulfillmentOrders. Falling back to tag-based shipment.');
        const fallbackSuccess = await fallbackTagOrder(shopifyDomain, accessToken, ADMIN_API_VERSION, globalOrderId);
        if (fallbackSuccess) {
          return res.status(200).json({ success: true, method: 'tag' });
        }
        return res.status(500).json({ error: 'Fulfillment access denied, and fallback tagging failed.' });
      }
      console.error('[Ship Order] getFo error:', JSON.stringify(foData.errors));
      return res.status(500).json({ error: 'Failed to fetch fulfillment order' });
    }

    const fos = foData.data?.order?.fulfillmentOrders?.edges || [];
    const openFo = fos.find(fo => ['OPEN', 'IN_PROGRESS'].includes(fo.node.status));

    if (!openFo) {
      return res.status(400).json({ error: 'No open fulfillment orders found for this order' });
    }

    const fulfillmentOrderId = openFo.node.id;

    // 2. Fulfill the order
    const fulfillMutation = `
      mutation createFulfillment($fulfillmentOrderId: ID!) {
        fulfillmentCreateV2(fulfillment: {
          lineItemsByFulfillmentOrder: [{
            fulfillmentOrderId: $fulfillmentOrderId
          }]
        }) {
          fulfillment { id status }
          userErrors { field message }
        }
      }
    `;

    const fRes = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: fulfillMutation, variables: { fulfillmentOrderId } }),
    });

    const fData = await fRes.json();
    if (fData.errors) {
      const isAccessDenied = fData.errors.some(e => 
        e.extensions?.code === 'ACCESS_DENIED' || 
        e.message?.toLowerCase().includes('access denied')
      );
      if (isAccessDenied) {
        console.log('[Ship Order] Access denied for fulfillment creation. Falling back to tag-based shipment.');
        const fallbackSuccess = await fallbackTagOrder(shopifyDomain, accessToken, ADMIN_API_VERSION, globalOrderId);
        if (fallbackSuccess) {
          return res.status(200).json({ success: true, method: 'tag' });
        }
        return res.status(500).json({ error: 'Fulfillment access denied, and fallback tagging failed.' });
      }
      console.error('[Ship Order] fulfill error:', JSON.stringify(fData.errors));
      return res.status(500).json({ error: 'Error fulfilling order' });
    }

    const userErrors = fData.data?.fulfillmentCreateV2?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error('[Ship Order] User errors:', userErrors);
      return res.status(400).json({ error: userErrors[0].message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Ship Order] internal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function fallbackTagOrder(shopifyDomain, accessToken, apiVersion, orderId) {
  const mutation = `
    mutation tagsAdd($id: ID!, $tags: [String!]!) {
      tagsAdd(id: $id, tags: $tags) {
        node {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${shopifyDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ 
        query: mutation, 
        variables: { 
          id: orderId,
          tags: ["shipped"]
        } 
      }),
    });

    const data = await res.json();
    if (data.errors || (data.data?.tagsAdd?.userErrors && data.data.tagsAdd.userErrors.length > 0)) {
      console.error('[Ship Order Fallback] Tag update failed:', JSON.stringify(data.errors || data.data.tagsAdd.userErrors));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Ship Order Fallback] Network/Internal error:', err);
    return false;
  }
}
