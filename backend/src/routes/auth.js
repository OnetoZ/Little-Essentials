/**
 * Shopify OAuth Authentication Routes
 *
 * Implements the Shopify OAuth 2.0 flow for the new Dev Dashboard apps
 * that don't provide a static shpat_ token.
 *
 * Flow:
 *   1. Visit /api/auth/shopify → redirects to Shopify consent screen
 *   2. User authorizes → Shopify redirects to /api/auth/shopify/callback
 *   3. Backend exchanges the code for an access token
 *   4. Token is stored in .shopify-token.json
 *   5. All subsequent Admin API calls use this token
 */

import { Router } from 'express'
import crypto from 'node:crypto'
import { saveToken, loadToken, clearToken } from '../lib/tokenStore.js'

const router = Router()

const API_KEY = process.env.SHOPIFY_ADMIN_API_KEY
const API_SECRET = process.env.SHOPIFY_ADMIN_API_SECRET
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`

// Scopes your app needs — adjust as needed
const SCOPES = [
  'read_products',
  'read_product_listings',
  'write_draft_orders',
  'read_orders',
  'write_orders',
  'read_inventory',
  'read_collections',
  'read_content',
].join(',')

const REDIRECT_URI = `${BACKEND_URL}/api/auth/shopify/callback`

// In-memory nonce store (for CSRF protection during OAuth)
const nonceStore = new Set()

// ─── GET /api/auth/status ────────────────────────────────────────────
// Check if we have a valid Shopify access token
router.get('/status', (_req, res) => {
  const token = loadToken()

  res.json({
    authenticated: Boolean(token?.accessToken),
    shop: token?.shop || null,
    scope: token?.scope || null,
    obtainedAt: token?.obtainedAt || null,
  })
})

// ─── GET /api/auth/shopify ───────────────────────────────────────────
// Step 1: Redirect to Shopify's OAuth consent screen
router.get('/shopify', (_req, res) => {
  if (!API_KEY || !SHOP_DOMAIN) {
    return res.status(500).json({
      success: false,
      error: 'Missing SHOPIFY_ADMIN_API_KEY or SHOPIFY_STORE_DOMAIN in .env',
    })
  }

  // Generate a random nonce for CSRF protection
  const nonce = crypto.randomBytes(16).toString('hex')
  nonceStore.add(nonce)

  // Clean up old nonces after 10 minutes
  setTimeout(() => nonceStore.delete(nonce), 10 * 60 * 1000)

  const authUrl = new URL(`https://${SHOP_DOMAIN}/admin/oauth/authorize`)
  authUrl.searchParams.set('client_id', API_KEY)
  authUrl.searchParams.set('scope', SCOPES)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('state', nonce)

  console.log(`[Auth] Redirecting to Shopify OAuth...`)
  console.log(`[Auth] Redirect URI: ${REDIRECT_URI}`)

  res.redirect(authUrl.toString())
})

