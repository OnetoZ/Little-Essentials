/**
 * API Client
 *
 * Thin wrapper around fetch for calling the Little Essentials backend.
 * All Shopify logic lives on the backend — this file only knows about
 * the backend REST API.
 */

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

/**
 * Generic API fetch helper.
 * Returns parsed JSON or throws on error.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const json = await response.json()

  if (!response.ok || json.success === false) {
    throw new Error(json.error || `API error ${response.status}`)
  }

  return json
}

/**
 * GET helper with query-string support.
 */
export function apiGet(endpoint, params = {}) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  }
  const qs = searchParams.toString()
  return apiFetch(`${endpoint}${qs ? `?${qs}` : ''}`)
}

/**
 * POST helper.
 */
export function apiPost(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
