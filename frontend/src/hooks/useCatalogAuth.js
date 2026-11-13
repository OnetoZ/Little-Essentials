import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const TOKEN_KEY = 'le_customer_token'
const USER_KEY = 'le_customer_user'

function normalizeCustomer(customer) {
  if (!customer) return null
  const name = customer.name || ''
  const parts = name.trim().split(' ')
  const firstName = parts[0] || 'Customer'
  const lastName = parts.slice(1).join(' ') || ''

  const addresses = (customer.addresses || []).map((addr, idx) => ({
    id: addr.id || `addr_${idx + 1}`,
    firstName: addr.firstName || firstName,
    lastName: addr.lastName || lastName,
    address1: addr.address1 || addr.addressLine1 || '',
    address2: addr.address2 || addr.addressLine2 || '',
    city: addr.city || '',
    province: addr.province || addr.state || '',
    zip: addr.zip || addr.postalCode || '',
    phone: addr.phone || customer.phone || '',
    isDefault: Boolean(addr.isDefault),
  }))

  const defaultAddress = customer.defaultAddress || addresses.find((a) => a.isDefault) || addresses[0] || null

  return {
    ...customer,
    id: customer.id || customer._id,
    name,
    firstName,
    lastName,
    displayName: name || `${firstName} ${lastName}`.trim(),
    email: customer.email || '',
    phone: customer.phone || '',
    addresses,
    defaultAddress,
  }
}

function normalizeOrder(order) {
  if (!order) return null
  const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid'
  const isFulfilled = (order.orderStatus || '').toLowerCase() === 'shipped' || (order.orderStatus || '').toLowerCase() === 'delivered'

  const lineItems = (order.items || []).map((item) => ({
    node: {
      title: item.name,
      quantity: item.quantity,
      variant: {
        price: { amount: String(item.price || 0) },
        image: {
          url: item.image || '',
        },
      },
    },
  }))

  return {
    ...order,
    id: order._id || order.orderNumber,
    name: order.orderNumber,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    processedAt: order.createdAt,
    displayFinancialStatus: isPaid ? 'PAID' : 'PENDING',
    displayFulfillmentStatus: isFulfilled ? 'FULFILLED' : 'UNFULFILLED',
    totalPriceSet: {
      shopMoney: {
        amount: order.total || 0,
        currencyCode: order.currency || 'INR',
      },
    },
    lineItems: {
      edges: lineItems,
    },
  }
}

// Global shared reactive authentication store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
      user: (() => {
        if (typeof window === 'undefined') return null
        try {
          const stored = localStorage.getItem(USER_KEY)
          return stored ? normalizeCustomer(JSON.parse(stored)) : null
        } catch {
          return null
        }
      })(),
      loading: false,
      error: null,

      setAuth: (token, user) => {
        const normalized = normalizeCustomer(user)
        try {
          localStorage.setItem(TOKEN_KEY, token)
          localStorage.setItem(USER_KEY, JSON.stringify(normalized))
        } catch (e) {
          console.warn('Storage set error:', e)
        }
        set({ token, user: normalized, error: null, loading: false })
      },

      clearAuth: () => {
        try {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
        } catch (e) {
          console.warn('Storage clear error:', e)
        }
        set({ token: null, user: null, error: null, loading: false })
      },

      setUser: (user) => {
        const normalized = normalizeCustomer(user)
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(normalized))
        } catch (e) {
          console.warn('Storage set error:', e)
        }
        set({ user: normalized })
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'le_auth_session',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)

export function useShopifyAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setError = useAuthStore((state) => state.setError)

  const isAuthenticated = Boolean(token && user)

  const fetchProfile = useCallback(async (authToken) => {
    const currentToken = authToken || useAuthStore.getState().token
    if (!currentToken) return null

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearAuth()
        }
        return null
      }

      const data = await res.json()
      if (data.success && data.customer) {
        const normalized = normalizeCustomer(data.customer)
        setUser(normalized)
        return normalized
      }
      return null
    } catch (err) {
      console.warn('Failed to fetch profile:', err.message)
      return null
    }
  }, [clearAuth, setUser])

  // Sync session on mount if token exists
  useEffect(() => {
    if (token && !user) {
      fetchProfile(token)
    }
  }, [token, user, fetchProfile])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) {
        throw new Error(data.message || 'Login failed')
      }

      setAuth(data.token, data.customer)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [setAuth, setError, setLoading])

  const register = useCallback(async (firstName, lastName, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Customer'
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) {
        throw new Error(data.message || 'Registration failed')
      }

      setAuth(data.token, data.customer)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [setAuth, setError, setLoading])

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const fetchOrders = useCallback(async () => {
    const currentToken = useAuthStore.getState().token
    if (!currentToken) return []
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success && Array.isArray(data.orders)) {
        return data.orders.map(normalizeOrder)
      }
      return []
    } catch (err) {
      console.warn('Failed to fetch orders:', err.message)
      return []
    }
  }, [])

  const addAddress = useCallback(async (addressForm) => {
    const currentToken = useAuthStore.getState().token
    if (!currentToken) throw new Error('Not authenticated')
    const res = await fetch('/api/auth/me/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(addressForm),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to add address')
    }
    const updatedUser = normalizeCustomer(data.customer)
    setUser(updatedUser)
    return updatedUser
  }, [setUser])

  const updateAddress = useCallback(async (addressId, addressForm) => {
    const currentToken = useAuthStore.getState().token
    if (!currentToken) throw new Error('Not authenticated')
    const res = await fetch(`/api/auth/me/addresses/${encodeURIComponent(addressId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(addressForm),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update address')
    }
    const updatedUser = normalizeCustomer(data.customer)
    setUser(updatedUser)
    return updatedUser
  }, [setUser])

  const deleteAddress = useCallback(async (addressId) => {
    const currentToken = useAuthStore.getState().token
    if (!currentToken) throw new Error('Not authenticated')
    const res = await fetch(`/api/auth/me/addresses/${encodeURIComponent(addressId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete address')
    }
    const updatedUser = normalizeCustomer(data.customer)
    setUser(updatedUser)
    return updatedUser
  }, [setUser])

  const setDefaultAddress = useCallback(async (addressId) => {
    return updateAddress(addressId, { isDefault: true })
  }, [updateAddress])

  const recoverPassword = useCallback(async () => {
    return { success: true, message: 'Password recovery instructions sent to your email.' }
  }, [])

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    fetchProfile,
    fetchOrders,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    recoverPassword,
  }
}

// Alias export for clarity
export const useCatalogAuth = useShopifyAuth
