import Razorpay from 'razorpay';

let razorpayClient = null;

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


  // Handle environment setup issues
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay credentials missing in environment');
    return res.status(401).json({ error: 'Unauthorized: Razorpay credentials missing' });
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  
  try {
    const { amount, currency, receipt } = req.body || {};

    // Validate amount
    if (amount === undefined || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum amount is 100 paise (₹1).' });
    }

    const options = {
      amount: Math.round(amount), // must be integer paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpayClient.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    // If it's an authentication error with Razorpay
    if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR' && error.error.description.includes('API key'))) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Razorpay Key or Secret' });
    }
    return res.status(500).json({ error: error.message || 'Internal server error while creating order' });
  }
}
