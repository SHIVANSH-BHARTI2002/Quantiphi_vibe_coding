import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Manages the favorites list backed by the SQLite-backed API.
// Returns { favorites, loading, error, add, remove, find, refresh }.
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .getFavorites()
      .then((rows) => setFavorites(rows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (base, target) => {
    const row = await api.addFavorite(base, target);
    setFavorites((prev) => {
      if (prev.some((f) => f.id === row.id)) return prev;
      return [row, ...prev];
    });
    return row;
  }, []);

  const remove = useCallback(async (id) => {
    await api.removeFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const find = useCallback(
    (base, target) =>
      favorites.find(
        (f) => f.base_currency === base && f.target_currency === target
      ) || null,
    [favorites]
  );

  return { favorites, loading, error, add, remove, find, refresh };
}
