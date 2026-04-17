export type ThemeAlias = 'light' | 'dark' | 'system';

export interface IThemeStore {
  preferredTheme: ThemeAlias;
  setTheme: (theme: ThemeAlias) => void;
}
