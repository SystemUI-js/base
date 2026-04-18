import { useEffect, useLayoutEffect, useRef } from 'react';

import type { ScreenProps, SystemProps } from '../shared/types';
import { BaseThemeProvider } from './window';

function mergeClassNames(
  ...classNames: Array<string | undefined>
): string | undefined {
  const merged = classNames.filter(Boolean).join(' ');

  return merged.length > 0 ? merged : undefined;
}

export function System({
  accessibilityLabel,
  children,
  className,
  onBoot,
  onLoad,
  systemType = 'windows',
  testID,
  theme = 'win98',
}: SystemProps) {
  const hasBootedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useLayoutEffect(() => {
    if (hasBootedRef.current) {
      return;
    }

    hasBootedRef.current = true;
    onBoot?.();
  }, [onBoot]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    onLoad?.();
  }, [onLoad]);

  return (
    <BaseThemeProvider theme={theme}>
      <div
        className={mergeClassNames('sb-base-system', className)}
        data-accessibility-label={accessibilityLabel}
        data-system-theme={theme}
        data-system-type={systemType}
        data-testid={testID}
      >
        {children}
      </div>
    </BaseThemeProvider>
  );
}

export function Screen({
  accessibilityLabel,
  children,
  className,
  screenClassName,
  systemType,
  testID,
  theme,
}: ScreenProps) {
  return (
    <div
      className={mergeClassNames('sb-base-screen', className)}
      data-accessibility-label={accessibilityLabel}
      data-screen-theme={theme}
      data-screen-type={systemType}
      data-testid={testID}
    >
      <div
        className={mergeClassNames('sb-base-screen__surface', screenClassName)}
      >
        {children}
      </div>
    </div>
  );
}
