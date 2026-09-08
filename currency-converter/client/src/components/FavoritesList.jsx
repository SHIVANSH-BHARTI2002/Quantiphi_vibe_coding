import { getCurrency } from '../data/currencies.js';
import { useCurrency } from '../context/CurrencyContext.jsx';

export default function FavoritesList({ favorites, loading, error, onRemove }) {
  const { loadPair, notify } = useCurrency();

  function handleSelect(fav) {
    loadPair(fav.base_currency, fav.target_currency);
  }

  async function handleRemove(e, fav) {
    e.stopPropagation();
    try {
      await onRemove(fav.id);
      notify(`Removed ${fav.base_currency} → ${fav.target_currency}`, 'info');
    } catch (err) {
      notify(err.message || 'Failed to remove favorite', 'error');
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="mb-3 font-bold text-slate-900">Favorites</h2>

      {loading && (
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-9 w-28 rounded-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-rose-600">Couldn’t load favorites: {error}</p>
      )}

      {!loading && !error && favorites.length === 0 && (
        <p className="text-sm text-slate-400">
          No favorites yet. Tap the star on a pair to save it here.
        </p>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {favorites.map((fav) => {
            const b = getCurrency(fav.base_currency);
            const t = getCurrency(fav.target_currency);
            return (
              <div
                key={fav.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(fav)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(fav);
                  }
                }}
                className="group flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <span>
                  {b.flag} {fav.base_currency} → {t.flag} {fav.target_currency}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, fav)}
                  aria-label={`Remove ${fav.base_currency} to ${fav.target_currency}`}
                  className="grid h-6 w-6 place-items-center rounded-full text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
