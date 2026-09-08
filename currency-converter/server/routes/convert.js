import { Router } from 'express';
import { getRate, getRates, ExchangeRateError } from '../services/exchangeRateService.js';

const router = Router();

// POST /api/convert  body: { base, target, amount }
router.post('/', async (req, res) => {
  const { base, target, amount } = req.body || {};

  if (!base || !target || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'base, target and amount are required' });
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return res.status(400).json({ error: 'amount must be a number' });
  }

  try {
    const { rate, lastUpdated, base: b, target: t } = await getRate(base, target);

    res.json({
      base: b,
      target: t,
      rate,
      amount: numericAmount,
      convertedAmount: numericAmount * rate,
      lastUpdated,
    });
  } catch (err) {
    const status = err instanceof ExchangeRateError ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
});

// POST /api/convert/multi  body: { base, amount, targets: [...] }
// Single external call: fetches all rates for base, then computes conversions.
router.post('/multi', async (req, res) => {
  const { base, amount, targets } = req.body || {};

  if (!base || amount === undefined || amount === null || !Array.isArray(targets)) {
    return res.status(400).json({ error: 'base, amount and targets[] are required' });
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return res.status(400).json({ error: 'amount must be a number' });
  }

  try {
    const { rates, lastUpdated, base: b } = await getRates(base);

    const results = [];
    const unsupported = [];

    for (const t of targets) {
      const code = String(t).toUpperCase();
      const rate = rates[code];
      if (rate === undefined) {
        unsupported.push(code);
        continue;
      }
      results.push({
        target: code,
        rate,
        convertedAmount: numericAmount * rate,
      });
    }

    res.json({
      base: b,
      amount: numericAmount,
      lastUpdated,
      results,
      unsupported,
    });
  } catch (err) {
    const status = err instanceof ExchangeRateError ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
