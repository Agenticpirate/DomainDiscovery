'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync React state with the theme the pre-paint bootstrap script already
    // applied to <html> (saved choice → OS preference → dark). Reading the DOM
    // class avoids a second source of truth and keeps state == painted theme.
    if (typeof window !== 'undefined') {
      const domLight = document.documentElement.classList.contains('light');
      const saved = localStorage.getItem('theme') as Theme | null;
      const resolved: Theme = saved ?? (domLight ? 'light' : 'dark');
      setThemeState(resolved);
      document.documentElement.classList.toggle('light', resolved === 'light');
      document.documentElement.style.colorScheme = resolved;
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('light', newTheme === 'light');
      document.documentElement.style.colorScheme = newTheme;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values during SSR or before provider is mounted
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
