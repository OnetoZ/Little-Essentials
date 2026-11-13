const { describe, it } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');

describe('Orders & Server-side Pricing Module', () => {
  const SHIPPING_RULES = {
    standard: { name: 'Standard Delivery', fee: 0 },
    express: { name: 'Express Delivery', fee: 149 },
  };

  it('calculates shipping fee strictly based on server rules', () => {
    const calculateShipping = (methodKey) => {
      const rule = SHIPPING_RULES[String(methodKey || 'standard').toLowerCase()] || SHIPPING_RULES.standard;
      return rule.fee;
    };

    assert.strictEqual(calculateShipping('standard'), 0);
    assert.strictEqual(calculateShipping('Standard Delivery'), 0);
    assert.strictEqual(calculateShipping('express'), 149);
    assert.strictEqual(calculateShipping('Express Delivery'), 0); // Unmatched falls back to standard
    assert.strictEqual(calculateShipping(undefined), 0);
  });

  it('rejects invalid or empty order item lists', () => {
    const validateItems = (items) => {
      if (!Array.isArray(items) || items.length === 0 || items.length > 50) return false;
      for (const item of items) {
        const id = item.productId || item.id;
        const qty = Number(item.quantity ?? item.qty);
        if (!ObjectId.isValid(id)) return false;
        if (!Number.isSafeInteger(qty) || qty < 1 || qty > 50) return false;
      }
      return true;
    };

    assert.strictEqual(validateItems([]), false);
    assert.strictEqual(validateItems(null), false);
    assert.strictEqual(validateItems([{ id: 'not-an-objectid', qty: 1 }]), false);
    assert.strictEqual(validateItems([{ id: new ObjectId().toString(), qty: 0 }]), false);
    assert.strictEqual(validateItems([{ id: new ObjectId().toString(), qty: -5 }]), false);
    assert.strictEqual(validateItems([{ id: new ObjectId().toString(), qty: 1.5 }]), false);
    assert.strictEqual(validateItems([{ id: new ObjectId().toString(), qty: 2 }]), true);
  });

  it('calculates subtotal and item totals strictly from database product prices', () => {
    const mockDbProducts = [
      { _id: new ObjectId(), name: 'Electric Kettle', price: 1299, stock: 10 },
      { _id: new ObjectId(), name: 'Toaster', price: 899, stock: 5 },
    ];

    const requestedItems = [
      { id: mockDbProducts[0]._id.toString(), qty: 2, clientSentPrice: 10 }, // Client tries to spoof ₹10
      { id: mockDbProducts[1]._id.toString(), qty: 1, clientSentPrice: 50 },
    ];

    let subtotal = 0;
    const orderItems = [];

    for (const item of requestedItems) {
      const dbProd = mockDbProducts.find(p => p._id.toString() === item.id);
      assert.ok(dbProd);

      const serverPrice = dbProd.price; // Untrusted client price IGNORED
      const lineTotal = serverPrice * item.qty;
      subtotal += lineTotal;

      orderItems.push({
        productId: dbProd._id.toString(),
        name: dbProd.name,
        price: serverPrice,
        quantity: item.qty,
        lineTotal,
      });
    }

    assert.strictEqual(subtotal, 1299 * 2 + 899 * 1); // 2598 + 899 = 3497
    assert.strictEqual(orderItems[0].price, 1299);
    assert.strictEqual(orderItems[1].price, 899);
  });

  it('enforces order customer ownership', () => {
    const order = {
      orderNumber: 'LE12345',
      customerId: 'customer_111',
      total: 1500,
    };

    const isAuthorized = (order, requestingCustomer) => {
      return order && order.customerId === requestingCustomer.id;
    };

    assert.strictEqual(isAuthorized(order, { id: 'customer_111' }), true);
    assert.strictEqual(isAuthorized(order, { id: 'customer_999' }), false);
  });
});

