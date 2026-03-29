import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ThemeConfig } from 'antd';
import { darkTheme, lightTheme } from './themeConfig';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeConfig;
  toggleTheme: () => void;
  isDark: boolean;
}

const STORAGE_KEY = 'lyLzz-theme-mode';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  theme: darkTheme,
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Set a data attribute on html for CSS fallback
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value: ThemeContextValue = {
    mode,
    theme: mode === 'dark' ? darkTheme : lightTheme,
    toggleTheme,
    isDark: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
