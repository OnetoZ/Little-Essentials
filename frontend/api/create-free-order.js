// import { getShopifyAccessToken } from './_utils/shopifyToken.js';
// import { buildOrderLineItems } from './_utils/orders.js';

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

  const { cartItems } = req.body || {};

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    const mockId = String(Math.floor(100000 + Math.random() * 900000));
    return res.status(200).json({
      success: true,
      message: 'Free order created successfully',
      shopify_order_id: mockId,
      order_id: mockId
    });

    /*
    // ── Shopify Free Order Creation (Commented Out) ───────────────────
    console.log('[Shopify] Creating free order...');
    const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    let accessToken;
    try {
      accessToken = getShopifyAccessToken();
    } catch (tokenErr) {
      console.warn('[Shopify] Token unavailable:', tokenErr.message);
    }

    if (!shopifyDomain || !accessToken) {
      console.warn('[Shopify] Missing domain or token, returning mock free order');
      const mockId = String(Math.floor(100000 + Math.random() * 900000));
      return res.status(200).json({
        success: true,
        message: 'Free order created successfully (mock fallback)',
        shopify_order_id: mockId
      });
    }

    let shopify_order_id = null;
    let shopify_error = null;

    const lineItems = buildOrderLineItems(cartItems);

    let parsedCustomerId = null;
    if (customerId) {
      parsedCustomerId = customerId;
      if (!String(parsedCustomerId).includes('gid://')) {
        parsedCustomerId = `gid://shopify/Customer/${parsedCustomerId}`;
      }
    }

    const variables = {
      order: {
        email: customerInfo.email,
        financialStatus: 'PAID',
        note: `Free Order`,
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
      options: {
        inventoryBehaviour: 'DECREMENT_OBEYING_POLICY',
        sendReceipt: true
      }
    };

    if (parsedCustomerId) {
      variables.order.customerId = parsedCustomerId;
    }

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
    if (orderDataResp.data?.orderCreate?.order) {
      const fullGid = orderDataResp.data.orderCreate.order.id;
      shopify_order_id = fullGid.split('/').pop();
    }
    // ──────────────────────────────────────────────────────────────────
    */

  } catch (error) {
    console.error('Error creating free order:', error.message);
    const mockId = String(Math.floor(100000 + Math.random() * 900000));
    return res.status(200).json({
      success: true,
      message: 'Free order created successfully',
      shopify_order_id: mockId,
      order_id: mockId
    });
  }
}
