const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const { connectDB } = require('../config/db');
const {
  listAllOrders,
  findOrderByNumber,
  findOrderById,
  updateOrderStatus,
} = require('../models/Order');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../models/Product');
const { listCustomers } = require('../models/Customer');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

function getAdminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.AUTH_JWT_SECRET;
}

function normalizeAdminOrder(order) {
  if (!order) return null;
  const id = order._id ? order._id.toString() : order.orderNumber;
  const isPaid = order.paymentStatus === 'paid';
  const isShipped = order.orderStatus === 'shipped' || order.orderStatus === 'delivered' || order.fulfillmentStatus === 'FULFILLED';

  return {
    ...order,
    id,
    orderNumber: order.orderNumber,
    name: `#${order.orderNumber}`,
    total: Number(order.total || 0),
    financialStatus: isPaid ? 'PAID' : (order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'),
    fulfillmentStatus: isShipped ? 'FULFILLED' : 'UNFULFILLED',
    tags: isShipped ? ['shipped'] : [],
    customer: {
      name: order.shippingAddress?.name || 'Customer',
      phone: order.shippingAddress?.phone || '',
      email: order.shippingAddress?.email || '',
    },
    lineItems: (order.items || []).map(i => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image,
    })),
  };
}

/**
 * Admin Login
 * POST /api/admin/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    let isAuthenticated = false;

    // Check configured environment credentials
    if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
      isAuthenticated = true;
    } else {
      // Check database admins collection if present
      const db = await connectDB();
      const adminUser = await db.collection('admins').findOne({ email });
      if (adminUser && adminUser.passwordHash) {
        isAuthenticated = await bcrypt.compare(password, adminUser.passwordHash);
      }
    }

    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials',
      });
    }

    const secret = getAdminSecret();
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: 'Admin authentication secret not configured',
      });
    }

    const token = jwt.sign(
      {
        sub: 'admin_primary',
        email,
        role: 'admin',
      },
      secret,
      { expiresIn: '12h' }
    );

    return res.json({
      success: true,
      token,
      email,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Exchange customer token for admin session if user is admin
 * POST /api/admin/exchange-token
 */
router.post('/exchange-token', async (req, res, next) => {
  try {
    const { customerAccessToken } = req.body;
    if (!customerAccessToken) {
      return res.status(400).json({ success: false, error: 'Token missing' });
    }

    const secret = process.env.AUTH_JWT_SECRET;
    const payload = jwt.verify(customerAccessToken, secret);

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (payload.email && envAdminEmail && payload.email.toLowerCase() === envAdminEmail) {
      const adminSecret = getAdminSecret();
      const token = jwt.sign(
        { sub: payload.sub, email: payload.email, role: 'admin' },
        adminSecret,
        { expiresIn: '12h' }
      );
      return res.json({ success: true, token, email: payload.email });
    }

    return res.status(403).json({ success: false, error: 'User is not an authorized administrator' });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

/**
 * List orders for Admin
 * GET /api/admin/orders
 */
router.get('/orders', authenticateAdmin, async (req, res, next) => {
  try {
    const limit = Number(req.query.first || req.query.limit || 50);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const search = req.query.search;

    const result = await listAllOrders({ page, limit, status, search });

    res.json({
      success: true,
      orders: result.orders.map(normalizeAdminOrder),
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get single order details
 * GET /api/admin/orders/:orderNumber
 */
router.get('/orders/:orderNumber', authenticateAdmin, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    let order = await findOrderByNumber(orderNumber);
    if (!order && ObjectId.isValid(orderNumber)) {
      order = await findOrderById(orderNumber);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      order: normalizeAdminOrder(order),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update order status
 * PATCH /api/admin/orders/:orderNumber
 */
router.patch('/orders/:orderNumber', authenticateAdmin, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const updated = await updateOrderStatus(orderNumber, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      order: normalizeAdminOrder(updated),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Ship order (compatibility with AdminDashboard)
 * POST /api/admin/ship-order
 */
router.post('/ship-order', authenticateAdmin, async (req, res, next) => {
  try {
    const { orderId, trackingNumber, carrier } = req.body;
    let order = await findOrderByNumber(orderId);
    if (!order && ObjectId.isValid(orderId)) {
      order = await findOrderById(orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updated = await updateOrderStatus(order.orderNumber, {
      orderStatus: 'shipped',
      trackingNumber: trackingNumber || `TRK${Date.now()}`,
      carrier: carrier || 'Standard Express',
    });

    res.json({
      success: true,
      message: 'Order marked as shipped',
      order: normalizeAdminOrder(updated),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Unship / Revoke shipment (compatibility with AdminDashboard)
 * POST /api/admin/unship-order
 */
router.post('/unship-order', authenticateAdmin, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    let order = await findOrderByNumber(orderId);
    if (!order && ObjectId.isValid(orderId)) {
      order = await findOrderById(orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updated = await updateOrderStatus(order.orderNumber, {
      orderStatus: 'confirmed',
      trackingNumber: null,
      carrier: null,
    });

    res.json({
      success: true,
      message: 'Shipment revoked',
      order: normalizeAdminOrder(updated),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * List customers
 * GET /api/admin/customers
 */
router.get('/customers', authenticateAdmin, async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const result = await listCustomers({ page, limit });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * List products (including inactive)
 * GET /api/admin/products
 */
router.get('/products', authenticateAdmin, async (req, res, next) => {
  try {
    const result = await getProducts({
      search: req.query.search || '',
      category: req.query.category || '',
      sort: req.query.sort || 'newest',
      page: req.query.page,
      limit: req.query.limit || 50,
      includeInactive: true,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create product
 * POST /api/admin/products
 */
router.post('/products', authenticateAdmin, async (req, res, next) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update product
 * PATCH /api/admin/products/:id
 */
router.patch('/products/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete product
 * DELETE /api/admin/products/:id
 */
router.delete('/products/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * View payment logs
 * GET /api/admin/payments
 */
router.get('/payments', authenticateAdmin, async (req, res, next) => {
  try {
    const db = await connectDB();
    const orders = await db.collection('orders')
      .find({ paymentStatus: 'paid' })
      .sort({ paidAt: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    const payments = orders.map(o => ({
      orderNumber: o.orderNumber,
      amount: o.total,
      currency: o.currency,
      paymentMethod: o.paymentMethod,
      razorpayOrderId: o.razorpayOrderId,
      razorpayPaymentId: o.razorpayPaymentId,
      paidAt: o.paidAt || o.updatedAt,
      customer: o.shippingAddress?.name,
    }));

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

