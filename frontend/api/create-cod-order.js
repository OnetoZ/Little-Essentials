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

  const { cartItems, customerInfo, customerId, totalAmount } = req.body || {};

  if (!cartItems || !customerInfo) {
    return res.status(400).json({ error: 'Missing required fields for COD order' });
  }

  const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  // Use the Admin API access token (shpat_...) from the Custom App in Shopify Admin.
  // Go to: Settings → Apps → Develop apps → Your App → API credentials → Reveal token
  const accessToken = process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_CLIENT_SECRET;

  if (!shopifyDomain || !accessToken) {
    console.error('[COD] Missing Shopify env vars');
    return res.status(500).json({ error: 'Server configuration error for Shopify' });
  }

  try {
    // 1. Build line items — resolve variant ID from gid:// or variantNodes fallback
    const line_items = cartItems.map(item => {
      let raw_id = item.id;

      // ProductCard stores product handle/id (not a variant). Fall back to first variant.
      if (item.variantNodes && item.variantNodes.length > 0) {
        raw_id = item.variantNodes[0].id;
      }

      let variant_id = raw_id;
      if (typeof variant_id === 'string' && variant_id.includes('gid://')) {
        const parts = variant_id.split('/');
        variant_id = Number(parts[parts.length - 1]);
      } else {
        variant_id = Number(variant_id) || null;
      }

      return {
        variant_id,
        title: item.name || item.title || 'Product',
        quantity: item.qty || 1,
        price: String(item.price || 0)
      };
    });

    console.log('[COD] line_items:', JSON.stringify(line_items));

    // 2. Parse customer ID
    let parsedCustomerId = null;
    if (customerId) {
      if (typeof customerId === 'string' && customerId.includes('gid://')) {
        const parts = customerId.split('/');
        parsedCustomerId = Number(parts[parts.length - 1]);
      } else {
        parsedCustomerId = Number(customerId);
      }
    }

    // 3. Build order payload
    const orderPayload = {
      order: {
        email: customerInfo.email,
        financial_status: 'pending',
        send_receipt: true,
        note: 'Cash on Delivery',
        line_items,
        shipping_address: {
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          address1: customerInfo.address,
          address2: customerInfo.address2 || '',
          city: customerInfo.city,
          province: customerInfo.state,
          zip: customerInfo.pincode,
          country: 'IN',
          phone: customerInfo.phone || ''
        }
      }
    };

    if (parsedCustomerId) {
      orderPayload.order.customer = { id: parsedCustomerId };
    }

    console.log('[COD] Sending order payload to Shopify:', JSON.stringify(orderPayload));

    // 4. Create order via Shopify Admin API — use secret directly as access token
    const orderRes = await fetch(`https://${shopifyDomain}/admin/api/2024-01/orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(orderPayload)
    });

    const orderText = await orderRes.text();
    console.log('[COD] Shopify response status:', orderRes.status);
    console.log('[COD] Shopify response body:', orderText);

    if (!orderRes.ok) {
      return res.status(500).json({ error: 'Failed to create Shopify order', details: orderText });
    }

    const orderData = JSON.parse(orderText);
    const shopify_order_id = orderData.order?.id || orderData.order?.name;

    console.log('[COD] Successfully created Shopify COD order:', shopify_order_id);

    return res.status(200).json({
      success: true,
      message: 'COD order placed successfully',
      shopify_order_id
    });

  } catch (err) {
    console.error('[COD] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error while creating COD order' });
  }
}
