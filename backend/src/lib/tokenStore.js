/**
 * Shopify Token Store
 *
 * Persists the OAuth access token to a local JSON file.
 * In production, you'd use a database — but for development
 * and single-store setups, a file works perfectly.
 *
 * The token is obtained via the OAuth flow in routes/auth.js
 * and consumed by lib/shopifyAdmin.js for API calls.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_FILE = path.join(__dirname, '..', '..', '.shopify-token.json')

/**
 * Save the access token (and metadata) to disk.
 */
export function saveToken(data) {
  const payload = {
    accessToken: data.accessToken,
    scope: data.scope || '',
    shop: data.shop || '',
    obtainedAt: new Date().toISOString(),
  }

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`[TokenStore] Token saved for shop: ${payload.shop}`)

  return payload
}

/**
 * Load the stored access token. Returns null if not found.
 */
export function loadToken() {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null

    const raw = fs.readFileSync(TOKEN_FILE, 'utf8')
    const data = JSON.parse(raw)

    if (!data.accessToken) return null

    return data
  } catch {
    return null
  }
}

/**
 * Get just the access token string. Returns null if not stored.
 */
export function getAccessToken() {
  const data = loadToken()
  return data?.accessToken ?? null
}

/**
 * Check whether we have a stored token.
 */
export function hasToken() {
  return getAccessToken() !== null
}

/**
 * Delete the stored token (for re-authentication).
 */
export function clearToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE)
      console.log('[TokenStore] Token cleared')
    }
  } catch {
    // ignore
  }
}
