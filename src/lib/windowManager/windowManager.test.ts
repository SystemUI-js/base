import { describe, it, expect, beforeEach } from 'vitest';
import { getWindowManagerStore, WindowListItem } from './index';

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
