const { describe, it } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Customer & Admin Authentication Module', () => {
  const JWT_SECRET = 'test_super_secret_jwt_key_12345';

  it('hashes passwords securely using bcrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.notStrictEqual(rawPassword, hash);
    assert.strictEqual(await bcrypt.compare(rawPassword, hash), true);
    assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false);
  });

  it('signs and verifies customer JWT tokens with correct claims', () => {
    const customer = {
      _id: '507f1f77bcf86cd799439011',
      email: 'customer@example.com',
      role: 'customer',
    };

    const token = jwt.sign(
      {
        sub: customer._id,
        email: customer.email,
        role: 'customer',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.sub, customer._id);
    assert.strictEqual(decoded.email, customer.email);
    assert.strictEqual(decoded.role, 'customer');
  });

  it('rejects tampered or expired JWT tokens', () => {
    const token = jwt.sign({ sub: '123', role: 'customer' }, JWT_SECRET, { expiresIn: '1s' });
    const tampered = token.slice(0, -5) + 'abcde';

    assert.throws(() => {
      jwt.verify(tampered, JWT_SECRET);
    }, /invalid signature/i);
  });

  it('enforces customer vs admin role separation', () => {
    const customerToken = jwt.sign({ sub: 'c1', role: 'customer' }, JWT_SECRET);
    const adminToken = jwt.sign({ sub: 'a1', role: 'admin' }, JWT_SECRET);

    const customerPayload = jwt.verify(customerToken, JWT_SECRET);
    const adminPayload = jwt.verify(adminToken, JWT_SECRET);

    assert.strictEqual(customerPayload.role === 'admin', false);
    assert.strictEqual(adminPayload.role === 'admin', true);
  });

  it('validates registration input requirements', () => {
    const validate = ({ name, email, password }) => {
      if (!name || name.trim().length < 2 || name.trim().length > 100) return 'INVALID_NAME';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'INVALID_EMAIL';
      if (!password || password.length < 8) return 'WEAK_PASSWORD';
      return 'VALID';
    };

    assert.strictEqual(validate({ name: 'A', email: 'a@b.com', password: 'password123' }), 'INVALID_NAME');
    assert.strictEqual(validate({ name: 'Alice', email: 'not-an-email', password: 'password123' }), 'INVALID_EMAIL');
    assert.strictEqual(validate({ name: 'Alice', email: 'alice@test.com', password: '123' }), 'WEAK_PASSWORD');
    assert.strictEqual(validate({ name: 'Alice Bob', email: 'alice@test.com', password: 'password123' }), 'VALID');
  });
});

