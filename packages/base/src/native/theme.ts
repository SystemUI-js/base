import type { BaseThemeName } from '../shared/theme';

export interface NativeThemePalette {
  readonly bodyBackground: string;
  readonly borderDark: string;
  readonly borderLight: string;
  readonly buttonFace: string;
  readonly screenBackground: string;
  readonly systemBackground: string;
  readonly textColor: string;
  readonly titleBackground: string;
  readonly titleTextColor: string;
  readonly windowBackground: string;
  readonly windowFrame: string;
}

const NATIVE_THEME_PALETTES: Record<BaseThemeName, NativeThemePalette> = {
  default: {
    bodyBackground: '#f7f7f7',
    borderDark: '#7d7d7d',
    borderLight: '#ffffff',
    buttonFace: '#ececec',
    screenBackground: '#d9e2ec',
    systemBackground: '#d9e2ec',
    textColor: '#1f2937',
    titleBackground: '#5b7db1',
    titleTextColor: '#ffffff',
    windowBackground: '#f3f4f6',
    windowFrame: '#d5d9dd',
  },
  win98: {
    bodyBackground: '#c0c0c0',
    borderDark: '#808080',
    borderLight: '#ffffff',
    buttonFace: '#c0c0c0',
    screenBackground: '#008080',
    systemBackground: '#008080',
    textColor: '#111827',
    titleBackground: '#000080',
    titleTextColor: '#ffffff',
    windowBackground: '#c0c0c0',
    windowFrame: '#c0c0c0',
  },
  winxp: {
    bodyBackground: '#f8fbff',
    borderDark: '#245dbe',
    borderLight: '#9cc2ff',
    buttonFace: '#edf4ff',
    screenBackground: '#2c71c4',
    systemBackground: '#2c71c4',
    textColor: '#102a43',
    titleBackground: '#316ac5',
    titleTextColor: '#ffffff',
    windowBackground: '#edf4ff',
    windowFrame: '#5fa3ff',
  },
};

export function getNativeThemePalette(
  themeName: BaseThemeName,
): NativeThemePalette {
  return NATIVE_THEME_PALETTES[themeName];
}
