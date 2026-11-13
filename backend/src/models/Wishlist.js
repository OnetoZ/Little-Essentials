const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

const COLLECTION = 'wishlists';

async function getCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION);
}

async function getCustomerWishlist(customerId) {
  const collection = await getCollection();
  const db = await connectDB();
  const productsCollection = db.collection('products');

  const wishlist = await collection.findOne({ customerId: String(customerId) });
  if (!wishlist || !Array.isArray(wishlist.productIds) || wishlist.productIds.length === 0) {
    return { items: [], productIds: [] };
  }

  const ids = wishlist.productIds
    .map(id => (typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id))
    .filter(Boolean);

  const products = await productsCollection
    .find({ _id: { $in: ids }, isActive: { $ne: false } })
    .toArray();

  return {
    items: products,
    productIds: wishlist.productIds,
  };
}

async function addToWishlist(customerId, productId) {
  const collection = await getCollection();
  const idStr = String(productId);
  const custStr = String(customerId);

  if (!ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const now = new Date();
  await collection.updateOne(
    { customerId: custStr },
    {
      $addToSet: { productIds: idStr },
      $setOnInsert: { createdAt: now },
      $set: { updatedAt: now },
    },
    { upsert: true }
  );

  return getCustomerWishlist(customerId);
}

async function removeFromWishlist(customerId, productId) {
  const collection = await getCollection();
  const idStr = String(productId);
  const custStr = String(customerId);

  await collection.updateOne(
    { customerId: custStr },
    {
      $pull: { productIds: idStr },
      $set: { updatedAt: new Date() },
    }
  );

  return getCustomerWishlist(customerId);
}

module.exports = {
  getCustomerWishlist,
  addToWishlist,
  removeFromWishlist,
};

