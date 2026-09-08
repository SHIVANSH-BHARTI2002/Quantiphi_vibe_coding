import { Router } from 'express';
import { getTimeSeries, FrankfurterError } from '../services/frankfurterService.js';

const router = Router();

// GET /api/history?base=USD&target=INR&days=30
// Real 30-day (or N-day) trend data sourced from the Frankfurter time-series
// API. Response shape is kept stable for the frontend TrendChart:
//   { base, target, days, count, building, points: [{ date, rate }] }
router.get('/', async (req, res) => {
  const { base, target } = req.query;
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));

  if (!base || !target) {
    return res.status(400).json({ error: 'base and target query params are required' });
  }

  const baseCode = base.toUpperCase();
  const targetCode = target.toUpperCase();

  try {
    const points = await getTimeSeries(baseCode, targetCode, days);

    res.json({
      base: baseCode,
      target: targetCode,
      days,
      count: points.length,
      building: points.length < 5,
      source: 'frankfurter',
      points,
    });
  } catch (err) {
    const status = err instanceof FrankfurterError ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
