import {
  CButton,
  CWindow,
  CWindowBody,
  CWindowTitle,
  Theme,
  defaultThemeDefinition,
  win98ThemeDefinition,
  winXpThemeDefinition,
  type CButtonProps,
  type CWindowBodyProps,
  type CWindowProps,
  type CWindowResizeOptions,
  type CWindowTitleProps,
  type WindowTitleActionButtonPosition,
} from '@system-ui-js/chameleon';
import type { ReactNode } from 'react';

const WINDOW_RESIZE_OPTIONS: Readonly<CWindowResizeOptions> = {
  edgeWidth: 6,
  minContentWidth: 240,
  minContentHeight: 180,
};

export const WINDOW_THEME_CLASS_NAMES = {
  default: defaultThemeDefinition.className,
  win98: win98ThemeDefinition.className,
  winxp: winXpThemeDefinition.className,
} as const;

export type BaseThemeName = keyof typeof WINDOW_THEME_CLASS_NAMES;
export type BaseThemeToken = BaseThemeName | string;

export const DEFAULT_WINDOW_THEME_CLASS_NAME = WINDOW_THEME_CLASS_NAMES.win98;

function isBaseThemeName(value: string): value is BaseThemeName {
  return value in WINDOW_THEME_CLASS_NAMES;
}

function resolveThemeClassName(theme?: BaseThemeToken): string {
  if (!theme) {
    return DEFAULT_WINDOW_THEME_CLASS_NAME;
  }

  return isBaseThemeName(theme) ? WINDOW_THEME_CLASS_NAMES[theme] : theme;
}

function mergeClassNames(
  ...classNames: Array<string | undefined>
): string | undefined {
  const merged = classNames.filter(Boolean).join(' ');

  return merged.length > 0 ? merged : undefined;
}

export interface BaseThemeProviderProps {
  readonly children?: ReactNode;
  readonly theme?: BaseThemeToken;
}

export function BaseThemeProvider({
  children,
  theme = DEFAULT_WINDOW_THEME_CLASS_NAME,
}: BaseThemeProviderProps) {
  return <Theme name={resolveThemeClassName(theme)}>{children}</Theme>;
}

export interface BaseWindowProps extends Omit<
  CWindowProps,
  'theme' | 'resizeOptions'
> {
  readonly theme?: BaseThemeToken;
  readonly resizeOptions?: CWindowResizeOptions;
}

export function BaseWindow({
  children,
  resizable = true,
  resizeOptions,
  theme,
  ...windowProps
}: BaseWindowProps) {
  return (
    <CWindow
      {...windowProps}
      resizable={resizable}
      resizeOptions={{ ...WINDOW_RESIZE_OPTIONS, ...resizeOptions }}
      theme={theme ? resolveThemeClassName(theme) : undefined}
    >
      {children}
    </CWindow>
  );
}

export interface BaseWindowTitleProps extends Omit<
  CWindowTitleProps,
  'actionButton' | 'actionButtonPosition' | 'theme'
> {
  readonly action?: ReactNode;
  readonly actionPosition?: WindowTitleActionButtonPosition;
  readonly theme?: BaseThemeToken;
}

export function BaseWindowTitle({
  action,
  actionPosition = 'right',
  children,
  theme,
  ...titleProps
}: BaseWindowTitleProps) {
  return (
    <CWindowTitle
      {...titleProps}
      actionButton={action}
      actionButtonPosition={actionPosition}
      theme={theme ? resolveThemeClassName(theme) : undefined}
    >
      {children}
    </CWindowTitle>
  );
}

export interface BaseWindowBodyProps extends Omit<CWindowBodyProps, 'theme'> {
  readonly theme?: BaseThemeToken;
}

export function BaseWindowBody({
  children,
  theme,
  ...bodyProps
}: BaseWindowBodyProps) {
  return (
    <CWindowBody
      {...bodyProps}
      theme={theme ? resolveThemeClassName(theme) : undefined}
    >
      {children}
    </CWindowBody>
  );
}

export interface BaseWindowActionButtonProps extends Omit<
  CButtonProps,
  'theme'
> {
  readonly theme?: BaseThemeToken;
}

export function BaseWindowActionButton({
  children,
  className,
  theme,
  variant = 'default',
  ...buttonProps
}: BaseWindowActionButtonProps) {
  return (
    <CButton
      {...buttonProps}
      className={mergeClassNames('sb-base-window-action', className)}
      theme={theme ? resolveThemeClassName(theme) : undefined}
      variant={variant}
    >
      {children}
    </CButton>
  );
}
