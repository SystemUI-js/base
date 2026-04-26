import {
  CButton,
  CWindow,
  CWindowBody,
  CWindowTitle,
  Theme,
  type CWindowResizeOptions,
  type WindowTitleActionButtonPosition,
} from '@system-ui-js/chameleon';
import type { ComponentProps, ReactNode } from 'react';
import {
  DEFAULT_WINDOW_THEME_CLASS_NAME,
  WINDOW_THEME_CLASS_NAMES,
  type BaseThemeName,
  type BaseThemeToken,
} from './window-theme';

const WINDOW_RESIZE_OPTIONS: Readonly<CWindowResizeOptions> = {
  edgeWidth: 6,
  minContentWidth: 240,
  minContentHeight: 180,
};

type ThemeName = ComponentProps<typeof Theme>['name'];
type ChameleonWindowProps = ComponentProps<typeof CWindow>;
type ChameleonWindowTitleProps = ComponentProps<typeof CWindowTitle>;
type ChameleonWindowBodyProps = ComponentProps<typeof CWindowBody>;
type ChameleonButtonProps = ComponentProps<typeof CButton>;

function isBaseThemeName(value: string): value is BaseThemeName {
  return value in WINDOW_THEME_CLASS_NAMES;
}

function resolveThemeClassName(theme?: BaseThemeToken): ThemeName {
  if (!theme) {
    return DEFAULT_WINDOW_THEME_CLASS_NAME;
  }

  return isBaseThemeName(theme) ? WINDOW_THEME_CLASS_NAMES[theme] : theme;
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
  ChameleonWindowProps,
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
  const resolvedResizeOptions: NonNullable<ChameleonWindowProps['resizeOptions']> = {
    ...WINDOW_RESIZE_OPTIONS,
    ...resizeOptions,
  };

  return (
    <CWindow
      {...windowProps}
      resizable={resizable}
      resizeOptions={resolvedResizeOptions}
      theme={theme ? resolveThemeClassName(theme) : undefined}
    >
      {children}
    </CWindow>
  );
}

export interface BaseWindowTitleProps extends Omit<
  ChameleonWindowTitleProps,
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

export interface BaseWindowBodyProps extends Omit<ChameleonWindowBodyProps, 'theme'> {
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
  ChameleonButtonProps,
  'style' | 'theme'
> {
  readonly style?: ChameleonButtonProps['style'];
  readonly theme?: BaseThemeToken;
}

export function BaseWindowActionButton({
  children,
  style,
  theme,
  variant = 'default',
  ...buttonProps
}: BaseWindowActionButtonProps) {
  const mergedStyle =
    style == null ? [{ minWidth: 112 }] : [{ minWidth: 112 }, style];

  return (
    <CButton
      {...buttonProps}
      style={mergedStyle as ChameleonButtonProps['style']}
      theme={theme ? resolveThemeClassName(theme) : undefined}
      variant={variant}
    >
      {children}
    </CButton>
  );
}
