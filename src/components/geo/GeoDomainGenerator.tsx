'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { getRegistrarUrl } from '@/lib/registrars';
import countriesData from '@/data/countries.json';
import citiesData from '@/data/cities-expanded.json';
import usStatesData from '@/data/us-states.json';
import canadaProvincesData from '@/data/canada-provinces.json';
import australiaStatesData from '@/data/australia-states.json';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface Location {
  name: string;
  population: number;
  type: 'country' | 'city' | 'state';
  code?: string;
  continent?: string;
  country?: string;
  region?: string;
}

interface GeneratedDomain {
  domain: string;
  location: string;
  population: number;
  length: number;
  type: 'country' | 'city' | 'state';
  status: 'pending' | 'checking' | 'available' | 'taken' | 'error' | 'skipped';
  pattern: string;
  /** ISO 3166-1 alpha-2 for flag display */
  countryCode?: string;
  /** After live check: free registration vs premium aftermarket-style listing */
  premium?: boolean;
  price?: string;
  buyUrl?: string;
}

type StatusFilter = 'all' | 'available' | 'premium' | 'taken' | 'checking';
type SortKey = 'domain' | 'population' | 'length' | 'status';

type LocationType =
  | 'all_countries'
  | 'all_cities'
  | 'mega_cities'
  | 'country_cities'
  | 'us_states'
  | 'us_cities'
  | 'canada_cities'
  | 'canada_provinces'
  | 'uk_cities'
  | 'australia_cities'
  | 'australia_states'
  | 'europe'
  | 'asia'
  | 'africa'
  | 'south_america'
  | 'oceania'
  | 'north_america'
  | 'europe_cities'
  | 'asia_cities'
  | 'africa_cities'
  | 'latam_cities'
  | 'oceania_cities';

type KeywordPosition = 'start' | 'end' | 'both';
type SeparatorMode = 'none' | 'hyphen' | 'both';

const TLD_OPTIONS = [
  { value: 'com', label: '.com', popular: true, geo: false },
  { value: 'net', label: '.net', popular: true, geo: false },
  { value: 'org', label: '.org', popular: true, geo: false },
  { value: 'co', label: '.co', popular: true, geo: false },
  { value: 'io', label: '.io', popular: true, geo: false },
  { value: 'ai', label: '.ai', popular: true, geo: false },
  { value: 'app', label: '.app', popular: true, geo: false },
  { value: 'dev', label: '.dev', popular: false, geo: false },
  { value: 'xyz', label: '.xyz', popular: false, geo: false },
  { value: 'online', label: '.online', popular: false, geo: false },
  { value: 'us', label: '.us', popular: true, geo: true },
  { value: 'uk', label: '.uk', popular: false, geo: true },
  { value: 'ca', label: '.ca', popular: false, geo: true },
  { value: 'de', label: '.de', popular: false, geo: true },
  { value: 'fr', label: '.fr', popular: false, geo: true },
  { value: 'au', label: '.au', popular: false, geo: true },
  { value: 'in', label: '.in', popular: false, geo: true },
  { value: 'eu', label: '.eu', popular: false, geo: true },
  { value: 'info', label: '.info', popular: false, geo: false },
  { value: 'biz', label: '.biz', popular: false, geo: false },
];

const LOCATION_OPTIONS: {
  value: LocationType;
  label: string;
  group: string;
  icon: string;
}[] = [
  { value: 'country_cities', label: 'Pick a country', group: 'By country', icon: '🏳️' },
  { value: 'mega_cities', label: 'Mega cities (1M+)', group: 'Global', icon: '🏙️' },
  { value: 'all_cities', label: 'All major cities', group: 'Global', icon: '🌐' },
  { value: 'all_countries', label: 'All countries', group: 'Global', icon: '🌍' },
  { value: 'us_cities', label: 'US cities', group: 'United States', icon: '🇺🇸' },
  { value: 'us_states', label: 'US states', group: 'United States', icon: '🇺🇸' },
  { value: 'canada_cities', label: 'Canada cities', group: 'Canada', icon: '🇨🇦' },
  { value: 'canada_provinces', label: 'Canada provinces', group: 'Canada', icon: '🇨🇦' },
  { value: 'uk_cities', label: 'UK cities', group: 'United Kingdom', icon: '🇬🇧' },
  { value: 'australia_cities', label: 'Australia cities', group: 'Australia', icon: '🇦🇺' },
  { value: 'australia_states', label: 'Australia states', group: 'Australia', icon: '🇦🇺' },
  { value: 'europe_cities', label: 'Europe cities', group: 'Continents', icon: '🇪🇺' },
  { value: 'asia_cities', label: 'Asia cities', group: 'Continents', icon: '🌏' },
  { value: 'africa_cities', label: 'Africa cities', group: 'Continents', icon: '🌍' },
  { value: 'latam_cities', label: 'LatAm cities', group: 'Continents', icon: '🌎' },
  { value: 'oceania_cities', label: 'Oceania cities', group: 'Continents', icon: '🌊' },
  { value: 'europe', label: 'Europe countries', group: 'Continents', icon: '🇪🇺' },
  { value: 'asia', label: 'Asia countries', group: 'Continents', icon: '🌏' },
  { value: 'africa', label: 'Africa countries', group: 'Continents', icon: '🌍' },
  { value: 'north_america', label: 'N. America countries', group: 'Continents', icon: '🌎' },
  { value: 'south_america', label: 'S. America countries', group: 'Continents', icon: '🌎' },
  { value: 'oceania', label: 'Oceania countries', group: 'Continents', icon: '🌊' },
];

const CONTINENT_COUNTRY_CODES: Record<string, string[]> = {
  europe: [
    'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'GR',
    'PL', 'CZ', 'HU', 'RO', 'BG', 'RS', 'HR', 'UA', 'BY', 'RU',
  ],
  asia: [
    'CN', 'IN', 'JP', 'KR', 'ID', 'PH', 'TH', 'VN', 'MY', 'SG', 'TW', 'PK', 'BD', 'SA', 'AE', 'TR',
    'IL', 'IR', 'IQ', 'KZ', 'UZ', 'MM', 'KH', 'LK', 'NP', 'JO', 'LB', 'QA', 'KW',
  ],
  africa: [
    'NG', 'EG', 'ZA', 'KE', 'ET', 'GH', 'CI', 'SN', 'UG', 'TZ', 'MA', 'DZ', 'TN', 'AO', 'CD', 'SD',
  ],
  latam: [
    'BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO',
  ],
  oceania: ['AU', 'NZ'],
};

const NICHE_CHIPS = [
  'plumber',
  'lawyer',
  'dentist',
  'realtor',
  'pizza',
  'taxi',
  'hotel',
  'news',
  'jobs',
  'cars',
  'homes',
  'rentals',
  'tours',
  'gym',
  'spa',
  'clinic',
  'agency',
  'shop',
];

const PAGE_SIZE = 40;
const COUNTRY_PAGE_SIZE = 20;
/** Domains per HTTP request to instant-check */
const CHECK_BATCH = 50;
/** How many instant-check requests to run in parallel */
const CHECK_CONCURRENCY = 3;
/** Default live-check budget — lower = faster first results */
const DEFAULT_MAX_CHECK = 120;
const HARD_MAX_CHECK = 500;

/**
 * Always express large populations in millions (never "B" / billions).
 * India ≈ 1,429M · China ≈ 1,426M · Shanghai ≈ 24.7M
 */
const formatPopulation = (pop: number): string => {
  if (!pop || pop <= 0) return '—';
  if (pop >= 1_000_000) {
    const millions = pop / 1_000_000;
    if (millions >= 100) return `${Math.round(millions).toLocaleString('en-US')}M`;
    if (millions >= 10) return `${millions.toFixed(1)}M`;
    return `${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (pop >= 1_000) return `${Math.round(pop / 1_000)}K`;
  return String(pop);
};

/** Full integer count (e.g. 24,722,254). */
const formatPopulationExact = (pop: number): string => {
  if (!pop || pop <= 0) return '—';
  return pop.toLocaleString('en-US');
};

/** Spoken-style label for country-scale numbers. */
const formatPopulationMillions = (pop: number): string => {
  if (!pop || pop <= 0) return '—';
  if (pop >= 1_000_000) {
    const millions = pop / 1_000_000;
    if (millions >= 100) {
      return `${Math.round(millions).toLocaleString('en-US')} million`;
    }
    return `${millions.toFixed(1)} million`;
  }
  return formatPopulationExact(pop);
};

/** Official flag image via flagcdn (ISO alpha-2). */
function CountryFlag({
  code,
  size = 22,
  className = '',
  title,
}: {
  code?: string | null;
  size?: number;
  className?: string;
  title?: string;
}) {
  if (!code) return null;
  const raw = code.trim().toLowerCase();
  const cc = raw === 'uk' ? 'gb' : raw === 'xk' ? 'xk' : raw;
  if (!/^[a-z]{2}$/.test(cc)) return null;
  const h = Math.max(12, Math.round(size * 0.72));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${cc}.png`}
      srcSet={`https://flagcdn.com/w40/${cc}.png 1x, https://flagcdn.com/w80/${cc}.png 2x`}
      width={size}
      height={h}
      alt={title ? `${title} flag` : `${cc.toUpperCase()} flag`}
      title={title || cc.toUpperCase()}
      loading="eager"
      decoding="async"
      draggable={false}
      className={`inline-block shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/15 dark:ring-white/20 ${className}`}
      style={{ width: size, height: h }}
    />
  );
}

