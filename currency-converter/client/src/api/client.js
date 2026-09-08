// Thin fetch wrapper around the backend API. All requests go to /api which is
// proxied to the Express server in dev (see vite.config.js). The ExchangeRate
// API key lives only on the backend and is never referenced here.

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message = (body && body.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return body;
}

export const api = {
  getRate: (base, target) =>
    request(`/rates?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}`),

  convert: (base, target, amount) =>
    request('/convert', {
      method: 'POST',
      body: JSON.stringify({ base, target, amount }),
    }),

  convertMulti: (base, amount, targets) =>
    request('/convert/multi', {
      method: 'POST',
      body: JSON.stringify({ base, amount, targets }),
    }),

  getHistory: (base, target, days = 30) =>
    request(
      `/history?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}&days=${days}`
    ),

  getFavorites: () => request('/favorites'),

  addFavorite: (base, target) =>
    request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ base, target }),
    }),

  removeFavorite: (id) => request(`/favorites/${id}`, { method: 'DELETE' }),
};
