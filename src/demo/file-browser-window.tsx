import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import fs, { registerPlugin, usePlugin } from '@system-ui-js/file-system-browser';
import type { FsPluginFactory } from '@system-ui-js/file-system-browser';
import { CWindow, CWindowTitle, CButton } from '@system-ui-js/chameleon';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { WindowManagerState } from '../lib/windowManager';
import FileManager from '../lib/fileManager';
import type { FileManagerMoveError, FileManagerMoveContext } from '../lib/fileManager/types';
import { joinPath } from '../lib/fileManager/path';

const createIndexedDBPlugin: FsPluginFactory = (_options, ctx) => {
  return {
    match: /^/,
    /* eslint-disable @typescript-eslint/unbound-method -- handler methods are passed as references for plugin registration */
    handlers: {
      readFile: ctx.baseFs.readFile,
      writeFile: ctx.baseFs.writeFile,
      appendFile: ctx.baseFs.appendFile,
      rename: ctx.baseFs.rename,
      copyFile: ctx.baseFs.copyFile,
      mkdir: ctx.baseFs.mkdir,
      readdir: ctx.baseFs.readdir,
      rm: ctx.baseFs.rm,
      unlink: ctx.baseFs.unlink,
      rmdir: ctx.baseFs.rmdir,
      stat: ctx.baseFs.stat,
      lstat: ctx.baseFs.lstat,
      readlink: ctx.baseFs.readlink,
      symlink: ctx.baseFs.symlink,
      link: ctx.baseFs.link,
      exists: ctx.baseFs.exists,
      access: ctx.baseFs.access,
      nlink: ctx.baseFs.nlink,
      open: ctx.baseFs.open,
      read: ctx.baseFs.read,
      write: ctx.baseFs.write,
      close: ctx.baseFs.close,
      requestPersistentStorage: ctx.baseFs.requestPersistentStorage,
      diskUsage: ctx.baseFs.diskUsage,
    },
    /* eslint-enable @typescript-eslint/unbound-method */
  };
};

registerPlugin('indexeddb', createIndexedDBPlugin);

interface FileBrowserWindowProps {
  title: string;
  id: string;
  store: UseBoundStore<StoreApi<WindowManagerState>>;
  screenId: string;
  windowProps: { title: string; id: string };
  fullscreen?: boolean;
  resizable?: boolean;
  movable?: boolean;
  active?: boolean;
  style?: React.CSSProperties;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  onPointerDown?: () => void;
  'data-system-ui-fullscreen'?: 'true';
}

// Bypasses Chameleon's isWindowTitleElement clone injection to prevent move callbacks in fullscreen.
const StaticWindowTitle = (props: React.ComponentProps<typeof CWindowTitle>) => <CWindowTitle {...props} />;

export const FileBrowserWindow = (props: FileBrowserWindowProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { windowProps, store, fullscreen: isFullscreen, resizable, movable, screenId: _screenId, ...windowRestProps } = props;
  const effectiveResizable = isFullscreen ? false : resizable;
  const effectiveMovable = isFullscreen ? false : movable !== false;
  const TitleComponent = effectiveMovable ? CWindowTitle : StaticWindowTitle;
  
  usePlugin('indexeddb', { mountPath: '/' });
  
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [backStack, setBackStack] = useState<string[]>([]);
  const [forwardStack, setForwardStack] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeWindow = useCallback(() => {
    store.getState().closeWindow(props.id);
  }, [props.id, store]);

  const handlePathChange = useCallback(
    (newPath: string) => {
      setBackStack((prev) => [...prev, currentPath]);
      setForwardStack([]);
      setCurrentPath(newPath);
      setSelectedPath(null);
    },
    [currentPath]
  );

  const goBack = useCallback(() => {
    if (backStack.length === 0) return;
    const prevPath = backStack[backStack.length - 1]!;
    const newBackStack = backStack.slice(0, -1);
    setBackStack(newBackStack);
    setForwardStack((prev) => [...prev, currentPath]);
    setCurrentPath(prevPath);
    setSelectedPath(null);
  }, [backStack, currentPath]);

  const goForward = useCallback(() => {
    if (forwardStack.length === 0) return;
    const nextPath = forwardStack[forwardStack.length - 1]!;
    const newForwardStack = forwardStack.slice(0, -1);
    setForwardStack(newForwardStack);
    setBackStack((prev) => [...prev, currentPath]);
    setCurrentPath(nextPath);
    setSelectedPath(null);
  }, [forwardStack, currentPath]);

  const handleDelete = useCallback(async () => {
    if (!selectedPath) return;
    try {
      setError(null);
      await fs.promises.rm(selectedPath, { recursive: true, force: true });
      setSelectedPath(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to delete:', err);
      setError(`删除失败: ${(err as Error).message}`);
    }
  }, [selectedPath]);

  const handleNewFolder = useCallback(async () => {
    const folderName = prompt('请输入新文件夹名称:');
    if (!folderName) return;
    try {
      setError(null);
      const newPath = joinPath(currentPath, folderName);
      await fs.promises.mkdir(newPath, { recursive: true });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError(`创建文件夹失败: ${(err as Error).message}`);
    }
  }, [currentPath]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      try {
        setError(null);
        for (const file of Array.from(files)) {
          const targetPath = joinPath(currentPath, file.name);
          const buffer = new Uint8Array(await file.arrayBuffer());
          await fs.promises.writeFile(targetPath, buffer);
        }
        setRefreshKey((k) => k + 1);
      } catch (err) {
        console.error('Failed to upload file:', err);
        setError(`上传失败: ${(err as Error).message}`);
      } finally {
        // reset input so the same file can be selected again
        e.target.value = '';
      }
    },
    [currentPath]
  );

  const handleMoveError = useCallback(
    (error: FileManagerMoveError, _context: FileManagerMoveContext) => {
      console.error('Failed to move:', error);
      setError(`移动失败: ${error.message}`);
    },
    []
  );

  const handleMoveSuccess = useCallback(
    (_context: FileManagerMoveContext) => {
      setError(null);
    },
    []
  );

  return (
    <CWindow width={500} height={400} {...windowRestProps} resizable={effectiveResizable}>
      <TitleComponent
        actionButton={
          <>
            <CButton showFocusEffect={false} onClick={closeWindow} aria-label="关闭">
              x
            </CButton>
          </>
        }
      >
        {windowProps.title}
      </TitleComponent>
      <div className="cm-window__body" style={{ padding: '8px', overflow: 'auto' }}>
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CButton onClick={goBack} disabled={backStack.length === 0}>
            ← 返回
          </CButton>
          <CButton onClick={goForward} disabled={forwardStack.length === 0}>
            前进 →
          </CButton>
          <CButton onClick={() => { void handleDelete(); }} disabled={!selectedPath}>
            删除
          </CButton>
          <CButton onClick={() => { void handleNewFolder(); }}>
            新建文件夹
          </CButton>
          <CButton onClick={handleUploadClick}>上传</CButton>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => { void handleFileChange(e); }}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            当前路径: {currentPath}
          </span>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '8px', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <FileManager
          fileSystem={fs}
          root="/"
          currentPath={currentPath}
          onPathChange={handlePathChange}
          selectedPath={selectedPath}
          onSelectionChange={setSelectedPath}
          interactionMode="auto"
          refreshKey={refreshKey}
          draggable={true}
          onMoveError={handleMoveError}
          onMoveSuccess={handleMoveSuccess}
        />
      </div>
    </CWindow>
  );
};
