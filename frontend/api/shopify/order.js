// import { getShopifyAccessToken } from '../_utils/shopifyToken.js';
import { isNumericOrderId } from '../_utils/orders.js';

// const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

function getMockShopifyOrder(id) {
  return {
    id: `gid://shopify/Order/${id}`,
    name: `#${id}`,
    createdAt: new Date().toISOString(),
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'UNFULFILLED',
    totalPriceSet: {
      shopMoney: {
        amount: '1800.00',
      },
    },
    shippingAddress: {
      address1: '12 Koregaon Park Road',
      city: 'Pune',
      province: 'Maharashtra',
      zip: '411001',
    },
    lineItems: {
      edges: [
        {
          node: {
            title: 'Cypress & Fir Ceramic Candle',
            variantTitle: 'Default',
            quantity: 1,
            image: {
              url: 'https://images.unsplash.com/photo-1602928298849-325cec8771cc?w=800&q=85',
            },
            product: {
              id: 'gid://shopify/Product/p002',
              vendor: 'PADDYWAX',
            },
          },
        },
      ],
    },
    fulfillments: [],
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing order ID parameter' });
  }

  // Tracking ids are numeric order ids.
  if (!isNumericOrderId(id)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Shopify Admin API calls commented out - return order data directly
  return res.status(200).json(getMockShopifyOrder(id));

  /*
  // ── Shopify Admin API Query (Commented Out) ───────────────────────
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  let accessToken;

  try {
    accessToken = getShopifyAccessToken();
  } catch (err) {
    console.warn('[Shopify Order] Token not available, returning mock order:', err.message);
    return res.status(200).json(getMockShopifyOrder(id));
  }

  if (!shopifyDomain) {
    return res.status(200).json(getMockShopifyOrder(id));
  }

  try {
    const orderGid = `gid://shopify/Order/${id}`;

    const query = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
            }
          }
          shippingAddress {
            address1
            city
            province
            zip
          }
          lineItems(first: 5) {
            edges {
              node {
                title
                variantTitle
                quantity
                image {
                  url
                }
                product {
                  id
                  vendor
                }
              }
            }
          }
          fulfillments(first: 5) {
            trackingInfo {
              number
              url
              company
            }
            createdAt
            status
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { id: orderGid }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (data.errors || !data.data?.order) {
      console.warn('[Shopify Order] Order not found or GraphQL error, falling back to mock:', data.errors);
      return res.status(200).json(getMockShopifyOrder(id));
    }

    return res.status(200).json(data.data.order);
  } catch (error) {
    console.warn('[Shopify Order] Error fetching order, returning mock order:', error.message);
    return res.status(200).json(getMockShopifyOrder(id));
  }
  // ──────────────────────────────────────────────────────────────────
  */
}
