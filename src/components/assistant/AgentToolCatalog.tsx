'use client';

import React from 'react';
import { SolidPlate } from '@/components/ui/SolidPlate';

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
  const fill = isLight ? '#ffffff' : '#0a0a0c';
  const headFill = isLight ? '#f8fafc' : '#121214';

  return (
    <SolidPlate
      fill={fill}
      className={`shine-border overflow-x-auto rounded-2xl border ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}
    >
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr style={{ backgroundColor: headFill }}>
            <th className={`px-3 py-2 font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Tool</th>
            <th className={`px-3 py-2 font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>What it does</th>
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
    </SolidPlate>
  );
}
