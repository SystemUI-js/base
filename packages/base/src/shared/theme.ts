export const WINDOW_THEME_CLASS_NAMES = {
  default: 'cm-theme--default',
  win98: 'cm-theme--win98',
  winxp: 'cm-theme--winxp',
} as const;

export type BaseThemeName = keyof typeof WINDOW_THEME_CLASS_NAMES;
type BaseThemeClassName = (typeof WINDOW_THEME_CLASS_NAMES)[BaseThemeName];

export type BaseThemeToken = BaseThemeName | BaseThemeClassName;

export const DEFAULT_WINDOW_THEME_CLASS_NAME = WINDOW_THEME_CLASS_NAMES.win98;

const THEME_CLASS_NAME_TO_NAME: Record<BaseThemeClassName, BaseThemeName> = {
  'cm-theme--default': 'default',
  'cm-theme--win98': 'win98',
  'cm-theme--winxp': 'winxp',
};

export function resolveBaseThemeName(theme?: BaseThemeToken): BaseThemeName {
  if (!theme) {
    return 'win98';
  }

  if (theme in WINDOW_THEME_CLASS_NAMES) {
    return theme as BaseThemeName;
  }

  return THEME_CLASS_NAME_TO_NAME[theme as BaseThemeClassName] ?? 'win98';
}

export function resolveWindowThemeClassName(theme?: BaseThemeToken): string {
  if (!theme) {
    return DEFAULT_WINDOW_THEME_CLASS_NAME;
  }

  if (theme in WINDOW_THEME_CLASS_NAMES) {
    return WINDOW_THEME_CLASS_NAMES[theme as BaseThemeName];
  }

  return theme;
}
