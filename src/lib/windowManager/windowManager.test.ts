import { describe, it, expect, beforeEach } from 'vitest';
import { getWindowManagerStore, WindowListItem, WindowState } from './index';

describe('createWindow position staggering', () => {
  let store: ReturnType<typeof getWindowManagerStore>;
  
  beforeEach(() => {
    store = getWindowManagerStore();
    // Reset store state by setting screens to empty
    store.setState({ screens: [] });
  });
  
  it('should assign default position 30,30 for first window', () => {
    // Create a screen with size 800x600
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 800, height: 600 }
    });
    
    // Create first window without explicit position
    store.getState().createWindow({ type: 'test-window' }, 'screen-1');
    
    // Get the created window
    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const window = screen?.windows[0];
    
    // First window should be at position (30, 30)
    expect(window).toBeDefined();
    expect(window?.x).toBe(30);
    expect(window?.y).toBe(30);
  });
  
  it('should stagger position to 60,60 for second window', () => {
    // Create a screen
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 800, height: 600 }
    });
    
    // Create two windows
    store.getState().createWindow({ type: 'test-window-1' }, 'screen-1');
    store.getState().createWindow({ type: 'test-window-2' }, 'screen-1');
    
    // Get the second window
    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const secondWindow = screen?.windows[1];
    
    // Second window should be at position (60, 60)
    expect(secondWindow).toBeDefined();
    expect(secondWindow?.x).toBe(60);
    expect(secondWindow?.y).toBe(60);
  });
  
  it('should stagger position to 90,90 for third window', () => {
    // Create a screen
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 800, height: 600 }
    });
    
    // Create three windows
    store.getState().createWindow({ type: 'test-window-1' }, 'screen-1');
    store.getState().createWindow({ type: 'test-window-2' }, 'screen-1');
    store.getState().createWindow({ type: 'test-window-3' }, 'screen-1');
    
    // Get the third window
    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const thirdWindow = screen?.windows[2];
    
    // Third window should be at position (90, 90)
    expect(thirdWindow).toBeDefined();
    expect(thirdWindow?.x).toBe(90);
    expect(thirdWindow?.y).toBe(90);
  });
  
  it('should preserve explicitly provided x/y coordinates', () => {
    // Create a screen
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 800, height: 600 }
    });
    
    // Create window with explicit position
    store.getState().createWindow({ 
      type: 'test-window',
      x: 100,
      y: 200
    }, 'screen-1');
    
    // Get the created window
    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const window = screen?.windows[0];
    
    // Should preserve explicit coordinates
    expect(window).toBeDefined();
    expect(window?.x).toBe(100);
    expect(window?.y).toBe(200);
  });
  
  it('should clamp positions within screen boundaries', () => {
    // Create a small screen
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 100, height: 100 }
    });
    
    // Create many windows to exceed screen boundaries
    // With stagger of 30, after 3 windows we'd be at 90,90
    // After 4 windows we'd be at 120,120 which exceeds 100x100
    for (let i = 0; i < 5; i++) {
      store.getState().createWindow({ type: `test-window-${i}` }, 'screen-1');
    }
    
    // Get the last window
    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const lastWindow = screen?.windows[4];
    
    // Position should be clamped within screen boundaries
    expect(lastWindow).toBeDefined();
    expect(lastWindow?.x).toBeLessThanOrEqual(100);
    expect(lastWindow?.y).toBeLessThanOrEqual(100);
  });
});

describe('createWindow dimensions', () => {
  let store: ReturnType<typeof getWindowManagerStore>;

  beforeEach(() => {
    store = getWindowManagerStore();
    store.setState({ screens: [] });
  });

  it('should assign default width/height when no dimensions provided', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({ type: 'test-window' }, 'screen-1');

    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const window = screen?.windows[0];

    expect(window).toBeDefined();
    expect(window?.width).toBe(400);
    expect(window?.height).toBe(300);
  });

  it('should preserve explicit width/height when provided', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({
      type: 'test-window',
      width: 800,
      height: 600
    }, 'screen-1');

    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const window = screen?.windows[0];

    expect(window).toBeDefined();
    expect(window?.width).toBe(800);
    expect(window?.height).toBe(600);
  });
});

