const express = require('express');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');

const { connectDB } = require('../config/db');
const {
  createOrder,
  findOrderByNumber,
  findOrderById,
  getCustomerOrders,
} = require('../models/Order');

const { authenticateCustomer, optionalCustomerAuth } = require('../middleware/auth');

const router = express.Router();

function makeOrderNumber() {
  return `LE${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

const SHIPPING_RULES = {
  standard: {
    name: 'Standard Delivery',
    fee: 0,
  },
  express: {
    name: 'Express Delivery',
    fee: 149,
  },
};

/**
 * Create Order with server-side pricing and shipping calculation.
 * POST /api/orders
 */
router.post('/', authenticateCustomer, async (req, res, next) => {
  try {
    const { items, shippingAddress, shippingMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Provide between 1 and 50 order items',
        code: 'INVALID_ITEMS',
      });
    }

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
        code: 'MISSING_SHIPPING_ADDRESS',
      });
    }

    const requiredAddressFields = [
      'name', 'phone', 'addressLine1', 'city', 'state', 'postalCode',
    ];

    for (const field of requiredAddressFields) {
      if (!String(shippingAddress[field] || '').trim()) {
        return res.status(400).json({
          success: false,
          message: `Shipping address field '${field}' is required`,
          code: 'INCOMPLETE_ADDRESS',
        });
      }
    }

    const db = await connectDB();
    const productsCollection = db.collection('products');

    const quantities = new Map();

    for (const item of items) {
      const rawId = String(item.productId || item.id || '').trim();
      const quantity = Number(item.quantity ?? item.qty);

      if (!rawId ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1 || quantity > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or quantity in order items',
          code: 'INVALID_ITEM_SPECIFICATION',
        });
      }

      quantities.set(
        rawId,
        (quantities.get(rawId) || 0) + quantity
      );
    }

    const objectIds = [];
    const slugs = [];

    for (const id of quantities.keys()) {
      if (ObjectId.isValid(id) && id.length === 24) {
        objectIds.push(new ObjectId(id));
      } else {
        slugs.push(id);
      }
    }

    const queryFilters = [];
    if (objectIds.length > 0) queryFilters.push({ _id: { $in: objectIds } });
    if (slugs.length > 0) queryFilters.push({ slug: { $in: slugs } });

    if (queryFilters.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products identified',
        code: 'NO_VALID_PRODUCTS',
      });
    }

    const databaseProducts = await productsCollection.find({
      $or: queryFilters,
      isActive: { $ne: false },
    }).toArray();

    if (databaseProducts.length !== quantities.size) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected products are unavailable or do not exist in database',
        code: 'PRODUCT_UNAVAILABLE',
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const product of databaseProducts) {
      let quantity = quantities.get(product._id.toString());
      if (quantity === undefined && product.slug) {
        quantity = quantities.get(product.slug);
      }
      if (quantity === undefined) {
        quantity = 1;
      }
      const stock = Number(product.stock ?? product.inventory ?? 0);
      const price = Number(product.price);

      if (!Number.isSafeInteger(stock) || stock < quantity) {
        return res.status(409).json({
          success: false,
          message: `Product '${product.name}' has insufficient stock (available: ${stock}, requested: ${quantity})`,
          code: 'INSUFFICIENT_STOCK',
        });
      }

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price recorded for product '${product.name}'`,
          code: 'INVALID_PRODUCT_PRICE',
        });
      }

      const lineTotal = Math.round(price * quantity);
      subtotal += lineTotal;

      // Product snapshot to preserve historical record
      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        brand: product.brand || '',
        category: product.category || '',
        image: product.images?.[0] || product.image || '',
        sku: product.sku || '',
        price,
        quantity,
        lineTotal,
      });
    }

    if (!Number.isSafeInteger(subtotal) || subtotal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Calculated subtotal is invalid',
        code: 'INVALID_SUBTOTAL',
      });
    }

    // Shipping rules: Standard is ₹0, Express is ₹149
    const selectedMethodKey = String(shippingMethod || 'standard').toLowerCase();
    const shippingRule = SHIPPING_RULES[selectedMethodKey] || SHIPPING_RULES.standard;
    const shippingFee = shippingRule.fee;
    const total = subtotal + shippingFee;

    // Create order with pending status. DO NOT reduce inventory before payment.
    const orderNumber = makeOrderNumber();

    const customerEmail = String(shippingAddress.email || req.customer.email || '').trim();

    const order = await createOrder({
      orderNumber,
      customerId: req.customer.id,
      customerEmail,
      items: orderItems,
      shippingAddress: {
        name: String(shippingAddress.name).trim(),
        email: customerEmail,
        phone: String(shippingAddress.phone).trim(),
        addressLine1: String(shippingAddress.addressLine1).trim(),
        addressLine2: String(shippingAddress.addressLine2 || '').trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state).trim(),
        postalCode: String(shippingAddress.postalCode).trim(),
        country: String(shippingAddress.country || 'India').trim(),
      },
      shippingMethod: {
        id: selectedMethodKey,
        name: shippingRule.name,
      },
      subtotal,
      shippingFee,
      total,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending_payment',
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully. Complete payment to confirm.',
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Customer retrieves their order history.
 * GET /api/orders/my-orders
 */
router.get('/my-orders', authenticateCustomer, async (req, res, next) => {
  try {
    const result = await getCustomerOrders(
      req.customer.id,
      req.query.page,
      req.query.limit
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Retrieve order details by internal orderNumber.
 * GET /api/orders/:orderNumber
 */
router.get('/:orderNumber', optionalCustomerAuth, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    let order = await findOrderByNumber(orderNumber);

    if (!order && ObjectId.isValid(orderNumber)) {
      order = await findOrderById(orderNumber);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    }

    // If caller is authenticated, verify customer ownership (unless admin)
    if (req.customer && req.customer.role === 'customer') {
      if (order.customerId && order.customerId !== req.customer.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order',
          code: 'UNAUTHORIZED_ACCESS',
        });
      }
    }

    // Return safe public order summary
    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        shippingAddress: order.shippingAddress,
        shippingMethod: order.shippingMethod,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber || null,
        carrier: order.carrier || null,
        paidAt: order.paidAt || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
