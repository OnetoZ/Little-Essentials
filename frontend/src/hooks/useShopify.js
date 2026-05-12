import { useCallback, useEffect, useRef, useState } from 'react'
import { storefrontFetch, isStorefrontConfigured } from '../lib/shopifyClient'
import { normalizeProduct, normalizeProductEdges, normalizeCollection } from '../lib/shopifyAdapter'
import {
  ALL_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  ALL_COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
} from '../lib/shopifyQueries'
import {
  products as mockProducts,
  categories as mockCategories,
  getProductById as getMockProductById,
  getByCategory as getMockByCategory,
  getNewArrivals as getMockNewArrivals,
  getFeatured as getMockFeatured,
} from '../data/mockProducts'

// ─── useShopifyProducts ──────────────────────────────────────────────

/**
 * Fetch products directly from the Shopify Storefront API.
 * Falls back to mock data when the Storefront API is not configured.
 *
 * @param {Object} options
 * @param {number}  options.first     Number of products per page (default 24)
 * @param {string}  options.sortKey   TITLE | PRICE | BEST_SELLING | CREATED_AT
 * @param {boolean} options.reverse   Reverse sort direction
 * @param {string}  options.category  Filter by category name
 * @param {string}  options.filter    "new" to fetch only new arrivals
 * @param {string}  options.search    Search query string
 */
export function useShopifyProducts({
  first = 24,
  sortKey = 'BEST_SELLING',
  reverse = false,
  category = 'All',
  filter = '',
  search = '',
} = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor] = useState(null)
  const abortRef = useRef(0)

  const load = useCallback(async () => {
    const id = ++abortRef.current
    setLoading(true)
    setError(null)

    try {
      if (!isStorefrontConfigured()) {
        // ── Fallback to mock data ──
        let result =
          category && category !== 'All'
            ? getMockByCategory(category)
            : [...mockProducts]

        if (filter === 'new') {
          result = result.filter((p) => p.isNew)
        }

        if (search) {
          const lower = search.toLowerCase()
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(lower) ||
              p.brand.toLowerCase().includes(lower) ||
              p.category.toLowerCase().includes(lower),
          )
        }

        // Sort mock data
        switch (sortKey) {
          case 'PRICE':
            result.sort((a, b) =>
              reverse ? b.price - a.price : a.price - b.price,
            )
            break
          case 'TITLE':
            result.sort((a, b) =>
              reverse
                ? b.name.localeCompare(a.name)
                : a.name.localeCompare(b.name),
            )
            break
          case 'CREATED_AT':
            result.sort((a, b) =>
              reverse
                ? Number(a.isNew) - Number(b.isNew)
                : Number(b.isNew) - Number(a.isNew),
            )
            break
          default:
            break
        }

        if (id === abortRef.current) {
          setProducts(result)
          setHasNextPage(false)
          setEndCursor(null)
          setLoading(false)
        }
        return
      }

      // ── Fetch directly from Shopify Storefront API ──
      let data
      let edges
      let pageInfo

      if (search) {
        data = await storefrontFetch(SEARCH_PRODUCTS_QUERY, {
          query: search,
          first,
        })
        edges = data.search.edges
        pageInfo = { hasNextPage: false, endCursor: null }
      } else {
        data = await storefrontFetch(ALL_PRODUCTS_QUERY, {
          first,
          after: null,
          sortKey,
          reverse,
        })
        edges = data.products.edges
        pageInfo = data.products.pageInfo
      }

      if (id !== abortRef.current) return

      let normalized = normalizeProductEdges(edges)

      // Client-side category filter
      if (category && category !== 'All') {
        normalized = normalized.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase(),
        )
      }

      // "new" filter
      if (filter === 'new') {
        normalized = normalized.filter((p) => p.isNew)
      }

      setProducts(normalized)
      setHasNextPage(pageInfo?.hasNextPage ?? false)
      setEndCursor(pageInfo?.endCursor ?? null)
    } catch (err) {
      if (id === abortRef.current) {
        console.error('[useShopifyProducts]', err)
        setError(err.message)
        // Fallback to mock on error
        setProducts(
          category !== 'All' ? getMockByCategory(category) : [...mockProducts],
        )
      }
    } finally {
      if (id === abortRef.current) setLoading(false)
    }
  }, [first, sortKey, reverse, category, filter, search])

  useEffect(() => {
    load()
  }, [load])

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || !isStorefrontConfigured()) return

    setLoading(true)
    try {
      const data = await storefrontFetch(ALL_PRODUCTS_QUERY, {
        first,
        after: endCursor,
        sortKey,
        reverse,
      })

      const newProducts = normalizeProductEdges(data.products.edges)
      setProducts((prev) => [...prev, ...newProducts])
      setHasNextPage(data.products.pageInfo?.hasNextPage ?? false)
      setEndCursor(data.products.pageInfo?.endCursor ?? null)
    } catch (err) {
      console.error('[useShopifyProducts:loadMore]', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [hasNextPage, endCursor, first, sortKey, reverse])

  return { products, loading, error, hasNextPage, loadMore, refetch: load }
}

