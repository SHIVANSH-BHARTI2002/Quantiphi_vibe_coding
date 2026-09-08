import Header from './components/Header.jsx';
import CurrencySelector from './components/CurrencySelector.jsx';
import AmountInput from './components/AmountInput.jsx';
import ConversionResult from './components/ConversionResult.jsx';
import TrendChart from './components/TrendChart.jsx';
import FavoritesList from './components/FavoritesList.jsx';
import TravelBudgetTable from './components/TravelBudgetTable.jsx';
import Toast from './components/Toast.jsx';

import { useCurrency } from './context/CurrencyContext.jsx';
import { useConversion } from './hooks/useConversion.js';
import { useFavorites } from './hooks/useFavorites.js';

function SwapButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Swap source and target currencies"
      className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-card transition hover:rotate-180 hover:border-brand-300 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M7 10l4-4M7 10l4 4M7 10h10M17 14l-4 4M17 14l-4-4M17 14H7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function StarButton({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-100
        ${
          active
            ? 'border-amber-200 bg-amber-50 text-amber-600'
            : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-500'
        }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
        <path
          d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.98l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L12 3.5z"
          strokeLinejoin="round"
        />
      </svg>
      {active ? 'Saved' : 'Save pair'}
    </button>
  );
}

function MainConverter() {
  const { base, target, amount, setBase, setTarget, setAmount, swap, notify } = useCurrency();
  const { data, loading, error } = useConversion(base, target, amount);
  const favorites = useFavorites();

  const existing = favorites.find(base, target);

  async function toggleFavorite() {
    try {
      if (existing) {
        await favorites.remove(existing.id);
        notify(`Removed ${base} → ${target}`, 'info');
      } else {
        await favorites.add(base, target);
        notify(`Saved ${base} → ${target}`, 'success');
      }
    } catch (err) {
      notify(err.message || 'Something went wrong', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Convert</h2>
          <StarButton active={!!existing} onClick={toggleFavorite} />
        </div>

        {/* Selectors: stacked on mobile, row with swap on larger screens */}
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <CurrencySelector label="From" value={base} onChange={setBase} disabledCode={target} />
          <div className="flex justify-center">
            <SwapButton onClick={swap} />
          </div>
          <CurrencySelector label="To" value={target} onChange={setTarget} disabledCode={base} />
        </div>

        <div className="mt-4">
          <AmountInput label="Amount" value={amount} onChange={setAmount} currencyCode={base} />
        </div>

        <div className="mt-5">
          <ConversionResult data={data} loading={loading} error={error} base={base} target={target} />
        </div>
      </div>

      <TrendChart base={base} target={target} />

      <FavoritesList
        favorites={favorites.favorites}
        loading={favorites.loading}
        error={favorites.error}
        onRemove={favorites.remove}
      />
    </div>
  );
}

function TravelMode() {
  const { base, amount, setBase, setAmount } = useCurrency();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <h2 className="font-bold text-slate-900">Travel Budgeting</h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Enter one amount and see it in five major currencies at once.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CurrencySelector label="Base currency" value={base} onChange={setBase} />
          <AmountInput label="Amount" value={amount} onChange={setAmount} currencyCode={base} />
        </div>
      </div>

      <TravelBudgetTable base={base} amount={amount} />
    </div>
  );
}

export default function App() {
  const { travelMode } = useCurrency();

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {travelMode ? <TravelMode /> : <MainConverter />}
      </main>
      <footer className="pb-10 text-center text-xs text-slate-400">
        RateFlow · rates via ExchangeRate-API · cached server-side
      </footer>
      <Toast />
    </div>
  );
}
