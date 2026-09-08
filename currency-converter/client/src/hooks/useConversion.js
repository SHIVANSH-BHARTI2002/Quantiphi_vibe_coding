import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useDebounce } from './useDebounce.js';

// Runs a single-pair conversion. Debounces the amount by 400ms before calling
// the backend. Returns { data, loading, error }.
export function useConversion(base, target, amount) {
  const debouncedAmount = useDebounce(amount, 400);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!base || !target) return;

    const numeric = Number(debouncedAmount);
    if (debouncedAmount === '' || Number.isNaN(numeric)) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .convert(base, target, numeric)
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
  }, [base, target, debouncedAmount]);

  return { data, loading, error };
}
