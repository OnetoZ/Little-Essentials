const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

const COLLECTION = 'orders';

async function getOrders() {
  const db = await connectDB();
  return db.collection(COLLECTION);
}

async function createOrder(order) {
  const collection = await getOrders();
  const now = new Date();

  const result = await collection.insertOne({
    ...order,
    paymentStatus: order.paymentStatus || 'pending',
    orderStatus: order.orderStatus || 'pending_payment',
    stockDeducted: false,
    createdAt: now,
    updatedAt: now,
  });

  return collection.findOne({ _id: result.insertedId });
}

async function findOrderById(id) {
  if (!id) return null;
  const objectId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
  if (!objectId) return null;

  return (await getOrders()).findOne({ _id: objectId });
}

async function findOrderByNumber(orderNumber) {
  if (!orderNumber) return null;
  return (await getOrders()).findOne({ orderNumber });
}

async function findOrderByRazorpayOrderId(razorpayOrderId) {
  if (!razorpayOrderId) return null;
  return (await getOrders()).findOne({ razorpayOrderId });
}

async function getCustomerOrders(customerId, page = 1, limit = 10) {
  const collection = await getOrders();
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

  const filter = { customerId: String(customerId) };

  const [orders, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function listAllOrders({ page = 1, limit = 20, status, search } = {}) {
  const collection = await getOrders();
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};
  if (status) {
    filter.orderStatus = status;
  }
  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { orderNumber: { $regex: term, $options: 'i' } },
      { 'shippingAddress.name': { $regex: term, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: term, $options: 'i' } },
      { razorpayPaymentId: { $regex: term, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function setOrderRazorpayDetails(orderNumber, razorpayOrderId) {
  const collection = await getOrders();
  await collection.updateOne(
    { orderNumber },
    {
      $set: {
        razorpayOrderId,
        updatedAt: new Date(),
      },
    }
  );
  return findOrderByNumber(orderNumber);
}

// Atomically marks an order as paid and deducts inventory (idempotently).
async function markOrderPaidAndDeductInventory(orderNumber, paymentDetails) {
  const db = await connectDB();
  const ordersCollection = db.collection(COLLECTION);
  const productsCollection = db.collection('products');

  const order = await ordersCollection.findOne({ orderNumber });
  if (!order) {
    throw new Error(`Order ${orderNumber} not found`);
  }

  // Idempotency check: If already paid, return existing order
  if (order.paymentStatus === 'paid') {
    return { order, alreadyPaid: true };
  }

  const now = new Date();
  let inventoryDeductionSuccess = true;
  const inventoryIssues = [];

  // Deduct stock for each item if stock has not been deducted yet
  if (!order.stockDeducted) {
    for (const item of order.items) {
      const productId = typeof item.productId === 'string' && ObjectId.isValid(item.productId)
        ? new ObjectId(item.productId)
        : item.productId;

      const updateResult = await productsCollection.updateOne(
        {
          _id: productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
          $set: { updatedAt: now },
        }
      );

      if (updateResult.modifiedCount === 0) {
        inventoryDeductionSuccess = false;
        inventoryIssues.push({
          productId: item.productId,
          name: item.name,
          requested: item.quantity,
          error: 'Insufficient stock during payment capture',
        });
      }
    }
  }

  const updateFields = {
    paymentStatus: 'paid',
    orderStatus: inventoryDeductionSuccess ? 'confirmed' : 'requires_reconciliation',
    stockDeducted: inventoryDeductionSuccess,
    razorpayOrderId: paymentDetails.razorpayOrderId || order.razorpayOrderId,
    razorpayPaymentId: paymentDetails.razorpayPaymentId,
    razorpaySignature: paymentDetails.razorpaySignature || null,
    paymentMethod: paymentDetails.method || 'razorpay',
    paidAt: now,
    updatedAt: now,
  };

  if (!inventoryDeductionSuccess) {
    updateFields.inventoryIssues = inventoryIssues;
    updateFields.notes = 'Payment captured but some items had insufficient stock. Requires admin reconciliation/refund.';
  }

  await ordersCollection.updateOne(
    { orderNumber },
    { $set: updateFields }
  );

  const updatedOrder = await ordersCollection.findOne({ orderNumber });
  return { order: updatedOrder, alreadyPaid: false, inventoryDeductionSuccess };
}

async function updateOrderStatus(orderNumber, { orderStatus, trackingNumber, carrier, notes }) {
  const collection = await getOrders();
  const updates = { updatedAt: new Date() };

  if (orderStatus) updates.orderStatus = orderStatus;
  if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
  if (carrier !== undefined) updates.carrier = carrier;
  if (notes !== undefined) updates.notes = notes;

  await collection.updateOne(
    { orderNumber },
    { $set: updates }
  );

  return findOrderByNumber(orderNumber);
}

module.exports = {
  createOrder,
  findOrderById,
  findOrderByNumber,
  findOrderByRazorpayOrderId,
  getCustomerOrders,
  listAllOrders,
  setOrderRazorpayDetails,
  markOrderPaidAndDeductInventory,
  updateOrderStatus,
};
