/**
 * Shopify Admin API Client
 *
 * Handles all server-side Shopify operations using the Admin API.
 *
 * Token resolution order:
 *   1. OAuth token from .shopify-token.json (obtained via /api/auth/shopify)
 *   2. Static SHOPIFY_ADMIN_ACCESS_TOKEN from .env (legacy/custom apps)
 *
 * This means:
 *   - New Dev Dashboard apps → use OAuth flow, token auto-stored
 *   - Old Custom Apps → paste shpat_ token in .env, works immediately
 */

import { getAccessToken } from './tokenStore.js'

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const API_VERSION = '2024-10'

const ADMIN_URL = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`

/**
 * Resolve the current access token.
 * Prefers OAuth token; falls back to static env var.
 */
function resolveToken() {
  // 1. Try OAuth token (from Dev Dashboard flow)
  const oauthToken = getAccessToken()
  if (oauthToken) return oauthToken

  // 2. Fall back to static token in .env (old Custom App flow)
  const envToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  if (envToken && !envToken.includes('xxxx')) return envToken

  return null
}

/**
 * Execute a GraphQL query against the Shopify Admin API.
 */
export async function adminFetch(query, variables = {}) {
  const token = resolveToken()

  if (!SHOPIFY_DOMAIN) {
    throw new Error(
      'Missing SHOPIFY_STORE_DOMAIN in .env',
    )
  }

  if (!token) {
    throw new Error(
      'No Shopify access token available. ' +
      'Visit http://localhost:' + (process.env.PORT || 4000) + '/api/auth/shopify to authenticate.',
    )
  }

  const response = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text()

    // If 401/403, the token may have expired
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Shopify auth failed (${response.status}). Token may be expired — ` +
        `re-authenticate at /api/auth/shopify`,
      )
    }

    throw new Error(`Shopify Admin API error ${response.status}: ${text}`)
  }

  const json = await response.json()

  if (json.errors) {
    console.error('[Shopify Admin] GraphQL errors:', json.errors)
    throw new Error(json.errors.map((e) => e.message).join(', '))
  }

  return json.data
}

/**
 * Execute a REST API call against the Shopify Admin API.
 */
export async function adminRestFetch(endpoint, options = {}) {
  const token = resolveToken()

  if (!token) {
    throw new Error('No Shopify access token. Visit /api/auth/shopify to authenticate.')
  }

  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Shopify Admin REST error ${response.status}: ${text}`)
  }

  return response.json()
}

/**
 * Check if we currently have a usable token.
 */
export function isAuthenticated() {
  return resolveToken() !== null
}

export { SHOPIFY_DOMAIN, API_VERSION }
