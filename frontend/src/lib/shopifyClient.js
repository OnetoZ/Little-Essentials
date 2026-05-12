/**
 * Shopify Storefront API Client
 *
 * Talks directly to the Shopify Storefront API from the browser.
 * The Storefront Access Token is a PUBLIC token — it is safe to
 * expose in frontend code (Shopify designed it for this purpose).
 *
 * This replaces the old backend proxy entirely. No server needed.
 */

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-10'

const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`

/**
 * Execute a GraphQL query/mutation against the Shopify Storefront API.
 */
export async function storefrontFetch(query, variables = {}) {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error(
      'Missing VITE_SHOPIFY_STORE_DOMAIN or VITE_SHOPIFY_STOREFRONT_TOKEN in .env',
    )
  }

  const response = await fetch(STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Shopify Storefront API error ${response.status}: ${text}`)
  }

  const json = await response.json()

  if (json.errors) {
    console.error('[Shopify Storefront] GraphQL errors:', json.errors)
    throw new Error(json.errors.map((e) => e.message).join(', '))
  }

  return json.data
}

/**
 * Check if the Storefront API is configured.
 */
export function isStorefrontConfigured() {
  return Boolean(SHOPIFY_DOMAIN && STOREFRONT_TOKEN)
}

export { SHOPIFY_DOMAIN, STOREFRONT_TOKEN, API_VERSION }
