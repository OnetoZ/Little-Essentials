/**
 * Little Essentials — Backend Server
 *
 * All Shopify API communication lives here. The frontend only
 * talks to this server via REST endpoints.
 *
 * Architecture:
 *   Frontend (React) ──REST──▶ This Server ──GraphQL──▶ Shopify Admin API
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRouter from './routes/auth.js'
import productsRouter from './routes/products.js'
import collectionsRouter from './routes/collections.js'
import ordersRouter from './routes/orders.js'
import checkoutRouter from './routes/checkout.js'
import webhooksRouter from './routes/webhooks.js'
import { isAuthenticated } from './lib/shopifyAdmin.js'
import { isStorefrontConfigured } from './lib/shopifyStorefront.js'

const app = express()
const PORT = process.env.PORT || 4000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ─── Middleware ───────────────────────────────────────────────────────

app.use(helmet())
app.use(morgan('dev'))

// CORS — allow frontend origin
app.use(
  cors({
    origin: [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    credentials: true,
  }),
)

// JSON body parser (with raw body capture for webhook verification)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for webhook HMAC verification
      if (req.originalUrl.startsWith('/api/webhooks')) {
        req.rawBody = buf.toString('utf8')
      }
    },
  }),
)

// ─── Health check ────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  const adminAuth = isAuthenticated()
  const storefrontReady = isStorefrontConfigured()

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    shopifyDomain: process.env.SHOPIFY_STORE_DOMAIN || null,
    storefrontAPI: storefrontReady ? 'ready' : 'not configured',
    adminAPI: adminAuth ? 'authenticated' : 'not authenticated',
    authUrl: adminAuth ? null : '/api/auth/shopify',
  })
})

// ─── Routes ──────────────────────────────────────────────────────────

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/collections', collectionsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/webhooks', webhooksRouter)

// ─── 404 fallback ────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' })
})

// ─── Global error handler ────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err)
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  })
})

// ─── Start ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Little Essentials Backend running on http://localhost:${PORT}`)
  console.log(`   Health:  http://localhost:${PORT}/api/health`)

  if (!process.env.SHOPIFY_STORE_DOMAIN) {
    console.warn('   ⚠  SHOPIFY_STORE_DOMAIN not set in .env')
  }

  // Storefront API status
  if (isStorefrontConfigured()) {
    console.log('   ✅ Storefront API: Ready (products & collections will load)')
  } else {
    console.warn('   ⚠  Storefront API: SHOPIFY_STOREFRONT_TOKEN not set')
  }

  // Admin API status
  if (isAuthenticated()) {
    console.log('   ✅ Admin API: Authenticated (orders & checkout ready)')
  } else {
    console.log(`   🔑 Admin API: Not authenticated (orders/checkout disabled)`)
    console.log(`   👉 Visit http://localhost:${PORT}/api/auth/shopify to connect`)
  }

  console.log('')
})
