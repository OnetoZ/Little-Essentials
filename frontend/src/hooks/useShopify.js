import { useCallback, useEffect, useRef, useState } from 'react'
// Shopify Storefront API imports commented out
// import { storefrontFetch, isStorefrontConfigured } from '../lib/shopifyClient'
// import { normalizeProduct, normalizeProductEdges, normalizeCollection } from '../lib/shopifyAdapter'
// import {
//   ALL_PRODUCTS_QUERY,
//   SEARCH_PRODUCTS_QUERY,
//   PRODUCT_BY_HANDLE_QUERY,
//   ALL_COLLECTIONS_QUERY,
//   COLLECTION_BY_HANDLE_QUERY,
// } from '../lib/shopifyQueries'
import {
  products as mockProducts,
  categories as mockCategories,
  mockCollections,
  getProductById as getMockProductById,
  getByCategory as getMockByCategory,
  getNewArrivals as getMockNewArrivals,
  getFeatured as getMockFeatured,
} from '../data/mockProducts'

// ─── Mock Data Filter & Sort Helper ───────────────────────────────────

function filterAndSortMockProducts({
  category = 'All',
  filter = '',
  search = '',
  collectionHandle = '',
  sortKey = 'BEST_SELLING',
  reverse = false,
  first = 24,
} = {}) {
  let result = [...mockProducts]

  // Filter by collection handle if provided
  if (collectionHandle) {
    const coll = mockCollections.find(
      (c) => c.handle.toLowerCase() === collectionHandle.toLowerCase(),
    )
    if (coll) {
      result = [...coll.products]
    }
  } else if (category && category !== 'All') {
    result = getMockByCategory(category)
  }

  // "new" filter
  if (filter === 'new') {
    const filtered = result.filter((p) => p.isNew)
    if (filtered.length > 0) {
      result = filtered
    }
  }

  // Text search
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
    case 'CREATED':
      result.sort((a, b) =>
        reverse
          ? Number(a.isNew) - Number(b.isNew)
          : Number(b.isNew) - Number(a.isNew),
      )
      break
    case 'BEST_SELLING':
    default:
      result.sort((a, b) =>
        reverse
          ? (a.rating || 0) - (b.rating || 0)
          : (b.rating || 0) - (a.rating || 0),
      )
      break
  }

  if (first && first > 0) {
    result = result.slice(0, first)
  }

  return result
}

// ─── useShopifyProducts ──────────────────────────────────────────────

/**
 * Fetch products directly from local catalogue.
 * Shopify Storefront calls and fallbacks are commented out to run locally.
 */
