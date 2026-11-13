const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  sendOrderConfirmationEmail,
  buildCustomerEmailHtml,
  buildAdminEmailHtml,
} = require('../src/services/email');

describe('Order Confirmation Email Service', () => {
  const sampleOrder = {
    orderNumber: 'LE-20261113-1234',
    customerId: 'cust_test_99',
    customerEmail: 'buyer@example.com',
    items: [
      {
        productId: 'prod_1',
        name: 'Electric Kettle Deluxe',
        slug: 'electric-kettle',
        price: 1,
        quantity: 2,
        lineTotal: 2,
      },
    ],
    shippingAddress: {
      firstName: 'Ramesh',
      lastName: 'Kumar',
      email: 'buyer@example.com',
      phone: '9876543210',
      address: '42 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
    subtotal: 2,
    shippingFee: 0,
    total: 2,
    currency: 'INR',
    paymentStatus: 'paid',
  };

  it('generates customer HTML containing order number, item name, price, and tracking link', () => {
    const html = buildCustomerEmailHtml(sampleOrder, 'pay_mock_123', 'http://localhost:5173');
    assert.match(html, /LE-20261113-1234/);
    assert.match(html, /Electric Kettle Deluxe/);
    assert.match(html, /₹2/);
    assert.match(html, /pay_mock_123/);
    assert.match(html, /Track Your Order/);
    assert.match(html, /http:\/\/localhost:5173\/order\/LE-20261113-1234\/track/);
  });

  it('generates admin notification HTML containing customer details and order total', () => {
    const html = buildAdminEmailHtml(sampleOrder, 'pay_mock_123', 'http://localhost:5173');
    assert.match(html, /LE-20261113-1234/);
    assert.match(html, /Ramesh Kumar/);
    assert.match(html, /buyer@example.com/);
    assert.match(html, /9876543210/);
    assert.match(html, /₹2/);
  });

  it('handles email dispatch gracefully without throwing when SMTP credentials are unconfigured', async () => {
    // Should log simulation note and return non-crashing result
    const result = await sendOrderConfirmationEmail({
      order: sampleOrder,
      paymentId: 'pay_mock_123',
    });
    assert.equal(result.simulated, true);
    assert.equal(result.reason, 'SMTP_NOT_CONFIGURED');
  });

  it('handles null or invalid order without throwing', async () => {
    const result = await sendOrderConfirmationEmail({ order: null });
    assert.equal(result.success, false);
    assert.equal(result.reason, 'INVALID_ORDER');
  });
});

