import { useCurrency } from '../context/CurrencyContext.jsx';
import TravelBudgetToggle from './TravelBudgetToggle.jsx';

export default function Header() {
  const { travelMode, setTravelMode } = useCurrency();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-lift">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              <path
                d="M4 16l4-8 3 5 3-6 4 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">RateFlow</h1>
            <p className="text-xs text-slate-500 -mt-0.5">Real-time currency converter</p>
          </div>
        </div>

        <TravelBudgetToggle checked={travelMode} onChange={setTravelMode} />
      </div>
    </header>
  );
}
