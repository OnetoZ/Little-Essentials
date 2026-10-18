import { useCallback, useState } from 'react'
// Shopify Storefront API imports commented out
// import { storefrontFetch, isStorefrontConfigured } from '../lib/shopifyClient'
// import {
//   CUSTOMER_LOGIN_MUTATION,
//   CUSTOMER_REGISTER_MUTATION,
//   CUSTOMER_QUERY,
//   CUSTOMER_PROFILE_QUERY,
//   CUSTOMER_ADDRESS_CREATE_MUTATION,
//   CUSTOMER_ADDRESS_UPDATE_MUTATION,
//   CUSTOMER_ADDRESS_DELETE_MUTATION,
//   CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
//   CUSTOMER_ORDERS_QUERY,
//   CUSTOMER_RECOVER_MUTATION,
// } from '../lib/shopifyQueries'

function createMockCustomerSession(email, firstName = 'Demo', lastName = 'Collector') {
  return {
    token: 'mock-customer-token-' + Date.now(),
    customer: {
      id: 'gid://shopify/Customer/10001',
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      email,
      phone: '+91 98765 43210',
      defaultAddress: {
        id: 'gid://shopify/MailingAddress/1001',
        firstName,
        lastName,
        address1: '12 Koregaon Park Road',
        address2: 'Suite 4B',
        city: 'Pune',
        province: 'Maharashtra',
        zip: '411001',
        country: 'India',
        phone: '+91 98765 43210',
      },
      addresses: {
        edges: [
          {
            node: {
              id: 'gid://shopify/MailingAddress/1001',
              firstName,
              lastName,
              address1: '12 Koregaon Park Road',
              address2: 'Suite 4B',
              city: 'Pune',
              province: 'Maharashtra',
              zip: '411001',
              country: 'India',
              phone: '+91 98765 43210',
            },
          },
        ],
      },
      orders: {
        edges: [
          {
            node: {
              id: 'gid://shopify/Order/1001',
              name: '#1001',
              orderNumber: 1001,
              processedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
              financialStatus: 'PAID',
              fulfillmentStatus: 'UNFULFILLED',
              totalPriceV2: { amount: '1800.00', currencyCode: 'INR' },
              subtotalPriceV2: { amount: '1800.00', currencyCode: 'INR' },
              totalShippingPriceV2: { amount: '0.00', currencyCode: 'INR' },
              totalTaxV2: { amount: '0.00', currencyCode: 'INR' },
              shippingAddress: {
                address1: '12 Koregaon Park Road',
                city: 'Pune',
                province: 'Maharashtra',
                zip: '411001',
              },
              lineItems: {
                edges: [
                  {
                    node: {
                      title: 'Cypress & Fir Ceramic Candle',
                      quantity: 1,
                      variant: {
                        image: {
                          url: 'https://images.unsplash.com/photo-1602928298849-325cec8771cc?w=800&q=85',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  }
}

/**
 * Hook for Customer Authentication.
 * Shopify Storefront calls and fallback blocks are commented out.
 * Runs authentication via local session directly.
 */
export function useShopifyAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get user state from local storage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('le_customer')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email) => {
    setLoading(true)
    setError(null)
    try {
      // Direct session login without Shopify Storefront call or fallback
      const session = createMockCustomerSession(email)
      localStorage.setItem('le_customer', JSON.stringify(session))
      setUser(session)
      return session

      /*
      // ── Shopify Storefront Login Call & Fallback (Commented Out) ─────
      if (!isStorefrontConfigured()) {
        const session = createMockCustomerSession(email)
        localStorage.setItem('le_customer', JSON.stringify(session))
        setUser(session)
        return session
      }

      const tokenData = await storefrontFetch(CUSTOMER_LOGIN_MUTATION, {
        input: { email, password },
      })

      const { customerAccessToken, customerUserErrors } = tokenData.customerAccessTokenCreate

      if (customerUserErrors && customerUserErrors.length > 0) {
        let errorMessage = customerUserErrors[0].message
        if (errorMessage === 'Unidentified customer') {
          errorMessage = 'Invalid email or password. If you are a new user, please create an account first.'
        }
        throw new Error(errorMessage)
      }

      const customerData = await storefrontFetch(CUSTOMER_QUERY, {
        customerAccessToken: customerAccessToken.accessToken,
      })

      const session = {
        token: customerAccessToken.accessToken,
        customer: customerData.customer,
        expiresAt: customerAccessToken.expiresAt,
      }

      localStorage.setItem('le_customer', JSON.stringify(session))
      setUser(session)
      return session
      // ──────────────────────────────────────────────────────────────────
      */
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (firstName, lastName, email) => {
    setLoading(true)
    setError(null)
    try {
      // Direct registration without Shopify Storefront call or fallback
      const session = createMockCustomerSession(email, firstName, lastName)
      localStorage.setItem('le_customer', JSON.stringify(session))
      setUser(session)
      return {
        success: true,
        message: 'Account created successfully. You are now logged in.',
        customer: session.customer,
      }

      /*
      // ── Shopify Storefront Register Call & Fallback (Commented Out) ──
      if (!isStorefrontConfigured()) {
        return {
          success: true,
          message: 'Account created successfully (demo mode). Please log in.',
        }
      }

      const data = await storefrontFetch(CUSTOMER_REGISTER_MUTATION, {
        input: { firstName, lastName, email, password },
      })

      const { customer, customerUserErrors } = data.customerCreate

      if (customerUserErrors && customerUserErrors.length > 0) {
        throw new Error(customerUserErrors[0].message)
      }

      return {
        success: true,
        message: 'Account created successfully. Please log in.',
        customer,
      }
      // ──────────────────────────────────────────────────────────────────
      */
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('le_customer')
    setUser(null)
  }, [])

  const recoverPassword = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      return { success: true, message: 'Password recovery email sent.' }

      /*
      // ── Shopify Storefront Password Recovery (Commented Out) ────────
      if (!isStorefrontConfigured()) {
        return { success: true, message: 'Password recovery email sent (demo mode).' }
      }

      const data = await storefrontFetch(CUSTOMER_RECOVER_MUTATION, { email })
      const result = data.customerRecover

      if (result.customerUserErrors && result.customerUserErrors.length > 0) {
        throw new Error(result.customerUserErrors[0].message)
      }

      return { success: true, message: 'Password recovery email sent.' }
      // ──────────────────────────────────────────────────────────────────
      */
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!user?.token) return []
    // Direct local order list without calling Shopify Storefront or fallback
    const mockEdges = user.customer?.orders?.edges || []
    return mockEdges.map((e) => {
      const o = e.node
      return {
        id: o.id,
        name: o.name || `#${o.orderNumber || '1001'}`,
        createdAt: o.processedAt || new Date().toISOString(),
        displayFulfillmentStatus: o.fulfillmentStatus || 'UNFULFILLED',
        displayFinancialStatus: o.financialStatus || 'PAID',
        statusUrl: null,
        subtotalPriceV2: o.subtotalPriceV2 || { amount: '1800.00', currencyCode: 'INR' },
        totalShippingPriceV2: o.totalShippingPriceV2 || { amount: '0.00', currencyCode: 'INR' },
        totalTaxV2: o.totalTaxV2 || { amount: '0.00', currencyCode: 'INR' },
        shippingAddress: o.shippingAddress,
        totalPriceSet: {
          shopMoney: {
            amount: o.totalPriceV2?.amount || '1800.00',
            currencyCode: o.totalPriceV2?.currencyCode || 'INR',
          },
        },
        lineItems: o.lineItems || {
          edges: [
            {
              node: {
                title: 'Cypress & Fir Ceramic Candle',
                quantity: 1,
                image: { url: 'https://images.unsplash.com/photo-1602928298849-325cec8771cc?w=800&q=85' },
              },
            },
          ],
        },
      }
    })

    /*
    // ── Shopify Storefront Customer Orders Query (Commented Out) ──────
    try {
      const data = await storefrontFetch(CUSTOMER_ORDERS_QUERY, {
        customerAccessToken: user.token,
        first: 20,
      })
      ...
    } catch (err) {
      console.warn('Error fetching orders, returning mock orders:', err.message)
    }
    // ──────────────────────────────────────────────────────────────────
    */
  }, [user])

  const fetchProfile = useCallback(async () => {
    if (!user?.token) return null
    // Direct local profile without calling Shopify Storefront or fallback
    return user.customer || null

    /*
    // ── Shopify Storefront Profile Query (Commented Out) ──────────────
    try {
      const data = await storefrontFetch(CUSTOMER_PROFILE_QUERY, {
        customerAccessToken: user.token,
      })
      ...
    } catch (err) {
      console.warn('Error fetching profile:', err.message)
      return user.customer || null
    }
    // ──────────────────────────────────────────────────────────────────
    */
  }, [user])

  const addAddress = useCallback(
    async (address) => {
      if (!user) return
      // Direct local address addition without calling Shopify
      const newAddr = {
        id: `gid://shopify/MailingAddress/${Date.now()}`,
        ...address,
      }
      const existingEdges = user.customer?.addresses?.edges || []
      const updatedCustomer = {
        ...user.customer,
        addresses: {
          edges: [...existingEdges, { node: newAddr }],
        },
      }
      const updatedSession = { ...user, customer: updatedCustomer }
      localStorage.setItem('le_customer', JSON.stringify(updatedSession))
      setUser(updatedSession)
      return { success: true, addressId: newAddr.id }

      /*
      // ── Shopify Address Mutation (Commented Out) ──────────────────────
      const data = await storefrontFetch(CUSTOMER_ADDRESS_CREATE_MUTATION, {
        customerAccessToken: user.token,
        address,
      })
      ...
      // ──────────────────────────────────────────────────────────────────
      */
    },
    [user],
  )

  const updateAddress = useCallback(
    async (addressId, address) => {
      if (!user) return
      // Direct local address update without calling Shopify
      const existingEdges = user.customer?.addresses?.edges || []
      const updatedCustomer = {
        ...user.customer,
        addresses: {
          edges: existingEdges.map((e) =>
            e.node.id === addressId
              ? { node: { ...e.node, ...address } }
              : e,
          ),
        },
      }
      const updatedSession = { ...user, customer: updatedCustomer }
      localStorage.setItem('le_customer', JSON.stringify(updatedSession))
      setUser(updatedSession)
      return { success: true }

      /*
      // ── Shopify Address Update Mutation (Commented Out) ───────────────
      const data = await storefrontFetch(CUSTOMER_ADDRESS_UPDATE_MUTATION, {
        customerAccessToken: user.token,
        id: addressId,
        address,
      })
      ...
      // ──────────────────────────────────────────────────────────────────
      */
    },
    [user],
  )

  const deleteAddress = useCallback(
    async (addressId) => {
      if (!user) return
      // Direct local address deletion without calling Shopify
      const existingEdges = user.customer?.addresses?.edges || []
      const updatedCustomer = {
        ...user.customer,
        addresses: {
          edges: existingEdges.filter((e) => e.node.id !== addressId),
        },
      }
      const updatedSession = { ...user, customer: updatedCustomer }
      localStorage.setItem('le_customer', JSON.stringify(updatedSession))
      setUser(updatedSession)
      return { success: true }

      /*
      // ── Shopify Address Delete Mutation (Commented Out) ───────────────
      const data = await storefrontFetch(CUSTOMER_ADDRESS_DELETE_MUTATION, {
        customerAccessToken: user.token,
        id: addressId,
      })
      ...
      // ──────────────────────────────────────────────────────────────────
      */
    },
    [user],
  )

  const setDefaultAddress = useCallback(
    async (addressId) => {
      if (!user) return
      // Direct local default address set without calling Shopify
      const matched = user.customer?.addresses?.edges?.find(
        (e) => e.node.id === addressId,
      )?.node
      if (matched) {
        const updatedCustomer = { ...user.customer, defaultAddress: matched }
        const updatedSession = { ...user, customer: updatedCustomer }
        localStorage.setItem('le_customer', JSON.stringify(updatedSession))
        setUser(updatedSession)
      }
      return { success: true }

      /*
      // ── Shopify Address Default Mutation (Commented Out) ──────────────
      const data = await storefrontFetch(CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION, {
        customerAccessToken: user.token,
        addressId,
      })
      ...
      // ──────────────────────────────────────────────────────────────────
      */
    },
    [user],
  )

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
    setDefaultAddress,
  }
}
