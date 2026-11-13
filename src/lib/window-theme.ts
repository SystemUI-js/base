import {
  defaultThemeDefinition,
  win98ThemeDefinition,
  winXpThemeDefinition,
} from '@system-ui-js/chameleon';

export {
  defaultThemeDefinition,
  win98ThemeDefinition,
  winXpThemeDefinition,
};

export const WINDOW_THEME_CLASS_NAMES = {
  default: defaultThemeDefinition.className,
  win98: win98ThemeDefinition.className,
  winxp: winXpThemeDefinition.className,
} as const;

export type BaseThemeName = keyof typeof WINDOW_THEME_CLASS_NAMES;
export type BaseThemeToken = BaseThemeName | (string & {});

export const DEFAULT_WINDOW_THEME_CLASS_NAME = WINDOW_THEME_CLASS_NAMES.win98;
