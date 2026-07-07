import loginHandler from './_login.js';
import ordersHandler from './_orders.js';
import shipOrderHandler from './_ship-order.js';
import unshipOrderHandler from './_unship-order.js';

export default async function handler(req, res) {
  const { action } = req.query;
  switch (action) {
    case 'login': return loginHandler(req, res);
    case 'orders': return ordersHandler(req, res);
    case 'ship-order': return shipOrderHandler(req, res);
    case 'unship-order': return unshipOrderHandler(req, res);
    default: return res.status(404).json({ error: 'Not found' });
  }
}
