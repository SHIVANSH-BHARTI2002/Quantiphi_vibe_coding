import { createContext, useContext, useState, useCallback } from 'react';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [base, setBase] = useState('USD');
  const [target, setTarget] = useState('INR');
  const [amount, setAmount] = useState('1');
  const [travelMode, setTravelMode] = useState(false);

  // Toast notification state (single, transient).
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  const swap = useCallback(() => {
    setBase((prevBase) => {
      setTarget(prevBase);
      return target;
    });
  }, [target]);

  const loadPair = useCallback((b, t) => {
    setBase(b);
    setTarget(t);
    setTravelMode(false);
  }, []);

  const value = {
    base,
    target,
    amount,
    travelMode,
    setBase,
    setTarget,
    setAmount,
    setTravelMode,
    swap,
    loadPair,
    toast,
    notify,
    dismissToast,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
