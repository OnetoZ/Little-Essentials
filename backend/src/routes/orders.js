/**
 * Orders Routes
 *
 * Handles order creation, lookup, and management via the Shopify Admin API.
 * The frontend calls these endpoints after the customer completes checkout.
 */

import { Router } from 'express'
import { adminFetch } from '../lib/shopifyAdmin.js'

const router = Router()

// ─── POST /api/orders ────────────────────────────────────────────────
// Create a draft order (or use Shopify checkout for real payments)
router.post('/', async (req, res) => {
  try {
    const { lineItems, customer, shippingAddress, note } = req.body

    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No line items provided' })
    }

    // Create a draft order via Admin API
    const data = await adminFetch(
      `mutation DraftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            invoiceUrl
            totalPriceSet {
              shopMoney { amount currencyCode }
            }
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney { amount currencyCode }
                  }
                }
              }
            }
            createdAt
          }
          userErrors { field message }
        }
      }`,
      {
        input: {
          lineItems: lineItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          ...(customer && {
            email: customer.email,
            phone: customer.phone,
          }),
          ...(shippingAddress && {
            shippingAddress: {
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              address1: shippingAddress.address1,
              address2: shippingAddress.address2 || '',
              city: shippingAddress.city,
              province: shippingAddress.state,
              zip: shippingAddress.pincode,
              country: 'IN',
            },
          }),
          ...(note && { note }),
        },
      },
    )

    const result = data.draftOrderCreate

    if (result.userErrors?.length > 0) {
      return res.status(400).json({
        success: false,
        errors: result.userErrors,
      })
    }

    res.json({
      success: true,
      order: result.draftOrder,
    })
  } catch (error) {
    console.error('[POST /api/orders]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ─── GET /api/orders/:id ─────────────────────────────────────────────
// Fetch order details by order name/number (e.g. "LE-2025-08847")
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id

    // Search by order name
    const data = await adminFetch(
      `query OrderByName($query: String!) {
        orders(first: 1, query: $query) {
          edges {
            node {
              id
              name
              email
              phone
              createdAt
              displayFulfillmentStatus
              displayFinancialStatus
              totalPriceSet {
                shopMoney { amount currencyCode }
              }
              subtotalPriceSet {
                shopMoney { amount currencyCode }
              }
              totalShippingPriceSet {
                shopMoney { amount currencyCode }
              }
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                zip
                country
              }
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet {
                      shopMoney { amount currencyCode }
                    }
                    image { url altText }
                    variant {
                      title
                    }
                  }
                }
              }
              fulfillments {
                trackingInfo {
                  number
                  url
                  company
                }
                status
                createdAt
              }
            }
          }
        }
      }`,
      { query: `name:${orderId}` },
    )

    const order = data.orders?.edges?.[0]?.node

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    res.json({ success: true, order })
  } catch (error) {
    console.error('[GET /api/orders/:id]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ─── GET /api/orders/customer/:email ───────────────────────────────
// Fetch order history for a specific customer email
router.get('/customer/:email', async (req, res) => {
  try {
    const { email } = req.params

    const data = await adminFetch(
      `query OrdersByCustomer($query: String!) {
        orders(first: 20, query: $query) {
          edges {
            node {
              id
              name
              createdAt
              displayFulfillmentStatus
              displayFinancialStatus
              totalPriceSet {
                shopMoney { amount currencyCode }
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    image { url }
                  }
                }
              }
            }
          }
        }
      }`,
      { query: `email:${email}` },
    )

    const orders = data.orders?.edges?.map(edge => edge.node) || []
    res.json({ success: true, orders })
  } catch (error) {
    console.error('[GET /api/orders/customer/:email]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
