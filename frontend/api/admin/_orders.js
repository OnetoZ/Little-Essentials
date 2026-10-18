// import { getShopifyAccessToken } from '../_utils/shopifyToken.js';
import { requireAdmin } from '../_utils/adminAuth.js';
// import { normalizeAdminOrder } from '../_utils/orders.js';

// const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

/*
// ── Shopify GraphQL Admin Orders Query (Commented Out) ────────────────
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
// ──────────────────────────────────────────────────────────────────────
*/

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

  // Shopify Admin API call commented out - return mock orders list
  const mockOrders = [
    {
      id: '1001',
      name: '#1001',
      createdAt: new Date().toISOString(),
      financialStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      note: 'Razorpay Order ID: order_mock123',
      tags: [],
      total: 1800,
      currency: 'INR',
      customer: {
        name: 'Demo Collector',
        email: 'demo@littleessentials.in',
        phone: '+91 98765 43210',
      },
      shippingAddress: {
        address1: '12 Koregaon Park Road',
        city: 'Pune',
        province: 'Maharashtra',
        zip: '411001',
      },
      items: [
        {
          title: 'Cypress & Fir Ceramic Candle',
          quantity: 1,
          variantTitle: 'Default',
          price: 1800,
          image: 'https://images.unsplash.com/photo-1602928298849-325cec8771cc?w=800&q=85',
        },
      ],
    },
  ];

  return res.status(200).json({
    orders: mockOrders,
    pageInfo: { hasNextPage: false, endCursor: null },
  });

  /*
  // ── Shopify Query Execution (Commented Out) ───────────────────────
  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  let accessToken = getShopifyAccessToken();
  const response = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, ...);
  // ──────────────────────────────────────────────────────────────────
  */
}
