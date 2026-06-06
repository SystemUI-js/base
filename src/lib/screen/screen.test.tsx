import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import React from 'react';
import ScreenComponent from './index';
import { getWindowManagerStore, WindowState, windowContentRegistry } from '../windowManager';
import { CWindow, CWindowTitle } from '@system-ui-js/chameleon';

const TestWindowContent = (props: any) => {
  const { fullscreen: isFullscreen, ...rest } = props;
  return (
    <CWindow width={400} height={300} {...(isFullscreen ? { fullscreen: true } : {})} {...rest}>
      <CWindowTitle>Test Window</CWindowTitle>
      <div>Test Content</div>
    </CWindow>
  );
};

windowContentRegistry.set('test-window', TestWindowContent);

let styleElement: HTMLStyleElement | null = null;

beforeEach(() => {
  styleElement = document.createElement('style');
  styleElement.textContent = `
    .system-ui-js__screen { position: relative; }
    .system-ui-js__screen > .cm-window-frame.cm-window--fullscreen {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
  `;
  document.head.appendChild(styleElement);
});

afterEach(() => {
  cleanup();
  getWindowManagerStore().setState({ screens: [] });
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    styleElement = null;
  }
});

describe('ScreenComponent Fullscreen CSS', () => {
  it('should apply parent-relative sizing for fullscreen windows', async () => {
    const store = getWindowManagerStore();
    store.getState().createScreen({
      id: 'test-screen',
      size: { width: 800, height: 600 },
      bars: [],
      windows: []
    });
    store.getState().createWindow({
      id: 'test-window-1',
      type: 'test-window',
      props: { title: 'Test Window', content: 'Test Content' }
    }, 'test-screen');

    render(<ScreenComponent screenId="test-screen" windowManager={store} />);
    await act(async () => {});

    const windowFrame = document.querySelector('.cm-window-frame');
    expect(windowFrame).toBeTruthy();

    await act(async () => {
      store.getState().setWindowState('test-window-1', WindowState.Fullscreen);
    });

    expect(windowFrame?.classList.contains('cm-window--fullscreen')).toBe(true);

    const computedStyle = window.getComputedStyle(windowFrame as Element);
    expect(computedStyle.position).toBe('absolute');
    expect(computedStyle.width).toBe('100%');
    expect(computedStyle.height).toBe('100%');
    expect(computedStyle.left).toBe('0px');
    expect(computedStyle.top).toBe('0px');
  });

  it('should not affect normal windows', async () => {
    const store = getWindowManagerStore();
    store.getState().createScreen({
      id: 'test-screen',
      size: { width: 800, height: 600 },
      bars: [],
      windows: []
    });
    store.getState().createWindow({
      id: 'test-window-2',
      type: 'test-window',
      props: { title: 'Test Window 2', content: 'Test Content 2' }
    }, 'test-screen');

    render(<ScreenComponent screenId="test-screen" windowManager={store} />);
    await act(async () => {});

    const windowFrame = document.querySelector('.cm-window-frame');
    expect(windowFrame).toBeTruthy();
    expect(windowFrame?.classList.contains('cm-window--fullscreen')).toBe(false);

    const computedStyle = window.getComputedStyle(windowFrame as Element);
    expect(computedStyle.width).not.toBe('100%');
    expect(computedStyle.height).not.toBe('100%');
    expect(computedStyle.width).toMatch(/^\d+(\.\d+)?px$/);
    expect(computedStyle.height).toMatch(/^\d+(\.\d+)?px$/);
  });
});
