import { describe, it, expect } from 'vitest'
import {
  isNumericOrderId,
  resolveVariantGid,
  buildOrderLineItems,
  normalizeAdminOrder,
} from './orders.js'

describe('isNumericOrderId', () => {
  it('accepts a numeric Shopify order id', () => {
    expect(isNumericOrderId('7341891518632')).toBe(true)
    expect(isNumericOrderId(7341891518632)).toBe(true)
  })

  it('rejects a Razorpay-style id (prevents invalid GID / 404 crash)', () => {
    expect(isNumericOrderId('order_T9mlbscuqBMjXq')).toBe(false)
  })

  it('rejects empty / null / non-numeric', () => {
    expect(isNumericOrderId('')).toBe(false)
    expect(isNumericOrderId(null)).toBe(false)
    expect(isNumericOrderId(undefined)).toBe(false)
    expect(isNumericOrderId('12a3')).toBe(false)
  })
})

describe('resolveVariantGid', () => {
  it('keeps an existing ProductVariant GID', () => {
    const item = { id: 'gid://shopify/ProductVariant/55477277425832' }
    expect(resolveVariantGid(item)).toBe('gid://shopify/ProductVariant/55477277425832')
  })

  it('falls back to variantNodes[0] when id is a product handle (ProductCard path)', () => {
    const item = {
      id: 'desidiya-3d-ocean-wave',
      variantNodes: [{ id: 'gid://shopify/ProductVariant/99' }],
    }
    expect(resolveVariantGid(item)).toBe('gid://shopify/ProductVariant/99')
  })

  it('wraps a bare numeric variant id into a GID', () => {
    expect(resolveVariantGid({ id: 55477277425832 })).toBe(
      'gid://shopify/ProductVariant/55477277425832',
    )
  })

  it('returns null when no valid variant can be resolved', () => {
    expect(resolveVariantGid({ id: 'some-handle' })).toBeNull()
  })
})

describe('buildOrderLineItems', () => {
  it('maps cart items to Shopify line items with quantities', () => {
    const cart = [
      { id: 'gid://shopify/ProductVariant/1', qty: 2 },
      { id: 'gid://shopify/ProductVariant/2', qty: 1 },
    ]
    expect(buildOrderLineItems(cart)).toEqual([
      { variantId: 'gid://shopify/ProductVariant/1', quantity: 2 },
      { variantId: 'gid://shopify/ProductVariant/2', quantity: 1 },
    ])
  })

  it('defaults quantity to 1 and drops unresolvable items', () => {
    const cart = [
      { id: 'gid://shopify/ProductVariant/1' },
      { id: 'bad-handle-no-variant' },
    ]
    expect(buildOrderLineItems(cart)).toEqual([
      { variantId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
  })
})

describe('normalizeAdminOrder', () => {
  const node = {
    id: 'gid://shopify/Order/7341891518632',
    name: '#1002',
    createdAt: '2026-07-05T09:52:00Z',
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'UNFULFILLED',
    note: 'Razorpay Order ID: order_abc',
    email: 'sriman@example.com',
    totalPriceSet: { shopMoney: { amount: '1.0', currencyCode: 'INR' } },
    shippingAddress: { name: 'Sriman', address1: 'bengaluru', city: 'Bengaluru', province: 'Karnataka', zip: '624001', country: 'India', phone: null },
    lineItems: {
      edges: [
        { node: { title: 'Panda Night Light', quantity: 1, variantTitle: null, originalTotalSet: { shopMoney: { amount: '1.0' } }, image: { url: 'http://img' } } },
      ],
    },
  }

  it('flattens a Shopify order node into the dashboard shape', () => {
    const out = normalizeAdminOrder(node)
    expect(out.id).toBe('7341891518632')
    expect(out.name).toBe('#1002')
    expect(out.financialStatus).toBe('PAID')
    expect(out.fulfillmentStatus).toBe('UNFULFILLED')
    expect(out.total).toBe(1)
    expect(out.currency).toBe('INR')
    expect(out.customer).toEqual({ name: 'Sriman', email: 'sriman@example.com', phone: '' })
    expect(out.items).toHaveLength(1)
    expect(out.items[0]).toMatchObject({ title: 'Panda Night Light', quantity: 1, price: 1, image: 'http://img' })
  })
})
