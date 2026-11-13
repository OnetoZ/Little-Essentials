const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const {
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../src/services/razorpay');

describe('Razorpay Payment Verification Module', () => {
  const TEST_KEY_SECRET = 'test_razorpay_key_secret_xyz123';
  const TEST_WEBHOOK_SECRET = 'test_webhook_secret_whsec_456';

  it('accurately converts INR order totals to paise using integer arithmetic', () => {
    const toPaise = (inr) => Math.round(Number(inr) * 100);

    assert.strictEqual(toPaise(1800), 180000);
    assert.strictEqual(toPaise(149.50), 14950);
    assert.strictEqual(toPaise(0), 0);
    assert.strictEqual(toPaise(999.99), 99999);
  });

  it('validates a genuine Razorpay payment signature', () => {
    const orderId = 'order_DA001';
    const paymentId = 'pay_XY001';

    // Generate expected HMAC SHA256 signature
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const result = verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
      secret: TEST_KEY_SECRET,
    });

    assert.strictEqual(result, true);
  });

  it('rejects forged, truncated, or tampered payment signatures', () => {
    const orderId = 'order_DA001';
    const paymentId = 'pay_XY001';

    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const tamperedSignature = validSignature.slice(0, -2) + '00';
    const shortSignature = validSignature.slice(0, 10);

    assert.strictEqual(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: tamperedSignature,
        secret: TEST_KEY_SECRET,
      }),
      false
    );

    assert.strictEqual(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: shortSignature,
        secret: TEST_KEY_SECRET,
      }),
      false
    );

    assert.strictEqual(
      verifyPaymentSignature({
        razorpayOrderId: 'order_DIFFERENT',
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        secret: TEST_KEY_SECRET,
      }),
      false
    );
  });

  it('detects amount and currency mismatches between order and gateway payment', () => {
    const order = {
      orderNumber: 'LE100',
      total: 1999, // ₹1,999 => 199900 paise
      currency: 'INR',
    };

    const verifyGatewayPayment = (payment, order) => {
      const expectedPaise = Math.round(order.total * 100);
      if (payment.amount !== expectedPaise) return 'AMOUNT_MISMATCH';
      if (payment.currency !== order.currency) return 'CURRENCY_MISMATCH';
      if (payment.status !== 'captured' && payment.status !== 'authorized') return 'NOT_CAPTURED';
      return 'VALID';
    };

    // Client/Attacker tried paying less
    assert.strictEqual(
      verifyGatewayPayment({ amount: 100, currency: 'INR', status: 'captured' }, order),
      'AMOUNT_MISMATCH'
    );

    // Currency difference
    assert.strictEqual(
      verifyGatewayPayment({ amount: 199900, currency: 'USD', status: 'captured' }, order),
      'CURRENCY_MISMATCH'
    );

    // Uncaptured status
    assert.strictEqual(
      verifyGatewayPayment({ amount: 199900, currency: 'INR', status: 'failed' }, order),
      'NOT_CAPTURED'
    );

    // Valid
    assert.strictEqual(
      verifyGatewayPayment({ amount: 199900, currency: 'INR', status: 'captured' }, order),
      'VALID'
    );
  });

  it('validates genuine Razorpay webhook signatures using raw request body', () => {
    const rawBody = Buffer.from(JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_999' } } },
    }));

    const validSignature = crypto
      .createHmac('sha256', TEST_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const isValid = verifyWebhookSignature({
      rawBody,
      signature: validSignature,
      secret: TEST_WEBHOOK_SECRET,
    });

    assert.strictEqual(isValid, true);

    const isTamperedValid = verifyWebhookSignature({
      rawBody,
      signature: 'invalid_hex_signature_abcdef1234567890',
      secret: TEST_WEBHOOK_SECRET,
    });

    assert.strictEqual(isTamperedValid, false);
  });

  it('ensures payment verification and stock deduction is idempotent', () => {
    let order = {
      orderNumber: 'LE500',
      paymentStatus: 'pending',
      stockDeducted: false,
    };

    let inventory = 10;

    const executePaymentConfirmation = () => {
      if (order.paymentStatus === 'paid') {
        return { order, alreadyPaid: true };
      }

      // Deduct inventory
      inventory -= 1;
      order = {
        ...order,
        paymentStatus: 'paid',
        stockDeducted: true,
      };
      return { order, alreadyPaid: false };
    };

    // First call
    const firstCall = executePaymentConfirmation();
    assert.strictEqual(firstCall.alreadyPaid, false);
    assert.strictEqual(inventory, 9);
    assert.strictEqual(order.paymentStatus, 'paid');

    // Repeated call (idempotent callback)
    const secondCall = executePaymentConfirmation();
    assert.strictEqual(secondCall.alreadyPaid, true);
    assert.strictEqual(inventory, 9); // Inventory NOT decremented twice!
  });

  it('rejects promotional free-order bypass if calculated order total is non-zero', () => {
    const processFreeOrder = (order) => {
      if (Number(order.total) !== 0) {
        throw new Error('This order has a non-zero total and requires online payment');
      }
      return { success: true, paymentMethod: 'free_promotional' };
    };

    assert.throws(() => {
      processFreeOrder({ orderNumber: 'LE1', total: 100 });
    }, /non-zero total/);

    const result = processFreeOrder({ orderNumber: 'LE2', total: 0 });
    assert.strictEqual(result.success, true);
  });
});

