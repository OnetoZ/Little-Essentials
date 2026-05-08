/**
 * Shopify Webhooks Handler
 *
 * Receives and verifies webhook events from Shopify.
 * Webhooks are used for real-time updates like:
 *   - orders/create, orders/paid, orders/fulfilled
 *   - products/create, products/update, products/delete
 *   - inventory level updates
 *
 * IMPORTANT: Webhook endpoints receive raw body (not parsed JSON)
 * because we need the raw body for HMAC signature verification.
 */

import { Router } from 'express'
import crypto from 'node:crypto'

const router = Router()

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET

/**
 * Verify the Shopify webhook HMAC signature.
 * Returns true if the request is authentic.
 */
function verifyWebhook(rawBody, hmacHeader) {
  if (!WEBHOOK_SECRET || !hmacHeader) return false

  const digest = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(hmacHeader),
  )
}

// ─── Webhook receiver ────────────────────────────────────────────────
// All Shopify webhooks POST to /api/webhooks/shopify
router.post(
  '/shopify',
  // Use raw body parser for HMAC verification
  (req, res, next) => {
    // Express raw body should be available if configured in server.js
    if (!req.rawBody) {
      console.warn('[Webhooks] Raw body not available — skipping HMAC verification')
    }
    next()
  },
  async (req, res) => {
    try {
      const hmac = req.get('X-Shopify-Hmac-SHA256')
      const topic = req.get('X-Shopify-Topic')
      const shopDomain = req.get('X-Shopify-Shop-Domain')

      // Verify signature
      if (req.rawBody && !verifyWebhook(req.rawBody, hmac)) {
        console.warn(`[Webhooks] Invalid HMAC for topic: ${topic}`)
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }

      console.log(`[Webhooks] Received: ${topic} from ${shopDomain}`)

      const payload = req.body

      // Route to topic-specific handlers
      switch (topic) {
        case 'orders/create':
          await handleOrderCreate(payload)
          break

        case 'orders/paid':
          await handleOrderPaid(payload)
          break

        case 'orders/fulfilled':
          await handleOrderFulfilled(payload)
          break

        case 'products/create':
        case 'products/update':
          await handleProductUpdate(payload)
          break

        case 'products/delete':
          await handleProductDelete(payload)
          break

        default:
          console.log(`[Webhooks] Unhandled topic: ${topic}`)
      }

      // Always respond 200 quickly — Shopify retries on non-2xx
      res.status(200).json({ received: true })
    } catch (error) {
      console.error('[Webhooks] Error:', error.message)
      // Still respond 200 so Shopify doesn't retry
      res.status(200).json({ received: true, error: error.message })
    }
  },
)

// ─── Topic handlers ──────────────────────────────────────────────────
// Implement your business logic in these handlers.

async function handleOrderCreate(payload) {
  console.log(`[Webhook:orders/create] Order ${payload.name} created`)
  console.log(`  Email: ${payload.email}`)
  console.log(`  Total: ${payload.total_price} ${payload.currency}`)
  console.log(`  Items: ${payload.line_items?.length ?? 0}`)

  // TODO: Add your logic here, e.g.:
  // - Send confirmation email
  // - Update your internal database
  // - Trigger notifications
}

async function handleOrderPaid(payload) {
  console.log(`[Webhook:orders/paid] Order ${payload.name} paid`)

  // TODO: Add your logic here, e.g.:
  // - Activate digital products
  // - Send payment confirmation
}

async function handleOrderFulfilled(payload) {
  console.log(`[Webhook:orders/fulfilled] Order ${payload.name} fulfilled`)

  // TODO: Add your logic here, e.g.:
  // - Send shipping notification
  // - Update tracking info
}

async function handleProductUpdate(payload) {
  console.log(`[Webhook:products/update] Product "${payload.title}" updated`)

  // TODO: Add your logic here, e.g.:
  // - Invalidate cache
  // - Sync with search index
}

async function handleProductDelete(payload) {
  console.log(`[Webhook:products/delete] Product ${payload.id} deleted`)

  // TODO: Add your logic here, e.g.:
  // - Remove from cache
  // - Remove from search index
}

export default router
