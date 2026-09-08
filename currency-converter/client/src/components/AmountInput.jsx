import { getCurrency } from '../data/currencies.js';

// Numeric amount input. Value is a string (controlled) so the parent can
// debounce it before calling the API.
export default function AmountInput({ label, value, onChange, currencyCode }) {
  const currency = getCurrency(currencyCode);

  function handle(e) {
    const raw = e.target.value;
    // Allow empty, digits and a single decimal point.
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
      )}
      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 shadow-card transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
        <span className="mr-2 text-lg text-slate-400">{currency.symbol || currency.code}</span>
        <input
          inputMode="decimal"
          value={value}
          onChange={handle}
          placeholder="0.00"
          className="w-full bg-transparent py-3 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300"
          aria-label={label || 'Amount'}
        />
      </div>
    </div>
  );
}
