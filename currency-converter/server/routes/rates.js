import { Router } from 'express';
import { getRate, ExchangeRateError } from '../services/exchangeRateService.js';

const router = Router();

// GET /api/rates?base=USD&target=INR
router.get('/', async (req, res) => {
  const { base, target } = req.query;

  if (!base || !target) {
    return res.status(400).json({ error: 'base and target query params are required' });
  }

  try {
    const result = await getRate(base, target);
    res.json(result);
  } catch (err) {
    const status = err instanceof ExchangeRateError ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
