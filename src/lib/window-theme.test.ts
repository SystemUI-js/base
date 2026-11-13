import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@system-ui-js/chameleon', () => ({
  __esModule: true,
  defaultThemeDefinition: { className: 'theme-default' },
  win98ThemeDefinition: { className: 'theme-win98' },
  winXpThemeDefinition: { className: 'theme-winxp' },
}));

import {
  DEFAULT_WINDOW_THEME_CLASS_NAME,
  WINDOW_THEME_CLASS_NAMES,
} from './window-theme';

describe('window-theme contract', () => {
  it('exposes the expected theme class names', () => {
    expect(WINDOW_THEME_CLASS_NAMES).toEqual({
      default: 'theme-default',
      win98: 'theme-win98',
      winxp: 'theme-winxp',
    });
  });

  it('uses the win98 class as default wrapper theme', () => {
    expect(DEFAULT_WINDOW_THEME_CLASS_NAME).toBe('theme-win98');
  });
});
