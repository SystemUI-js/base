import { createContext, useContext } from 'react';

import type { BaseThemeProviderProps } from '../shared/types';
import {
  resolveBaseThemeName,
  type BaseThemeName,
  type BaseThemeToken,
} from '../shared/theme';

const BaseThemeContext = createContext<BaseThemeName>(resolveBaseThemeName());

export function BaseThemeProvider({ children, theme }: BaseThemeProviderProps) {
  const themeName = resolveBaseThemeName(theme);

  return (
    <BaseThemeContext.Provider value={themeName}>
      {children}
    </BaseThemeContext.Provider>
  );
}

export function useNativeTheme(theme?: BaseThemeToken): BaseThemeName {
  const inheritedTheme = useContext(BaseThemeContext);

  return theme ? resolveBaseThemeName(theme) : inheritedTheme;
}
