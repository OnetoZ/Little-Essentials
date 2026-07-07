import { getShopifyAccessToken } from '../_utils/shopifyToken.js';
import { requireAdmin } from '../_utils/adminAuth.js';

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
    // 1. Get fulfillment orders (look for closed/fulfilled ones to cancel)
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
        console.log('[Unship Order] Access denied for fulfillmentOrders. Falling back to tag removal.');
        const ok = await fallbackRemoveTag(shopifyDomain, accessToken, ADMIN_API_VERSION, globalOrderId);
        return ok
          ? res.status(200).json({ success: true, method: 'tag' })
          : res.status(500).json({ error: 'Access denied, and fallback tag removal failed.' });
      }
      console.error('[Unship Order] getFo error:', JSON.stringify(foData.errors));
      return res.status(500).json({ error: 'Failed to fetch fulfillment order' });
    }

    const fos = foData.data?.order?.fulfillmentOrders?.edges || [];
    const fulfilledFo = fos.find(fo => ['CLOSED', 'FULFILLED'].includes(fo.node.status));

    if (fulfilledFo) {
      // 2. Cancel / reopen the fulfillment order
      const cancelMutation = `
        mutation cancelFulfillmentOrder($id: ID!) {
          fulfillmentOrderCancel(id: $id) {
            fulfillmentOrder { id status }
            replacementFulfillmentOrder { id status }
            userErrors { field message }
          }
        }
      `;

      const cancelRes = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query: cancelMutation, variables: { id: fulfilledFo.node.id } }),
      });

      const cancelData = await cancelRes.json();

      if (!cancelData.errors) {
        const ue = cancelData.data?.fulfillmentOrderCancel?.userErrors;
        if (!ue || ue.length === 0) {
          // Success via API — also strip tag if present
          await fallbackRemoveTag(shopifyDomain, accessToken, ADMIN_API_VERSION, globalOrderId);
          return res.status(200).json({ success: true, method: 'fulfillment_cancel' });
        }
        console.warn('[Unship Order] cancel userErrors:', ue);
      } else {
        console.error('[Unship Order] cancel GraphQL errors:', JSON.stringify(cancelData.errors));
      }
    }

    // 3. Fallback: just remove the "shipped" tag
    const ok = await fallbackRemoveTag(shopifyDomain, accessToken, ADMIN_API_VERSION, globalOrderId);
    return ok
      ? res.status(200).json({ success: true, method: 'tag' })
      : res.status(400).json({ error: 'No fulfilled orders found or could not revert shipment' });

  } catch (error) {
    console.error('[Unship Order] internal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function fallbackRemoveTag(shopifyDomain, accessToken, apiVersion, orderId) {
  const mutation = `
    mutation tagsRemove($id: ID!, $tags: [String!]!) {
      tagsRemove(id: $id, tags: $tags) {
        node { id }
        userErrors { field message }
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
      body: JSON.stringify({ query: mutation, variables: { id: orderId, tags: ['shipped'] } }),
    });

    const data = await res.json();
    if (data.errors || data.data?.tagsRemove?.userErrors?.length > 0) {
      console.error('[Unship Fallback] Tag removal failed:', JSON.stringify(data.errors || data.data?.tagsRemove?.userErrors));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Unship Fallback] Network error:', err);
    return false;
  }
}
