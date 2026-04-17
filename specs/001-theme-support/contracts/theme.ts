export type ThemeAlias = 'light' | 'dark' | 'system';

export interface IThemeStore {
  /**
   * Represents the current stored string preference of the user.
   * Can be 'system' if the user wishes to defer to their OS preference.
   */
  preferredTheme: ThemeAlias;
  
  /**
   * Explicitly sets the UI preference, persisting the value.
   * Modifies the local storage configuration that controls CSS variables.
   * 
   * @param theme - The specific target mode to activate.
   */
  setTheme: (theme: ThemeAlias) => void;
}