export function useShopifyProducts({
  first = 24,
  sortKey = 'BEST_SELLING',
  reverse = false,
  category = 'All',
  filter = '',
  search = '',
  collectionHandle = '',
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

    // Load products directly from local catalogue without calling Shopify or Shopify fallbacks
    const result = filterAndSortMockProducts({
      category,
      filter,
      search,
      collectionHandle,
      sortKey,
      reverse,
      first,
    })

    if (id === abortRef.current) {
      setProducts(result)
      setHasNextPage(false)
      setEndCursor(null)
      setLoading(false)
    }

    /*
    // ── Shopify Storefront API Call & Fallback (Commented Out) ────────
    try {
      if (!isStorefrontConfigured()) {
        const result = filterAndSortMockProducts({
          category,
          filter,
          search,
          collectionHandle,
          sortKey,
          reverse,
          first,
        })

        if (id === abortRef.current) {
          setProducts(result)
          setHasNextPage(false)
          setEndCursor(null)
          setLoading(false)
        }
        return
      }

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
      } else if (collectionHandle) {
        const collSortKey = sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
        data = await storefrontFetch(COLLECTION_BY_HANDLE_QUERY, {
          handle: collectionHandle,
          first,
          after: null,
          sortKey: collSortKey,
          reverse,
        })
        edges = data.collection?.products?.edges || []
        pageInfo = data.collection?.products?.pageInfo || { hasNextPage: false, endCursor: null }
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

      if (filter === 'new') {
        const filtered = normalized.filter((p) => p.isNew)
        if (filtered.length > 0) {
          normalized = filtered
        }
      }

      setProducts(normalized)
      setHasNextPage(pageInfo?.hasNextPage ?? false)
      setEndCursor(pageInfo?.endCursor ?? null)
    } catch (err) {
      if (id === abortRef.current) {
        console.warn('[useShopifyProducts] Storefront fallback triggered:', err.message)
        const fallback = filterAndSortMockProducts({
          category,
          filter,
          search,
          collectionHandle,
          sortKey,
          reverse,
          first,
        })
        setProducts(fallback)
        setError(null)
        setHasNextPage(false)
        setEndCursor(null)
      }
    } finally {
      if (id === abortRef.current) setLoading(false)
    }
    // ──────────────────────────────────────────────────────────────────
    */
  }, [first, sortKey, reverse, category, filter, search, collectionHandle])

  useEffect(() => {
    load()
  }, [load])

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    /*
    // ── Shopify Storefront Pagination (Commented Out) ─────────────────
    if (!hasNextPage || !endCursor || !isStorefrontConfigured()) return

    setLoading(true)
    try {
      let data
      let edges
      let info

      if (collectionHandle) {
        const collSortKey = sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
        data = await storefrontFetch(COLLECTION_BY_HANDLE_QUERY, {
          handle: collectionHandle,
          first,
          after: endCursor,
          sortKey: collSortKey,
          reverse,
        })
        edges = data.collection?.products?.edges || []
        info = data.collection?.products?.pageInfo
      } else {
        data = await storefrontFetch(ALL_PRODUCTS_QUERY, {
          first,
          after: endCursor,
          sortKey,
          reverse,
        })
        edges = data.products.edges
        info = data.products.pageInfo
      }

      const newProducts = normalizeProductEdges(edges)
      setProducts((prev) => [...prev, ...newProducts])
      setHasNextPage(info?.hasNextPage ?? false)
      setEndCursor(info?.endCursor ?? null)
    } catch (err) {
      console.error('[useShopifyProducts:loadMore]', err)
    } finally {
      setLoading(false)
    }
    // ──────────────────────────────────────────────────────────────────
    */
  }, [/* hasNextPage, endCursor, first, sortKey, reverse, collectionHandle */])

  return { products, loading, error, hasNextPage, loadMore, refetch: load }
}

// ─── useShopifyProduct ───────────────────────────────────────────────

/**
 * Fetch a single product by handle or ID from local catalogue.
 * Shopify Storefront call and fallback commented out.
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

      // Direct local product resolution without calling Shopify Storefront API or fallback handler
      const mock = getMockProductById(handleOrId)
      if (!cancelled) {
        setProduct(mock ?? null)
        setError(mock ? null : 'Product not found')
        setLoading(false)
      }

      /*
      // ── Shopify Storefront Product Fetch & Fallback (Commented Out) ──
      try {
        if (!isStorefrontConfigured()) {
          const mock = getMockProductById(handleOrId)
          if (!cancelled) {
            setProduct(mock ?? null)
            setError(mock ? null : 'Product not found')
          }
          return
        }

        const data = await storefrontFetch(PRODUCT_BY_HANDLE_QUERY, {
          handle: handleOrId,
        })
        if (!cancelled) {
          const normalized = normalizeProduct(data.productByHandle)
          if (normalized) {
            setProduct(normalized)
            setError(null)
          } else {
            const mock = getMockProductById(handleOrId)
            setProduct(mock ?? null)
            setError(mock ? null : 'Product not found')
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useShopifyProduct] Storefront fallback triggered:', err.message)
          const mock = getMockProductById(handleOrId)
          setProduct(mock ?? null)
          setError(mock ? null : 'Product not found')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
      // ──────────────────────────────────────────────────────────────────
      */
    }

    if (handleOrId) load()
    else {
      setProduct(null)
      setError(null)
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
 * Fetch all collections directly from local catalogue.
 * Shopify Storefront API call and fallback commented out.
 */
export function useShopifyCollections() {
  const [collections, setCollections] = useState(mockCollections)
  const [categories, setCategories] = useState(mockCategories)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load local collections and categories directly without calling Shopify
    setCategories(mockCategories)
    setCollections(mockCollections)
    setLoading(false)

    /*
    // ── Shopify Storefront Collections Fetch & Fallback (Commented Out) 
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        if (!isStorefrontConfigured()) {
          if (!cancelled) {
            setCategories(mockCategories)
            setCollections(mockCollections)
          }
          return
        }

        const data = await storefrontFetch(ALL_COLLECTIONS_QUERY, { first: 20 })

        if (!cancelled) {
          const raw = data.collections?.edges?.map((e) => ({
            ...e.node,
            productsCount: { count: 0 },
          })) || []
          const normalized = raw
            .map((c) => normalizeCollection(c))
            .filter(Boolean)

          if (normalized.length > 0) {
            setCollections(normalized)
            setCategories(['All', ...normalized.map((c) => c.title)])
          } else {
            setCollections(mockCollections)
            setCategories(mockCategories)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useShopifyCollections] Storefront fallback triggered:', err.message)
          setCategories(mockCategories)
          setCollections(mockCollections)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // ──────────────────────────────────────────────────────────────────
    */
  }, [])

  return { collections, categories, loading }
}

