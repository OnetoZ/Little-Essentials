/**
 * Shopify Storefront API Client
 *
 * Uses the public Storefront API token for read-only operations
 * (products, collections, search). This works immediately without
 * OAuth — just needs the SHOPIFY_STOREFRONT_TOKEN in .env.
 *
 * For write operations (orders, checkout), use shopifyAdmin.js instead.
 */

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN
const API_VERSION = '2024-10'

const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 */
export async function storefrontFetch(query, variables = {}) {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error(
      'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN in .env',
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
