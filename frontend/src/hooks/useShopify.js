import { useCallback, useEffect, useRef, useState } from 'react'
import { apiGet } from '../lib/api'
import {
  products as mockProducts,
  categories as mockCategories,
  getProductById as getMockProductById,
  getByCategory as getMockByCategory,
  getNewArrivals as getMockNewArrivals,
  getFeatured as getMockFeatured,
} from '../data/mockProducts'

/**
 * Check whether the backend URL is configured.
 * If not, hooks transparently fall back to mock data.
 */
const isBackendConfigured = () =>
  Boolean(import.meta.env.VITE_BACKEND_URL)

// ─── useShopifyProducts ──────────────────────────────────────────────

/**
 * Fetch products from the backend. Falls back to mock data when the
 * backend is not configured or unreachable.
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
      if (!isBackendConfigured()) {
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

      // ── Fetch from backend API ──
      const data = await apiGet('/api/products', {
        first,
        sortKey,
        reverse,
        category: category !== 'All' ? category : undefined,
        filter: filter || undefined,
        search: search || undefined,
      })

      if (id !== abortRef.current) return

      setProducts(data.products || [])
      setHasNextPage(data.pageInfo?.hasNextPage ?? false)
      setEndCursor(data.pageInfo?.endCursor ?? null)
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
    if (!hasNextPage || !endCursor || !isBackendConfigured()) return

    setLoading(true)
    try {
      const data = await apiGet('/api/products', {
        first,
        after: endCursor,
        sortKey,
        reverse,
      })

      setProducts((prev) => [...prev, ...(data.products || [])])
      setHasNextPage(data.pageInfo?.hasNextPage ?? false)
      setEndCursor(data.pageInfo?.endCursor ?? null)
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
        if (!isBackendConfigured()) {
          const mock = getMockProductById(handleOrId)
          if (!cancelled) setProduct(mock ?? null)
          return
        }

        const data = await apiGet(`/api/products/${handleOrId}`)
        if (!cancelled) {
          setProduct(data.product ?? null)
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
 * Fetch all collections from the backend.
 * Falls back to mock categories if backend is not configured.
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
        if (!isBackendConfigured()) {
          setCategories(mockCategories)
          setCollections([])
          return
        }

        const data = await apiGet('/api/collections')
        if (!cancelled) {
          setCollections(data.collections || [])
          setCategories(data.categories || mockCategories)
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

// ─── useShopifySearch ────────────────────────────────────────────────

/**
 * Search products via the backend.
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
        if (!isBackendConfigured()) {
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

        const data = await apiGet('/api/products', { search: query, first })
        if (!cancelled) {
          setResults(data.products || [])
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
