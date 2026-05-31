'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator';
import { PreferredRegistrarSelect } from '@/components/domain/RegistrarControls';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { getRegistrarUrl } from '@/lib/registrars';
import { checkDomainAvailability } from '@/services/instantDomainService';

interface BrandableDomain {
  domain: string;
  available: boolean;
  score: number;
  style: string;
  pronunciation: string;
}

interface BrandableDomainFinderProps {
  onSelect?: (domain: string) => void;
  /** Show the internal title + subtitle. Off by default since callers provide a page heading. */
  showHeading?: boolean;
}

export function BrandableDomainFinder({ onSelect, showHeading = false }: BrandableDomainFinderProps) {
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState<'modern' | 'classic' | 'playful' | 'professional'>('modern');
  const [length, setLength] = useState<'short' | 'medium' | 'any'>('short');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BrandableDomain[]>([]);
  const { theme } = useTheme();
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();
  const isLight = theme === 'light';

  const styles = [
    { id: 'modern', label: 'Modern', desc: 'Clean, tech-forward names' },
    { id: 'classic', label: 'Classic', desc: 'Timeless, professional names' },
    { id: 'playful', label: 'Playful', desc: 'Fun, memorable names' },
    { id: 'professional', label: 'Professional', desc: 'Corporate, trustworthy names' },
  ];

  const lengths = [
    { id: 'short', label: 'Short (4-6 chars)' },
    { id: 'medium', label: 'Medium (7-10 chars)' },
    { id: 'any', label: 'Any length' },
  ];

  const handleGenerate = async () => {
    if (!industry.trim()) return;

    setIsGenerating(true);
    const cleanIndustry = industry.toLowerCase().replace(/[^a-z0-9]/g, '');
    const industryRoot = cleanIndustry.slice(0, length === 'short' ? 4 : length === 'medium' ? 6 : 8) || 'brand';
    const prefixes = {
      modern: ['Zeno', 'Vex', 'Nex', 'Flux', 'Aero', 'Sync', 'Pixel', 'Nova'],
      classic: ['Prime', 'Atlas', 'Crown', 'Elite', 'Royal', 'Grand', 'Noble', 'Sterling'],
      playful: ['Zippy', 'Boop', 'Fizz', 'Spark', 'Jolly', 'Quirk', 'Zappy', 'Bounce'],
      professional: ['Apex', 'Core', 'Trust', 'Solid', 'Peak', 'Vertex', 'Summit', 'Anchor'],
    };

    const suffixes = ['io', 'ly', 'ify', 'hub', 'lab', 'co', 'app', 'ai'];
    const selectedPrefixes = prefixes[style];
    const candidates = selectedPrefixes.slice(0, 4).flatMap((prefix, i) => {
      const suffix = suffixes[i % suffixes.length];
      return [
        {
          domain: `${prefix.toLowerCase()}${industryRoot}.com`,
          score: Math.max(72, 92 - i * 3),
          pronunciation: `${prefix}-${industryRoot}`,
        },
        {
          domain: `${industryRoot}${suffix}.com`,
          score: Math.max(70, 89 - i * 2),
          pronunciation: `${industryRoot}-${suffix}`,
        },
      ];
    });

    const uniqueCandidates = Array.from(new Map(candidates.map((item) => [item.domain, item])).values()).slice(0, 8);
    const availability = await checkDomainAvailability(uniqueCandidates.map((item) => item.domain));
    const availabilityMap = new Map(availability.map((item) => [item.domain.toLowerCase(), item.available]));

    const generated: BrandableDomain[] = uniqueCandidates.map((item) => ({
        domain: item.domain,
        available: availabilityMap.get(item.domain.toLowerCase()) ?? false,
        score: item.score,
        style: style,
        pronunciation: item.pronunciation,
    }));

    setResults(generated);
    setIsGenerating(false);
  };

  const handleResultClick = (result: BrandableDomain) => {
    onSelect?.(result.domain);

    const targetUrl = result.available
      ? getRegistrarUrl(result.domain, selectedRegistrar)
      : `https://who.is/whois/${encodeURIComponent(result.domain)}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`glass-card p-3.5 sm:p-4 ${isLight ? 'border-slate-200 shadow-sm' : 'border-white/10'}`}>
      <div className="mb-5">
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {showHeading ? (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border border-white/10'}`}>
                <Icons.Star />
              </div>
              <h3 className="text-lg font-bold">Find Brandable Domains</h3>
            </div>
          ) : (
            <span />
          )}
          <PreferredRegistrarSelect
            selectedRegistrar={selectedRegistrar}
            onSelectRegistrar={setSelectedRegistrar}
            label="Registrar"
          />
        </div>
        {showHeading && (
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
            Discover unique, memorable brandable domain names perfect for your business
          </p>
        )}
      </div>

      {/* Industry Input */}
      <div className="mb-5">
        <Input
          label="Industry or Niche"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g., startups, founders, ventures..."
        />
      </div>

      {/* Style Selection */}
      <div className="mb-5">
        <label className={`block text-xs font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-3`}>
          Brand Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {styles.map((s) => (
            <Button
              key={s.id}
              onClick={() => setStyle(s.id as typeof style)}
              variant={style === s.id ? 'secondary' : 'ghost'}
              className="h-auto p-3 text-left flex-col items-start min-h-[72px]"
            >
              <div className="font-semibold text-sm mb-0.5">{s.label}</div>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{s.desc}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Length Selection */}
      <div className="mb-5">
        <label className={`block text-xs font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/40'} mb-3`}>
          Domain Length
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {lengths.map((l) => (
            <Button
              key={l.id}
              onClick={() => setLength(l.id as typeof length)}
              variant={length === l.id ? 'primary' : 'secondary'}
              size="sm"
              className="w-full"
            >
              {l.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full mb-5">
        Generate Brandable Names
      </Button>

      {/* Results */}
      {isGenerating && (
        <div className="text-center py-8">
          <div className={`inline-flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
            <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-400' : 'bg-white/40'} animate-pulse`} />
            <span className="text-sm">Finding brandable names...</span>
          </div>
        </div>
      )}

      {results.length > 0 && !isGenerating && (
        <div className="space-y-2 animate-fade-in">
          {results.map((result, i) => (
            <div
              key={i}
              className={`p-3.5 sm:p-4 rounded-xl ${isLight ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/[0.06]' : 'bg-white/[0.02] border border-white/10 hover:border-white/20'} border transition-all group`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <AvailabilityIndicator 
                      status={result.available ? 'available' : 'unavailable'}
                      size="sm"
                    />
                    <span className="font-mono font-bold text-sm sm:text-base break-all">{result.domain}</span>
                    {result.available && (
                      <Badge variant="success" size="sm">
                        Available
                      </Badge>
                    )}
                  </div>
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${isLight ? 'text-slate-500' : 'text-white/40'} mb-2`}>
                    <span>Score: {result.score}</span>
                    <span>•</span>
                    <span>Pronunciation: {result.pronunciation}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className={`font-mono text-left text-sm transition-colors ${result.available ? (isLight ? 'text-slate-700 hover:text-slate-950' : 'text-white/80 hover:text-white') : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/35 hover:text-white/55')}`}
                    title={result.available ? `Register on ${selectedRegistrar}` : 'View WHOIS'}
                  >
                    Open with {result.available ? selectedRegistrar : 'WHOIS'}
                  </button>
                  <Badge variant="neutral" size="sm">
                    {result.style}
                  </Badge>
                </div>
                <Button
                  variant={result.available ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full sm:w-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => handleResultClick(result)}
                >
                  {result.available ? 'Register' : 'View'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
