import { getShopifyAccessToken } from '../utils/shopifyToken.js';
import { isNumericOrderId } from '../utils/orders.js';

const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing order ID parameter' });
  }

  // Tracking ids are numeric Shopify order ids. Reject anything else early
  // (e.g. a Razorpay order id) so we don't build an invalid Order GID.
  if (!isNumericOrderId(id)) {
    return res.status(404).json({ error: 'Order not found' });
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

  try {
    // We expect the ID to be the numeric ID from the URL (e.g. /order/123/track)
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

    const response = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { id: orderGid }
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('[Shopify Order] GraphQL Error:', data.errors);
      return res.status(500).json({ error: 'Error fetching order' });
    }

    if (!data.data.order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(data.data.order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
