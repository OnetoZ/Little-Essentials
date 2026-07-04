import crypto from 'crypto';
import { getShopifyAccessToken } from './utils/shopifyToken.js';

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

    try {
      // 1. Build GraphQL line items directly using GIDs
      const lineItems = cartItems.map(item => {
        let variantId = item.id;

        // Fallback for ProductCard which might still add product ID instead of variant ID
        if (!String(variantId).includes('gid://') && item.variantNodes && item.variantNodes.length > 0) {
          variantId = item.variantNodes[0].id;
        }

        // Must ensure it is a valid gid:// string for ProductVariant
        if (!String(variantId).includes('ProductVariant')) {
          if (typeof variantId === 'number' || !isNaN(Number(variantId))) {
            variantId = `gid://shopify/ProductVariant/${variantId}`;
          }
        }

        return {
          variantId: variantId,
          quantity: item.qty || 1
        };
      });

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
        }
      };

      if (parsedCustomerId) {
        variables.order.customerId = parsedCustomerId;
      }

      // 4. GraphQL Mutation
      const mutation = `
        mutation orderCreate($order: OrderCreateOrderInput!) {
          orderCreate(order: $order) {
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

      // 5. Execute Request against Spring '26 GraphQL Admin API
      const orderRes = await fetch(`https://${shopifyDomain}/admin/api/2024-01/graphql.json`, {
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
      } else if (orderDataResp.data?.orderCreate?.userErrors?.length > 0) {
        console.error('[Shopify] GraphQL User Errors:', JSON.stringify(orderDataResp.data.orderCreate.userErrors, null, 2));
      } else if (orderDataResp.data?.orderCreate?.order) {
        // Successfully created! Extract the legacy numeric ID for frontend routing if needed
        const fullGid = orderDataResp.data.orderCreate.order.id; // gid://shopify/Order/123456
        shopify_order_id = fullGid.split('/').pop();
        console.log('[Shopify] Successfully created order:', shopify_order_id);
      } else {
        console.error('[Shopify] Unknown GraphQL response:', JSON.stringify(orderDataResp, null, 2));
      }

    } catch (shopifyErr) {
      console.error('[Shopify] Order Creation Error:', shopifyErr);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Payment verified successfully',
      shopify_order_id: shopify_order_id
    });

  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during verification' });
  }
}
