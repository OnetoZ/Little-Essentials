import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchProducts,
  fetchProduct,
  fetchCategories,
  searchProducts,
} from '../lib/catalogApi'
import {
  products as mockProducts,
  categories as mockCategories,
  mockCollections,
  getProductById as getMockProductById,
  getByCategory as getMockByCategory,
} from '../data/mockProducts'

function mapSort(sortKey, reverse = false) {
  if (sortKey === 'PRICE') return reverse ? 'price_desc' : 'price_asc'
  if (sortKey === 'TITLE') return reverse ? 'name' : 'name'
  return 'newest'
}

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
  const pageRef = useRef(1)
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestRef.current
    pageRef.current = 1
    setLoading(true)
    setError(null)

    try {
      const result = await fetchProducts({
        search,
        category: collectionHandle || category,
        sort: mapSort(sortKey, reverse),
        page: 1,
        limit: first,
      })

      if (requestId !== requestRef.current) return

      let items = result.products
      if (filter === 'new') items = items.filter((p) => p.isNew)

      if (items.length === 0 && import.meta.env.VITE_FALLBACK_TO_MOCK !== 'false') {
        let fallback = [...mockProducts]
        if (collectionHandle) {
          const coll = mockCollections.find(c => c.handle.toLowerCase() === collectionHandle.toLowerCase())
          if (coll) fallback = [...coll.products]
        } else if (category && category !== 'All') {
          fallback = getMockByCategory(category)
        }
        if (filter === 'new') fallback = fallback.filter(p => p.isNew)
        if (search) fallback = fallback.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        items = fallback.slice(0, first)
      }

      setProducts(items)
      setHasNextPage(result.pagination.page < result.pagination.totalPages)
      setEndCursor(result.pagination.totalPages > 1 ? 2 : null)
    } catch (err) {
      if (requestId === requestRef.current) {
        if (import.meta.env.VITE_FALLBACK_TO_MOCK !== 'false') {
          let fallback = [...mockProducts]
          if (category && category !== 'All') fallback = getMockByCategory(category)
          if (filter === 'new') fallback = fallback.filter(p => p.isNew)
          setProducts(fallback.slice(0, first))
          setError(null)
        } else {
          setProducts([])
          setError(err.message || 'Unable to load products')
        }
        setHasNextPage(false)
        setEndCursor(null)
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [first, sortKey, reverse, category, filter, search, collectionHandle])

  useEffect(() => {
    load()
    return () => {
      requestRef.current += 1
    }
  }, [load])

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return

    const nextPage = pageRef.current + 1
    setLoading(true)

    try {
      const result = await fetchProducts({
        search,
        category: collectionHandle || category,
        sort: mapSort(sortKey, reverse),
        page: nextPage,
        limit: first,
      })

      pageRef.current = nextPage
      setProducts((previous) => [...previous, ...result.products])
      setHasNextPage(nextPage < result.pagination.totalPages)
      setEndCursor(nextPage < result.pagination.totalPages ? nextPage + 1 : null)
    } catch (err) {
      setError(err.message || 'Unable to load more products')
    } finally {
      setLoading(false)
    }
  }, [hasNextPage, loading, search, collectionHandle, category, sortKey, reverse, first])

  return { products, loading, error, hasNextPage, endCursor, loadMore, refetch: load }
}

export function useShopifyProduct(handleOrId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(Boolean(handleOrId))
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    if (!handleOrId) {
      setProduct(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetchProduct(handleOrId)
      .then((result) => {
        if (!cancelled) {
          const fallback = result || (import.meta.env.VITE_FALLBACK_TO_MOCK !== 'false'
            ? getMockProductById(handleOrId) || mockProducts.find(p => p.handle === handleOrId || p.id === handleOrId)
            : null)
          setProduct(fallback)
          setError(fallback ? null : 'Product not found')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const fallback = import.meta.env.VITE_FALLBACK_TO_MOCK !== 'false'
            ? getMockProductById(handleOrId) || mockProducts.find(p => p.handle === handleOrId || p.id === handleOrId)
            : null
          setProduct(fallback)
          setError(fallback ? null : (err.message || 'Product not found'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [handleOrId])

  return { product, loading, error }
}

export function useShopifyCollections() {
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchCategories()
      .then((items) => {
        if (cancelled) return

        if ((!items || items.length === 0) && import.meta.env.VITE_FALLBACK_TO_MOCK !== 'false') {
          setCategories(['All', ...mockCategories])
          setCollections(mockCollections)
          return
        }

        setCategories(['All', ...items])
        setCollections(items.map((name) => ({
          id: name,
          handle: name,
          title: name,
          products: [],
        })))
      })
      .catch((err) => {
        console.error('Unable to load categories:', err)
        if (!cancelled) {
          if (import.meta.env.VITE_FALLBACK_TO_MOCK !== 'false') {
            setCategories(['All', ...mockCategories])
            setCollections(mockCollections)
          } else {
            setCategories(['All'])
            setCollections([])
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { collections, categories, loading }
}

export function useShopifyCollection(
  handle,
  { first = 24, sortKey = 'MANUAL', reverse = false } = {},
) {
  const [collection, setCollection] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(Boolean(handle))
  const [error, setError] = useState(null)
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    endCursor: null,
  })

  useEffect(() => {
    let cancelled = false

    if (!handle) {
      setCollection(null)
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetchProducts({
      category: handle,
      sort: mapSort(sortKey, reverse),
      page: 1,
      limit: first,
    })
      .then((result) => {
        if (cancelled) return

        setCollection({
          id: handle,
          handle,
          title: handle,
          products: result.products,
        })
        setProducts(result.products)
        setPageInfo({
          hasNextPage: result.pagination.page < result.pagination.totalPages,
          endCursor: result.pagination.page < result.pagination.totalPages ? 2 : null,
        })
      })
      .catch((err) => {
        if (!cancelled) {
          setCollection(null)
          setProducts([])
          setError(err.message || 'Unable to load category')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [handle, first, sortKey, reverse])

  return { collection, products, loading, error, pageInfo }
}

export function useShopifySearch(query, first = 12) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    searchProducts(query.trim(), first)
      .then((items) => {
        if (!cancelled) setResults(items)
      })
      .catch((err) => {
        console.error('Product search failed:', err)
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, first])

  return { results, loading }
}
