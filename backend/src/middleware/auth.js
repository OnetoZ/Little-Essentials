const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is not configured');
  }
  return secret;
}

function authenticateCustomer(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    console.error('AUTH_JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Authentication service unavailable',
    });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, secret);

    if (payload.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Customer access required',
        code: 'FORBIDDEN',
      });
    }

    req.customer = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
}

function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required',
      message: 'Admin authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const token = header.slice(7);
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_JWT_SECRET;
    const payload = jwt.verify(token, secret);

    if (payload.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privilege required',
        message: 'Admin privilege required',
        code: 'FORBIDDEN',
      });
    }

    req.admin = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired admin session',
      message: 'Invalid or expired admin session',
      code: 'INVALID_TOKEN',
    });
  }
}

function optionalCustomerAuth(req, res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    const secret = process.env.AUTH_JWT_SECRET;

    if (secret) {
      try {
        const payload = jwt.verify(token, secret);
        if (payload.role === 'customer') {
          req.customer = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
          };
        }
      } catch {
        // Ignored for optional auth
      }
    }
  }

  next();
}

module.exports = {
  authenticateCustomer,
  authenticateAdmin,
  optionalCustomerAuth,
};