const sanitizeDomainName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 63);

function shell(isLight: boolean) {
  return isLight
    ? 'border-slate-200/90 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_40px_-16px_rgba(15,23,42,0.18)] backdrop-blur-sm'
    : 'border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)]';
}

function chipCls(active: boolean, isLight: boolean) {
  if (active) {
    return isLight
      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
      : 'border-white/25 bg-white/[0.12] text-white ring-1 ring-inset ring-white/20';
  }
  return isLight
    ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.05]';
}

function locationIsoCode(loc: Location): string | undefined {
  if (loc.type === 'country') return loc.code;
  if (loc.country) return loc.country;
  if (loc.type === 'state' && loc.code && loc.code.length === 2 && !loc.country) {
    // US states etc. — country not always set
    return undefined;
  }
  return loc.country || loc.code;
}

export const GeoDomainGenerator: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const reduceMotion = useReducedMotion();
  const { selectedRegistrar } = usePreferredRegistrar();

  const [keyword, setKeyword] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('mega_cities');
  const [locationGroupTab, setLocationGroupTab] = useState<string>('By country');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [countrySearch, setCountrySearch] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [customPlaces, setCustomPlaces] = useState('');
  const [minCityPop, setMinCityPop] = useState(0);
  const [countryPage, setCountryPage] = useState(0);
  const [resultsPage, setResultsPage] = useState(0);
  const [includeCodes, setIncludeCodes] = useState(true);
  const [position, setPosition] = useState<KeywordPosition>('end');
  const [separator, setSeparator] = useState<SeparatorMode>('none');
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['com']);
  const [customTldInput, setCustomTldInput] = useState('');
  const [minPopulation, setMinPopulation] = useState(0);
  const [maxLocations, setMaxLocations] = useState(0); // 0 = all
  const [minLength, setMinLength] = useState(1);
  const [maxLength, setMaxLength] = useState(63);
  const [maxCheck, setMaxCheck] = useState(DEFAULT_MAX_CHECK);
  /** Off by default — premium pass roughly doubles wait time */
  const [checkPremiumDeep, setCheckPremiumDeep] = useState(false);
  const [checkProgress, setCheckProgress] = useState({ done: 0, total: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [generatedDomains, setGeneratedDomains] = useState<GeneratedDomain[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('population');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [resultQuery, setResultQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  /** Countries that have cities in our catalog (for the country picker). */
  const countriesWithCities = useMemo(() => {
    const byCode = new Map<
      string,
      {
        code: string;
        name: string;
        cityCount: number;
        megaCount: number;
        topPop: number;
        population: number;
      }
    >();
    for (const city of citiesData as { name: string; country: string; population: number; countryName: string }[]) {
      const cur = byCode.get(city.country) || {
        code: city.country,
        name: city.countryName,
        cityCount: 0,
        megaCount: 0,
        topPop: 0,
        population: 0,
      };
      cur.cityCount += 1;
      if (city.population >= 1_000_000) cur.megaCount += 1;
      cur.topPop = Math.max(cur.topPop, city.population);
      if (city.countryName) cur.name = city.countryName;
      byCode.set(city.country, cur);
    }
    // Prefer official country names + national population from countries.json
    for (const c of countriesData as { name: string; code: string; population: number }[]) {
      const row = byCode.get(c.code);
      if (row) {
        row.name = c.name;
        row.population = c.population;
      }
    }
    return Array.from(byCode.values()).sort(
      (a, b) => (b.population || b.topPop) - (a.population || a.topPop) || b.cityCount - a.cityCount
    );
  }, []);

  const filteredCountryPicker = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countriesWithCities;
    return countriesWithCities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countriesWithCities, countrySearch]);

  const countryPageCount = Math.max(1, Math.ceil(filteredCountryPicker.length / COUNTRY_PAGE_SIZE));
  const pagedCountries = useMemo(() => {
    const page = Math.min(countryPage, countryPageCount - 1);
    const start = page * COUNTRY_PAGE_SIZE;
    return filteredCountryPicker.slice(start, start + COUNTRY_PAGE_SIZE);
  }, [filteredCountryPicker, countryPage, countryPageCount]);

  const selectedCountryMeta = useMemo(
    () => countriesWithCities.find((c) => c.code === selectedCountryCode) || null,
    [countriesWithCities, selectedCountryCode]
  );

  /** Cities in selected country at current min pop (for accurate scope labels). */
  const selectedCountryCityStats = useMemo(() => {
    if (!selectedCountryMeta) return { total: 0, matching: 0, mega: 0 };
    const all = (citiesData as { country: string; population: number }[]).filter(
      (c) => c.country === selectedCountryCode
    );
    return {
      total: all.length,
      matching: all.filter((c) => c.population >= Math.max(minCityPop, 0)).length,
      mega: all.filter((c) => c.population >= 1_000_000).length,
    };
  }, [selectedCountryCode, selectedCountryMeta, minCityPop]);

  const mapCities = (
    list: { name: string; country: string; population: number; countryName: string }[]
  ): Location[] =>
    list.map((c) => ({
      name: c.name,
      population: c.population,
      type: 'city' as const,
      country: c.country,
      region: c.countryName,
    }));

  const baseLocations = useMemo((): Location[] => {
    let result: Location[] = [];
    const cities = citiesData as {
      name: string;
      country: string;
      population: number;
      countryName: string;
    }[];

    if (locationType === 'all_countries') {
      result = (countriesData as { name: string; code: string; population: number; continent: string }[]).map(
        (c) => ({
          name: c.name,
          population: c.population,
          type: 'country' as const,
          code: c.code,
          continent: c.continent,
        })
      );
    } else if (locationType === 'all_cities') {
      result = mapCities(cities.filter((c) => c.population >= Math.max(minCityPop, 0)));
    } else if (locationType === 'mega_cities') {
      result = mapCities(cities.filter((c) => c.population >= 1_000_000));
    } else if (locationType === 'country_cities') {
      result = mapCities(
        cities.filter(
          (c) => c.country === selectedCountryCode && c.population >= Math.max(minCityPop, 0)
        )
      );
    } else if (locationType === 'us_cities') {
      result = mapCities(
        cities.filter((c) => c.country === 'US' && c.population >= Math.max(minCityPop, 0))
      );
    } else if (locationType === 'us_states') {
      result = usStatesData.map((s) => ({
        name: s.name,
        population: s.population,
        type: 'state' as const,
        code: s.code,
        region: s.region,
        country: 'US',
      }));
    } else if (locationType === 'canada_cities') {
      result = mapCities(
        cities.filter((c) => c.country === 'CA' && c.population >= Math.max(minCityPop, 0))
      );
    } else if (locationType === 'canada_provinces') {
      result = canadaProvincesData.map((p) => ({
        name: p.name,
        population: p.population,
        type: 'state' as const,
        code: p.code,
        country: p.country || 'CA',
      }));
    } else if (locationType === 'uk_cities') {
      result = mapCities(
        cities.filter((c) => c.country === 'GB' && c.population >= Math.max(minCityPop, 0))
      );
    } else if (locationType === 'australia_cities') {
      result = mapCities(
        cities.filter((c) => c.country === 'AU' && c.population >= Math.max(minCityPop, 0))
      );
    } else if (locationType === 'australia_states') {
      result = australiaStatesData.map((s) => ({
        name: s.name,
        population: s.population,
        type: 'state' as const,
        code: s.code,
        country: s.country || 'AU',
      }));
    } else if (locationType === 'europe_cities') {
      const set = new Set(CONTINENT_COUNTRY_CODES.europe);
      const floor = Math.max(minCityPop, 0);
      result = mapCities(cities.filter((c) => set.has(c.country) && c.population >= floor));
    } else if (locationType === 'asia_cities') {
      const set = new Set(CONTINENT_COUNTRY_CODES.asia);
      const floor = Math.max(minCityPop, 0);
      result = mapCities(cities.filter((c) => set.has(c.country) && c.population >= floor));
    } else if (locationType === 'africa_cities') {
      const set = new Set(CONTINENT_COUNTRY_CODES.africa);
      const floor = Math.max(minCityPop, 0);
      result = mapCities(cities.filter((c) => set.has(c.country) && c.population >= floor));
    } else if (locationType === 'latam_cities') {
      const set = new Set(CONTINENT_COUNTRY_CODES.latam);
      const floor = Math.max(minCityPop, 0);
      result = mapCities(cities.filter((c) => set.has(c.country) && c.population >= floor));
    } else if (locationType === 'oceania_cities') {
      const set = new Set(CONTINENT_COUNTRY_CODES.oceania);
      const floor = Math.max(minCityPop, 0);
      result = mapCities(cities.filter((c) => set.has(c.country) && c.population >= floor));
    } else {
      const continentMap: Partial<Record<LocationType, string>> = {
        europe: 'Europe',
        asia: 'Asia',
        africa: 'Africa',
        north_america: 'North America',
        south_america: 'South America',
        oceania: 'Oceania',
      };
      const continent = continentMap[locationType];
      if (continent) {
        result = (
          countriesData as { name: string; code: string; population: number; continent: string }[]
        )
          .filter((c) => c.continent === continent)
          .map((c) => ({
            name: c.name,
            population: c.population,
            type: 'country' as const,
            code: c.code,
            continent: c.continent,
          }));
      }
    }

    return result.filter((l) => l.population >= minPopulation);
  }, [locationType, minPopulation, minCityPop, selectedCountryCode]);

  const customLocationList = useMemo((): Location[] => {
    const lines = customPlaces
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.map((name) => ({
      name,
      population: 0,
      type: 'city' as const,
    }));
  }, [customPlaces]);

  const locations = useMemo(() => {
    let list = baseLocations;
    const q = locationQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.code?.toLowerCase().includes(q) ||
          l.region?.toLowerCase().includes(q) ||
          l.country?.toLowerCase().includes(q)
      );
    }
    // Highest population first, then cap
    list = [...list].sort((a, b) => b.population - a.population);
    if (maxLocations > 0) list = list.slice(0, maxLocations);
    if (customLocationList.length) {
      // Custom places always included (and de-duplicated by name)
      const seen = new Set(list.map((l) => l.name.toLowerCase()));
      for (const c of customLocationList) {
        if (!seen.has(c.name.toLowerCase())) list.push(c);
      }
    }
    return list;
  }, [baseLocations, locationQuery, maxLocations, customLocationList]);

  const estimateCount = useMemo(() => {
    const posMult = position === 'both' ? 2 : 1;
    const sepMult = separator === 'both' ? 2 : 1;
    const codeMult = includeCodes ? 2 : 1; // name + optional code variants average upper bound
    return locations.length * selectedTlds.length * posMult * sepMult * (includeCodes ? codeMult : 1);
  }, [locations.length, selectedTlds.length, position, separator, includeCodes]);

  const livePreview = useMemo(() => {
    const kw = sanitizeDomainName(keyword) || 'plumber';
    const loc = sanitizeDomainName(locations[0]?.name || 'london') || 'london';
    const tld = selectedTlds[0] || 'com';
    const samples: string[] = [];
    const seps = separator === 'none' ? [''] : separator === 'hyphen' ? ['-'] : ['', '-'];
    for (const sep of seps) {
      if (position === 'start' || position === 'both') samples.push(`${kw}${sep}${loc}.${tld}`);
      if (position === 'end' || position === 'both') samples.push(`${loc}${sep}${kw}.${tld}`);
    }
    return Array.from(new Set(samples)).slice(0, 4);
  }, [keyword, locations, selectedTlds, position, separator]);

  const flash = useCallback((msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 2400);
  }, []);

  const checkDomainAvailability = useCallback(
    async (domainsToCheck: GeneratedDomain[], checkLimit: number) => {
      setIsChecking(true);
      const limit = Math.min(Math.max(20, checkLimit), HARD_MAX_CHECK);
      const toCheck = domainsToCheck.slice(0, limit);
      const checkSet = new Set(toCheck.map((d) => d.domain.toLowerCase()));

      // Only the budgeted set is "checking"; everything else is skipped (not a fake pending state)
      setGeneratedDomains((prev) =>
        prev.map((d) =>
          checkSet.has(d.domain.toLowerCase())
            ? { ...d, status: 'checking' as const }
            : { ...d, status: 'skipped' as const }
        )
      );
      setCheckProgress({ done: 0, total: toCheck.length });

      type CheckRow = {
        domain: string;
        available?: boolean;
        premium?: boolean;
        price?: string;
        buyUrl?: string;
      };

      const applyResults = (list: CheckRow[], batchDomains: string[]) => {
        const byDomain = new Map(
          list
            .filter((r) => r.domain)
            .map((r) => [r.domain.toLowerCase(), r] as const)
        );
        const batchSet = new Set(batchDomains.map((d) => d.toLowerCase()));
        setGeneratedDomains((prev) =>
          prev.map((d) => {
            const key = d.domain.toLowerCase();
            const result = byDomain.get(key);
            if (result && typeof result.available === 'boolean') {
              return {
                ...d,
                status: result.available ? ('available' as const) : ('taken' as const),
                premium: Boolean(result.premium),
                price: result.price,
                buyUrl: result.buyUrl,
              };
            }
            if (batchSet.has(key) && d.status === 'checking') {
              return { ...d, status: 'error' as const };
            }
            return d;
          })
        );
      };

      const runBatch = async (batch: GeneratedDomain[]) => {
        const domainNames = batch.map((d) => d.domain);
        try {
          const response = await fetch('/api/domains/instant-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains: domainNames }),
          });
          if (response.ok) {
            const results = await response.json();
            const list: CheckRow[] = Array.isArray(results)
              ? results
              : results?.results || results?.data || [];
            applyResults(list, domainNames);
          } else {
            applyResults([], domainNames);
          }
        } catch {
          applyResults([], domainNames);
        } finally {
          setCheckProgress((p) => ({
            ...p,
            done: Math.min(p.total, p.done + domainNames.length),
          }));
        }
      };

      // Parallel window of batch requests (much faster than pure sequential)
      const batches: GeneratedDomain[][] = [];
      for (let i = 0; i < toCheck.length; i += CHECK_BATCH) {
        batches.push(toCheck.slice(i, i + CHECK_BATCH));
      }
      for (let i = 0; i < batches.length; i += CHECK_CONCURRENCY) {
        const window = batches.slice(i, i + CHECK_CONCURRENCY);
        await Promise.all(window.map((b) => runBatch(b)));
      }

      // Optional premium pass — only on available names (not the full check list)
      if (checkPremiumDeep) {
        try {
          const freeSnapshot = await new Promise<string[]>((resolve) => {
            setGeneratedDomains((prev) => {
              resolve(
                prev
                  .filter((d) => d.status === 'available')
                  .map((d) => d.domain)
                  .slice(0, 40)
              );
              return prev;
            });
          });
          if (freeSnapshot.length > 0) {
            const response = await fetch('/api/domains/premium-check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domains: freeSnapshot }),
            });
            if (response.ok) {
              const payload = await response.json();
              const list: CheckRow[] = Array.isArray(payload)
                ? payload
                : payload?.results || payload?.data || [];
              if (list.length) {
                const byDomain = new Map(
                  list.map((r) => [r.domain?.toLowerCase(), r] as const)
                );
                setGeneratedDomains((prev) =>
                  prev.map((d) => {
                    const result = byDomain.get(d.domain.toLowerCase());
                    if (!result) return d;
                    return {
                      ...d,
                      status:
                        typeof result.available === 'boolean'
                          ? result.available
                            ? ('available' as const)
                            : ('taken' as const)
                          : d.status,
                      premium: Boolean(result.premium) || d.premium,
                      price: result.price || d.price,
                      buyUrl: result.buyUrl || d.buyUrl,
                    };
                  })
                );
              }
            }
          }
        } catch {
          /* optional */
        }
      }

      // Finish any leftover in-flight rows
      setGeneratedDomains((prev) =>
        prev.map((d) =>
          d.status === 'checking' || d.status === 'pending'
            ? { ...d, status: 'error' as const }
            : d
        )
      );
      setIsChecking(false);
      setCheckProgress({ done: 0, total: 0 });
      setStatusFilter((prev) => (prev === 'checking' ? 'all' : prev));
    },
    [checkPremiumDeep]
  );

  const generateDomains = useCallback(async () => {
    if (!keyword.trim() || selectedTlds.length === 0 || locations.length === 0) return;

    setIsGenerating(true);
    setResultsPage(0);
    setStatusFilter('all');
    const sanitizedKeyword = sanitizeDomainName(keyword);
    if (!sanitizedKeyword) {
      setIsGenerating(false);
      flash('Enter a valid keyword (letters/numbers)');
      return;
    }

    const domains: GeneratedDomain[] = [];
    const seen = new Set<string>();
    const seps = separator === 'none' ? [''] : separator === 'hyphen' ? ['-'] : ['', '-'];

    const pushVariant = (
      name: string,
      pattern: string,
      location: Location,
      label: string
    ) => {
      if (seen.has(name)) return;
      const labelLen = name.length;
      if (labelLen < minLength || labelLen > maxLength) return;
      seen.add(name);
      domains.push({
        domain: name,
        location: label,
        population: location.population,
        length: labelLen,
        type: location.type,
        status: 'pending',
        pattern,
        countryCode: locationIsoCode(location),
        premium: false,
      });
    };

    for (const location of locations) {
      const placeTokens = [sanitizeDomainName(location.name)];
      if (includeCodes && location.code) {
        const code = sanitizeDomainName(location.code);
        if (code && code !== placeTokens[0]) placeTokens.push(code);
      }

      for (const place of placeTokens) {
        if (!place) continue;
        const placeLabel =
          place === sanitizeDomainName(location.name)
            ? location.name
            : `${location.name} (${location.code})`;

        for (const tld of selectedTlds) {
          for (const sep of seps) {
            if (position === 'start' || position === 'both') {
              pushVariant(
                `${sanitizedKeyword}${sep}${place}.${tld}`,
                sep ? 'keyword-place' : 'keywordplace',
                location,
                placeLabel
              );
            }
            if (position === 'end' || position === 'both') {
              pushVariant(
                `${place}${sep}${sanitizedKeyword}.${tld}`,
                sep ? 'place-keyword' : 'placekeyword',
                location,
                placeLabel
              );
            }
          }
        }
      }
    }

    // Prefer high population first for checking; mark check budget vs skipped
    domains.sort((a, b) => b.population - a.population);
    const limit = Math.min(Math.max(20, maxCheck), HARD_MAX_CHECK);
    domains.forEach((d, i) => {
      d.status = i < limit ? 'checking' : 'skipped';
    });

    setGeneratedDomains(domains);
    setIsGenerating(false);
    flash(
      `Generated ${domains.length.toLocaleString()} · live-checking top ${Math.min(limit, domains.length)}`
    );
    // Bring results into view on generate
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    void checkDomainAvailability(domains, maxCheck);
  }, [
    keyword,
    locations,
    selectedTlds,
    position,
    separator,
    includeCodes,
    minLength,
    maxLength,
    maxCheck,
    checkDomainAvailability,
    flash,
  ]);

  const sortedDomains = useMemo(() => {
    let filtered = [...generatedDomains];

    if (statusFilter === 'available') {
      // Free-to-register (not premium aftermarket pricing)
      filtered = filtered.filter((d) => d.status === 'available' && !d.premium);
    } else if (statusFilter === 'premium') {
      filtered = filtered.filter((d) => Boolean(d.premium));
    } else if (statusFilter === 'taken') {
      filtered = filtered.filter((d) => d.status === 'taken');
    } else if (statusFilter === 'checking') {
      // Only in-flight checks — never pending/skipped leftovers
      filtered = filtered.filter((d) => d.status === 'checking');
    } else {
      // All = resolved inventory (hide skipped noise unless still checking)
      if (!isChecking) {
        filtered = filtered.filter((d) => d.status !== 'skipped' && d.status !== 'pending');
      }
    }

    const rq = resultQuery.trim().toLowerCase();
    if (rq) {
      filtered = filtered.filter(
        (d) =>
          d.domain.includes(rq) ||
          d.location.toLowerCase().includes(rq) ||
          d.pattern.includes(rq)
      );
    }

    filtered = filtered.filter((d) => d.length >= minLength && d.length <= maxLength);

    return filtered.sort((a, b) => {
      const order: Record<GeneratedDomain['status'], number> = {
        available: 0,
        checking: 1,
        pending: 2,
        taken: 3,
        error: 4,
        skipped: 5,
      };
      if (sortBy === 'status') {
        const sa = a.premium ? -0.5 : order[a.status];
        const sb = b.premium ? -0.5 : order[b.status];
        if (sa !== sb) return sortOrder === 'asc' ? sa - sb : sb - sa;
      } else {
        const statusDiff = order[a.status] - order[b.status];
        if (statusDiff !== 0) return statusDiff;
      }

      let comparison = 0;
      if (sortBy === 'domain') comparison = a.domain.localeCompare(b.domain);
      else if (sortBy === 'population') comparison = a.population - b.population;
      else if (sortBy === 'length') comparison = a.length - b.length;
      else comparison = a.domain.localeCompare(b.domain);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    generatedDomains,
    sortBy,
    sortOrder,
    statusFilter,
    resultQuery,
    minLength,
    maxLength,
    isChecking,
  ]);

  const resultsPageCount = Math.max(1, Math.ceil(sortedDomains.length / PAGE_SIZE));
  const safeResultsPage = Math.min(resultsPage, resultsPageCount - 1);
  const visibleDomains = sortedDomains.slice(
    safeResultsPage * PAGE_SIZE,
    safeResultsPage * PAGE_SIZE + PAGE_SIZE
  );

  const stats = useMemo(
    () => ({
      total: generatedDomains.length,
      available: generatedDomains.filter((d) => d.status === 'available' && !d.premium).length,
      premium: generatedDomains.filter((d) => Boolean(d.premium)).length,
      taken: generatedDomains.filter((d) => d.status === 'taken').length,
      checking: generatedDomains.filter((d) => d.status === 'checking').length,
      skipped: generatedDomains.filter((d) => d.status === 'skipped').length,
      error: generatedDomains.filter((d) => d.status === 'error').length,
      resolved: generatedDomains.filter((d) =>
        ['available', 'taken', 'error'].includes(d.status) || d.premium
      ).length,
    }),
    [generatedDomains]
  );

  const toggleTld = (tld: string) => {
    const clean = tld.toLowerCase().replace(/^\./, '').replace(/[^a-z0-9-]/g, '');
    if (!clean) return;
    setSelectedTlds((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean]
    );
  };

  const addCustomTlds = () => {
    const parts = customTldInput
      .split(/[\s,;]+/)
      .map((t) => t.toLowerCase().replace(/^\./, '').replace(/[^a-z0-9-]/g, ''))
      .filter(Boolean);
    if (!parts.length) return;
    setSelectedTlds((prev) => Array.from(new Set([...prev, ...parts])));
    setCustomTldInput('');
    flash(`Added extension${parts.length > 1 ? 's' : ''}: ${parts.map((p) => `.${p}`).join(' ')}`);
  };

  const exportCsv = () => {
    if (!generatedDomains.length) return;
    const rows = [
      ['domain', 'status', 'premium', 'price', 'location', 'type', 'population', 'length', 'pattern'],
      ...sortedDomains.map((d) => [
        d.domain,
        d.status,
        d.premium ? 'yes' : 'no',
        d.price || '',
        d.location,
        d.type,
        String(d.population),
        String(d.length),
        d.pattern,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geo-domains-${sanitizeDomainName(keyword) || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash('CSV downloaded');
  };

  const copyAvailable = async () => {
    const list = sortedDomains
      .filter((d) => d.status === 'available' && !d.premium)
      .map((d) => d.domain);
    if (!list.length) {
      flash('No free available domains yet — try Premium filter or wait for checks');
      return;
    }
    await navigator.clipboard.writeText(list.join('\n'));
    flash(`Copied ${list.length} free domains`);
  };

  const registerUrl = (domain: string) => getRegistrarUrl(domain, selectedRegistrar);
  const whoisUrl = (domain: string) => `/tools/whois?domain=${encodeURIComponent(domain)}`;

  const locationGroups = useMemo(() => {
    const groups = new Map<string, typeof LOCATION_OPTIONS>();
    for (const opt of LOCATION_OPTIONS) {
      const arr = groups.get(opt.group) || [];
      arr.push(opt);
      groups.set(opt.group, arr);
    }
    return Array.from(groups.entries());
  }, []);

  const activeLocationLabel = useMemo(() => {
    if (locationType === 'country_cities' && selectedCountryMeta) {
      return `Country: ${selectedCountryMeta.name} (${selectedCountryMeta.code})`;
    }
    return LOCATION_OPTIONS.find((o) => o.value === locationType)?.label || 'Locations';
  }, [locationType, selectedCountryMeta]);

  const locationTabs = useMemo(() => locationGroups.map(([g]) => g), [locationGroups]);
  const locationsInTab = useMemo(() => {
    return LOCATION_OPTIONS.filter((o) => o.group === locationGroupTab);
  }, [locationGroupTab]);

  const selectLocationPreset = (value: LocationType) => {
    setLocationType(value);
    setLocationQuery('');
    if (value === 'country_cities' && !selectedCountryCode) {
      setSelectedCountryCode('US');
    }
  };

  const selectCountry = (code: string) => {
    if (code !== selectedCountryCode) setSelectedCountryCode(code);
    if (locationType !== 'country_cities') setLocationType('country_cities');
    if (locationGroupTab !== 'By country') setLocationGroupTab('By country');
    // Stay on the current page when the country is already visible — avoids list flicker
    const idx = filteredCountryPicker.findIndex((c) => c.code === code);
    if (idx >= 0) {
      const nextPage = Math.floor(idx / COUNTRY_PAGE_SIZE);
      setCountryPage((p) => (p === nextPage ? p : nextPage));
    }
  };

  const inputCls = isLight
    ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10'
    : 'border-white/10 bg-black/35 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-2 focus:ring-white/10';

  const canGenerate =
    Boolean(keyword.trim()) && selectedTlds.length > 0 && locations.length > 0 && !isGenerating && !isChecking;

  const catalogMega = useMemo(
    () => (citiesData as { population: number }[]).filter((c) => c.population >= 1_000_000).length,
    []
  );
  const catalogTotal = (citiesData as unknown[]).length;

  const stepLabel = (n: number, title: string, hint?: string, done?: boolean) => (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition ${
            done
              ? isLight
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 text-black'
              : isLight
                ? 'bg-slate-900 text-white'
                : 'bg-white text-black'
          }`}
        >
          {done ? '✓' : n}
        </span>
        <div className="min-w-0">
          <div className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {title}
          </div>
          {hint && (
            <div className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>{hint}</div>
          )}
        </div>
      </div>
    </div>
  );

  const rise = (delay = 0) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: easeOut },
        };

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 lg:pb-0">
      {/* Premium metrics bar */}
      <motion.div
        {...rise(0)}
        className={`relative overflow-hidden rounded-2xl border px-4 py-4 sm:px-5 ${shell(isLight)}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 opacity-60 ${
            isLight
              ? 'bg-[radial-gradient(ellipse_at_top_right,rgba(226,232,240,0.9),transparent_55%)]'
              : 'bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_55%)]'
          }`}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {[
              ['Catalog', `${catalogMega.toLocaleString()} cities 1M+ · ${catalogTotal.toLocaleString()}`],
              ['Scope', `${locations.length.toLocaleString()} places`],
              ['Output', `~${estimateCount.toLocaleString()} names`],
              ['Check', `top ${maxCheck}`],
            ].map(([k, v]) => (
              <div key={k}>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                    isLight ? 'text-slate-400' : 'text-white/35'
                  }`}
                >
                  {k}
                </span>
                <div className={`font-semibold tabular-nums tracking-tight ${isLight ? 'text-slate-900' : 'text-white/90'}`}>
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {locationType === 'country_cities' && selectedCountryMeta && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700'
                    : 'border-white/10 bg-white/[0.05] text-white/75'
                }`}
              >
                <CountryFlag code={selectedCountryMeta.code} size={14} title={selectedCountryMeta.name} />
                {selectedCountryMeta.name}
              </span>
            )}
            {isChecking ? (
              <span className={`text-xs font-bold tabular-nums ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                Checking {checkProgress.done}/{checkProgress.total || maxCheck}…
              </span>
            ) : feedback ? (
              <span className={`text-xs font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                {feedback}
              </span>
            ) : canGenerate ? (
              <span className={`text-xs font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                Ready to generate
              </span>
            ) : (
              <span className={`text-xs font-medium ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                {!keyword.trim()
                  ? 'Enter a keyword'
                  : locations.length === 0
                    ? 'Pick locations'
                    : selectedTlds.length === 0
                      ? 'Select a TLD'
                      : 'Configure build'}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Main builder */}
        <motion.div
          {...rise(0.06)}
          className={`rounded-2xl border overflow-hidden ${shell(isLight)}`}
        >
          {/* Step 1 */}
          <section className={`border-b p-4 sm:p-5 ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
            {stepLabel(1, 'Keyword', 'Local niche or brand term', Boolean(keyword.trim()))}
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canGenerate && void generateDomains()}
                placeholder="plumber, lawyer, pizza, homes…"
                className={`w-full rounded-xl border px-4 py-3.5 pr-11 text-base outline-none transition ${inputCls}`}
                autoComplete="off"
                spellCheck={false}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300' : 'text-white/25'}`}>
                <Icons.Search />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {NICHE_CHIPS.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => setKeyword(niche)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${chipCls(
                    keyword === niche,
                    isLight
                  )}`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2 */}
          <section className={`border-b p-4 sm:p-5 ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
            {stepLabel(
              2,
              'Locations',
              `${locations.length.toLocaleString()} places in scope`,
              locations.length > 0
            )}

            {/* Mode tabs */}
            <div className="mb-3 flex flex-wrap gap-1">
              {locationTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setLocationGroupTab(tab);
                    const first = LOCATION_OPTIONS.find((o) => o.group === tab);
                    if (first) selectLocationPreset(first.value);
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    locationGroupTab === tab
                      ? isLight
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-black'
                      : isLight
                        ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        : 'text-white/45 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Preset chips for current tab */}
            <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {locationsInTab.map((option) => {
                const active = locationType === option.value;
                const presetFlag =
                  option.value.startsWith('us_')
                    ? 'US'
                    : option.value.startsWith('canada_')
                      ? 'CA'
                      : option.value.startsWith('uk_')
                        ? 'GB'
                        : option.value.startsWith('australia_')
                          ? 'AU'
                          : null;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectLocationPreset(option.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${chipCls(
                      active,
                      isLight
                    )}`}
                  >
                    {presetFlag ? (
                      <CountryFlag code={presetFlag} size={18} />
                    ) : (
                      <span className="text-sm leading-none opacity-90">{option.icon}</span>
                    )}
                    <span className="min-w-0 truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Country picker — flags + population in millions */}
            {(locationType === 'country_cities' || locationGroupTab === 'By country') && (
              <div
                className={`mb-3 overflow-hidden rounded-2xl border ${
                  isLight
                    ? 'border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-50/80'
                    : 'border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-black/20 to-black/40'
                }`}
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 border-b px-3.5 py-3 ${
                    isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                        isLight ? 'text-slate-500' : 'text-white/40'
                      }`}
                    >
                      Select a country
                    </div>
                    <p className={`mt-0.5 text-[11px] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                      {locationType === 'country_cities' && selectedCountryMeta
                        ? `${selectedCountryMeta.name} · ${selectedCountryCityStats.matching.toLocaleString()} cities in scope${
                            selectedCountryMeta.population > 0
                              ? ` · ${formatPopulation(selectedCountryMeta.population)} people`
                              : ''
                          }`
                        : 'Tap a country below · populations in millions · official flags'}
                    </p>
                  </div>
                </div>

                <div className="p-3">
                  <input
                    type="search"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setCountryPage(0);
                    }}
                    placeholder="Search countries… India, China, Germany, Brazil"
                    className={`mb-3 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputCls}`}
                  />

                  <div
                    className={`rounded-xl border ${
                      isLight ? 'border-slate-200 bg-white' : 'border-white/[0.08] bg-black/25'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {pagedCountries.map((c) => {
                        const active =
                          locationType === 'country_cities' && selectedCountryCode === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => selectCountry(c.code)}
                            aria-pressed={active}
                            className={`flex items-center gap-2.5 border-b px-3 py-2.5 text-left text-xs transition last:border-b-0 sm:odd:border-r ${
                              isLight ? 'border-slate-100' : 'border-white/[0.05]'
                            } ${
                              active
                                ? isLight
                                  ? 'bg-slate-900/95 text-white'
                                  : 'bg-white/[0.12] text-white ring-1 ring-inset ring-white/25'
                                : isLight
                                  ? 'bg-white text-slate-700 hover:bg-slate-50'
                                  : 'bg-transparent text-white/75 hover:bg-white/[0.04]'
                            }`}
                          >
                            <CountryFlag code={c.code} size={22} title={c.name} />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5 truncate font-semibold tracking-tight">
                                {c.name}
                                {active && (
                                  <span
                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                      isLight
                                        ? 'bg-emerald-400/25 text-emerald-200'
                                        : 'bg-emerald-400/20 text-emerald-200'
                                    }`}
                                  >
                                    Selected
                                  </span>
                                )}
                              </span>
                              <span
                                className={`block tabular-nums text-[10px] ${
                                  active ? 'opacity-70' : isLight ? 'text-slate-400' : 'text-white/35'
                                }`}
                              >
                                {c.population > 0
                                  ? `${formatPopulation(c.population)} people`
                                  : c.megaCount > 0
                                    ? `${c.megaCount}×1M+`
                                    : `${c.cityCount} cities`}
                                {c.cityCount > 0 ? ` · ${c.cityCount} cities` : ''}
                              </span>
                            </span>
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                active
                                  ? isLight
                                    ? 'bg-white/15 text-white/80'
                                    : 'bg-white/10 text-white/70'
                                  : isLight
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-white/5 text-white/40'
                              }`}
                            >
                              {c.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Country list pagination */}
                    {filteredCountryPicker.length > COUNTRY_PAGE_SIZE && (
                      <div
                        className={`flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5 ${
                          isLight ? 'border-slate-100 bg-slate-50/80' : 'border-white/[0.06] bg-black/20'
                        }`}
                      >
                        <span className={`text-[11px] tabular-nums ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                          {filteredCountryPicker.length} countries · page{' '}
                          {Math.min(countryPage, countryPageCount - 1) + 1}/{countryPageCount}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={countryPage <= 0}
                            onClick={() => setCountryPage((p) => Math.max(0, p - 1))}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-30 ${
                              isLight
                                ? 'bg-white text-slate-700 ring-1 ring-slate-200'
                                : 'bg-white/10 text-white/80'
                            }`}
                          >
                            Prev
                          </button>
                          {Array.from({ length: countryPageCount }, (_, i) => i)
                            .filter((i) => {
                              const cur = Math.min(countryPage, countryPageCount - 1);
                              return i === 0 || i === countryPageCount - 1 || Math.abs(i - cur) <= 1;
                            })
                            .map((i, idx, arr) => {
                              const prev = arr[idx - 1];
                              const showEllipsis = prev !== undefined && i - prev > 1;
                              const cur = Math.min(countryPage, countryPageCount - 1);
                              return (
                                <span key={i} className="inline-flex items-center gap-1">
                                  {showEllipsis && (
                                    <span className={isLight ? 'text-slate-300' : 'text-white/25'}>…</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setCountryPage(i)}
                                    className={`min-w-[28px] rounded-lg px-1.5 py-1 text-[11px] font-bold tabular-nums ${
                                      i === cur
                                        ? isLight
                                          ? 'bg-slate-900 text-white'
                                          : 'bg-white text-slate-900'
                                        : isLight
                                          ? 'text-slate-500 hover:bg-white'
                                          : 'text-white/45 hover:bg-white/10'
                                    }`}
                                  >
                                    {i + 1}
                                  </button>
                                </span>
                              );
                            })}
                          <button
                            type="button"
                            disabled={countryPage >= countryPageCount - 1}
                            onClick={() => setCountryPage((p) => Math.min(countryPageCount - 1, p + 1))}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-30 ${
                              isLight
                                ? 'bg-white text-slate-700 ring-1 ring-slate-200'
                                : 'bg-white/10 text-white/80'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* City population floor for city modes */}
            {(locationType === 'country_cities' ||
              locationType === 'all_cities' ||
              locationType === 'mega_cities' ||
              locationType.endsWith('_cities')) && (
              <div className="mb-3">
                <div className="mb-1 flex flex-wrap items-end justify-between gap-2 text-[11px]">
                  <span className={isLight ? 'text-slate-500' : 'text-white/45'}>
                    Min city population (city proper · WPR 2026)
                  </span>
                  <span className={`font-bold tabular-nums ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                    {minCityPop === 0 ? 'Any size' : `${formatPopulation(minCityPop)}+`}
                    <span className={`ml-2 font-semibold ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                      · {locations.length.toLocaleString()} match
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5_000_000}
                  step={100_000}
                  value={Math.min(minCityPop, 5_000_000)}
                  onChange={(e) => setMinCityPop(Number(e.target.value))}
                  className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
                    isLight ? 'bg-slate-100 accent-slate-900' : 'bg-white/10 accent-slate-200'
                  }`}
                />
                <div className={`mt-1.5 flex flex-wrap gap-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  {[
                    [0, 'Any'],
                    [250_000, '250K'],
                    [500_000, '500K'],
                    [1_000_000, '1M'],
                    [2_000_000, '2M'],
                    [5_000_000, '5M+'],
                  ].map(([val, label]) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setMinCityPop(Number(val))}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                        minCityPop === val
                          ? isLight
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-900'
                          : isLight
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-white/[0.06] text-white/50 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {locations.length === 0 && (
                  <p className={`mt-2 text-[11px] font-medium ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                    No cities match this filter — lower the minimum (e.g. Any or 500K). City-proper counts are
                    smaller than metro areas; US only has ~1 city above 5M.
                  </p>
                )}
                <p className={`mt-1.5 text-[10px] leading-relaxed ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                  City-proper figures (not metro). Tokyo ≈ 10.3M · Shanghai ≈ 24.7M · New York ≈ 8.5M.
                </p>
              </div>
            )}

            <input
              type="search"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Filter place names in current scope…"
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${inputCls}`}
            />
            <p className={`mt-2 text-[11px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
              <span className="font-semibold">{activeLocationLabel}</span>
              {' · '}
              {locations.length.toLocaleString()} places
              {locationQuery ? ' (name filter on)' : ''}
              {customLocationList.length ? ` · +${customLocationList.length} custom` : ''}
            </p>
          </section>

          {/* Step 3 */}
          <section className={`border-b p-4 sm:p-5 ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
            {stepLabel(
              3,
              'Pattern & extensions',
              `${selectedTlds.length} TLD${selectedTlds.length === 1 ? '' : 's'} · ${position} · ${separator}`,
              selectedTlds.length > 0
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  Order
                </div>
                <div className="flex flex-col gap-1">
                  {(
                    [
                      ['end', 'Location first', 'londonplumber.com'],
                      ['start', 'Keyword first', 'plumberlondon.com'],
                      ['both', 'Both orders', '2× patterns'],
                    ] as const
                  ).map(([val, label, ex]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPosition(val)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${chipCls(
                        position === val,
                        isLight
                      )}`}
                    >
                      <span className="text-xs font-bold">{label}</span>
                      <span className={`font-mono text-[10px] opacity-60`}>{ex}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  Separator
                </div>
                <div className="flex flex-col gap-1">
                  {(
                    [
                      ['none', 'Solid', 'londonplumber'],
                      ['hyphen', 'Hyphen', 'london-plumber'],
                      ['both', 'Both styles', '2× variants'],
                    ] as const
                  ).map(([val, label, ex]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSeparator(val)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${chipCls(
                        separator === val,
                        isLight
                      )}`}
                    >
                      <span className="text-xs font-bold">{label}</span>
                      <span className="font-mono text-[10px] opacity-60">{ex}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <div className={`text-[10px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                  Extensions (TLDs) · {selectedTlds.length} selected
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <button type="button" className={isLight ? 'text-slate-500' : 'text-white/40'} onClick={() => setSelectedTlds(TLD_OPTIONS.filter((t) => t.popular).map((t) => t.value))}>
                    Popular
                  </button>
                  <button type="button" className={isLight ? 'text-slate-500' : 'text-white/40'} onClick={() => setSelectedTlds(TLD_OPTIONS.filter((t) => t.geo).map((t) => t.value))}>
                    Geo
                  </button>
                  <button type="button" className={isLight ? 'text-slate-500' : 'text-white/40'} onClick={() => setSelectedTlds(['com'])}>
                    Reset
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TLD_OPTIONS.map((tld) => {
                  const active = selectedTlds.includes(tld.value);
                  return (
                    <button
                      key={tld.value}
                      type="button"
                      onClick={() => toggleTld(tld.value)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${chipCls(
                        active,
                        isLight
                      )}`}
                    >
                      {tld.label}
                    </button>
                  );
                })}
                {/* Custom selected TLDs not in preset list */}
                {selectedTlds
                  .filter((t) => !TLD_OPTIONS.some((o) => o.value === t))
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTld(t)}
                      title="Click to remove"
                      className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${
                        isLight
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-white bg-white text-black'
                      }`}
                    >
                      .{t} ×
                    </button>
                  ))}
              </div>
              <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={customTldInput}
                  onChange={(e) => setCustomTldInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTlds();
                    }
                  }}
                  placeholder="Add your own extensions… e.g. shop, store, co.uk, health"
                  className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none ${inputCls}`}
                  aria-label="Enter custom domain extensions"
                />
                <button
                  type="button"
                  onClick={addCustomTlds}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold ${
                    isLight
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-white bg-white text-black'
                  }`}
                >
                  Add extensions
                </button>
              </div>
              <p className={`mt-1.5 text-[10px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                Enter one or more extensions (with or without the dot). Multi-level allowed (e.g. co.uk).
              </p>
            </div>
          </section>

          {/* Step 4 — compact advanced */}
          <section className="p-4 sm:p-5">
            {stepLabel(4, 'Refine & generate', 'Preview · limits · custom places')}
            <div className="mb-3">
              <div className="mb-1 flex justify-between text-[11px]">
                <span className={isLight ? 'text-slate-500' : 'text-white/45'}>Min population</span>
                <span className={`font-bold tabular-nums ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                  {minPopulation === 0 ? 'Any' : `${formatPopulation(minPopulation)}+`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10_000_000}
                step={50_000}
                value={minPopulation}
                onChange={(e) => setMinPopulation(Number(e.target.value))}
                className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
                  isLight ? 'bg-slate-100 accent-slate-900' : 'bg-white/10 accent-slate-200'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`mb-3 text-[11px] font-bold underline-offset-2 hover:underline ${
                isLight ? 'text-slate-600' : 'text-white/50'
              }`}
            >
              {showAdvanced ? 'Hide' : 'Show'} advanced options
            </button>

            {showAdvanced && (
              <div
                className={`mb-3 space-y-3 rounded-xl border p-3 ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-black/25'
                }`}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ['Max places', maxLocations, setMaxLocations, 0, 500],
                      ['Check limit', maxCheck, setMaxCheck, 20, HARD_MAX_CHECK],
                      ['Min length', minLength, setMinLength, 1, 63],
                      ['Max length', maxLength, setMaxLength, 1, 63],
                    ] as const
                  ).map(([label, val, set, lo, hi]) => (
                    <label key={label} className="text-[10px]">
                      <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-white/45'}`}>{label}</span>
                      <input
                        type="number"
                        min={lo}
                        max={hi}
                        value={val}
                        onChange={(e) => {
                          const n = Number(e.target.value) || lo;
                          if (set === setMaxCheck) setMaxCheck(Math.min(hi, Math.max(lo, n)));
                          else if (set === setMaxLocations) setMaxLocations(Math.max(0, n));
                          else if (set === setMinLength) setMinLength(Math.min(63, Math.max(1, n)));
                          else setMaxLength(Math.min(63, Math.max(1, n)));
                        }}
                        className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-sm ${inputCls}`}
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className={`inline-flex items-center gap-2 text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-white/65'}`}>
                    <input type="checkbox" checked={includeCodes} onChange={(e) => setIncludeCodes(e.target.checked)} />
                    State / country codes
                  </label>
                  <label className={`inline-flex items-center gap-2 text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-white/65'}`}>
                    <input type="checkbox" checked={checkPremiumDeep} onChange={(e) => setCheckPremiumDeep(e.target.checked)} />
                    Premium deep scan (slower)
                  </label>
                </div>
                <textarea
                  value={customPlaces}
                  onChange={(e) => setCustomPlaces(e.target.value)}
                  rows={2}
                  placeholder="Custom places (optional) — Austin, Brooklyn, …"
                  className={`w-full rounded-lg border px-2.5 py-2 text-sm outline-none ${inputCls}`}
                />
              </div>
            )}

            <div
              className={`mb-4 rounded-xl border px-3 py-2.5 ${
                isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/[0.08] bg-black/25'
              }`}
            >
              <div
                className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  isLight ? 'text-slate-400' : 'text-white/35'
                }`}
              >
                Live preview
              </div>
              <div className="flex flex-wrap gap-1.5">
                {livePreview.map((s) => (
                  <span
                    key={s}
                    className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                      isLight
                        ? 'border-slate-200 bg-white text-slate-700'
                        : 'border-white/10 bg-white/[0.04] text-white/70'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={() => void generateDomains()}
              disabled={!canGenerate}
              size="lg"
              className="hidden w-full min-h-[48px] sm:inline-flex"
            >
              {isGenerating || isChecking ? (
                isChecking ? (
                  `Checking ${checkProgress.done}/${checkProgress.total || maxCheck}…`
                ) : (
                  'Generating…'
                )
              ) : (
                <>
                  <Icons.Magic />
                  <span className="ml-2">Generate &amp; check ~{estimateCount.toLocaleString()}</span>
                </>
              )}
            </Button>
            {locations.length === 0 && (
              <p className={`mt-2 text-xs ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>
                No places in scope — adjust population or filters.
              </p>
            )}
          </section>
        </motion.div>

        {/* Side summary — desktop */}
        <motion.aside
          {...rise(0.1)}
          className="hidden lg:block sticky top-24 space-y-3"
        >
          <div className={`rounded-2xl border p-4 ${shell(isLight)}`}>
            <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
              Build summary
            </div>

            <ul className="mt-3 space-y-2">
              {(
                [
                  ['Keyword', Boolean(keyword.trim())],
                  ['Locations', locations.length > 0],
                  ['Extensions', selectedTlds.length > 0],
                ] as const
              ).map(([label, ok]) => (
                <li key={label} className="flex items-center gap-2 text-[12px] font-semibold">
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                      ok
                        ? isLight
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-emerald-500/20 text-emerald-300'
                        : isLight
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {ok ? '✓' : '·'}
                  </span>
                  <span className={isLight ? 'text-slate-700' : 'text-white/70'}>{label}</span>
                </li>
              ))}
            </ul>

            <dl
              className={`mt-4 space-y-2.5 border-t pt-3 text-sm ${
                isLight ? 'border-slate-100' : 'border-white/[0.06]'
              }`}
            >
              {[
                ['Scope', activeLocationLabel],
                ['Places', locations.length.toLocaleString()],
                ['TLDs', selectedTlds.map((t) => `.${t}`).join(' ') || '—'],
                ['Pattern', `${position} · ${separator}`],
                ['Live check', `top ${maxCheck}`],
                ['Est. names', `~${estimateCount.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className={isLight ? 'text-slate-400' : 'text-white/35'}>{k}</dt>
                  <dd
                    className={`max-w-[180px] truncate text-right font-semibold ${
                      isLight ? 'text-slate-800' : 'text-white/85'
                    }`}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 flex flex-wrap gap-1">
              {livePreview.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className={`truncate rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-white/40'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>

            <Button
              onClick={() => void generateDomains()}
              disabled={!canGenerate}
              className="mt-4 w-full"
            >
              {isChecking
                ? `Checking ${checkProgress.done}/${checkProgress.total || maxCheck}`
                : isGenerating
                  ? 'Generating…'
                  : 'Run generator'}
            </Button>
          </div>
          <div
            className={`rounded-2xl border p-4 text-[11px] leading-relaxed ${shell(isLight)} ${
              isLight ? 'text-slate-500' : 'text-white/40'
            }`}
          >
            <p className={`font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
              After live check
            </p>
            Available (free to register), premium aftermarket, and already registered names.
            Export CSV or copy free domains when ready.
          </div>
        </motion.aside>
      </div>

      {/* Mobile sticky generate */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t p-3 lg:hidden ${
          isLight
            ? 'border-slate-200/90 bg-white/95 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.2)] backdrop-blur-md'
            : 'border-white/10 bg-black/80 shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md'
        }`}
      >
        <Button
          onClick={() => void generateDomains()}
          disabled={!canGenerate}
          size="lg"
          className="w-full min-h-[48px]"
        >
          {isChecking
            ? `Checking ${checkProgress.done}/${checkProgress.total || maxCheck}…`
            : isGenerating
              ? 'Generating…'
              : `Generate ~${estimateCount.toLocaleString()}`}
        </Button>
      </div>

      {/* Empty state before first run */}
      {generatedDomains.length === 0 && !isGenerating && (
        <motion.div
          {...rise(0.12)}
          className={`rounded-2xl border px-5 py-10 text-center ${shell(isLight)}`}
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -4, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }
            }
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
              isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/40'
            }`}
          >
            <Icons.Magic />
          </motion.div>
          <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Your inventory appears here
          </h3>
          <p className={`mx-auto mt-1.5 max-w-md text-sm ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            Pick a keyword and market, then generate. We live-check the top {maxCheck} names for
            available, premium, and registered status. Populations are city-proper (not metro).
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {livePreview.map((s, i) => (
              <motion.span
                key={s}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.15 + i * 0.05, duration: 0.35 }}
                className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                  isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-white/50'
                }`}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      {generatedDomains.length > 0 && (
        <motion.div
          ref={resultsRef}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="scroll-mt-28 space-y-3"
        >
          <div className={`rounded-2xl border p-4 ${shell(isLight)}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Inventory results
                  </h3>
                  {isChecking && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isLight ? 'bg-sky-50 text-sky-700' : 'bg-sky-500/15 text-sky-300'
                      }`}
                    >
                      Live
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                  {stats.total.toLocaleString()} generated
                  {isChecking && checkProgress.total > 0
                    ? ` · checking ${Math.min(checkProgress.done, checkProgress.total)}/${checkProgress.total}`
                    : isChecking
                      ? ' · checking…'
                      : ` · ${stats.resolved.toLocaleString()} resolved`}
                  {stats.skipped > 0 ? ` · ${stats.skipped} beyond check limit` : ''}
                </p>
                {isChecking && checkProgress.total > 0 && (
                  <div
                    className={`mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full ${
                      isLight ? 'bg-slate-100' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (checkProgress.done / checkProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold sm:text-sm">
                {stats.available > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {stats.available} available
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  {stats.premium} premium
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {stats.taken} registered
                </span>
                {isChecking && stats.checking > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    {stats.checking} in progress
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ['all', 'All', true],
                    ['available', `Available${stats.available ? ` · ${stats.available}` : ''}`, stats.available > 0 || isChecking],
                    ['premium', `Premium · ${stats.premium}`, true],
                    ['taken', `Registered · ${stats.taken}`, true],
                    ['checking', `In progress · ${stats.checking}`, isChecking && stats.checking > 0],
                  ] as const
                )
                  .filter(([, , show]) => show)
                  .map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(key);
                      setResultsPage(0);
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                      statusFilter === key
                        ? isLight
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-black'
                        : isLight
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-white/[0.05] text-white/50 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => void copyAvailable()}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
                    isLight ? 'border-slate-200 text-slate-700' : 'border-white/10 text-white/70'
                  }`}
                >
                  Copy free
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
                    isLight ? 'border-slate-200 text-slate-700' : 'border-white/10 text-white/70'
                  }`}
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="search"
                value={resultQuery}
                onChange={(e) => {
                  setResultQuery(e.target.value);
                  setResultsPage(0);
                }}
                placeholder="Filter results…"
                className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none ${inputCls}`}
              />
              <div className="flex flex-wrap items-center gap-1">
                <span className={`px-1 text-[10px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Sort</span>
                {(['population', 'domain', 'length', 'status'] as const).map((sort) => (
                  <button
                    key={sort}
                    type="button"
                    onClick={() => {
                      if (sortBy === sort) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                      else {
                        setSortBy(sort);
                        setSortOrder('desc');
                      }
                      setResultsPage(0);
                    }}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold capitalize ${
                      sortBy === sort
                        ? isLight
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-white/10 text-white'
                        : isLight
                          ? 'text-slate-400'
                          : 'text-white/35'
                    }`}
                  >
                    {sort}
                    {sortBy === sort ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${shell(isLight)}`}>
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-100 bg-slate-50/80' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  {['Domain', 'Status', 'Location', 'Pop.', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        isLight ? 'text-slate-400' : 'text-white/35'
                      } ${i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-center'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/[0.05]'}`}>
                {visibleDomains.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`py-12 text-center text-sm ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                      No domains match this filter.
                    </td>
                  </tr>
                ) : (
                  visibleDomains.map((domain) => (
                    <tr
                      key={domain.domain}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50/90' : 'hover:bg-white/[0.035]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <a
                          href={registerUrl(domain.domain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-mono text-[13px] font-semibold tracking-tight ${
                            isLight ? 'text-slate-900 hover:text-slate-600' : 'text-white hover:text-white/70'
                          }`}
                        >
                          {domain.domain}
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusPill
                          status={domain.status}
                          premium={domain.premium}
                          price={domain.price}
                          isLight={isLight}
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <CountryFlag
                            code={domain.countryCode}
                            size={20}
                            title={domain.location}
                            className="rounded-[3px]"
                          />
                          <span className={`truncate text-[13px] font-medium ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                            {domain.location}
                          </span>
                          <span
                            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                              isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/35'
                            }`}
                          >
                            {domain.type}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right tabular-nums ${isLight ? 'text-slate-600' : 'text-white/55'}`}
                        title={
                          domain.population >= 1_000_000
                            ? `${formatPopulationMillions(domain.population)} (${formatPopulationExact(domain.population)} people)`
                            : formatPopulationExact(domain.population)
                        }
                      >
                        <span className="block text-[13px] font-semibold tracking-tight">
                          {formatPopulation(domain.population)}
                        </span>
                        {domain.population >= 1_000_000 && (
                          <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                            {formatPopulationExact(domain.population)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={domain.buyUrl || registerUrl(domain.domain)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                              domain.premium
                                ? isLight
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-violet-500 text-white'
                                : domain.status === 'available'
                                  ? isLight
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-500 text-black'
                                  : isLight
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-white/10 text-white/70'
                            }`}
                          >
                            {domain.premium
                              ? domain.price
                                ? domain.price
                                : 'Premium'
                              : domain.status === 'available'
                                ? 'Register'
                                : domain.status === 'taken'
                                  ? 'Registered'
                                  : 'Check'}
                          </a>
                          <a
                            href={whoisUrl(domain.domain)}
                            className={`rounded-lg p-1.5 ${
                              isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-white/30 hover:bg-white/10'
                            }`}
                            title="WHOIS"
                          >
                            <Icons.Info />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedDomains.length > 0 && (
            <div
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${shell(isLight)}`}
            >
              <span className={`text-[12px] tabular-nums ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                Showing{' '}
                <strong className={isLight ? 'text-slate-800' : 'text-white/80'}>
                  {sortedDomains.length === 0
                    ? 0
                    : `${safeResultsPage * PAGE_SIZE + 1}–${Math.min(
                        (safeResultsPage + 1) * PAGE_SIZE,
                        sortedDomains.length
                      )}`}
                </strong>{' '}
                of {sortedDomains.length.toLocaleString()} results
                {sortedDomains.length !== stats.total ? ` (filtered from ${stats.total.toLocaleString()})` : ''}
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={safeResultsPage <= 0}
                  onClick={() => setResultsPage((p) => Math.max(0, p - 1))}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-30 ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: resultsPageCount }, (_, i) => i)
                  .filter((i) => {
                    return i === 0 || i === resultsPageCount - 1 || Math.abs(i - safeResultsPage) <= 1;
                  })
                  .map((i, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && i - prev > 1;
                    return (
                      <span key={i} className="inline-flex items-center gap-1">
                        {showEllipsis && (
                          <span className={isLight ? 'text-slate-300' : 'text-white/25'}>…</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setResultsPage(i)}
                          className={`min-w-[32px] rounded-lg px-2 py-1.5 text-[11px] font-bold tabular-nums ${
                            i === safeResultsPage
                              ? isLight
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-900'
                              : isLight
                                ? 'text-slate-500 hover:bg-slate-100'
                                : 'text-white/45 hover:bg-white/10'
                          }`}
                        >
                          {i + 1}
                        </button>
                      </span>
                    );
                  })}
                <button
                  type="button"
                  disabled={safeResultsPage >= resultsPageCount - 1}
                  onClick={() => setResultsPage((p) => Math.min(resultsPageCount - 1, p + 1))}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-30 ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

function StatusPill({
  status,
  premium,
  price,
  isLight,
}: {
  status: GeneratedDomain['status'];
  premium?: boolean;
  price?: string;
  isLight: boolean;
}) {
  if (status === 'checking' || status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isLight ? 'bg-sky-50 text-sky-700' : 'bg-sky-500/15 text-sky-300'
        }`}
      >
        <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />
        Checking
      </span>
    );
  }
  if (premium) {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isLight ? 'bg-violet-50 text-violet-800' : 'bg-violet-500/20 text-violet-200'
        }`}
        title={price ? `Premium ${price}` : 'Premium'}
      >
        Premium{price ? ` · ${price}` : ''}
      </span>
    );
  }
  if (status === 'available') {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isLight ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/15 text-emerald-300'
        }`}
      >
        Available
      </span>
    );
  }
  if (status === 'taken') {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isLight ? 'bg-rose-50 text-rose-700' : 'bg-rose-500/15 text-rose-300'
        }`}
      >
        Registered
      </span>
    );
  }
  if (status === 'skipped') {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/40'
        }`}
        title="Outside live-check budget — raise check limit to include"
      >
        Not checked
      </span>
    );
  }
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
        isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-500/15 text-amber-200'
      }`}
    >
      Error
    </span>
  );
}

export default GeoDomainGenerator;
