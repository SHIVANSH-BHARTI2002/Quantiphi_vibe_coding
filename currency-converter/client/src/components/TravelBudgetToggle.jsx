// Accessible toggle switch for Travel Budgeting mode.
export default function TravelBudgetToggle({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <span className="hidden text-sm font-medium text-slate-600 sm:inline">
        Travel Budgeting
      </span>
      <span className="text-lg sm:hidden">✈️</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Travel Budgeting Mode"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition
          ${checked ? 'bg-brand-500' : 'bg-slate-300'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  );
}