// ─── GET /api/auth/shopify/callback ──────────────────────────────────
// Step 2: Shopify redirects here with ?code=xxx&state=xxx&shop=xxx
router.get('/shopify/callback', async (req, res) => {
  try {
    const { code, state, shop, hmac } = req.query

    // Validate the nonce (CSRF protection)
    if (!state || !nonceStore.has(state)) {
      return res.status(403).send(`
        <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>❌ Authentication Failed</h2>
          <p>Invalid state parameter (CSRF check failed).</p>
          <p><a href="/api/auth/shopify">Try again</a></p>
        </body></html>
      `)
    }
    nonceStore.delete(state)

    // Verify the HMAC signature from Shopify
    if (hmac) {
      const params = { ...req.query }
      delete params.hmac
      const sortedParams = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&')
      const digest = crypto
        .createHmac('sha256', API_SECRET)
        .update(sortedParams)
        .digest('hex')

      if (digest !== hmac) {
        return res.status(403).send(`
          <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>❌ Authentication Failed</h2>
            <p>HMAC verification failed.</p>
            <p><a href="/api/auth/shopify">Try again</a></p>
          </body></html>
        `)
      }
    }

    if (!code) {
      return res.status(400).send(`
        <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>❌ Authentication Failed</h2>
          <p>No authorization code received from Shopify.</p>
          <p><a href="/api/auth/shopify">Try again</a></p>
        </body></html>
      `)
    }

    // Step 3: Exchange the authorization code for an access token
    const tokenUrl = `https://${shop || SHOP_DOMAIN}/admin/oauth/access_token`

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[Auth] Token exchange failed:', errorText)
      return res.status(500).send(`
        <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>❌ Token Exchange Failed</h2>
          <p>${tokenResponse.status}: ${errorText}</p>
          <p><a href="/api/auth/shopify">Try again</a></p>
        </body></html>
      `)
    }

    const tokenData = await tokenResponse.json()

    // tokenData = { access_token: "shpua_xxx", scope: "read_products,..." }
    console.log('[Auth] ✅ Access token obtained successfully!')
    console.log(`[Auth] Scope: ${tokenData.scope}`)

    // Save the token
    saveToken({
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      shop: shop || SHOP_DOMAIN,
    })

    console.log('[Auth] Redirecting back to frontend...')
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?status=success`)
  } catch (error) {
    console.error('[Auth] Callback error:', error)
    res.status(500).send(`
      <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2>❌ Authentication Error</h2>
        <p>${error.message}</p>
        <p><a href="/api/auth/shopify">Try again</a></p>
      </body></html>
    `)
  }
})

// ─── POST /api/auth/logout ───────────────────────────────────────────
// Clear the stored token (for re-authentication)
router.post('/logout', (_req, res) => {
  clearToken()
  res.json({ success: true, message: 'Token cleared. Visit /api/auth/shopify to re-authenticate.' })
})

// ─── CUSTOMER AUTH (Storefront API) ──────────────────────────────────

/**
 * POST /api/auth/customer/login
 * Log in a customer using their Shopify email and password.
 */
router.post('/customer/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' })
  }

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `

    const data = await storefrontFetch(mutation, {
      input: { email, password }
    })

    const { customerAccessToken, customerUserErrors } = data.customerAccessTokenCreate

    if (customerUserErrors && customerUserErrors.length > 0) {
      return res.status(401).json({
        success: false,
        error: customerUserErrors[0].message
      })
    }

    // Now fetch the customer details using this token
    const customerQuery = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          firstName
          lastName
          email
          phone
          defaultAddress {
            address1
            address2
            city
            province
            zip
            country
          }
        }
      }
    `

    const customerData = await storefrontFetch(customerQuery, {
      customerAccessToken: customerAccessToken.accessToken
    })

    res.json({
      success: true,
      token: customerAccessToken.accessToken,
      expiresAt: customerAccessToken.expiresAt,
      customer: customerData.customer
    })
  } catch (error) {
    console.error('[Customer Auth] Login error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/auth/customer/register
 * Create a new customer account in Shopify.
 */
router.post('/customer/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' })
  }

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const mutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `

    const data = await storefrontFetch(mutation, {
      input: { firstName, lastName, email, password }
    })

    const { customer, customerUserErrors } = data.customerCreate

    if (customerUserErrors && customerUserErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: customerUserErrors[0].message
      })
    }

    res.json({
      success: true,
      message: 'Account created successfully. Please log in.',
      customer
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/auth/customer/profile
 * Fetch full customer profile including all addresses.
 */
router.post('/customer/profile', async (req, res) => {
  const { accessToken } = req.body

  if (!accessToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const query = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          firstName
          lastName
          email
          phone
          addresses(first: 10) {
            edges {
              node {
                id
                address1
                address2
                city
                province
                zip
                country
                company
              }
            }
          }
          defaultAddress {
            id
            address1
            address2
            city
            province
            zip
            country
          }
        }
      }
    `

    const data = await storefrontFetch(query, { customerAccessToken: accessToken })

    if (!data.customer) {
      return res.status(401).json({ success: false, error: 'Invalid session' })
    }

    res.json({ success: true, customer: data.customer })
  } catch (error) {
    console.error('[Customer Auth] Profile fetch error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/auth/customer/address/create
 * Add a new address to the customer's account.
 */
router.post('/customer/address/create', async (req, res) => {
  const { accessToken, address } = req.body

  if (!accessToken || !address) {
    return res.status(400).json({ success: false, error: 'Token and address are required' })
  }

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const mutation = `
      mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
        customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
          customerAddress { id }
          customerUserErrors { message }
        }
      }
    `

    const data = await storefrontFetch(mutation, {
      customerAccessToken: accessToken,
      address
    })

    const result = data.customerAddressCreate
    if (result.customerUserErrors?.length > 0) {
      return res.status(400).json({ success: false, error: result.customerUserErrors[0].message })
    }

    res.json({ success: true, addressId: result.customerAddress.id })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/auth/customer/address/update
 * Update an existing address.
 */
router.post('/customer/address/update', async (req, res) => {
  const { accessToken, addressId, address } = req.body

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const mutation = `
      mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
        customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
          customerAddress { id }
          customerUserErrors { message }
        }
      }
    `

    const data = await storefrontFetch(mutation, {
      customerAccessToken: accessToken,
      id: addressId,
      address
    })

    const result = data.customerAddressUpdate
    if (result.customerUserErrors?.length > 0) {
      return res.status(400).json({ success: false, error: result.customerUserErrors[0].message })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/auth/customer/address/delete
 * Delete a customer address.
 */
router.post('/customer/address/delete', async (req, res) => {
  const { accessToken, addressId } = req.body

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const mutation = `
      mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
        customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
          deletedCustomerAddressId
          customerUserErrors { message }
        }
      }
    `

    const data = await storefrontFetch(mutation, {
      customerAccessToken: accessToken,
      id: addressId
    })

    const result = data.customerAddressDelete
    if (result.customerUserErrors?.length > 0) {
      return res.status(400).json({ success: false, error: result.customerUserErrors[0].message })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/auth/customer/address/default
 * Set a default address.
 */
router.post('/customer/address/default', async (req, res) => {
  const { accessToken, addressId } = req.body

  try {
    const { storefrontFetch } = await import('../lib/shopifyStorefront.js')

    const mutation = `
      mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
        customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
          customer { id }
          customerUserErrors { message }
        }
      }
    `

    const data = await storefrontFetch(mutation, {
      customerAccessToken: accessToken,
      addressId
    })

    const result = data.customerDefaultAddressUpdate
    if (result.customerUserErrors?.length > 0) {
      return res.status(400).json({ success: false, error: result.customerUserErrors[0].message })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
