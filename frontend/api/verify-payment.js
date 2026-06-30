import crypto from 'crypto';

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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, customerInfo, totalAmount } = req.body || {};

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

    if (generated_signature === razorpay_signature) {
      console.log('[Shopify] Signature verified. Starting order creation...');
      console.log('[Shopify] cartItems received:', JSON.stringify(cartItems));
      console.log('[Shopify] customerInfo received:', JSON.stringify(customerInfo));

      // Signature is valid. Create Shopify Order.
      const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
      const clientId = process.env.SHOPIFY_CLIENT_ID;
      const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

      console.log('[Shopify] Domain:', shopifyDomain);
      console.log('[Shopify] ClientID set:', !!clientId);
      console.log('[Shopify] ClientSecret set:', !!clientSecret);
      
      let shopify_order_id = null;

      if (shopifyDomain && clientId && clientSecret && cartItems && customerInfo) {
        try {
          // 1. Get OAuth Access Token
          const tokenRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'client_credentials'
            })
          });
          
          if (!tokenRes.ok) {
            console.error('Failed to get Shopify token:', await tokenRes.text());
          } else {
            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;
            
            // 2. Format Order Data
            const line_items = cartItems.map(item => {
              // Parse global ID to numeric ID if it's a gid
              let variant_id = item.id;
              if (typeof variant_id === 'string' && variant_id.includes('gid://')) {
                const parts = variant_id.split('/');
                variant_id = parts[parts.length - 1];
              }
              return {
                variant_id: variant_id,
                title: item.name || item.title || 'Product',
                quantity: item.qty,
                price: String(item.price)  // Shopify requires price as string
              };
            });
            console.log('[Shopify] Line items to create:', JSON.stringify(line_items));
            
            const orderPayload = {
              order: {
                email: customerInfo.email,
                financial_status: "paid",
                send_receipt: true,
                note: `Razorpay Order ID: ${razorpay_order_id}`,
                line_items: line_items,
                shipping_address: {
                  first_name: customerInfo.firstName,
                  last_name: customerInfo.lastName,
                  address1: customerInfo.address,
                  address2: customerInfo.address2 || "",
                  city: customerInfo.city,
                  province: customerInfo.state,
                  zip: customerInfo.pincode,
                  country: "IN",
                  phone: customerInfo.phone || ""
                }
              }
            };
            
            // 3. Create Order
            const orderRes = await fetch(`https://${shopifyDomain}/admin/api/2024-01/orders.json`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
              },
              body: JSON.stringify(orderPayload)
            });
            
            if (orderRes.ok) {
              const orderDataResp = await orderRes.json();
              shopify_order_id = orderDataResp.order.id || orderDataResp.order.name;
              console.log('Successfully created Shopify order:', shopify_order_id);
            } else {
              console.error('Failed to create Shopify order:', await orderRes.text());
            }
          }
        } catch (shopifyErr) {
          console.error('Shopify Order Creation Error:', shopifyErr);
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Payment verified successfully',
        shopify_order_id: shopify_order_id
      });
    } else {
      return res.status(400).json({ success: false, error: 'Payment signature mismatch' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during verification' });
  }
}
