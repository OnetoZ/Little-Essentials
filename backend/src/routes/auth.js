const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const {
  createCustomer,
  findCustomerByEmail,
  findCustomerById,
  updateCustomer,
} = require('../models/Customer');

const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

function createToken(customer) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      sub: customer._id.toString(),
      email: customer.email,
      role: 'customer',
    },
    secret,
    { expiresIn: '7d' }
  );
}

function publicCustomer(customer) {
  if (!customer) return null;
  const { passwordHash, ...safeCustomer } = customer;

  // Format addresses for consistent client consumption
  const addresses = (safeCustomer.addresses || []).map((addr, idx) => ({
    ...addr,
    id: addr.id || `addr_${idx + 1}`,
  }));

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;

  return {
    ...safeCustomer,
    id: safeCustomer._id.toString(),
    addresses,
    defaultAddress,
  };
}

// Customer registration
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain between 2 and 100 characters',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address',
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain between 8 and 128 characters',
      });
    }

    if (await findCustomerByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await createCustomer({
      name,
      email,
      passwordHash,
      phone: '',
      addresses: [],
    });

    const token = createToken(customer);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      customer: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }
    next(error);
  }
});

// Customer login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const customer = await findCustomerByEmail(email);

    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (customer.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Customer account required',
      });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: createToken(customer),
      customer: publicCustomer(customer),
    });
  } catch (error) {
    next(error);
  }
});

// Current customer profile
router.get('/me', authenticateCustomer, async (req, res, next) => {
  try {
    const customer = await findCustomerById(req.customer.id);

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      customer: publicCustomer(customer),
    });
  } catch (error) {
    next(error);
  }
});

// Update customer profile
router.patch('/me', authenticateCustomer, async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2 || name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid name',
        });
      }
      updates.name = name;
    }

    if (req.body.phone !== undefined) {
      const phone = String(req.body.phone).trim();
      if (phone.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number',
        });
      }
      updates.phone = phone;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid profile fields provided',
      });
    }

    const customer = await updateCustomer(req.customer.id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      customer: publicCustomer(customer),
    });
  } catch (error) {
    next(error);
  }
});

// Add customer address
router.post('/me/addresses', authenticateCustomer, async (req, res, next) => {
  try {
    const customer = await findCustomerById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { firstName, lastName, address1, address2, city, province, zip, phone, isDefault } = req.body;
    if (!address1 || !city) {
      return res.status(400).json({ success: false, message: 'Address line 1 and city are required' });
    }

    const newAddress = {
      id: `addr_${crypto.randomBytes(4).toString('hex')}`,
      firstName: String(firstName || '').trim(),
      lastName: String(lastName || '').trim(),
      address1: String(address1 || '').trim(),
      address2: String(address2 || '').trim(),
      city: String(city || '').trim(),
      province: String(province || '').trim(),
      zip: String(zip || '').trim(),
      phone: String(phone || '').trim(),
      isDefault: Boolean(isDefault || (customer.addresses || []).length === 0),
    };

    let addresses = customer.addresses || [];
    if (newAddress.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);

    const updated = await updateCustomer(req.customer.id, { addresses });
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      customer: publicCustomer(updated),
      address: newAddress,
    });
  } catch (error) {
    next(error);
  }
});

// Update customer address
router.patch('/me/addresses/:addressId', authenticateCustomer, async (req, res, next) => {
  try {
    const customer = await findCustomerById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { addressId } = req.params;
    const addresses = (customer.addresses || []).map(addr => {
      if (addr.id === addressId) {
        return {
          ...addr,
          firstName: req.body.firstName !== undefined ? String(req.body.firstName).trim() : addr.firstName,
          lastName: req.body.lastName !== undefined ? String(req.body.lastName).trim() : addr.lastName,
          address1: req.body.address1 !== undefined ? String(req.body.address1).trim() : addr.address1,
          address2: req.body.address2 !== undefined ? String(req.body.address2).trim() : addr.address2,
          city: req.body.city !== undefined ? String(req.body.city).trim() : addr.city,
          province: req.body.province !== undefined ? String(req.body.province).trim() : addr.province,
          zip: req.body.zip !== undefined ? String(req.body.zip).trim() : addr.zip,
          phone: req.body.phone !== undefined ? String(req.body.phone).trim() : addr.phone,
          isDefault: req.body.isDefault !== undefined ? Boolean(req.body.isDefault) : addr.isDefault,
        };
      }
      return req.body.isDefault ? { ...addr, isDefault: false } : addr;
    });

    const updated = await updateCustomer(req.customer.id, { addresses });
    res.json({
      success: true,
      message: 'Address updated successfully',
      customer: publicCustomer(updated),
    });
  } catch (error) {
    next(error);
  }
});

// Delete customer address
router.delete('/me/addresses/:addressId', authenticateCustomer, async (req, res, next) => {
  try {
    const customer = await findCustomerById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { addressId } = req.params;
    const addresses = (customer.addresses || []).filter(addr => addr.id !== addressId);

    const updated = await updateCustomer(req.customer.id, { addresses });
    res.json({
      success: true,
      message: 'Address removed successfully',
      customer: publicCustomer(updated),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
