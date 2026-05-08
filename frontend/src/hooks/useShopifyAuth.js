import { useCallback, useState, useEffect } from 'react'
import { apiPost } from '../lib/api'
import useStore from '../store/useStore'

/**
 * Hook for Shopify Customer Authentication.
 * Manages login, registration, and user session.
 */
export function useShopifyAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Get user state from global store if available, or local storage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('le_customer')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost('/api/auth/customer/login', { email, password })
      
      const session = {
        token: data.token,
        customer: data.customer,
        expiresAt: data.expiresAt
      }
      
      localStorage.setItem('le_customer', JSON.stringify(session))
      setUser(session)
      return session
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (firstName, lastName, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost('/api/auth/customer/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      })
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('le_customer')
    setUser(null)
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!user?.customer?.email) return []
    try {
      const { apiGet } = await import('../lib/api')
      const data = await apiGet(`/api/orders/customer/${user.customer.email}`)
      return data.orders || []
    } catch (err) {
      console.error('Error fetching orders:', err)
      return []
    }
  }, [user])

  const fetchProfile = useCallback(async () => {
    if (!user?.token) return null
    try {
      const data = await apiPost('/api/auth/customer/profile', { accessToken: user.token })
      if (data.success) {
        const updatedSession = { ...user, customer: data.customer }
        localStorage.setItem('le_customer', JSON.stringify(updatedSession))
        setUser(updatedSession)
        return data.customer
      }
      return null
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [user])

  const addAddress = useCallback(async (address) => {
    if (!user?.token) return
    const data = await apiPost('/api/auth/customer/address/create', { accessToken: user.token, address })
    if (data.success) await fetchProfile()
    return data
  }, [user, fetchProfile])

  const updateAddress = useCallback(async (addressId, address) => {
    if (!user?.token) return
    const data = await apiPost('/api/auth/customer/address/update', { accessToken: user.token, addressId, address })
    if (data.success) await fetchProfile()
    return data
  }, [user, fetchProfile])

  const deleteAddress = useCallback(async (addressId) => {
    if (!user?.token) return
    const data = await apiPost('/api/auth/customer/address/delete', { accessToken: user.token, addressId })
    if (data.success) await fetchProfile()
    return data
  }, [user, fetchProfile])

  const setDefaultAddress = useCallback(async (addressId) => {
    if (!user?.token) return
    const data = await apiPost('/api/auth/customer/address/default', { accessToken: user.token, addressId })
    if (data.success) await fetchProfile()
    return data
  }, [user, fetchProfile])

  const isAuthenticated = Boolean(user?.token)

  return {
    user: user?.customer || null,
    token: user?.token || null,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    fetchOrders,
    fetchProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
}
