/**
 * Shopify → Little Essentials Data Adapter (Commented Out)
 *
 * Shopify mapping logic commented out.
 */

export function extractGid(gid) {
  if (!gid) return ''
  const parts = gid.split('/')
  return parts[parts.length - 1]
}

export function normalizeProduct(shopifyProduct) {
  /*
  // Shopify product normalization commented out
  ...
  */
  return shopifyProduct || null
}

export function normalizeProductEdges(edges) {
  /*
  // Shopify product edges normalization commented out
  ...
  */
  if (!Array.isArray(edges)) return []
  return edges.map(e => e.node || e)
}

export function normalizeCollection(collectionNode) {
  /*
  // Shopify collection normalization commented out
  ...
  */
  return collectionNode || null
}
