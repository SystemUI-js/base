import './styles/base.css';

export {
  windowContentRegistry,
  barComponentRegistry,
  getWindowManagerStore,
  generateId,
  BarPosition,
  WindowState,
} from './windowManager';

export type {
  WindowManagerState,
  WindowListItem,
  ScreenListItem,
  BarListItem,
} from './windowManager';

export { default as SystemComponent } from './system';
