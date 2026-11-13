const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

const collectionName = 'products';

async function getCollection() {
  const db = await connectDB();
  return db.collection(collectionName);
}

async function getProducts({
  search = '',
  category = '',
  sort = 'newest',
  page = 1,
  limit = 24,
  includeInactive = false,
} = {}) {
  const collection = await getCollection();

  const filter = {};
  if (!includeInactive) {
    filter.isActive = { $ne: false };
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { brand: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { tags: { $regex: term, $options: 'i' } },
      { sku: { $regex: term, $options: 'i' } },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name: { name: 1 },
  };

  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 24));
  const total = await collection.countDocuments(filter);

  const products = await collection
    .find(filter)
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return {
    products,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function getProduct(identifier, includeInactive = false) {
  if (!identifier) return null;
  const collection = await getCollection();

  const filter = {};
  if (!includeInactive) {
    filter.isActive = { $ne: false };
  }

  if (ObjectId.isValid(identifier)) {
    filter.$or = [
      { _id: new ObjectId(identifier) },
      { slug: identifier },
    ];
  } else {
    filter.slug = identifier;
  }

  return collection.findOne(filter);
}

async function getCategories() {
  const collection = await getCollection();

  return collection.distinct('category', {
    isActive: { $ne: false },
    category: { $exists: true, $ne: '' },
  });
}

async function createProduct(productData) {
  const collection = await getCollection();
  const now = new Date();

  const doc = {
    name: String(productData.name || '').trim(),
    slug: String(productData.slug || '').trim() || String(productData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    brand: String(productData.brand || '').trim(),
    category: String(productData.category || '').trim(),
    description: String(productData.description || '').trim(),
    price: Math.max(0, Number(productData.price) || 0),
    originalPrice: productData.originalPrice != null ? Number(productData.originalPrice) : null,
    stock: Math.max(0, Number(productData.stock ?? productData.inventory ?? 0)),
    sku: String(productData.sku || '').trim(),
    images: Array.isArray(productData.images) ? productData.images : (productData.image ? [productData.image] : []),
    variants: Array.isArray(productData.variants) ? productData.variants : [],
    isActive: productData.isActive !== false,
    rating: Number(productData.rating || 0),
    isNew: Boolean(productData.isNew),
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return collection.findOne({ _id: result.insertedId });
}

async function updateProduct(id, updates) {
  if (!id) return null;
  const objectId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
  if (!objectId) return null;

  const collection = await getCollection();
  const allowed = [
    'name', 'slug', 'brand', 'category', 'description',
    'price', 'originalPrice', 'stock', 'inventory', 'sku',
    'images', 'variants', 'isActive', 'rating', 'isNew'
  ];

  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      if (key === 'price' || key === 'stock' || key === 'rating' || key === 'originalPrice') {
        sanitized[key] = Number(updates[key]);
      } else {
        sanitized[key] = updates[key];
      }
    }
  }

  sanitized.updatedAt = new Date();

  await collection.updateOne(
    { _id: objectId },
    { $set: sanitized }
  );

  return collection.findOne({ _id: objectId });
}

async function deleteProduct(id) {
  if (!id) return false;
  const objectId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
  if (!objectId) return false;

  const collection = await getCollection();
  const res = await collection.deleteOne({ _id: objectId });
  return res.deletedCount > 0;
}

module.exports = {
  getProducts,
  getProduct,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
