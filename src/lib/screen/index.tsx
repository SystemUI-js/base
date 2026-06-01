import React from "react";
import {
  barComponentRegistry,
  windowContentRegistry,
  WindowManagerState,
} from '../windowManager';
import { StoreApi, UseBoundStore } from "zustand";
import "./index.css";

interface Props {
  screenId: string;
  windowManager: UseBoundStore<StoreApi<WindowManagerState>>;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScreenComponent(props: Props) {
    const bars = props.windowManager(state => {
        const screen = state.screens.find(s => s.id === props.screenId);
        return screen ? screen.bars : [];
    });
    const windows = props.windowManager(state => {
        const screen = state.screens.find(s => s.id === props.screenId);
        return screen ? screen.windows : [];
    });
    return (
      <div className={`system-ui-js__screen ${props.className || ''}`} style={props.style}>
        {bars.map((bar) => {
          const BarComponent: React.ComponentType<Record<string, unknown>> | null =
            barComponentRegistry.get(bar.type) || null;
          return (
            BarComponent && (
              <BarComponent key={bar.id} id={bar.id} screenId={props.screenId} store={props.windowManager} barProps={bar.props} />
            )
          );
        })}
        {windows.map((window) => {
          console.log(window.zIndex);
          const WindowComponent = windowContentRegistry.get(window.type) || null;
          return (
            WindowComponent && (
              <WindowComponent
                key={window.id}
                id={window.id}
                screenId={props.screenId}
                active={window.active}
                store={props.windowManager}
                style={{ zIndex: window.zIndex }}
                windowProps={window.props}
                onPointerDown={() => props.windowManager.getState().focusWindow(window.id)}
                x={window.x}
                y={window.y}
              />
            )
          );
        })}
      </div>
    );
}
