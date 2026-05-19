import { useCallback, useState, useEffect } from 'react'
import { storefrontFetch, isStorefrontConfigured } from '../lib/shopifyClient'
import {
  CUSTOMER_LOGIN_MUTATION,
  CUSTOMER_REGISTER_MUTATION,
  CUSTOMER_QUERY,
  CUSTOMER_PROFILE_QUERY,
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_ADDRESS_DELETE_MUTATION,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_RECOVER_MUTATION,
} from '../lib/shopifyQueries'

/**
 * Hook for Shopify Customer Authentication.
 * Manages login, registration, and user session — all via the
 * Shopify Storefront API directly. No backend needed.
 */
export function useShopifyAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Get user state from local storage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('le_customer')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      if (!isStorefrontConfigured()) {
        throw new Error('Shopify Storefront API is not configured. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN.')
      }

      // Create customer access token
      const tokenData = await storefrontFetch(CUSTOMER_LOGIN_MUTATION, {
        input: { email, password }
      })

      const { customerAccessToken, customerUserErrors } = tokenData.customerAccessTokenCreate

      if (customerUserErrors && customerUserErrors.length > 0) {
        let errorMessage = customerUserErrors[0].message;
        if (errorMessage === 'Unidentified customer') {
          errorMessage = 'Invalid email or password. If you are a new user, please create an account first.';
        }
        throw new Error(errorMessage);
      }

      // Fetch customer details using the token
      const customerData = await storefrontFetch(CUSTOMER_QUERY, {
        customerAccessToken: customerAccessToken.accessToken
      })

      const session = {
        token: customerAccessToken.accessToken,
        customer: customerData.customer,
        expiresAt: customerAccessToken.expiresAt
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
      if (!isStorefrontConfigured()) {
        throw new Error('Shopify Storefront API is not configured.')
      }

      const data = await storefrontFetch(CUSTOMER_REGISTER_MUTATION, {
        input: { firstName, lastName, email, password }
      })

      const { customer, customerUserErrors } = data.customerCreate

      if (customerUserErrors && customerUserErrors.length > 0) {
        throw new Error(customerUserErrors[0].message)
      }

      return { success: true, message: 'Account created successfully. Please log in.', customer }
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

  const recoverPassword = useCallback(async (email) => {
    setLoading(true)
    setError(null)
    try {
      if (!isStorefrontConfigured()) {
        throw new Error('Shopify Storefront API is not configured.')
      }

      const data = await storefrontFetch(CUSTOMER_RECOVER_MUTATION, { email })
      const result = data.customerRecover

      if (result.customerUserErrors && result.customerUserErrors.length > 0) {
        throw new Error(result.customerUserErrors[0].message)
      }

      return { success: true, message: 'Password recovery email sent.' }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!user?.token || !isStorefrontConfigured()) return []
    try {
      const data = await storefrontFetch(CUSTOMER_ORDERS_QUERY, {
        customerAccessToken: user.token,
        first: 20,
      })

      // Normalize orders from Storefront API format
      const orders = data.customer?.orders?.edges?.map(edge => {
        const o = edge.node
        return {
          id: o.id,
          name: o.name || `#${o.orderNumber}`,
          createdAt: o.processedAt,
          displayFulfillmentStatus: o.fulfillmentStatus,
          displayFinancialStatus: o.financialStatus,
          totalPriceSet: {
            shopMoney: {
              amount: o.totalPriceV2?.amount,
              currencyCode: o.totalPriceV2?.currencyCode,
            }
          },
          lineItems: {
            edges: o.lineItems?.edges?.map(le => ({
              node: {
                title: le.node.title,
                quantity: le.node.quantity,
                image: le.node.variant?.image || null,
              }
            })) || []
          }
        }
      }) || []

      return orders
    } catch (err) {
      console.error('Error fetching orders:', err)
      return []
    }
  }, [user])

  const fetchProfile = useCallback(async () => {
    if (!user?.token || !isStorefrontConfigured()) return null
    try {
      const data = await storefrontFetch(CUSTOMER_PROFILE_QUERY, {
        customerAccessToken: user.token
      })

      if (!data.customer) return null

      if (JSON.stringify(user?.customer) !== JSON.stringify(data.customer)) {
        const updatedSession = { ...user, customer: data.customer }
        localStorage.setItem('le_customer', JSON.stringify(updatedSession))
        setUser(updatedSession)
      }
      return data.customer
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [user])

  const addAddress = useCallback(async (address) => {
    if (!user?.token || !isStorefrontConfigured()) return
    const data = await storefrontFetch(CUSTOMER_ADDRESS_CREATE_MUTATION, {
      customerAccessToken: user.token,
      address
    })
    const result = data.customerAddressCreate
    if (result.customerUserErrors?.length > 0) {
      throw new Error(result.customerUserErrors[0].message)
    }
    await fetchProfile()
    return { success: true, addressId: result.customerAddress.id }
  }, [user, fetchProfile])

  const updateAddress = useCallback(async (addressId, address) => {
    if (!user?.token || !isStorefrontConfigured()) return
    const data = await storefrontFetch(CUSTOMER_ADDRESS_UPDATE_MUTATION, {
      customerAccessToken: user.token,
      id: addressId,
      address
    })
    const result = data.customerAddressUpdate
    if (result.customerUserErrors?.length > 0) {
      throw new Error(result.customerUserErrors[0].message)
    }
    await fetchProfile()
    return { success: true }
  }, [user, fetchProfile])

  const deleteAddress = useCallback(async (addressId) => {
    if (!user?.token || !isStorefrontConfigured()) return
    const data = await storefrontFetch(CUSTOMER_ADDRESS_DELETE_MUTATION, {
      customerAccessToken: user.token,
      id: addressId
    })
    const result = data.customerAddressDelete
    if (result.customerUserErrors?.length > 0) {
      throw new Error(result.customerUserErrors[0].message)
    }
    await fetchProfile()
    return { success: true }
  }, [user, fetchProfile])

  const setDefaultAddress = useCallback(async (addressId) => {
    if (!user?.token || !isStorefrontConfigured()) return
    const data = await storefrontFetch(CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION, {
      customerAccessToken: user.token,
      addressId
    })
    const result = data.customerDefaultAddressUpdate
    if (result.customerUserErrors?.length > 0) {
      throw new Error(result.customerUserErrors[0].message)
    }
    await fetchProfile()
    return { success: true }
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
    recoverPassword,
    fetchOrders,
    fetchProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
}
