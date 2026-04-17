'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeSync } from './ThemeSync';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      enableSystem={true} 
      defaultTheme="system" 
      attribute="class"
      {...props}
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}
