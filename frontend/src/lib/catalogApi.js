const API_BASE = '/api';

async function request(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from the server');
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

// Convert MongoDB product documents into the existing React UI format.
export function normalizeProduct(product) {
  if (!product) return null;

  const id = String(product._id || product.id || product.slug);
  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  const variantNodes = variants.length
    ? variants.map((variant, index) => ({
        ...variant,
        id: String(variant._id || variant.id || `${id}-${index}`),
        price: Number(variant.price ?? product.price ?? 0),
        image: variant.image || images[0] || '',
      }))
    : [{
        id,
        price: Number(product.price || 0),
        image: images[0] || '',
        title: 'Default',
      }];

  return {
    ...product,
    id,
    handle: product.slug || id,
    name: product.name || product.title || '',
    brand: product.brand || '',
    category: product.category || '',
    description: product.description || '',
    images,
    price: Number(product.price || 0),
    originalPrice: product.originalPrice != null
      ? Number(product.originalPrice)
      : product.originalPrice === null
        ? null
        : undefined,
    rating: Number(product.rating || 0),
    isNew: Boolean(product.isNew),
    isSoldOut: product.isActive === false ||
      product.isSoldOut === true ||
      Number(product.stock ?? product.inventory ?? 0) <= 0,
    variantNodes,
  };
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function fetchProducts({
  search = '',
  category = '',
  sort = 'newest',
  page = 1,
  limit = 24,
} = {}) {
  const query = buildQuery({ search, category, sort, page, limit });
  const data = await request(`/products?${query}`);

  return {
    products: (data.products || []).map(normalizeProduct),
    pagination: data.pagination || {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function fetchProduct(identifier) {
  const data = await request(
    `/products/${encodeURIComponent(identifier)}`
  );

  return normalizeProduct(data.product);
}

export async function fetchCategories() {
  const data = await request('/categories');
  return data.categories || [];
}

export async function searchProducts(search, limit = 12) {
  const result = await fetchProducts({
    search,
    limit,
    page: 1,
  });

  return result.products;
}
