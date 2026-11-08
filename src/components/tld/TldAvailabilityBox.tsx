'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TldAvailabilityBox({ tld }: { tld: string }) {
  const router = useRouter();
  const [name, setName] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const label = name.trim().toLowerCase().replace(/\s+/g, '').replace(/^\.+|\.+$/g, '');
    if (!label) return;
    router.push(`/search?q=${encodeURIComponent(`${label}${tld}`)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-2" role="search">
      <label htmlFor="tld-name" className="sr-only">
        Domain name to check
      </label>
      <div className="flex flex-1 items-center rounded-xl border border-white/15 bg-black px-3 focus-within:border-white/40">
        <input
          id="tld-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="yourname"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-white outline-none placeholder:text-white/30"
        />
        <span className="select-none text-[15px] font-semibold text-white/60">{tld}</span>
      </div>
      <button
        type="submit"
        className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-white/90"
      >
        Check availability
      </button>
    </form>
  );
}
