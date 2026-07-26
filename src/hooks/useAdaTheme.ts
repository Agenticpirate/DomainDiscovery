'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { adaTokens, type AdaThemeTokens } from '@/lib/ada/theme';

/**
 * Theme tokens for ADA UI. Avoids washed-out light mode by using stronger
 * slate contrast, solid white cards, and clearer borders.
 */
export function useAdaTheme(): AdaThemeTokens & { ready: boolean } {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Default dark until mount to match historical SSR; light applies after hydrate
  const isLight = mounted && theme === 'light';
  const tokens = adaTokens(isLight);
  return { ...tokens, mounted, ready: mounted };
}
