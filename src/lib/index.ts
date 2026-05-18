import './styles/base.css';

import { WindowManager } from './window-manager';

export {
  BaseThemeProvider,
  BaseWindow,
  BaseWindowActionButton,
  BaseWindowBody,
  BaseWindowTitle,
} from './window';

export {
  DEFAULT_WINDOW_THEME_CLASS_NAME,
  WINDOW_THEME_CLASS_NAMES,
} from './window-theme';

export type {
  BaseThemeProviderProps,
  BaseWindowActionButtonProps,
  BaseWindowBodyProps,
  BaseWindowProps,
  BaseWindowTitleProps,
} from './window';

export type { BaseThemeName, BaseThemeToken } from './window-theme';

export { WindowManager };

export const windowManager = new WindowManager();

export type {
  WindowSlotContent,
  WindowLifecycleStatus,
  WindowCreateOptions,
  WindowContent,
  WindowInstance,
} from './window-manager';
