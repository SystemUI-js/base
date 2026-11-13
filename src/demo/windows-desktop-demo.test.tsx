import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WindowsDesktopDemo } from './windows-desktop-demo';
import { getWindowManagerStore } from '../lib/windowManager';

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
    .system-ui-js__screen > [data-system-ui-fullscreen="true"] {
      position: absolute !important;
      inset: 0 !important;
      left: 0 !important;
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
  `;
  document.head.appendChild(styleElement);
});

afterEach(() => {
  for (const el of document.querySelectorAll('.cm-window-frame')) el.remove();
  getWindowManagerStore().setState({ screens: [] });
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    styleElement = null;
  }
});

function getWindowFrames(): NodeListOf<Element> {
  return document.querySelectorAll('.cm-window-frame');
}

function getWindowFrame(): Element | null {
  return document.querySelector('.cm-window-frame');
}

function isFullscreen(wrapper: Element | null): boolean {
  return wrapper?.getAttribute('data-system-ui-fullscreen') === 'true' ?? false;
}

function isActive(wrapper: Element | null): boolean {
  return wrapper?.classList.contains('cm-widget--active') ?? false;
}

function getZIndex(wrapper: Element | null): number {
  return wrapper ? Number((wrapper as HTMLElement).style.zIndex) : 0;
}

function getGeometry(wrapper: Element | null) {
  const el = wrapper as HTMLElement | null;
  return {
    left: el?.style.left,
    top: el?.style.top,
    width: el?.style.width,
    height: el?.style.height,
  };
}

describe('WindowsDesktopDemo', () => {
  it('renders an initial demo window', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    expect(getWindowFrames().length).toBe(1);
  });

  it('creates a new window via the + button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const plusButton = screen.getByText('+');
    await act(async () => fireEvent.click(plusButton));
    expect(getWindowFrames().length).toBe(2);
  });

  it('closes a window via titlebar close button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const closeButton = document.querySelector('[aria-label="关闭"]');
    if (closeButton) {
      await act(async () => fireEvent.click(closeButton));
    }
    expect(getWindowFrames().length).toBe(0);
  });

  it('focuses a window via status bar click', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const plusButton = screen.getByText('+');
    await act(async () => fireEvent.click(plusButton));
    const statusButtons = screen.getAllByText(/Demo Window|New Window/);
    expect(statusButtons.length).toBeGreaterThan(0);
    await act(async () => fireEvent.click(statusButtons[0]));
    const wrappers = getWindowFrames();
    expect(isActive(wrappers[0])).toBe(true);
  });

  it('brings older window to front on status bar click', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const plusButton = screen.getByText('+');
    await act(async () => fireEvent.click(plusButton));
    const statusButtons = screen.getAllByText(/Demo Window|New Window/);
    expect(statusButtons.length).toBeGreaterThan(0);
    await act(async () => fireEvent.click(statusButtons[0]));
    const wrappers = getWindowFrames();
    const z0 = getZIndex(wrappers[0]);
    const z1 = getZIndex(wrappers[1]);
    expect(z0).toBeGreaterThan(z1);
    expect(isActive(wrappers[0])).toBe(true);
    expect(isActive(wrappers[1])).toBe(false);
  });

  it('toggles fullscreen via content fullscreen button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const fullscreenButton = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton));
    const wrapper = getWindowFrame();
    expect(wrapper?.getAttribute('data-system-ui-fullscreen')).toBe('true');
    const computedStyle = window.getComputedStyle(wrapper as Element);
    expect(computedStyle.width).toBe('100%');
    expect(computedStyle.height).toBe('100%');
  });

  it('restores fullscreen window to normal via content restore button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const fullscreenButton = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton));
    let wrapper = getWindowFrame();
    expect(isFullscreen(wrapper)).toBe(true);
    const restoreButton = screen.getByLabelText('退出全屏');
    await act(async () => fireEvent.click(restoreButton));
    wrapper = getWindowFrame();
    expect(isFullscreen(wrapper)).toBe(false);
    const geom = getGeometry(wrapper);
    expect(geom.left).not.toBe('0px');
    expect(geom.top).not.toBe('0px');
    expect(geom.width).not.toBe('800px');
    expect(geom.height).not.toBe('600px');
  });

  it('closes a fullscreen window normally', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const fullscreenButton = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton));
    const wrapper = getWindowFrame();
    expect(isFullscreen(wrapper)).toBe(true);
    const closeButton = document.querySelector('[aria-label="关闭"]');
    if (closeButton) {
      await act(async () => fireEvent.click(closeButton));
    }
    expect(getWindowFrames().length).toBe(0);
  });

  it('allows multiple windows to independently toggle fullscreen', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const plusButton = screen.getByText('+');
    await act(async () => fireEvent.click(plusButton));
    const fullscreenButtons = screen.getAllByLabelText('全屏');
    expect(fullscreenButtons.length).toBe(2);
    await act(async () => fireEvent.click(fullscreenButtons[0]));
    const wrappers = getWindowFrames();
    expect(isFullscreen(wrappers[0])).toBe(true);
    expect(isFullscreen(wrappers[1])).toBe(false);
  });

  it('fullscreen disables resize handles', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const fullscreenButton = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton));
    const wrapper = getWindowFrame();
    expect(isFullscreen(wrapper)).toBe(true);
    // Chameleon renders resize handles with data-testid="window-resize-{direction}"
    // When fullscreen, CWindow.renderResizeHandles() returns null
    const resizeHandles = wrapper?.querySelectorAll('[data-testid^="window-resize-"]') ?? [];
    expect(resizeHandles.length).toBe(0);
  });

  it('fullscreen disables title-bar drag', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const fullscreenButton = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton));
    const wrapper = getWindowFrame();
    expect(isFullscreen(wrapper)).toBe(true);
    // Store should show x=0, y=0 for fullscreen
    const store = getWindowManagerStore();
    const screenData = store.getState().screens[0];
    const winBefore = screenData?.windows[0];
    expect(winBefore?.x).toBe(0);
    expect(winBefore?.y).toBe(0);
    // Attempt to drag the title bar
    const titleEl = wrapper?.querySelector('[data-testid="window-title"]') as HTMLElement | null;
    expect(titleEl).toBeTruthy();
    if (titleEl) {
      fireEvent.pointerDown(titleEl, { clientX: 100, clientY: 100 });
      fireEvent.pointerMove(titleEl, { clientX: 300, clientY: 300 });
      fireEvent.pointerUp(titleEl, { clientX: 300, clientY: 300 });
    }
    // Store geometry should remain at 0,0
    const screenAfter = store.getState().screens[0];
    const winAfter = screenAfter?.windows[0];
    expect(winAfter?.x).toBe(0);
    expect(winAfter?.y).toBe(0);
    // Frame layout should remain 100%
    const computedStyle = window.getComputedStyle(wrapper as Element);
    expect(computedStyle.width).toBe('100%');
    expect(computedStyle.height).toBe('100%');
  });

  it('restores exact geometry after fullscreen toggle', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    // Default first window: x=30, y=30, width=400, height=300
    const store = getWindowManagerStore();
    const screenData = store.getState().screens[0];
    const winId = screenData?.windows[0]?.id;
    expect(winId).toBeTruthy();
    const origX = screenData?.windows[0]?.x;
    const origY = screenData?.windows[0]?.y;
    const origW = screenData?.windows[0]?.width;
    const origH = screenData?.windows[0]?.height;
    expect(origX).toBe(30);
    expect(origY).toBe(30);
    expect(origW).toBe(400);
    expect(origH).toBe(300);
    // Toggle fullscreen ON
    const fullscreenButton = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton));
    expect(isFullscreen(getWindowFrame())).toBe(true);
    // Toggle fullscreen OFF
    const restoreButton = screen.getByLabelText('退出全屏');
    await act(async () => fireEvent.click(restoreButton));
    expect(isFullscreen(getWindowFrame())).toBe(false);
    // Geometry must be exactly restored
    const winAfter = store.getState().screens[0]?.windows.find(w => w.id === winId);
    expect(winAfter?.x).toBe(origX);
    expect(winAfter?.y).toBe(origY);
    expect(winAfter?.width).toBe(origW);
    expect(winAfter?.height).toBe(origH);
  });

  it('fullscreen toggle is idempotent (ON → OFF → ON)', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const fullscreenButton = screen.getByLabelText('全屏');
    // ON
    await act(async () => fireEvent.click(fullscreenButton));
    expect(isFullscreen(getWindowFrame())).toBe(true);
    // OFF
    const restoreButton = screen.getByLabelText('退出全屏');
    await act(async () => fireEvent.click(restoreButton));
    expect(isFullscreen(getWindowFrame())).toBe(false);
    // ON again
    const fullscreenButton2 = screen.getByLabelText('全屏');
    await act(async () => fireEvent.click(fullscreenButton2));
    const wrapper = getWindowFrame();
    expect(isFullscreen(wrapper)).toBe(true);
    expect(wrapper?.getAttribute('data-system-ui-fullscreen')).toBe('true');
    const computedStyle = window.getComputedStyle(wrapper as Element);
    expect(computedStyle.width).toBe('100%');
    expect(computedStyle.height).toBe('100%');
  });

  it('assigns staggered positions to new windows', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => {});
    const geom1 = getGeometry(getWindowFrame());
    expect(geom1.left).toBe('30px');
    expect(geom1.top).toBe('30px');

    const plusButton = screen.getByText('+');
    await act(async () => fireEvent.click(plusButton));
    const wrappers = getWindowFrames();
    const geom2 = getGeometry(wrappers[1]);
    expect(geom2.left).toBe('60px');
    expect(geom2.top).toBe('60px');
  });
});
