import './styles/base.css';

export { default as FileManager } from './fileManager';

export {
  clampToRoot,
  getParentPath,
  joinPath,
  normalizePath,
} from './fileManager/path';

export type {
  FileManagerDirent,
  FileManagerInteractionMode,
  FileManagerProps,
  FileSystemLike,
} from './fileManager/types';

export { default as SystemComponent } from './system';

export {
  BarPosition,
  WindowState,
  barComponentRegistry,
  generateId,
  getWindowManagerStore,
  windowContentRegistry,
} from './windowManager';

export type {
  BarListItem,
  ScreenListItem,
  WindowListItem,
  WindowManagerState,
} from './windowManager';
