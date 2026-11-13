const express = require('express');
const {
  getCustomerWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../models/Wishlist');
const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateCustomer, async (req, res, next) => {
  try {
    const wishlist = await getCustomerWishlist(req.customer.id);
    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/items', authenticateCustomer, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const wishlist = await addToWishlist(req.customer.id, productId);
    res.json({
      success: true,
      message: 'Item added to wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:productId', authenticateCustomer, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await removeFromWishlist(req.customer.id, productId);
    res.json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

