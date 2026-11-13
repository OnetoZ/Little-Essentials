const express = require('express');
const {
  getCustomerCart,
  setCartItem,
  removeCartItem,
  clearCustomerCart,
} = require('../models/Cart');
const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

// Retrieve customer cart
router.get('/', authenticateCustomer, async (req, res, next) => {
  try {
    const cart = await getCustomerCart(req.customer.id);
    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Add or increment item in cart
router.post('/items', authenticateCustomer, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity || 1);

    if (!productId || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid productId and positive quantity are required',
      });
    }

    const cart = await setCartItem(req.customer.id, productId, qty);
    res.json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Update item quantity in cart
router.patch('/items/:productId', authenticateCustomer, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid non-negative quantity required',
      });
    }

    const cart = await setCartItem(req.customer.id, productId, qty);
    res.json({
      success: true,
      message: 'Cart item updated',
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/items/:productId', authenticateCustomer, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await removeCartItem(req.customer.id, productId);
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/', authenticateCustomer, async (req, res, next) => {
  try {
    const cart = await clearCustomerCart(req.customer.id);
    res.json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

