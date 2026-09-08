import { useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext.jsx';

const TONES = {
  success: 'bg-emerald-600',
  info: 'bg-slate-800',
  error: 'bg-rose-600',
};

export default function Toast() {
  const { toast, dismissToast } = useCurrency();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(dismissToast, 2600);
    return () => clearTimeout(id);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lift ${
          TONES[toast.tone] || TONES.info
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}
