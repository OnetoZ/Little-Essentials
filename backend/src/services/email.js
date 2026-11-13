const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transport using environment variables
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Format currency in Indian Rupees
 */
function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

/**
 * Build Customer Order Confirmation HTML
 */
function buildCustomerEmailHtml(order, paymentId, storeUrl) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #ECE3D8;">
        <td style="padding: 12px 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #3B2A22;">
          <strong>${item.name}</strong>
          ${item.variant ? `<br/><span style="font-size: 11px; color: #967259;">Variant: ${item.variant}</span>` : ''}
          <br/><span style="font-size: 11px; color: #7B685B;">SKU / ID: ${item.slug || item.productId}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #3B2A22;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #3B2A22;">
          ${formatCurrency(item.price)}
        </td>
        <td style="padding: 12px 8px; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #3B2A22;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  const shipping = order.shippingAddress || {};
  const trackingUrl = `${storeUrl}/order/${order.orderNumber}/track`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Order Confirmation #${order.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F4EE; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(59,42,34,0.06); border: 1px solid #ECE3D8;">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #3B2A22; padding: 28px 32px; text-align: center;">
                  <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; color: #F7F4EE; letter-spacing: 1px; font-weight: normal;">
                    LITTLE ESSENTIALS
                  </h1>
                  <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #DCC5B2;">
                    Order Confirmation
                  </p>
                </td>
              </tr>

              <!-- Greeting Banner -->
              <tr>
                <td style="padding: 32px 32px 16px;">
                  <h2 style="margin: 0 0 8px; font-size: 18px; color: #3B2A22; font-family: Georgia, serif;">
                    Thank you for your order, ${shipping.firstName || 'Valued Customer'}!
                  </h2>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #665246;">
                    We have received your payment and your order is now confirmed. We are carefully preparing your items for shipment.
                  </p>
                </td>
              </tr>

              <!-- Order Summary Cards -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <div style="background-color: #FAF8F5; border: 1px solid #ECE3D8; border-radius: 6px; padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 12px; color: #7B685B; padding-bottom: 4px;">Order Number:</td>
                        <td style="text-align: right; font-size: 13px; font-weight: 600; color: #3B2A22; padding-bottom: 4px;">
                          ${order.orderNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #7B685B; padding-bottom: 4px;">Payment Reference:</td>
                        <td style="text-align: right; font-size: 12px; font-family: monospace; color: #3B2A22; padding-bottom: 4px;">
                          ${paymentId || order.paymentDetails?.razorpayPaymentId || 'Verified'}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #7B685B;">Payment Status:</td>
                        <td style="text-align: right; font-size: 12px; font-weight: 600; color: #15803d;">
                          ✓ Paid & Verified
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #F7F4EE; border-bottom: 2px solid #DCC5B2;">
                        <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7B685B;">Item</th>
                        <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7B685B;">Qty</th>
                        <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7B685B;">Price</th>
                        <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7B685B;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Price Breakdown -->
              <tr>
                <td style="padding: 16px 32px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-left: auto; max-width: 260px;">
                    <tr>
                      <td style="padding: 4px 0; font-size: 13px; color: #7B685B;">Subtotal:</td>
                      <td style="padding: 4px 0; font-size: 13px; text-align: right; color: #3B2A22;">${formatCurrency(order.subtotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-size: 13px; color: #7B685B;">Shipping:</td>
                      <td style="padding: 4px 0; font-size: 13px; text-align: right; color: #3B2A22;">
                        ${order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}
                      </td>
                    </tr>
                    <tr style="border-top: 1px solid #DCC5B2;">
                      <td style="padding: 10px 0 0; font-size: 15px; font-weight: 600; color: #3B2A22;">Total Paid:</td>
                      <td style="padding: 10px 0 0; font-size: 16px; font-weight: 700; text-align: right; color: #3B2A22;">${formatCurrency(order.total)}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping Info -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <div style="background-color: #FAF8F5; border-radius: 6px; padding: 16px; border: 1px solid #ECE3D8;">
                    <h3 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #967259;">
                      Delivery Address
                    </h3>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #3B2A22;">
                      <strong>${shipping.firstName || ''} ${shipping.lastName || ''}</strong><br />
                      ${shipping.address || ''}${shipping.address2 ? `, ${shipping.address2}` : ''}<br />
                      ${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}<br />
                      ${shipping.phone ? `Phone: ${shipping.phone}` : ''}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Track Order CTA Button -->
              <tr>
                <td align="center" style="padding: 0 32px 32px;">
                  <a href="${trackingUrl}" style="display: inline-block; background-color: #3B2A22; color: #F7F4EE; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                    Track Your Order
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #FAF8F5; padding: 20px 32px; text-align: center; border-top: 1px solid #ECE3D8;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #7B685B;">
                    Questions about your order? Reply directly to this email or contact support.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #A69285;">
                    &copy; ${new Date().getFullYear()} Little Essentials. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Build Admin Notification HTML
 */
function buildAdminEmailHtml(order, paymentId, storeUrl) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong> ${item.variant ? `(${item.variant})` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join('');

  const shipping = order.shippingAddress || {};

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e0e0e0;">
        <h2 style="color: #15803d; margin-top: 0;">🔔 New Paid Order: #${order.orderNumber}</h2>
        <p style="font-size: 15px;"><strong>Amount:</strong> <span style="font-size: 18px; color: #3B2A22;">${formatCurrency(order.total)}</span></p>
        <p style="font-size: 13px; color: #555;">
          <strong>Payment ID:</strong> <code>${paymentId || order.paymentDetails?.razorpayPaymentId || 'N/A'}</code><br />
          <strong>Customer Email:</strong> ${shipping.email || order.customerId || 'N/A'}<br />
          <strong>Customer Phone:</strong> ${shipping.phone || 'N/A'}
        </p>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #666; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 6px;">
          Shipping Destination
        </h3>
        <p style="font-size: 13px; line-height: 1.5;">
          ${shipping.firstName || ''} ${shipping.lastName || ''}<br />
          ${shipping.address || ''}${shipping.address2 ? `, ${shipping.address2}` : ''}<br />
          ${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}
        </p>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #666; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 6px;">
          Ordered Items
        </h3>
        <table width="100%" style="border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="${storeUrl}/admin" style="background: #3B2A22; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 13px; display: inline-block;">
            Open Admin Dashboard
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Dispatch Order Confirmation Emails (Customer + Admin)
 * Runs asynchronously and never throws or interrupts the payment flow.
 */
async function sendOrderConfirmationEmail({ order, paymentId }) {
  try {
    if (!order || !order.orderNumber) {
      console.warn('[EMAIL] Cannot send confirmation: order object is invalid');
      return { success: false, reason: 'INVALID_ORDER' };
    }

    const customerEmail =
      order.shippingAddress?.email ||
      order.customerEmail ||
      (typeof order.customerId === 'string' && order.customerId.includes('@') ? order.customerId : null);

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'orders@littleessentials.com';
    const storeUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const transporter = createTransporter();

    if (!transporter) {
      console.log(
        `\n[EMAIL NOTICE] SMTP not yet configured in backend/.env. Confirmation email simulated:
  To Customer: ${customerEmail || '(no customer email in address)'}
  To Admin: ${adminEmail || '(no admin email)'}
  Order: #${order.orderNumber}
  Total: ₹${order.total}
  Payment ID: ${paymentId || order.paymentDetails?.razorpayPaymentId || 'N/A'}\n`
      );
      return { success: false, reason: 'SMTP_NOT_CONFIGURED', simulated: true };
    }

    const tasks = [];

    // 1. Send to Customer
    if (customerEmail) {
      const customerMailOptions = {
        from: `"Little Essentials" <${fromAddress}>`,
        to: customerEmail,
        subject: `Order Confirmed: #${order.orderNumber} - Little Essentials`,
        html: buildCustomerEmailHtml(order, paymentId, storeUrl),
      };
      tasks.push(
        transporter.sendMail(customerMailOptions).then((info) => {
          console.log(`[EMAIL] Confirmation sent to customer (${customerEmail}) for order #${order.orderNumber}. ID: ${info.messageId}`);
        })
      );
    } else {
      console.warn(`[EMAIL] Order #${order.orderNumber} has no customer email address in shipping details.`);
    }

    // 2. Send to Admin
    if (adminEmail) {
      const adminMailOptions = {
        from: `"Little Essentials Orders" <${fromAddress}>`,
        to: adminEmail,
        subject: `🔔 New Order Received: #${order.orderNumber} (₹${order.total})`,
        html: buildAdminEmailHtml(order, paymentId, storeUrl),
      };
      tasks.push(
        transporter.sendMail(adminMailOptions).then((info) => {
          console.log(`[EMAIL] Notification sent to admin (${adminEmail}) for order #${order.orderNumber}. ID: ${info.messageId}`);
        })
      );
    }

    await Promise.allSettled(tasks);
    return { success: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send order confirmation for #${order?.orderNumber}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  buildCustomerEmailHtml,
  buildAdminEmailHtml,
};

