import axios from 'axios';

// Frankfurter is a free, no-key API backed by European Central Bank reference
// rates. It exposes a historical time-series endpoint, which we use to power the
// 30-day trend chart with real data:
//   https://api.frankfurter.dev/v1/{start}..{end}?base=USD&symbols=INR
//
// Notes:
// - Only ~30 major currencies are supported (ECB set). Unsupported codes yield
//   an empty series, which we surface as a "building/unavailable" state.
// - Only business days are returned (no weekends/holidays), which is expected
//   for FX data.

const BASE_URL = 'https://api.frankfurter.dev/v1';

// In-memory cache of time-series responses, keyed by base:target:days.
// TTL 6h — historical points don't change intraday and today's point settles
// once ECB publishes.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

export class FrankfurterError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'FrankfurterError';
    this.status = status;
  }
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Fetch a daily time-series of base->target rates for the last `days` days.
 * Returns an array of { date, rate } sorted ascending by date. Same-currency
 * pairs return a flat series of 1. Unsupported pairs return an empty array.
 */
export async function getTimeSeries(base, target, days = 30) {
  const baseCode = base.toUpperCase();
  const targetCode = target.toUpperCase();

  const cacheKey = `${baseCode}:${targetCode}:${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.points;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  // Same currency: constant series of 1.0 across the window.
  if (baseCode === targetCode) {
    const points = [
      { date: formatDate(start), rate: 1 },
      { date: formatDate(end), rate: 1 },
    ];
    cache.set(cacheKey, { at: Date.now(), points });
    return points;
  }

  const url = `${BASE_URL}/${formatDate(start)}..${formatDate(end)}`;
  try {
    const { data } = await axios.get(url, {
      params: { base: baseCode, symbols: targetCode },
      timeout: 10000,
    });

    const rates = data?.rates || {};
    const points = Object.keys(rates)
      .sort()
      .map((date) => ({ date, rate: rates[date]?.[targetCode] }))
      .filter((p) => typeof p.rate === 'number');

    cache.set(cacheKey, { at: Date.now(), points });
    return points;
  } catch (err) {
    if (err.response) {
      // Frankfurter returns 404 for an unsupported base/symbol. Treat as empty
      // rather than a hard error so the chart shows an "unavailable" state.
      if (err.response.status === 404) {
        cache.set(cacheKey, { at: Date.now(), points: [] });
        return [];
      }
      throw new FrankfurterError(
        `Frankfurter API error: HTTP ${err.response.status}`,
        502
      );
    }
    if (err.code === 'ECONNABORTED') {
      throw new FrankfurterError('Frankfurter request timed out', 504);
    }
    throw new FrankfurterError('Network failure reaching Frankfurter', 502);
  }
}
