/**
 * Checkout Routes
 *
 * Creates a Shopify checkout session and returns the checkout URL
 * so the customer can complete payment on Shopify's hosted checkout.
 *
 * This is the recommended approach for PCI compliance — you never
 * handle card data yourself; Shopify does it.
 */

import { Router } from 'express'
import { adminFetch } from '../lib/shopifyAdmin.js'

const router = Router()

// ─── POST /api/checkout ──────────────────────────────────────────────
// Create a Shopify checkout and return the checkout URL
router.post('/', async (req, res) => {
  try {
    const { lineItems, email, shippingAddress } = req.body

    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No line items provided' })
    }

    // Create a draft order, then get its invoice URL for payment
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
          ...(email && { email }),
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
      checkoutUrl: result.draftOrder.invoiceUrl,
      orderId: result.draftOrder.id,
      orderName: result.draftOrder.name,
      total: result.draftOrder.totalPriceSet?.shopMoney,
    })
  } catch (error) {
    console.error('[POST /api/checkout]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
