/**
 * Shopify → Little Essentials Data Adapter
 *
 * Maps Shopify Storefront API product/collection data into the shape
 * that the frontend components (ProductCard, ProductGrid, etc.) expect.
 *
 * Ported from backend/src/lib/shopifyAdapter.js — now runs in the browser.
 */

/**
 * Extract a numeric Shopify GID to a simple ID string.
 * e.g. "gid://shopify/Product/1234567890" → "1234567890"
 */
export function extractGid(gid) {
  if (!gid) return ''
  const parts = gid.split('/')
  return parts[parts.length - 1]
}


/**
 * Normalize a Shopify product node into the format frontend components expect.
 *
 * Output shape matches what the frontend's ProductCard / ProductGrid / ProductInfo
 * components consume:
 * {
 *   id, brand, category, name, price, originalPrice,
 *   rating, reviewCount, isNew, isSoldOut,
 *   images, description, variants, handle, variantNodes
 * }
 */
export function normalizeProduct(shopifyProduct) {
  if (!shopifyProduct) return null

  const {
    id,
    handle,
    title,
    vendor,
    productType,
    tags = [],
    createdAt,
    availableForSale,
    status,
    images,
    variants,
    options,
    description,
    descriptionHtml,
    metafields,
  } = shopifyProduct

  // ── Price ──
  // Storefront API uses priceRange, Admin API uses priceRangeV2
  const priceRange = shopifyProduct.priceRangeV2 || shopifyProduct.priceRange
  const compareAtPriceRange = shopifyProduct.compareAtPriceRange

  let price = 0
  let originalPrice = null

  if (priceRange?.minVariantPrice?.amount) {
    price = parseFloat(priceRange.minVariantPrice.amount)
  }

  if (compareAtPriceRange?.minVariantPrice?.amount) {
    const compareAt = parseFloat(compareAtPriceRange.minVariantPrice.amount)
    if (compareAt > price) originalPrice = compareAt
  }

  // ── Images ──
  const imageUrls = images?.edges
    ? images.edges.map((edge) => edge.node.url)
    : []

  // ── Variants map (for UI display: { size: ["S", "M", "L"], color: [...] }) ──
  const variantMap = {}
  if (options && options.length > 0) {
    for (const option of options) {
      if (option.name !== 'Title' || option.values?.[0] !== 'Default Title') {
        variantMap[option.name.toLowerCase()] = option.values
      }
    }
  }

  // ── Variant nodes (for cart operations — full data) ──
  const variantNodes = variants?.edges
    ? variants.edges.map((edge) => {
        const v = edge.node
        return {
          id: v.id,
          title: v.title,
          available: v.availableForSale,
          price: parseFloat(v.price?.amount ?? v.price ?? 0),
          compareAtPrice: v.compareAtPrice
            ? parseFloat(v.compareAtPrice?.amount ?? v.compareAtPrice ?? 0)
            : null,
          inventoryQuantity: v.inventoryQuantity ?? null,
          selectedOptions: v.selectedOptions,
          image: v.image?.url ?? null,
        }
      })
    : []

  // ── "New" badge ──
  const tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [])
  const isNew =
    tagList.includes('new') ||
    (createdAt &&
      Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000)

  // ── Rating / reviews from metafields ──
  let rating = 4.5
  let reviewCount = 0
  if (metafields) {
    for (const mf of metafields) {
      if (mf?.key === 'rating' && mf.value) rating = parseFloat(mf.value)
      if (mf?.key === 'review_count' && mf.value)
        reviewCount = parseInt(mf.value, 10)
    }
  }

  // ── Sold out status ──
  const isSoldOut =
    availableForSale === false ||
    status === 'DRAFT' ||
    status === 'ARCHIVED' ||
    (shopifyProduct.totalInventory !== undefined &&
      shopifyProduct.totalInventory <= 0)

  return {
    id: handle || extractGid(id),
    shopifyId: id,
    handle,
    brand: vendor || '',
    category: productType || 'Uncategorized',
    name: title,
    price,
    originalPrice,
    rating,
    reviewCount,
    isNew,
    isSoldOut,
    images: imageUrls,
    description: description || '',
    descriptionHtml: descriptionHtml || '',
    variants: variantMap,
    variantNodes,
    tags: tagList,
  }
}

/**
 * Normalize a list of product edges from a Shopify products connection.
 */
export function normalizeProductEdges(edges) {
  if (!edges) return []
  return edges.map((edge) => normalizeProduct(edge.node)).filter(Boolean)
}

/**
 * Normalize a Shopify collection node.
 */

export function normalizeCollection(shopifyCollection) {
  if (!shopifyCollection) return null

  return {
    id: shopifyCollection.handle || extractGid(shopifyCollection.id),
    shopifyId: shopifyCollection.id,
    handle: shopifyCollection.handle,
    title: shopifyCollection.title,
    description: shopifyCollection.description || '',
    image: shopifyCollection.image?.url || null,
    productCount: shopifyCollection.productsCount?.count ?? (shopifyCollection.products?.edges?.length ?? 0),
    products: shopifyCollection.products?.edges
      ? normalizeProductEdges(shopifyCollection.products.edges)
      : [],
  }
}
