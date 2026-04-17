import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeAlias, IThemeStore } from './theme.types';

export const useThemeStore = create<IThemeStore>()(
  persist(
    (set) => ({
      preferredTheme: 'system',
      setTheme: (theme: ThemeAlias) => set({ preferredTheme: theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
