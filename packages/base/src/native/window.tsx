import type { ReactNode } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';

import type {
  BaseWindowActionButtonProps,
  BaseWindowBodyProps,
  BaseWindowProps,
  BaseWindowTitleProps,
  WindowTitleActionButtonPosition,
} from '../shared/types';
import { getNativeThemePalette } from './theme';
import { useNativeTheme } from './theme-context';

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: 12,
  },
  button: {
    alignItems: 'center',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  frame: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    padding: 2,
  },
  innerFrame: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    flex: 1,
  },
  titleBar: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleBarAction: {
    marginLeft: 8,
  },
  titleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  window: {
    flex: 1,
  },
});

function renderTextChild(children: ReactNode, textStyle: object) {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={textStyle}>{children}</Text>;
  }

  return children;
}

function resolveWindowPosition(windowProps: BaseWindowProps) {
  const { height, width, x, y } = windowProps;

  if (x === undefined && y === undefined) {
    return {
      height,
      width,
    };
  }

  return {
    height,
    left: x ?? 0,
    position: 'absolute' as const,
    top: y ?? 0,
    width,
  };
}

export { BaseThemeProvider } from './theme-context';

export function BaseWindow({
  children,
  height,
  resizable,
  theme,
  width,
  x,
  y,
}: BaseWindowProps) {
  const themeName = useNativeTheme(theme);
  const palette = getNativeThemePalette(themeName);

  void resizable;

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: palette.windowFrame,
          borderBottomColor: palette.borderDark,
          borderLeftColor: palette.borderLight,
          borderRightColor: palette.borderDark,
          borderTopColor: palette.borderLight,
        },
        resolveWindowPosition({
          children,
          height,
          resizable,
          theme,
          width,
          x,
          y,
        }),
      ]}
    >
      <View
        style={[
          styles.innerFrame,
          {
            borderBottomColor: palette.borderLight,
            borderLeftColor: palette.borderDark,
            borderRightColor: palette.borderLight,
            borderTopColor: palette.borderDark,
          },
        ]}
      >
        <View
          style={[styles.window, { backgroundColor: palette.windowBackground }]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

function renderTitleAction(
  action: ReactNode,
  actionPosition: WindowTitleActionButtonPosition,
) {
  if (!action) {
    return null;
  }

  return (
    <View
      style={[
        styles.titleBarAction,
        actionPosition === 'left' ? { marginLeft: 0, marginRight: 8 } : null,
      ]}
    >
      {action}
    </View>
  );
}

export function BaseWindowTitle({
  action,
  actionPosition = 'right',
  children,
  theme,
}: BaseWindowTitleProps) {
  const themeName = useNativeTheme(theme);
  const palette = getNativeThemePalette(themeName);
  const titleText = renderTextChild(children, [
    styles.titleText,
    { color: palette.titleTextColor },
  ]);
  const leadingAction =
    actionPosition === 'left'
      ? renderTitleAction(action, actionPosition)
      : null;
  const trailingAction =
    actionPosition === 'right'
      ? renderTitleAction(action, actionPosition)
      : null;

  return (
    <View
      style={[styles.titleBar, { backgroundColor: palette.titleBackground }]}
    >
      {leadingAction}
      {titleText}
      {trailingAction}
    </View>
  );
}

export function BaseWindowBody({ children, theme }: BaseWindowBodyProps) {
  const themeName = useNativeTheme(theme);
  const palette = getNativeThemePalette(themeName);

  return (
    <View style={[styles.body, { backgroundColor: palette.bodyBackground }]}>
      {children}
    </View>
  );
}

export function BaseWindowActionButton({
  children,
  className,
  disabled,
  onPress,
  theme,
}: BaseWindowActionButtonProps) {
  const themeName = useNativeTheme(theme);
  const palette = getNativeThemePalette(themeName);

  void className;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: palette.buttonFace,
          borderBottomColor: palette.borderDark,
          borderLeftColor: palette.borderLight,
          borderRightColor: palette.borderDark,
          borderTopColor: palette.borderLight,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {renderTextChild(children, [
        styles.buttonText,
        { color: palette.textColor },
      ])}
    </Pressable>
  );
}
