const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

let client;
let db;
let indexesInitialized = false;

async function initIndexes(database) {
  if (indexesInitialized) return;

  try {
    const customers = database.collection('customers');
    await customers.createIndex({ email: 1 }, { unique: true });

    const products = database.collection('products');
    await products.createIndex({ slug: 1 }, { unique: true });
    await products.createIndex({ category: 1, isActive: 1 });
    await products.createIndex({ createdAt: -1 });

    const orders = database.collection('orders');
    await orders.createIndex({ orderNumber: 1 }, { unique: true });
    await orders.createIndex({ customerId: 1, createdAt: -1 });
    await orders.createIndex({ razorpayOrderId: 1 }, { sparse: true });

    const carts = database.collection('carts');
    await carts.createIndex({ customerId: 1 }, { unique: true });

    const wishlists = database.collection('wishlists');
    await wishlists.createIndex({ customerId: 1 }, { unique: true });

    const webhookEvents = database.collection('webhookEvents');
    await webhookEvents.createIndex({ eventId: 1 }, { unique: true });

    const admins = database.collection('admins');
    await admins.createIndex({ email: 1 }, { unique: true, sparse: true });

    indexesInitialized = true;
  } catch (error) {
    console.error('Failed to create indexes:', error.message);
  }
}

async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from backend/.env');
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db('little_essentials');
  await db.command({ ping: 1 });

  await initIndexes(db);

  console.log('MongoDB connected successfully!');
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    indexesInitialized = false;
  }
}

module.exports = { connectDB, closeDB, initIndexes };
