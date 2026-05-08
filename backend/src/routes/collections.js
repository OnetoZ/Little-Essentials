/**
 * Collections Routes
 *
 * Uses Storefront API for reading collections, falls back to Admin API.
 * Returns normalized data ready for frontend.
 */

import { Router } from 'express'
import { storefrontFetch, isStorefrontConfigured } from '../lib/shopifyStorefront.js'
import { adminFetch, isAuthenticated } from '../lib/shopifyAdmin.js'
import { normalizeCollection, normalizeProductEdges } from '../lib/shopifyAdapter.js'

const router = Router()

// ─── Storefront product fields (for collection products) ─────────────
const SF_PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  productType
  tags
  availableForSale
  createdAt
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 4) {
    edges { node { url altText width height } }
  }
  variants(first: 20) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`

// ─── GET /api/collections ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { first = 20 } = req.query
    let collections = []

    if (isStorefrontConfigured()) {
      try {
        const data = await storefrontFetch(
          `query Collections($first: Int!) {
            collections(first: $first) {
              edges {
                node {
                  id
                  handle
                  title
                  description
                  image { url altText width height }
                }
              }
            }
          }`,
          { first: parseInt(first, 10) },
        )
        collections = data.collections.edges.map((e) => ({
          ...e.node,
          productsCount: { count: 0 },
        }))
      } catch (err) {
        console.error('[Collections] Storefront API failed:', err.message)
      }
    }

    // Fallback to Admin API
    if (collections.length === 0 && isAuthenticated()) {
      const data = await adminFetch(
        `query Collections($first: Int!) {
          collections(first: $first) {
            edges {
              node {
                id
                handle
                title
                description
                image { url altText width height }
                productsCount { count }
              }
            }
          }
        }`,
        { first: parseInt(first, 10) },
      )
      collections = data.collections.edges.map((e) => e.node)
    }

    const normalized = collections
      .map((c) => normalizeCollection(c))
      .filter(Boolean)

    const categories = ['All', ...normalized.map((c) => c.title)]

    res.json({ success: true, collections: normalized, categories })
  } catch (error) {
    console.error('[GET /api/collections]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ─── GET /api/collections/:handle ────────────────────────────────────
router.get('/:handle', async (req, res) => {
  try {
    const { first = 24, after, sortKey = 'MANUAL', reverse = false } = req.query
    let collection = null
    let productsData = null

    if (isStorefrontConfigured()) {
      try {
        const data = await storefrontFetch(
          `query CollectionByHandle($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
            collection(handle: $handle) {
              id
              handle
              title
              description
              image { url altText width height }
              products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
                pageInfo { hasNextPage endCursor }
                edges {
                  node { ${SF_PRODUCT_FIELDS} }
                }
              }
            }
          }`,
          {
            handle: req.params.handle,
            first: parseInt(first, 10),
            after: after || null,
            sortKey,
            reverse: reverse === 'true',
          },
        )
        if (data.collection) {
          collection = data.collection
          productsData = data.collection.products
        }
      } catch (err) {
        console.error('[Collections] Storefront API failed:', err.message)
      }
    }

    // Fallback to Admin API
    if (!collection && isAuthenticated()) {
      const data = await adminFetch(
        `query CollectionByHandle($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
          collectionByHandle(handle: $handle) {
            id
            handle
            title
            description
            image { url altText width height }
            productsCount { count }
            products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
              pageInfo { hasNextPage endCursor }
              edges {
                node {
                  id handle title vendor productType tags availableForSale createdAt
                  priceRangeV2 { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
                  compareAtPriceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
                  images(first: 4) { edges { node { url altText width height } } }
                  options { name values }
                  variants(first: 20) { edges { node { id title availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } } } }
                }
              }
            }
          }
        }`,
        {
          handle: req.params.handle,
          first: parseInt(first, 10),
          after: after || null,
          sortKey,
          reverse: reverse === 'true',
        },
      )
      if (data.collectionByHandle) {
        collection = data.collectionByHandle
        productsData = data.collectionByHandle.products
      }
    }

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' })
    }

    const normalizedCollection = normalizeCollection(collection)
    const products = normalizeProductEdges(productsData?.edges || [])

    res.json({
      success: true,
      collection: normalizedCollection,
      products,
      pageInfo: productsData?.pageInfo || { hasNextPage: false, endCursor: null },
    })
  } catch (error) {
    console.error('[GET /api/collections/:handle]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
