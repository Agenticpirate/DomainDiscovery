'use client';

import { useEffect, useState } from 'react';

type Props = {
  id: string;
  initial: string;
  buttonLabel: string;
  loading: boolean;
  onSubmit: (domain: string) => void;
  children?: React.ReactNode;
};

/** Shared domain input used by the SEO tool widgets. */
export function ToolDomainForm({ id, initial, buttonLabel, loading, onSubmit, children }: Props) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);

  return (
    <form
      role="search"
      className="mt-6 flex flex-col sm:flex-row gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim();
        if (v) onSubmit(v);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Domain name
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="example.com"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black px-3 py-3 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-white/40"
      />
      {children}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-white/90 disabled:opacity-60"
      >
        {loading ? 'Checking…' : buttonLabel}
      </button>
    </form>
  );
}
