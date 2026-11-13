const express = require('express');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('../config/db');
const {
  findOrderByNumber,
  findOrderByRazorpayOrderId,
  setOrderRazorpayDetails,
  markOrderPaidAndDeductInventory,
} = require('../models/Order');
const {
  getRazorpayInstance,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../services/razorpay');
const { sendOrderConfirmationEmail } = require('../services/email');
const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment requests. Please try again shortly.',
  },
});

/**
 * 1. Create Razorpay Order
 * POST /api/payments/create-order
 */
router.post('/create-order', paymentLimiter, authenticateCustomer, async (req, res, next) => {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Order number is required',
        code: 'MISSING_ORDER_NUMBER',
      });
    }

    const order = await findOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }

    if (order.customerId !== req.customer.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pay for this order',
        code: 'UNAUTHORIZED_ORDER_ACCESS',
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid',
        code: 'ORDER_ALREADY_PAID',
      });
    }

    const amountInPaise = Math.round(Number(order.total) * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount for online payment',
        code: 'INVALID_ORDER_AMOUNT',
      });
    }

    const razorpay = getRazorpayInstance();

    // Prevent creating multiple Razorpay orders for the same pending order
    if (order.razorpayOrderId) {
      try {
        const existingOrder = await razorpay.orders.fetch(order.razorpayOrderId);
        if (existingOrder && existingOrder.status !== 'paid' && existingOrder.amount === amountInPaise) {
          return res.json({
            success: true,
            order_id: existingOrder.id,
            amount: existingOrder.amount,
            currency: existingOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
          });
        }
      } catch (fetchErr) {
        // If fetch failed or order expired on Razorpay, proceed to create a new one
        console.warn('Could not reuse existing Razorpay order, creating fresh order:', fetchErr.message);
      }
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderNumber: order.orderNumber,
        customerId: req.customer.id,
      },
    });

    await setOrderRazorpayDetails(order.orderNumber, razorpayOrder.id);

    return res.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 2. Verify Razorpay Payment
 * POST /api/payments/verify
 */
router.post('/verify', paymentLimiter, authenticateCustomer, async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields',
        code: 'MISSING_PAYMENT_FIELDS',
      });
    }

    const order = await findOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }

    if (order.customerId !== req.customer.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify payment for this order',
        code: 'UNAUTHORIZED_ORDER_ACCESS',
      });
    }

    // Verify razorpay order ID matches stored order ID
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order ID mismatch',
        code: 'ORDER_ID_MISMATCH',
      });
    }

    // Verify payment signature using HMAC SHA256 timingSafeEqual
    const isValidSignature = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
        code: 'INVALID_PAYMENT_SIGNATURE',
      });
    }

    // Fetch verified payment details from Razorpay using server credentials
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'Payment details could not be retrieved from gateway',
        code: 'GATEWAY_PAYMENT_NOT_FOUND',
      });
    }

    // Verify payment order ID
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment does not belong to the requested order',
        code: 'PAYMENT_ORDER_MISMATCH',
      });
    }

    // Verify expected amount in paise
    const expectedAmountPaise = Math.round(Number(order.total) * 100);
    if (Number(payment.amount) !== expectedAmountPaise) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch between gateway and recorded order',
        code: 'AMOUNT_MISMATCH',
      });
    }

    // Verify currency
    if (payment.currency !== 'INR') {
      return res.status(400).json({
        success: false,
        message: 'Currency mismatch',
        code: 'CURRENCY_MISMATCH',
      });
    }

    // Verify payment capture status
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${payment.status}`,
        code: 'PAYMENT_NOT_CAPTURED',
      });
    }

    // Mark paid and safely deduct inventory atomically & idempotently
    const { order: updatedOrder, alreadyPaid, inventoryDeductionSuccess } =
      await markOrderPaidAndDeductInventory(order.orderNumber, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        method: payment.method || 'razorpay',
      });

    // Send confirmation email asynchronously to both customer and admin
    if (!alreadyPaid) {
      sendOrderConfirmationEmail({
        order: updatedOrder,
        paymentId: razorpay_payment_id,
      }).catch((err) => {
        console.error('[EMAIL BACKGROUND ERROR]', err.message);
      });
    }

    return res.json({
      success: true,
      message: alreadyPaid ? 'Order was already verified as paid' : 'Payment verified successfully',
      order_id: updatedOrder.orderNumber,
      orderNumber: updatedOrder.orderNumber,
      paymentId: razorpay_payment_id,
      order: updatedOrder,
      inventoryDeductionSuccess,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 3. Free Order Confirmation (Server-validated total MUST be genuinely 0)
 * POST /api/payments/free-order
 */
router.post('/free-order', paymentLimiter, authenticateCustomer, async (req, res, next) => {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required',
        code: 'MISSING_ORDER_NUMBER',
      });
    }

    const order = await findOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }

    if (order.customerId !== req.customer.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized order access',
        code: 'UNAUTHORIZED_ORDER_ACCESS',
      });
    }

    // Server-side calculated total MUST be genuinely 0
    if (Number(order.total) !== 0) {
      return res.status(400).json({
        success: false,
        message: 'This order has a non-zero total and requires online payment',
        code: 'NON_ZERO_TOTAL',
      });
    }

    const { order: updatedOrder, alreadyPaid } = await markOrderPaidAndDeductInventory(order.orderNumber, {
      razorpayOrderId: null,
      razorpayPaymentId: `free_${Date.now()}`,
      method: 'free_promotional',
    });

    if (!alreadyPaid) {
      sendOrderConfirmationEmail({
        order: updatedOrder,
        paymentId: 'PROMOTIONAL_FREE',
      }).catch((err) => {
        console.error('[EMAIL BACKGROUND ERROR]', err.message);
      });
    }

    return res.json({
      success: true,
      message: 'Free order confirmed successfully',
      order_id: updatedOrder.orderNumber,
      orderNumber: updatedOrder.orderNumber,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 4. Razorpay Webhook
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody;

  if (!signature || !rawBody) {
    return res.status(400).json({
      success: false,
      message: 'Missing webhook signature or raw body',
    });
  }

  try {
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.warn('Webhook signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }
  } catch (err) {
    console.error('Webhook error during signature check:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Webhook verification service error',
    });
  }

  const event = req.body;
  const eventId = event && event.event_id;

  if (!eventId) {
    return res.status(400).json({
      success: false,
      message: 'Missing event ID',
    });
  }

  try {
    const db = await connectDB();
    const webhookEvents = db.collection('webhookEvents');

    // Check idempotency: if event already processed, acknowledge without re-processing
    const existing = await webhookEvents.findOne({ eventId });
    if (existing) {
      return res.json({ status: 'ok', message: 'Event already processed' });
    }

    // Record webhook event receipt
    await webhookEvents.insertOne({
      eventId,
      event: event.event,
      createdAt: new Date(),
    });

    // Handle payment.captured or order.paid
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await findOrderByRazorpayOrderId(razorpayOrderId);
        if (order && order.paymentStatus !== 'paid') {
          const { order: updatedOrder, alreadyPaid } = await markOrderPaidAndDeductInventory(order.orderNumber, {
            razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || `webhook_${Date.now()}`,
            method: paymentEntity?.method || 'razorpay_webhook',
          });

          if (!alreadyPaid) {
            sendOrderConfirmationEmail({
              order: updatedOrder,
              paymentId: razorpayPaymentId || 'WEBHOOK_CAPTURED',
            }).catch((err) => {
              console.error('[EMAIL BACKGROUND ERROR]', err.message);
            });
          }
        }
      }
    }

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing failure:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

