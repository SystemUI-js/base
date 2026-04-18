import {
  CButton,
  CWindow,
  CWindowBody,
  CWindowTitle,
  Theme,
  type CWindowResizeOptions,
} from '@system-ui-js/chameleon';

import type {
  BaseThemeProviderProps,
  BaseWindowActionButtonProps,
  BaseWindowBodyProps,
  BaseWindowProps,
  BaseWindowTitleProps,
} from '../shared/types';
import { resolveWindowThemeClassName } from '../shared/theme';

const WINDOW_RESIZE_OPTIONS: Readonly<CWindowResizeOptions> = {
  edgeWidth: 6,
  minContentWidth: 240,
  minContentHeight: 180,
};

function mergeClassNames(
  ...classNames: Array<string | undefined>
): string | undefined {
  const merged = classNames.filter(Boolean).join(' ');

  return merged.length > 0 ? merged : undefined;
}

export function BaseThemeProvider({ children, theme }: BaseThemeProviderProps) {
  return <Theme name={resolveWindowThemeClassName(theme)}>{children}</Theme>;
}

export function BaseWindow({
  children,
  height,
  resizable = true,
  theme,
  width,
  x,
  y,
}: BaseWindowProps) {
  return (
    <CWindow
      height={height}
      resizable={resizable}
      resizeOptions={WINDOW_RESIZE_OPTIONS}
      theme={theme ? resolveWindowThemeClassName(theme) : undefined}
      width={width}
      x={x}
      y={y}
    >
      {children}
    </CWindow>
  );
}

export function BaseWindowTitle({
  action,
  actionPosition = 'right',
  children,
  theme,
}: BaseWindowTitleProps) {
  return (
    <CWindowTitle
      actionButton={action}
      actionButtonPosition={actionPosition}
      theme={theme ? resolveWindowThemeClassName(theme) : undefined}
    >
      {children}
    </CWindowTitle>
  );
}

export function BaseWindowBody({ children, theme }: BaseWindowBodyProps) {
  return (
    <CWindowBody theme={theme ? resolveWindowThemeClassName(theme) : undefined}>
      {children}
    </CWindowBody>
  );
}

export function BaseWindowActionButton({
  children,
  className,
  disabled,
  onPress,
  theme,
  variant = 'default',
}: BaseWindowActionButtonProps) {
  return (
    <CButton
      className={mergeClassNames('sb-base-window-action', className)}
      disabled={disabled}
      onClick={onPress}
      theme={theme ? resolveWindowThemeClassName(theme) : undefined}
      variant={variant}
    >
      {children}
    </CButton>
  );
}
