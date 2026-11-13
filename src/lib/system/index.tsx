import React from 'react';
import { WindowManagerState } from '../windowManager';
import ScreenComponent from '../screen';
import { StoreApi, UseBoundStore } from 'zustand';

interface Props {
  windowManager: UseBoundStore<StoreApi<WindowManagerState>>;
  className?: string;
  style?: React.CSSProperties;
}

export default function SystemComponent(props: Props) {
  const screens = props.windowManager(state => state.screens);
  return (
    <div className={`system-ui-js__system ${props.className || ''}`} style={props.style}>
      {screens.map(screen => (
        <ScreenComponent key={screen.id} screenId={screen.id} windowManager={props.windowManager} />
      ))}
    </div>
  );
}
