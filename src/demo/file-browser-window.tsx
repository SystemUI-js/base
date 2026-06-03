import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import fs, { registerPlugin, usePlugin } from '@system-ui-js/file-system-browser';
import { createMemoryStoragePlugin } from '@system-ui-js/file-system-plugin-memory';
import { CWindow, CWindowTitle, CButton } from '@system-ui-js/chameleon';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { WindowManagerState } from '../lib/windowManager';
import FileManager from '../lib/fileManager';
import { joinPath } from '../lib/fileManager/path';

let fsInitialized = false;

function initFileSystem() {
  if (fsInitialized) return;

  try {
    registerPlugin('memory', createMemoryStoragePlugin);
  } catch {
    // ignore duplicate registration
  }

  try {
    // biome-ignore lint/correctness/useHookAtTopLevel: usePlugin is not a React hook
    usePlugin('memory', { mountPath: '/memory' });
    fsInitialized = true;
  } catch (error) {
    console.error('Failed to initialize file system:', error);
  }
}

initFileSystem();

interface FileBrowserWindowProps {
  title: string;
  id: string;
  store: UseBoundStore<StoreApi<WindowManagerState>>;
  screenId: string;
  windowProps: { title: string; id: string };
}

export const FileBrowserWindow = (props: FileBrowserWindowProps) => {
  const { screenId, windowProps, store, id, ...restProps } = props;
  const [currentPath, setCurrentPath] = useState('/memory');
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

  return (
    <CWindow width={500} height={400} {...restProps}>
      <CWindowTitle
        actionButton={
          <CButton showFocusEffect={false} onClick={closeWindow}>
            x
          </CButton>
        }
      >
        {windowProps.title}
      </CWindowTitle>
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
          root="/memory"
          currentPath={currentPath}
          onPathChange={handlePathChange}
          selectedPath={selectedPath}
          onSelectionChange={setSelectedPath}
          interactionMode="auto"
          refreshKey={refreshKey}
        />
      </div>
    </CWindow>
  );
};
