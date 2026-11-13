const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

const COLLECTION = 'carts';

async function getCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION);
}

async function getCustomerCart(customerId) {
  const collection = await getCollection();
  const db = await connectDB();
  const productsCollection = db.collection('products');

  const cart = await collection.findOne({ customerId: String(customerId) });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  // Hydrate items with fresh database prices and stock
  const productIds = cart.items
    .map(i => (typeof i.productId === 'string' && ObjectId.isValid(i.productId) ? new ObjectId(i.productId) : i.productId))
    .filter(Boolean);

  const dbProducts = await productsCollection.find({ _id: { $in: productIds } }).toArray();
  const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

  const validItems = [];
  let subtotal = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    const product = productMap.get(String(item.productId));
    if (!product || product.isActive === false) {
      continue; // Skip inactive/deleted products
    }

    const price = Number(product.price || 0);
    const availableStock = Number(product.stock ?? product.inventory ?? 0);
    const quantity = Math.min(Math.max(1, Number(item.quantity) || 1), Math.max(1, availableStock));

    const lineTotal = price * quantity;
    subtotal += lineTotal;
    itemCount += quantity;

    validItems.push({
      productId: product._id.toString(),
      name: product.name,
      brand: product.brand || '',
      category: product.category || '',
      image: product.images?.[0] || product.image || '',
      price,
      quantity,
      lineTotal,
      inStock: availableStock >= quantity,
      availableStock,
    });
  }

  return {
    items: validItems,
    subtotal,
    itemCount,
  };
}

async function setCartItem(customerId, productId, quantity) {
  const collection = await getCollection();
  const customerStr = String(customerId);
  const qty = Number(quantity);

  if (!ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  if (qty <= 0) {
    // Remove item
    await collection.updateOne(
      { customerId: customerStr },
      {
        $pull: { items: { productId: String(productId) } },
        $set: { updatedAt: new Date() },
      }
    );
  } else {
    // Check if cart exists
    const cart = await collection.findOne({ customerId: customerStr });
    const now = new Date();

    if (!cart) {
      await collection.insertOne({
        customerId: customerStr,
        items: [{ productId: String(productId), quantity: qty }],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const existingItemIndex = cart.items.findIndex(i => String(i.productId) === String(productId));

      if (existingItemIndex > -1) {
        await collection.updateOne(
          { customerId: customerStr, 'items.productId': String(productId) },
          {
            $set: {
              'items.$.quantity': qty,
              updatedAt: now,
            },
          }
        );
      } else {
        await collection.updateOne(
          { customerId: customerStr },
          {
            $push: { items: { productId: String(productId), quantity: qty } },
            $set: { updatedAt: now },
          }
        );
      }
    }
  }

  return getCustomerCart(customerId);
}

async function removeCartItem(customerId, productId) {
  const collection = await getCollection();
  await collection.updateOne(
    { customerId: String(customerId) },
    {
      $pull: { items: { productId: String(productId) } },
      $set: { updatedAt: new Date() },
    }
  );
  return getCustomerCart(customerId);
}

async function clearCustomerCart(customerId) {
  const collection = await getCollection();
  await collection.updateOne(
    { customerId: String(customerId) },
    {
      $set: { items: [], updatedAt: new Date() },
    },
    { upsert: true }
  );
  return { items: [], subtotal: 0, itemCount: 0 };
}

module.exports = {
  getCustomerCart,
  setCartItem,
  removeCartItem,
  clearCustomerCart,
};

