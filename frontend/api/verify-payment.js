import crypto from 'crypto';
import { getShopifyAccessToken } from './utils/shopifyToken.js';
import { buildOrderLineItems } from './utils/orders.js';

const ADMIN_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION_ADMIN || '2025-07';

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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, customerInfo, customerId } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required signature verification fields' });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    console.error('Razorpay secret missing in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment signature mismatch' });
    }

    console.log('[Shopify] Signature verified. Starting order creation...');
    
    // Shopify Spring '26 GraphQL Architecture with programmatic credentials
    const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    let accessToken;
    
    try {
      accessToken = getShopifyAccessToken();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server configuration error: Failed to obtain Admin API token.' });
    }

    if (!shopifyDomain) {
      console.error('[Shopify] Missing VITE_SHOPIFY_STORE_DOMAIN in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Missing Domain.' });
    }

    let shopify_order_id = null;
    let shopify_error = null;

    try {
      // 1. Build GraphQL line items using tested variant-GID resolution.
      const lineItems = buildOrderLineItems(cartItems);

      console.log('[Shopify] GraphQL Line items to create:', JSON.stringify(lineItems));

      // 2. Parse customer ID as GID
      let parsedCustomerId = null;
      if (customerId) {
        parsedCustomerId = customerId;
        if (!String(parsedCustomerId).includes('gid://')) {
          parsedCustomerId = `gid://shopify/Customer/${parsedCustomerId}`;
        }
      }

      // 3. Build GraphQL Variables
      const variables = {
        order: {
          email: customerInfo.email,
          financialStatus: 'PAID',
          note: `Razorpay Order ID: ${razorpay_order_id}`,
          lineItems: lineItems,
          shippingAddress: {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            address1: customerInfo.address,
            address2: customerInfo.address2 || "",
            city: customerInfo.city,
            province: customerInfo.state,
            zip: customerInfo.pincode,
            countryCode: "IN",
            phone: customerInfo.phone || ""
          }
        },
        // DECREMENT_OBEYING_POLICY reduces stock on purchase (respects
        // each variant's "continue selling when out of stock" policy).
        options: {
          inventoryBehaviour: 'DECREMENT_OBEYING_POLICY',
          sendReceipt: true
        }
      };

      if (parsedCustomerId) {
        variables.order.customerId = parsedCustomerId;
      }

      // 4. GraphQL Mutation
      const mutation = `
        mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
          orderCreate(order: $order, options: $options) {
            order {
              id
              name
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      // 5. Execute Request against the GraphQL Admin API
      const orderRes = await fetch(`https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        })
      });

      const orderDataResp = await orderRes.json();
      
      if (orderDataResp.errors) {
        console.error('[Shopify] GraphQL Request Errors:', JSON.stringify(orderDataResp.errors, null, 2));
        shopify_error = orderDataResp.errors.map((e) => e.message).join(', ');
      } else if (orderDataResp.data?.orderCreate?.userErrors?.length > 0) {
        console.error('[Shopify] GraphQL User Errors:', JSON.stringify(orderDataResp.data.orderCreate.userErrors, null, 2));
        shopify_error = orderDataResp.data.orderCreate.userErrors.map((e) => e.message).join(', ');
      } else if (orderDataResp.data?.orderCreate?.order) {
        // Successfully created! Extract the legacy numeric ID for frontend routing.
        const fullGid = orderDataResp.data.orderCreate.order.id; // gid://shopify/Order/123456
        shopify_order_id = fullGid.split('/').pop();
        console.log('[Shopify] Successfully created order:', shopify_order_id);
      } else {
        console.error('[Shopify] Unknown GraphQL response:', JSON.stringify(orderDataResp, null, 2));
        shopify_error = 'Unknown Shopify response';
      }

    } catch (shopifyErr) {
      console.error('[Shopify] Order Creation Error:', shopifyErr);
      shopify_error = shopifyErr.message || 'Shopify order creation failed';
    }

    // Payment is verified regardless, but flag order-creation failures so the
    // frontend never routes to a non-existent tracking page.
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order_created: Boolean(shopify_order_id),
      shopify_order_id: shopify_order_id,
      shopify_error: shopify_error
    });

  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during verification' });
  }
}
