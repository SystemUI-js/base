import { useCallback, useEffect, useRef } from 'react';
import SystemComponent from '../lib/system';
import type { WindowManagerState } from '../lib/windowManager';
import { barComponentRegistry, BarPosition, generateId, getWindowManagerStore, windowContentRegistry } from '../lib/windowManager';
import type { StoreApi, UseBoundStore } from 'zustand';
import { CButton, CWindow, CWindowTitle, CStartBar } from '@system-ui-js/chameleon';
import { FileBrowserWindow } from './file-browser-window';
import './index.css';

interface DemoWindowContentProps {
  title: string;
  content: string;
  id: string;
  store: UseBoundStore<StoreApi<WindowManagerState>>;
  screenId: string;
  windowProps: { title: string; content: string; id: string };
}

export const DemoWindowContent = (props: DemoWindowContentProps) => {
  const { screenId, windowProps, store, id, ...restProps } = props;
  const closeWindow = useCallback(() => {
    store.getState().closeWindow(props.id);
  }, [props.id, store]);
  const createNewWindow = useCallback(() => {
    const newWindowId = generateId();
    store.getState().createWindow({
      id: newWindowId,
      type: 'demo-window',
      props: { title: `New Window ${newWindowId}`, content: 'This is a new window.', id: newWindowId, screenId: props.screenId },
    }, screenId);
  }, [screenId, props.screenId, store]);
  return (
    <CWindow width={400} height={300} {...restProps}>
      <CWindowTitle
        actionButton={
          <div>
            <CButton compact showFocusEffect={false} onClick={createNewWindow}>
              +
            </CButton>
            <CButton compact showFocusEffect={false} onClick={closeWindow}>
              x
            </CButton>
          </div>
        }
      >
        {windowProps.title}
      </CWindowTitle>
      <div className="cm-window__body">
        <h3>{windowProps.title}</h3>
        <p>{windowProps.content}</p>
      </div>
    </CWindow>
  );
};

function DemoBar(props: { store: UseBoundStore<StoreApi<WindowManagerState>>, screenId: string }) {
  const windows = props.store(state => {
    const screen = state.screens.find(s => s.id === props.screenId);
    return screen ? screen.windows : [];
  });
  return <CStartBar>{windows.map(w => {
    return <CButton key={w.id} active={w.active} onClick={() => props.store.getState().focusWindow(w.id)}>
      {(w.props.title as string) || 'Untitled Window'}
    </CButton>;
  })}</CStartBar>;
}

windowContentRegistry.set(
  'demo-window',
  DemoWindowContent,
);
windowContentRegistry.set(
  'file-browser-window',
  FileBrowserWindow,
);
barComponentRegistry.set(
  'demo-bar',
  DemoBar,
);

export function WindowsDesktopDemo() {
  const useWindowManagerStore = getWindowManagerStore();
  const createScreen = useWindowManagerStore(state => state.createScreen);
  const createWindow = useWindowManagerStore(state => state.createWindow);
  const createBar = useWindowManagerStore(state => state.createBar);
  const initialized = useRef(false);

  const createFileBrowserWindow = useCallback(() => {
    const screen = useWindowManagerStore.getState().screens[0];
    if (!screen) return;
    const newWindowId = generateId();
    createWindow({
      id: newWindowId,
      type: 'file-browser-window',
      props: { title: '文件浏览器', id: newWindowId },
    }, screen.id);
  }, [createWindow, useWindowManagerStore]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const screenId = generateId();
      createScreen({
        bars: [],
        windows: [],
        size: { width: 800, height: 600 },
        id: screenId,
      });
      const windowId = generateId();
      createWindow({
        id: windowId,
        type: 'demo-window',
        props: { title: 'Demo Window', content: 'This is a demo window.' },
      }, screenId);
      const barId = generateId();
      createBar(
        {
          id: barId,
          type: 'demo-bar',
          props: {},
          position: BarPosition.Bottom,
        },
        screenId,
      );
    }
  }, [createScreen, createWindow, createBar]);

  return (
    <>
      <SystemComponent windowManager={useWindowManagerStore} className="demo-system" />
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        <CButton onClick={createFileBrowserWindow}>
          打开文件浏览器
        </CButton>
      </div>
    </>
  );
}
