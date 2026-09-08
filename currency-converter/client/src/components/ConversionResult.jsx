import { getCurrency } from '../data/currencies.js';

function formatMoney(value, code) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback for codes Intl doesn't recognize.
    return `${value.toFixed(2)} ${code}`;
  }
}

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ConversionResult({ data, loading, error, base, target }) {
  const baseCur = getCurrency(base);
  const targetCur = getCurrency(target);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
        <p className="font-semibold">Couldn’t fetch the rate</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-3 h-9 w-48" />
        <div className="skeleton mt-4 h-3 w-40" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400">
        Enter an amount to see the conversion.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {baseCur.flag} {data.amount} {base}
        </span>
        {loading && <span className="text-brand-500">Updating…</span>}
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {formatMoney(data.convertedAmount, target)}
        </span>
        <span className="text-lg font-semibold text-slate-400">{targetCur.flag}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
          1 {base} = {data.rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {target}
        </span>
        <span className="text-slate-400">Updated {formatTimestamp(data.lastUpdated)}</span>
      </div>
    </div>
  );
}
