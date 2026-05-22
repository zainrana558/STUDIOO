"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { themes, Theme } from '../lib/themes';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const activeTheme = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'genre' && pathSegments[1]) {
        return themes[pathSegments[1] as keyof typeof themes] || themes.default;
    }
    return themes.default;
  }, [pathname]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTheme) {
      const body = document.body;

      const cssVars = {
          '--color-primary': activeTheme.colors.primary,
          '--color-secondary': activeTheme.colors.secondary,
          '--color-accent': activeTheme.colors.accent,
          '--font-display': activeTheme.fonts.display,
          '--font-body': activeTheme.fonts.body,
      };

      // Store previous values for cleanup
      const previousVars: Record<string, string> = {};
      Object.entries(cssVars).forEach(([key, value]) => {
          previousVars[key] = body.style.getPropertyValue(key);
      });

      // Apply new theme with smooth transition
      body.style.setProperty('transition', 'background-color 0.4s ease, color 0.4s ease');
      Object.entries(cssVars).forEach(([key, value]) => {
          body.style.setProperty(key, value);
      });

      // Cleanup function - restore previous values when unmounting or theme changes
      return () => {
        Object.keys(cssVars).forEach((key) => {
            body.style.removeProperty(key);
        });
      };
    }
  }, [activeTheme]);


  return (
    <ThemeContext.Provider value={{ theme: activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
