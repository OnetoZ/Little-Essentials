const express = require('express');
const router = express.Router();

const { getCategories } = require('../models/Product');

router.get('/', async (req, res, next) => {
  try {
    const categories = await getCategories();

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
