/**
 * Pure helpers for Shopify order handling — extracted so they can be
 * unit-tested without any network / server context.
 */

/** True only when id is a plain numeric Shopify order id. */
export function isNumericOrderId(id) {
  if (id === null || id === undefined) return false
  return /^\d+$/.test(String(id))
}

/**
 * Resolve a Shopify ProductVariant GID from a cart item.
 * Handles: existing variant GID, product-handle + variantNodes fallback,
 * and bare numeric variant ids. Returns null when unresolvable.
 */
export function resolveVariantGid(item) {
  if (!item) return null
  let variantId = item.id

  // If the id isn't already a GID, prefer the first variant node.
  if (!String(variantId).includes('gid://') && item.variantNodes?.length > 0) {
    variantId = item.variantNodes[0].id
  }

  const str = String(variantId)

  if (str.includes('ProductVariant')) return str

  // Bare numeric id -> wrap into a ProductVariant GID.
  if (variantId !== '' && variantId !== null && variantId !== undefined && !Number.isNaN(Number(variantId))) {
    return `gid://shopify/ProductVariant/${variantId}`
  }

  return null
}

/**
 * Build Shopify GraphQL line items from cart items.
 * Unresolvable items are dropped so one bad item can't fail the whole order.
 */
export function buildOrderLineItems(cartItems = []) {
  return cartItems
    .map((item) => {
      const variantId = resolveVariantGid(item)
      if (!variantId) return null
      return { variantId, quantity: item.qty || 1 }
    })
    .filter(Boolean)
}

/** Flatten a Shopify Admin order node into the shape the dashboard consumes. */
export function normalizeAdminOrder(node) {
  return {
    id: node.id.split('/').pop(),
    name: node.name,
    createdAt: node.createdAt,
    financialStatus: node.displayFinancialStatus,
    fulfillmentStatus: node.displayFulfillmentStatus,
    note: node.note || '',
    total: parseFloat(node.totalPriceSet?.shopMoney?.amount || 0),
    currency: node.totalPriceSet?.shopMoney?.currencyCode || 'INR',
    customer: {
      name: node.shippingAddress?.name || '',
      email: node.email || '',
      phone: node.shippingAddress?.phone || '',
    },
    shippingAddress: node.shippingAddress || null,
    items: (node.lineItems?.edges || []).map(({ node: li }) => ({
      title: li.title,
      quantity: li.quantity,
      variantTitle: li.variantTitle,
      price: parseFloat(li.originalTotalSet?.shopMoney?.amount || 0),
      image: li.image?.url || null,
    })),
  }
}
