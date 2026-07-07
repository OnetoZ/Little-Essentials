import { getShopifyAccessToken } from '../_utils/shopifyToken.js';
import { requireAdmin } from '../_utils/adminAuth.js';
import { normalizeAdminOrder } from '../_utils/orders.js';

const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

const ORDERS_QUERY = `
  query getOrders($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          note
          email
          tags
          totalPriceSet { shopMoney { amount currencyCode } }
          shippingAddress {
            name address1 address2 city province zip country phone
          }
          lineItems(first: 20) {
            edges {
              node {
                title
                quantity
                variantTitle
                originalTotalSet { shopMoney { amount } }
                image { url }
              }
            }
          }
        }
      }
    }
  }
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth gate
  const session = requireAdmin(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  let accessToken;
  try {
    accessToken = getShopifyAccessToken();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server configuration error' });
  }
  if (!shopifyDomain) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const first = Math.min(parseInt(req.query.first, 10) || 25, 50);
  const after = req.query.after || null;

  try {
    const response = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: ORDERS_QUERY, variables: { first, after } }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('[Admin Orders] GraphQL error:', JSON.stringify(data.errors));
      return res.status(500).json({ error: 'Error fetching orders' });
    }

    const conn = data.data?.orders;
    const orders = (conn?.edges || []).map(({ node }) => normalizeAdminOrder(node));

    return res.status(200).json({
      orders,
      pageInfo: conn?.pageInfo || { hasNextPage: false, endCursor: null },
    });
  } catch (error) {
    console.error('[Admin Orders] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
