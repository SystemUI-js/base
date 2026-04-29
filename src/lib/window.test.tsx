import { describe, expect, it, jest } from '@jest/globals';
import type { ReactElement } from 'react';

jest.mock('@system-ui-js/chameleon', () => {
  const createComponent = () => () => null;

  return {
    __esModule: true,
    CButton: createComponent(),
    CWindow: createComponent(),
    CWindowBody: createComponent(),
    CWindowTitle: createComponent(),
    Theme: createComponent(),
    defaultThemeDefinition: { className: 'theme-default' },
    win98ThemeDefinition: { className: 'theme-win98' },
    winXpThemeDefinition: { className: 'theme-winxp' },
  };
});

import {
  BaseThemeProvider,
  BaseWindow,
  BaseWindowActionButton,
  BaseWindowTitle,
} from './window';

describe('window wrapper contract', () => {
  it('resolves base theme names for the theme provider', () => {
    const element = BaseThemeProvider({
      children: 'content',
      theme: 'winxp',
    }) as ReactElement<{ name: string }>;

    expect(element.props.name).toBe('theme-winxp');
  });

  it('merges default resize options with caller overrides', () => {
    const element = BaseWindow({
      children: 'body',
      resizeOptions: {
        edgeWidth: 10,
        minContentHeight: 320,
      },
      theme: 'default',
    }) as ReactElement<{
      resizeOptions: {
        edgeWidth: number;
        minContentHeight: number;
        minContentWidth: number;
      };
      theme?: string;
    }>;

    expect(element.props.resizeOptions).toEqual({
      edgeWidth: 10,
      minContentWidth: 240,
      minContentHeight: 320,
    });
    expect(element.props.theme).toBe('theme-default');
  });

  it('maps title action props onto Chameleon title props', () => {
    const action = 'Close';
    const element = BaseWindowTitle({
      action,
      actionPosition: 'left',
      children: 'Title',
      theme: 'win98',
    }) as ReactElement<{
      actionButton: unknown;
      actionButtonPosition: string;
      theme?: string;
    }>;

    expect(element.props.actionButton).toBe(action);
    expect(element.props.actionButtonPosition).toBe('left');
    expect(element.props.theme).toBe('theme-win98');
  });

  it('applies native-safe minimum width and preserves caller style', () => {
    const callerStyle = { backgroundColor: 'rebeccapurple' };
    const element = BaseWindowActionButton({
      children: 'Confirm',
      style: callerStyle,
      theme: 'custom-theme',
    }) as ReactElement<{
      style: Array<unknown>;
      theme?: string;
      variant: string;
    }>;

    expect(element.props.style).toEqual([{ minWidth: 112 }, callerStyle]);
    expect(element.props.theme).toBe('custom-theme');
    expect(element.props.variant).toBe('default');
  });
});