describe('setWindowState fullscreen transitions', () => {
  let store: ReturnType<typeof getWindowManagerStore>;

  beforeEach(() => {
    store = getWindowManagerStore();
    store.setState({ screens: [] });
  });

  it('should transition from Normal to Fullscreen', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({ type: 'test-window' }, 'screen-1');

    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const windowId = screen!.windows[0]!.id;

    expect(screen!.windows[0]!.state).toBe(WindowState.Normal);

    store.getState().setWindowState(windowId, WindowState.Fullscreen);

    const updatedScreen = store.getState().screens.find(s => s.id === 'screen-1');
    expect(updatedScreen!.windows[0]!.state).toBe(WindowState.Fullscreen);
  });

  it('should transition from Fullscreen back to Normal', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({ type: 'test-window' }, 'screen-1');

    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const windowId = screen!.windows[0]!.id;

    store.getState().setWindowState(windowId, WindowState.Fullscreen);
    store.getState().setWindowState(windowId, WindowState.Normal);

    const updatedScreen = store.getState().screens.find(s => s.id === 'screen-1');
    expect(updatedScreen!.windows[0]!.state).toBe(WindowState.Normal);
  });

  it('should save and restore geometry during fullscreen transitions', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({
      type: 'test-window',
      x: 100,
      y: 200,
      width: 640,
      height: 480
    }, 'screen-1');

    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const windowId = screen!.windows[0]!.id;

    const originalX = screen!.windows[0]!.x;
    const originalY = screen!.windows[0]!.y;
    const originalWidth = screen!.windows[0]!.width;
    const originalHeight = screen!.windows[0]!.height;

    store.getState().setWindowState(windowId, WindowState.Fullscreen);

    const fullscreenScreen = store.getState().screens.find(s => s.id === 'screen-1');
    expect(fullscreenScreen!.windows[0]!.x).toBe(0);
    expect(fullscreenScreen!.windows[0]!.y).toBe(0);
    expect(fullscreenScreen!.windows[0]!.width).toBe(1920);
    expect(fullscreenScreen!.windows[0]!.height).toBe(1080);

    store.getState().setWindowState(windowId, WindowState.Normal);

    const restoredScreen = store.getState().screens.find(s => s.id === 'screen-1');
    expect(restoredScreen!.windows[0]!.x).toBe(originalX);
    expect(restoredScreen!.windows[0]!.y).toBe(originalY);
    expect(restoredScreen!.windows[0]!.width).toBe(originalWidth);
    expect(restoredScreen!.windows[0]!.height).toBe(originalHeight);
  });

  it('should no-op when setting state on unknown window ID', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({ type: 'test-window' }, 'screen-1');

    const stateBefore = store.getState().screens;

    store.getState().setWindowState('non-existent-window-id', WindowState.Fullscreen);

    expect(store.getState().screens).toEqual(stateBefore);
  });

  it('should not affect other windows when changing one window state', () => {
    store.getState().createScreen({
      id: 'screen-1',
      bars: [],
      windows: [],
      size: { width: 1920, height: 1080 }
    });

    store.getState().createWindow({ type: 'test-window-1' }, 'screen-1');
    store.getState().createWindow({ type: 'test-window-2' }, 'screen-1');

    const screen = store.getState().screens.find(s => s.id === 'screen-1');
    const window1Id = screen!.windows[0]!.id;

    store.getState().setWindowState(window1Id, WindowState.Fullscreen);

    const updatedScreen = store.getState().screens.find(s => s.id === 'screen-1');
    expect(updatedScreen!.windows[0]!.state).toBe(WindowState.Fullscreen);
    expect(updatedScreen!.windows[1]!.state).toBe(WindowState.Normal);
  });
});
