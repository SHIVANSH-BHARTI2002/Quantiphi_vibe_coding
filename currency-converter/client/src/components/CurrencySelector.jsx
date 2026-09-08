import { useEffect, useMemo, useRef, useState } from 'react';
import { CURRENCIES, getCurrency } from '../data/currencies.js';

// Searchable currency dropdown. Controlled via `value` (ISO code) + `onChange`.
export default function CurrencySelector({ label, value, onChange, disabledCode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = getCurrency(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Focus the search field when opening.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function choose(code) {
    if (code === disabledCode) return;
    onChange(code);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) choose(item.code);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-card transition hover:border-brand-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl leading-none">{selected.flag}</span>
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900">{selected.code}</span>
              <span className="block truncate text-xs text-slate-500">{selected.name}</span>
            </span>
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lift">
            <div className="p-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search currency…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <ul
              className="scroll-thin max-h-64 overflow-y-auto pb-2"
              role="listbox"
              aria-label={label}
            >
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-slate-400">No matches</li>
              )}
              {filtered.map((c, idx) => {
                const isDisabled = c.code === disabledCode;
                const isSelected = c.code === value;
                const isActive = idx === activeIndex;
                return (
                  <li key={c.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => choose(c.code)}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition
                        ${isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-brand-50'}
                        ${isActive && !isDisabled ? 'bg-brand-50' : ''}
                        ${isSelected ? 'font-semibold text-brand-700' : 'text-slate-700'}`}
                    >
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span className="w-11 font-semibold">{c.code}</span>
                      <span className="truncate text-slate-500">{c.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
