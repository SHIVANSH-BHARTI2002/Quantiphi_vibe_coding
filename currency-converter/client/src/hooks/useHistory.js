import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Fetches the rate history for a pair whenever base/target changes.
// Returns { data, loading, error }.
export function useHistory(base, target, days = 30) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!base || !target) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getHistory(base, target, days)
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
  }, [base, target, days]);

  return { data, loading, error };
}
