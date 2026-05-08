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

    // Show success page
    res.send(`
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; padding: 60px; text-align: center; background: #faf8f5; color: #3b2a22;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(59,42,34,0.08);">
          <h1 style="font-size: 48px; margin: 0;">✅</h1>
          <h2 style="margin-top: 16px;">Shopify Connected!</h2>
          <p style="color: #8b6f47; line-height: 1.6;">
            Your Little Essentials backend is now connected to your Shopify store.
          </p>
          <div style="background: #f5f0e8; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: left;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Store:</strong> ${shop || SHOP_DOMAIN}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Scopes:</strong> ${tokenData.scope}</p>
          </div>
          <p style="margin-top: 24px; font-size: 14px; color: #8b6f47;">
            You can now close this window and use the API.<br/>
            Test it: <a href="/api/health" style="color: #3b2a22;">/api/health</a> |
            <a href="/api/products?first=2" style="color: #3b2a22;">/api/products</a>
          </p>
        </div>
      </body>
      </html>
    `)
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

export default router
