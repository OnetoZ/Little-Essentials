import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the serverless handlers directly to prevent logic duplication
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';
import createCodOrderHandler from './api/create-cod-order.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Express adapter to run Vercel serverless handlers locally
const expressToVercel = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('Express wrapper caught error:', err);
      res.status(500).json({ error: 'Internal server error in handler' });
    }
  };
};

// Define endpoints matching Vercel's path mapping
app.post('/api/create-order', expressToVercel(createOrderHandler));
app.post('/api/verify-payment', expressToVercel(verifyPaymentHandler));
app.post('/api/create-cod-order', expressToVercel(createCodOrderHandler));

// Health / diagnostics endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    keysConfigured: {
      keyId: !!process.env.RAZORPAY_KEY_ID,
      keySecret: !!process.env.RAZORPAY_KEY_SECRET,
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Local Express server running at http://localhost:${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});
