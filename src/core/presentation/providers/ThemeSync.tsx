'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useThemeStore } from '@/src/application/stores/useThemeStore';
import { ThemeAlias } from '@/src/application/stores/theme.types';

export function ThemeSync() {
  const { theme, resolvedTheme } = useTheme();
  const setThemeStore = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    // Sincronizar el Theme del DOM hacia Zustand
    if (theme) {
      setThemeStore(theme as ThemeAlias);
    }
  }, [theme, setThemeStore]);

  return null;
}