// ─── useShopifyProduct ───────────────────────────────────────────────

/**
 * Fetch a single product by handle or ID.
 */
export function useShopifyProduct(handleOrId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        if (!isStorefrontConfigured()) {
          const mock = getMockProductById(handleOrId)
          if (!cancelled) setProduct(mock ?? null)
          return
        }

        const data = await storefrontFetch(PRODUCT_BY_HANDLE_QUERY, {
          handle: handleOrId,
        })
        if (!cancelled) {
          setProduct(normalizeProduct(data.productByHandle) ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useShopifyProduct]', err)
          setError(err.message)
          // Fallback to mock
          const mock = getMockProductById(handleOrId)
          setProduct(mock ?? null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (handleOrId) load()
    else {
      setProduct(null)
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [handleOrId])

  return { product, loading, error }
}

// ─── useShopifyCollections ───────────────────────────────────────────

/**
 * Fetch all collections directly from Shopify Storefront API.
 * Falls back to mock categories if not configured.
 */
export function useShopifyCollections() {
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState(mockCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        if (!isStorefrontConfigured()) {
          setCategories(mockCategories)
          setCollections([])
          return
        }

        const data = await storefrontFetch(ALL_COLLECTIONS_QUERY, { first: 20 })

        if (!cancelled) {
          const raw = data.collections.edges.map((e) => ({
            ...e.node,
            productsCount: { count: 0 },
          }))
          const normalized = raw
            .map((c) => normalizeCollection(c))
            .filter(Boolean)

          setCollections(normalized)
          setCategories(['All', ...normalized.map((c) => c.title)])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useShopifyCollections]', err)
          setCategories(mockCategories)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { collections, categories, loading }
}

// ─── useShopifyCollection ────────────────────────────────────────────

/**
 * Fetch a single collection and its products by handle.
 */
export function useShopifyCollection(handle, { first = 24, sortKey = 'MANUAL', reverse = false } = {}) {
  const [collection, setCollection] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!handle) return
      setLoading(true)
      setError(null)

      try {
        if (!isStorefrontConfigured()) {
          if (!cancelled) setLoading(false)
          return
        }

        const data = await storefrontFetch(COLLECTION_BY_HANDLE_QUERY, {
          handle,
          first,
          after: null,
          sortKey,
          reverse,
        })

        if (!cancelled && data.collection) {
          setCollection(normalizeCollection(data.collection))
          setProducts(normalizeProductEdges(data.collection.products?.edges || []))
          setPageInfo(data.collection.products?.pageInfo || { hasNextPage: false, endCursor: null })
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useShopifyCollection]', err)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [handle, first, sortKey, reverse])

  return { collection, products, loading, error, pageInfo }
}

// ─── useShopifySearch ────────────────────────────────────────────────

/**
 * Search products via the Storefront API.
 */
export function useShopifySearch(query, first = 12) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!query || query.length < 2) {
      setResults([])
      return
    }

    async function search() {
      setLoading(true)

      try {
        if (!isStorefrontConfigured()) {
          const lower = query.toLowerCase()
          const filtered = mockProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(lower) ||
              p.brand.toLowerCase().includes(lower) ||
              p.category.toLowerCase().includes(lower),
          )
          if (!cancelled) setResults(filtered)
          return
        }

        const data = await storefrontFetch(SEARCH_PRODUCTS_QUERY, {
          query,
          first,
        })
        if (!cancelled) {
          setResults(normalizeProductEdges(data.search.edges))
        }
      } catch (err) {
        if (!cancelled) console.error('[useShopifySearch]', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    search()
    return () => {
      cancelled = true
    }
  }, [query, first])

  return { results, loading }
}

// ─── Helper exports for components using direct imports ──────────────

export function getCategories() {
  return mockCategories
}

export function getFeaturedProducts() {
  return getMockFeatured()
}

export function getNewArrivals() {
  return getMockNewArrivals()
}
