const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

const COLLECTION = 'customers';

async function getCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION);
}

async function createCustomer(customer) {
  const collection = await getCollection();
  const now = new Date();

  const result = await collection.insertOne({
    ...customer,
    role: 'customer',
    addresses: customer.addresses || [],
    createdAt: now,
    updatedAt: now,
  });

  return collection.findOne(
    { _id: result.insertedId },
    { projection: { passwordHash: 0 } }
  );
}

async function findCustomerByEmail(email) {
  if (!email) return null;
  return (await getCollection()).findOne({
    email: email.toLowerCase().trim(),
  });
}

async function findCustomerById(id) {
  if (!id) return null;
  const objectId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
  if (!objectId) return null;

  return (await getCollection()).findOne(
    { _id: objectId },
    { projection: { passwordHash: 0 } }
  );
}

async function updateCustomer(id, updates) {
  if (!id) return null;
  const objectId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
  if (!objectId) return null;

  const collection = await getCollection();

  await collection.updateOne(
    { _id: objectId },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );

  return findCustomerById(id);
}

async function listCustomers({ page = 1, limit = 20 } = {}) {
  const collection = await getCollection();
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

  const [customers, total] = await Promise.all([
    collection
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return {
    customers,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

module.exports = {
  createCustomer,
  findCustomerByEmail,
  findCustomerById,
  updateCustomer,
  listCustomers,
};
