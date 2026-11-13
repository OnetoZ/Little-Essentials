const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
} = require('../models/Product');

router.get('/', async (req, res, next) => {
  try {
    const result = await getProducts({
      search: req.query.search || '',
      category: req.query.category || '',
      sort: req.query.sort || 'newest',
      page: req.query.page,
      limit: req.query.limit,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:identifier', async (req, res, next) => {
  try {
    const product = await getProduct(req.params.identifier);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
