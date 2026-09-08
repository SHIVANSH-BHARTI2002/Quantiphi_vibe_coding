import axios from 'axios';
import db from '../db/database.js';

const API_KEY = process.env.EXCHANGE_API_KEY;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Cache TTL for live rates: 15 minutes.
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Custom error carrying an HTTP status so routes can respond appropriately.
 */
export class ExchangeRateError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'ExchangeRateError';
    this.status = status;
  }
}

const getCacheStmt = db.prepare(
  'SELECT data, cached_at FROM rate_cache WHERE base_currency = ?'
);
const upsertCacheStmt = db.prepare(`
  INSERT INTO rate_cache (base_currency, data, cached_at)
  VALUES (@base, @data, @cachedAt)
  ON CONFLICT(base_currency) DO UPDATE SET
    data = excluded.data,
    cached_at = excluded.cached_at
`);
const insertHistoryStmt = db.prepare(`
  INSERT INTO rate_history (base_currency, target_currency, rate, fetched_at)
  VALUES (@base, @target, @rate, @fetchedAt)
`);

/**
 * Fetch the full set of conversion rates for a base currency directly from
 * ExchangeRate-API. Throws ExchangeRateError on failure.
 */
async function fetchFreshRates(base) {
  if (!API_KEY) {
    throw new ExchangeRateError(
      'Server missing EXCHANGE_API_KEY. Set it in server/.env',
      500
    );
  }

  const url = `${BASE_URL}/${API_KEY}/latest/${base}`;
  try {
    const { data } = await axios.get(url, { timeout: 10000 });

    if (data.result === 'error') {
      const type = data['error-type'] || 'unknown-error';
      const status = type === 'unsupported-code' ? 400 : 502;
      throw new ExchangeRateError(`ExchangeRate-API error: ${type}`, status);
    }

    return {
      base: data.base_code,
      rates: data.conversion_rates,
      lastUpdated: data.time_last_update_utc || new Date().toUTCString(),
    };
  } catch (err) {
    if (err instanceof ExchangeRateError) throw err;

    if (err.response) {
      const type = err.response.data?.['error-type'] || `HTTP ${err.response.status}`;
      const status = err.response.status === 429 ? 429 : 502;
      throw new ExchangeRateError(`ExchangeRate-API error: ${type}`, status);
    }
    if (err.code === 'ECONNABORTED') {
      throw new ExchangeRateError('ExchangeRate-API request timed out', 504);
    }
    throw new ExchangeRateError('Network failure reaching ExchangeRate-API', 502);
  }
}

/**
 * Returns { base, rates, lastUpdated, cached }. Uses rate_cache (15 min TTL)
 * before hitting the external API. On a fresh fetch, updates the cache and
 * records a rate_history snapshot for each target currency is NOT done here to
 * avoid huge writes — history for a specific pair is recorded on demand via
 * recordHistory().
 */
export async function getRates(base) {
  const baseCode = base.toUpperCase();
  const cached = getCacheStmt.get(baseCode);

  if (cached) {
    const age = Date.now() - new Date(cached.cached_at).getTime();
    if (age < CACHE_TTL_MS) {
      return {
        base: baseCode,
        rates: JSON.parse(cached.data),
        lastUpdated: cached.cached_at,
        cached: true,
      };
    }
  }

  const fresh = await fetchFreshRates(baseCode);
  const cachedAt = new Date().toISOString();

  upsertCacheStmt.run({
    base: baseCode,
    data: JSON.stringify(fresh.rates),
    cachedAt,
  });

  return {
    base: baseCode,
    rates: fresh.rates,
    lastUpdated: cachedAt,
    cached: false,
  };
}

/**
 * Get a single rate for base -> target, using the cached rates map.
 */
export async function getRate(base, target) {
  const baseCode = base.toUpperCase();
  const targetCode = target.toUpperCase();

  const { rates, lastUpdated, cached } = await getRates(baseCode);
  const rate = rates[targetCode];

  if (rate === undefined) {
    throw new ExchangeRateError(`Unsupported target currency: ${targetCode}`, 400);
  }

  return { base: baseCode, target: targetCode, rate, lastUpdated, cached };
}

/**
 * Record a single rate_history snapshot for a pair (used by /api/rates and the
 * daily snapshot job). Deduplicates to at most one row per pair per calendar day.
 */
const existsTodayStmt = db.prepare(`
  SELECT 1 FROM rate_history
  WHERE base_currency = ? AND target_currency = ? AND substr(fetched_at, 1, 10) = ?
  LIMIT 1
`);

export function recordHistory(base, target, rate, fetchedAt = new Date().toISOString()) {
  const baseCode = base.toUpperCase();
  const targetCode = target.toUpperCase();
  const day = fetchedAt.slice(0, 10);

  const already = existsTodayStmt.get(baseCode, targetCode, day);
  if (already) return false;

  insertHistoryStmt.run({
    base: baseCode,
    target: targetCode,
    rate,
    fetchedAt,
  });
  return true;
}

export { CACHE_TTL_MS };
