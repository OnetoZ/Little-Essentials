/**
 * Shopify Storefront API Client
 *
 * (Shopify Storefront network calls commented out)
 */

// const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
// const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
// const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-10'

const FORCE_MOCK = true
let storefrontFailed = true

// const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`

/**
 * Execute a GraphQL query/mutation against the Shopify Storefront API.
 * (Commented Out)
 */
export async function storefrontFetch(/* query, variables = {}, timeoutMs = 2500 */) {
  /*
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Shopify Storefront API error ${response.status}: ${text}`)
    }

    const json = await response.json()

    if (json.errors) {
      console.warn('[Shopify Storefront] GraphQL errors:', json.errors)
      throw new Error(json.errors.map((e) => e.message).join(', '))
    }

    return json.data
  } catch (err) {
    clearTimeout(timeoutId)
    storefrontFailed = true
    console.warn('[Shopify Storefront] Connection failed or timed out. Activating mock data fallback.', err.message)
    throw err
  }
  */
  return null
}

/**
 * Check if the Storefront API is configured and operational.
 * Returns false so UI stays entirely in local mode without Shopify calls.
 */
export function isStorefrontConfigured() {
  return false
}

export function isStorefrontAvailable() {
  return false
}

export function markStorefrontFailed() {
  storefrontFailed = true
}

export { FORCE_MOCK }
