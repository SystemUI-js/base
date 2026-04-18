import type { ReactNode } from 'react';

import type { BaseThemeName, BaseThemeToken } from './theme';

export type BaseWindowDimension = number;
export type SystemTypeId = string;
export type WindowTitleActionButtonPosition = 'left' | 'right';

interface BaseComponentProps {
  readonly accessibilityLabel?: string;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly testID?: string;
}

export interface BaseThemeProviderProps {
  readonly children?: ReactNode;
  readonly theme?: BaseThemeToken;
}

export interface SystemProps extends BaseComponentProps {
  readonly onBoot?: () => void;
  readonly onLoad?: () => void;
  readonly systemType?: SystemTypeId;
  readonly theme?: BaseThemeName;
}

export interface ScreenProps extends BaseComponentProps {
  readonly screenClassName?: string;
  readonly systemType?: SystemTypeId;
  readonly theme?: BaseThemeName;
}

export interface BaseWindowProps extends BaseComponentProps {
  readonly height?: BaseWindowDimension;
  readonly resizable?: boolean;
  readonly theme?: BaseThemeToken;
  readonly width?: BaseWindowDimension;
  readonly x?: number;
  readonly y?: number;
}

export interface BaseWindowTitleProps extends BaseComponentProps {
  readonly action?: ReactNode;
  readonly actionPosition?: WindowTitleActionButtonPosition;
  readonly theme?: BaseThemeToken;
}

export interface BaseWindowBodyProps extends BaseComponentProps {
  readonly theme?: BaseThemeToken;
}

export interface BaseWindowActionButtonProps extends BaseComponentProps {
  readonly disabled?: boolean;
  readonly onPress?: () => void;
  readonly theme?: BaseThemeToken;
  readonly variant?: 'default';
}
