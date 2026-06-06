import React from 'react';
import { create } from 'zustand'

export enum BarPosition {
    Top = 0,
    Bottom = 1,
    Left = 2,
    Right = 3
}

export interface BarListItem {
    props: Record<string, unknown>;
    type: string;
    position: BarPosition;
    id: string;
}

export interface ScreenListItem {
    bars: BarListItem[];
    windows: WindowListItem[];
    size: { width: number; height: number };
    id: string;
}

export enum WindowState {
    Minimized = 'minimized',
    Maximized = 'maximized',
    Normal = 'normal',
    Fullscreen = 'fullscreen'
}

export interface WindowListItem {
    zIndex: number;
    alwaysOnTop: boolean;
    state: WindowState;
    id: string;
    props: Record<string, unknown>;
    type: string;
    active: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    savedGeometry?: { x: number; y: number; width: number; height: number };
}

export interface WindowManagerState {
    screens: ScreenListItem[];
    createWindow: (window: Partial<WindowListItem>, screen: string) => void;
    createScreen: (screen: ScreenListItem) => void;
    closeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    createBar: (bar: BarListItem, screen: string) => void;
    setWindowState: (windowId: string, state: WindowState) => void;
}

let idCounter = 0;



export function generateId() {
    return `system-ui-js-window-${idCounter++}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const windowContentRegistry: Map<string, React.ComponentType<any>> = new Map();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const barComponentRegistry: Map<string, React.ComponentType<any>> = new Map();

const windowManagerStore = create<WindowManagerState>()(((set, get) => ({
    screens: [],
    createBar: (bar: BarListItem, screen: string) => set((state) => {
        const newBar = { ...bar, id: bar.id || generateId() };
        const screenIndex = state.screens.findIndex(s => s.id === screen);
        if (screenIndex === -1) {
            console.warn('Screen not found for bar creation');
            return state;
        }
        const updatedScreens = [...state.screens];
        updatedScreens[screenIndex]!.bars[bar.position] = newBar;
        return {
            ...state,
            screens: updatedScreens
        };
    }),
    createWindow: (window: Partial<WindowListItem>, screen: string) => {
        const BASE_OFFSET = 30;
        const STAGGER_OFFSET = 30;
        const DEFAULT_WIDTH = 400;
        const DEFAULT_HEIGHT = 300;

        const screenIndex = get().screens.findIndex(s => s.id === screen);
        if (screenIndex === -1) {
            console.warn('Screen not found for window creation');
            return;
        }

        const targetScreen = get().screens[screenIndex];
        const screenWidth = targetScreen?.size.width ?? DEFAULT_WIDTH;
        const screenHeight = targetScreen?.size.height ?? DEFAULT_HEIGHT;
        const windowsOnScreen = targetScreen?.windows.length ?? 0;

        const calculatedX = BASE_OFFSET + (windowsOnScreen * STAGGER_OFFSET);
        const calculatedY = BASE_OFFSET + (windowsOnScreen * STAGGER_OFFSET);

        const clampedX = Math.max(0, Math.min(calculatedX, screenWidth - DEFAULT_WIDTH));
        const clampedY = Math.max(0, Math.min(calculatedY, screenHeight - DEFAULT_HEIGHT));

        const finalX = window.x ?? clampedX;
        const finalY = window.y ?? clampedY;

        const newWindow = {
            ...window,
            id: window.id || generateId(),
            zIndex: window.zIndex || 1,
            active: false,
            alwaysOnTop: window.alwaysOnTop || false,
            state: window.state || WindowState.Normal,
            props: window.props || {},
            type: window.type || '',
            x: finalX,
            y: finalY,
            width: window.width ?? DEFAULT_WIDTH,
            height: window.height ?? DEFAULT_HEIGHT
        };

        console.log('Creating window:', newWindow, 'on screen:', screen);
        const updatedScreens = [...get().screens];
        updatedScreens[screenIndex]?.windows.push(newWindow);
        set({
            screens: updatedScreens
        });
        get().focusWindow(newWindow.id);
    },
    closeWindow: (windowId: string) => set((state) => {
        const updatedScreens = state.screens.map(screen => ({
            ...screen,
            windows: screen.windows.filter(w => w.id !== windowId)
        }));
        return {
            ...state,
            screens: updatedScreens
        };
    }),
    createScreen: (screen: ScreenListItem) => set((state) => {
        const newScreen = { ...screen, id: screen.id || generateId() };
        return {
            ...state,
            screens: [...state.screens, newScreen]
        };
    }),
    focusWindow: (windowId: string) => set((state) => {
        const maxZIndex = Math.max(...state.screens.flatMap(s => s.windows.map(w => w.zIndex)), 0);
        console.log('Focusing window:', windowId, maxZIndex);
        const updatedScreens = state.screens.map(screen => ({
            ...screen,
            windows: screen.windows.map(w => {
                if (w.id === windowId) {
                    w.active = true;
                    return { ...w, zIndex: maxZIndex + 1 };
                } else {
                    w.active = false;
                    return w;
                }
            })
        }));
        return {
            ...state,
            screens: updatedScreens
        };
    }),
    setWindowState: (windowId: string, state: WindowState) => set((prev) => {
        const updatedScreens = prev.screens.map(screen => ({
            ...screen,
            windows: screen.windows.map(window => {
                if (window.id !== windowId) return window;

                if (state === WindowState.Fullscreen) {
                    // 保存当前几何信息，然后切换到全屏（占满整个屏幕）
                    return {
                        ...window,
                        state,
                        x: 0,
                        y: 0,
                        width: screen.size.width,
                        height: screen.size.height,
                        savedGeometry: {
                            x: window.x,
                            y: window.y,
                            width: window.width,
                            height: window.height
                        }
                    };
                } else if (state === WindowState.Normal && window.savedGeometry) {
                    // 恢复之前保存的几何信息
                    const { savedGeometry, ...rest } = window;
                    return {
                        ...rest,
                        state,
                        x: savedGeometry.x,
                        y: savedGeometry.y,
                        width: savedGeometry.width,
                        height: savedGeometry.height
                    };
                }

                return { ...window, state };
            })
        }));
        return {
            ...prev,
            screens: updatedScreens
        };
    }),
})));

export const getWindowManagerStore = () => windowManagerStore;
