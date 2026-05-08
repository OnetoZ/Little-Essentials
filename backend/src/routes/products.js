/**
 * Products Routes
 *
 * Uses the Storefront API (public token) for reading products.
 * Falls back to Admin API if Storefront is not available.
 * Returns normalized product data ready for the frontend.
 */

import { Router } from 'express'
import { storefrontFetch, isStorefrontConfigured } from '../lib/shopifyStorefront.js'
import { adminFetch, isAuthenticated } from '../lib/shopifyAdmin.js'
import { normalizeProduct, normalizeProductEdges } from '../lib/shopifyAdapter.js'

const router = Router()

// ─── Storefront API product fields ───────────────────────────────────
const SF_PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  productType
  tags
  availableForSale
  createdAt
  description
  descriptionHtml
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 6) {
    edges { node { url altText width height } }
  }
  variants(first: 30) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
  options { name values }
  metafields(identifiers: [
    { namespace: "custom", key: "rating" },
    { namespace: "custom", key: "review_count" }
  ]) {
    key
    value
  }
`

// ─── Admin API product fields (fallback) ─────────────────────────────
const ADMIN_PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  productType
  tags
  status
  totalInventory
  availableForSale
  createdAt
  description
  descriptionHtml
  priceRangeV2 {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 6) {
    edges { node { url altText width height } }
  }
  variants(first: 30) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        inventoryQuantity
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
  options { name values }
  metafields(identifiers: [
    { namespace: "custom", key: "rating" },
    { namespace: "custom", key: "review_count" }
  ]) {
    key
    value
  }
`

/**
 * Fetch products using whichever API is available.
 * Priority: Storefront API → Admin API
 */
async function fetchProducts({ first = 24, after = null, sortKey = 'BEST_SELLING', reverse = false, searchQuery = null }) {
  // Try Storefront API first (public token, always works)
  if (isStorefrontConfigured()) {
    try {
      if (searchQuery) {
        const data = await storefrontFetch(
          `query SearchProducts($query: String!, $first: Int!) {
            search(query: $query, first: $first, types: PRODUCT) {
              edges {
                node {
                  ... on Product { ${SF_PRODUCT_FIELDS} }
                }
              }
            }
          }`,
          { query: searchQuery, first },
        )
        return {
          edges: data.search.edges,
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      }

      const data = await storefrontFetch(
        `query AllProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
          products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
            pageInfo { hasNextPage endCursor }
            edges { node { ${SF_PRODUCT_FIELDS} } }
          }
        }`,
        { first, after, sortKey, reverse },
      )
      return data.products
    } catch (err) {
      console.error('[Products] Storefront API failed, trying Admin API:', err.message)
    }
  }

  // Fallback to Admin API (needs OAuth token)
  if (isAuthenticated()) {
    if (searchQuery) {
      const data = await adminFetch(
        `query SearchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query, sortKey: RELEVANCE) {
            pageInfo { hasNextPage endCursor }
            edges { node { ${ADMIN_PRODUCT_FIELDS} } }
          }
        }`,
        { query: searchQuery, first },
      )
      return data.products
    }

    const data = await adminFetch(
      `query AllProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
          pageInfo { hasNextPage endCursor }
          edges { node { ${ADMIN_PRODUCT_FIELDS} } }
        }
      }`,
      { first, after, sortKey, reverse },
    )
    return data.products
  }

  throw new Error('No Shopify API available. Configure Storefront token or complete OAuth.')
}

/**
 * Fetch a single product by handle.
 */
async function fetchSingleProduct(handle) {
  if (isStorefrontConfigured()) {
    try {
      const data = await storefrontFetch(
        `query ProductByHandle($handle: String!) {
          productByHandle(handle: $handle) { ${SF_PRODUCT_FIELDS} }
        }`,
        { handle },
      )
      return data.productByHandle
    } catch (err) {
      console.error('[Products] Storefront API failed for single product:', err.message)
    }
  }

  if (isAuthenticated()) {
    const data = await adminFetch(
      `query ProductByHandle($handle: String!) {
        productByHandle(handle: $handle) { ${ADMIN_PRODUCT_FIELDS} }
      }`,
      { handle },
    )
    return data.productByHandle
  }

  throw new Error('No Shopify API available.')
}

// ─── GET /api/products ───────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      first = 24,
      after,
      sortKey = 'BEST_SELLING',
      reverse = false,
      category,
      filter,
      search,
    } = req.query

    const result = await fetchProducts({
      first: parseInt(first, 10),
      after: after || null,
      sortKey,
      reverse: reverse === 'true',
      searchQuery: search || null,
    })

    let products = normalizeProductEdges(result.edges)

    // Server-side category filter
    if (category && category !== 'All') {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      )
    }

    // "new" filter
    if (filter === 'new') {
      products = products.filter((p) => p.isNew)
    }

    res.json({
      success: true,
      products,
      pageInfo: result.pageInfo,
    })
  } catch (error) {
    console.error('[GET /api/products]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ─── GET /api/products/featured ──────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const { first = 4 } = req.query

    const result = await fetchProducts({
      first: parseInt(first, 10),
      sortKey: 'BEST_SELLING',
    })

    const products = normalizeProductEdges(result.edges)
    res.json({ success: true, products })
  } catch (error) {
    console.error('[GET /api/products/featured]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ─── GET /api/products/new-arrivals ──────────────────────────────────
router.get('/new-arrivals', async (req, res) => {
  try {
    const { first = 8 } = req.query

    const result = await fetchProducts({
      first: parseInt(first, 10),
      sortKey: 'CREATED_AT',
      reverse: true,
    })

    const products = normalizeProductEdges(result.edges)
    res.json({ success: true, products })
  } catch (error) {
    console.error('[GET /api/products/new-arrivals]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ─── GET /api/products/:handle ───────────────────────────────────────
router.get('/:handle', async (req, res) => {
  try {
    const raw = await fetchSingleProduct(req.params.handle)

    if (!raw) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    const product = normalizeProduct(raw)
    res.json({ success: true, product })
  } catch (error) {
    console.error('[GET /api/products/:handle]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
