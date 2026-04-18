import { useEffect, useLayoutEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ScreenProps, SystemProps } from '../shared/types';
import { resolveBaseThemeName } from '../shared/theme';
import { getNativeThemePalette } from './theme';
import { BaseThemeProvider, useNativeTheme } from './theme-context';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  surface: {
    flex: 1,
    overflow: 'hidden',
  },
  system: {
    flex: 1,
  },
});

export function System({
  accessibilityLabel,
  children,
  className,
  onBoot,
  onLoad,
  systemType,
  testID,
  theme = 'win98',
}: SystemProps) {
  const hasBootedRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const themeName = resolveBaseThemeName(theme);
  const palette = getNativeThemePalette(themeName);

  void className;
  void systemType;

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
      <View
        accessibilityLabel={accessibilityLabel}
        style={[styles.system, { backgroundColor: palette.systemBackground }]}
        testID={testID}
      >
        {children}
      </View>
    </BaseThemeProvider>
  );
}

export function Screen({
  accessibilityLabel,
  children,
  className,
  screenClassName,
  testID,
  theme,
}: ScreenProps) {
  const themeName = useNativeTheme(theme);
  const palette = getNativeThemePalette(themeName);

  void className;
  void screenClassName;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.screen, { backgroundColor: palette.systemBackground }]}
      testID={testID}
    >
      <View
        style={[styles.surface, { backgroundColor: palette.screenBackground }]}
      >
        {children}
      </View>
    </View>
  );
}
