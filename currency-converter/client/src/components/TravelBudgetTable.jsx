import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { getCurrency, TRAVEL_TARGETS } from '../data/currencies.js';
import { useDebounce } from '../hooks/useDebounce.js';

function formatMoney(value, code) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

// Converts one base amount into the TRAVEL_TARGETS list via a single
// /api/convert/multi call. Updates live (debounced) as the amount changes.
export default function TravelBudgetTable({ base, amount }) {
  const debouncedAmount = useDebounce(amount, 400);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const numeric = Number(debouncedAmount);
    if (debouncedAmount === '' || Number.isNaN(numeric)) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .convertMulti(base, numeric, TRAVEL_TARGETS)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [base, debouncedAmount]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-900">Travel budget breakdown</h2>
          <p className="text-xs text-slate-500">
            {getCurrency(base).flag} {amount || 0} {base} across major currencies
          </p>
        </div>
        {loading && <span className="text-sm text-brand-500">Updating…</span>}
      </div>

      {error && <p className="px-5 py-4 text-sm text-rose-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-semibold">Currency</th>
              <th className="px-5 py-3 font-semibold text-right">Amount</th>
              <th className="px-5 py-3 font-semibold text-right">Rate (1 {base})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TRAVEL_TARGETS.map((code) => {
              const cur = getCurrency(code);
              const row = data?.results?.find((r) => r.target === code);
              return (
                <tr key={code} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{cur.flag}</span>
                      <span>
                        <span className="block font-semibold text-slate-900">{cur.code}</span>
                        <span className="block text-xs text-slate-500">{cur.name}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {loading && !row ? (
                      <span className="skeleton ml-auto block h-4 w-20" />
                    ) : (
                      formatMoney(row?.convertedAmount, code)
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-500">
                    {row ? row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data?.lastUpdated && (
        <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Single external API call · updated{' '}
          {new Date(data.lastUpdated).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      )}
    </div>
  );
}
