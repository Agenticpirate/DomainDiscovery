'use client';

import React from 'react';

const TOOLS: { name: string; description: string }[] = [
  { name: 'find_brand_domains', description: 'AUTO: brief → generate → check → rank → shortlist (primary)' },
  { name: 'get_product_facts', description: 'Canonical product facts for agents' },
  { name: 'parse_business_brief', description: 'Free text → structured DomainBrief' },
  { name: 'generate_domain_names', description: 'Candidate names from brief/keywords' },
  { name: 'check_domain_availability', description: 'Live check up to 50 domains' },
  { name: 'rank_domains', description: 'Score brand fit with explainable breakdown' },
  { name: 'whois_lookup', description: 'Public WHOIS/RDAP registration data' },
  { name: 'generate_geo_domains', description: 'City/country + keyword patterns' },
  { name: 'compare_tld_prices', description: 'Regular-style TLD price research' },
];

export function AgentToolCatalog({ isLight }: { isLight: boolean }) {
  return (
    <div
      className={`shine-border relative isolate overflow-hidden overflow-x-auto rounded-2xl border ${
        isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0a0a0c]'
      }`}
    >
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className={isLight ? 'bg-slate-50 text-slate-500' : 'bg-[#121214] text-white/40'}>
            <th className="px-3 py-2 font-bold">Tool</th>
            <th className="px-3 py-2 font-bold">What it does</th>
          </tr>
        </thead>
        <tbody>
          {TOOLS.map((t) => (
            <tr
              key={t.name}
              className={`border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}
            >
              <td className={`px-3 py-2 font-mono font-semibold whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t.name}
              </td>
              <td className={`px-3 py-2 ${isLight ? 'text-slate-600' : 'text-white/55'}`}>{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