// ─── useShopifyCollection ────────────────────────────────────────────

/**
 * Fetch a single collection and its products by handle from local catalogue.
 * Shopify Storefront API call and fallback commented out.
 */
export function useShopifyCollection(handle, { first = 24, sortKey = 'MANUAL', reverse = false } = {}) {
  const [collection, setCollection] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null })

  useEffect(() => {
    if (!handle) return

    // Resolve collection directly from local mock catalogue without calling Shopify
    const matchedColl = mockCollections.find(
      (c) => c.handle.toLowerCase() === handle.toLowerCase() || c.title.toLowerCase() === handle.toLowerCase()
    )
    setCollection(matchedColl || { id: handle, handle, title: handle, products: [] })
    setProducts(matchedColl?.products || [])
    setError(null)
    setLoading(false)

    /*
    // ── Shopify Storefront Collection Fetch & Fallback (Commented Out) ─
    let cancelled = false

    async function load() {
      if (!handle) return
      setLoading(true)
      setError(null)

      try {
        if (!isStorefrontConfigured()) {
          const matchedColl = mockCollections.find(
            (c) => c.handle.toLowerCase() === handle.toLowerCase() || c.title.toLowerCase() === handle.toLowerCase()
          )
          if (!cancelled) {
            setCollection(matchedColl || { id: handle, handle, title: handle, products: [] })
            setProducts(matchedColl?.products || [])
            setLoading(false)
          }
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
          console.warn('[useShopifyCollection] Storefront fallback triggered:', err.message)
          const matchedColl = mockCollections.find(
            (c) => c.handle.toLowerCase() === handle.toLowerCase() || c.title.toLowerCase() === handle.toLowerCase()
          )
          setCollection(matchedColl || { id: handle, handle, title: handle, products: [] })
          setProducts(matchedColl?.products || [])
          setError(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // ──────────────────────────────────────────────────────────────────
    */
  }, [handle, first, sortKey, reverse])

  return { collection, products, loading, error, pageInfo }
}

// ─── useShopifySearch ────────────────────────────────────────────────

/**
 * Search products via local catalogue.
 * Shopify Storefront API call and fallback commented out.
 */
export function useShopifySearch(query, first = 12) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    // Direct local search without calling Shopify Storefront API or fallback
    const lower = query.toLowerCase()
    const matches = mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower),
    ).slice(0, first)

    setResults(matches)
    setLoading(false)

    /*
    // ── Shopify Storefront Search & Fallback (Commented Out) ──────────
    let cancelled = false

    async function search() {
      setLoading(true)

      const fallbackSearch = () => {
        const lower = query.toLowerCase()
        return mockProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.brand.toLowerCase().includes(lower) ||
            p.category.toLowerCase().includes(lower),
        ).slice(0, first)
      }

      try {
        if (!isStorefrontConfigured()) {
          if (!cancelled) setResults(fallbackSearch())
          return
        }

        const data = await storefrontFetch(SEARCH_PRODUCTS_QUERY, {
          query,
          first,
        })
        if (!cancelled) {
          const edges = data?.search?.edges || []
          setResults(normalizeProductEdges(edges))
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useShopifySearch] Storefront fallback triggered:', err.message)
          setResults(fallbackSearch())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    search()
    return () => {
      cancelled = true
    }
    // ──────────────────────────────────────────────────────────────────
    */
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
