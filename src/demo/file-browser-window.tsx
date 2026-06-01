import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Dirent } from '@system-ui-js/file-system-browser';
import fs, { registerPlugin, usePlugin } from '@system-ui-js/file-system-browser';
import { createMemoryStoragePlugin } from '@system-ui-js/file-system-plugin-memory';
import { CWindow, CWindowTitle, CButton } from '@system-ui-js/chameleon';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { WindowManagerState } from '../lib/windowManager';

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

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
}

interface FileBrowserWindowProps {
  title: string;
  id: string;
  store: UseBoundStore<StoreApi<WindowManagerState>>;
  screenId: string;
  windowProps: { title: string; id: string };
}

export const FileBrowserWindow = (props: FileBrowserWindowProps) => {
  const { screenId, windowProps, store, id, ...restProps } = props;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/memory');
  const [error, setError] = useState<string | null>(null);

  const closeWindow = useCallback(() => {
    store.getState().closeWindow(props.id);
  }, [props.id, store]);

  const refreshFileList = useCallback(async () => {
    try {
      setError(null);
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true }) as Dirent[];
      const fileList: FileItem[] = entries.map((entry: Dirent) => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: `${currentPath === '/' ? '' : currentPath}/${entry.name}`,
      }));
      setFiles(fileList);
    } catch (err) {
      console.error('Failed to read directory:', err);
      setError(`读取目录失败: ${(err as Error).message}`);
      setFiles([]);
    }
  }, [currentPath]);

  useEffect(() => {
    refreshFileList();
  }, [refreshFileList]);

  const createTxtFile = useCallback(async () => {
    try {
      setError(null);
      const timestamp = new Date().toLocaleString('zh-CN');
      const fileName = `新建文件_${Date.now()}.txt`;
      const filePath = `${currentPath}/${fileName}`;
      const content = `这是一个测试文件。\n创建时间: ${timestamp}\n\nHello, World! 这是文件浏览器的可行性验证。`;
      const encoder = new TextEncoder();
      
      await fs.promises.writeFile(filePath, encoder.encode(content));
      await refreshFileList();
    } catch (err) {
      console.error('Failed to create file:', err);
      setError(`创建文件失败: ${(err as Error).message}`);
    }
  }, [currentPath, refreshFileList]);

  const enterDirectory = useCallback((dirPath: string) => {
    setCurrentPath(dirPath);
  }, []);

  const goBack = useCallback(() => {
    if (currentPath === '/memory') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/memory';
    setCurrentPath(parentPath);
  }, [currentPath]);

  const deleteFile = useCallback(async (filePath: string) => {
    try {
      setError(null);
      await fs.promises.rm(filePath, { recursive: true, force: true });
      await refreshFileList();
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError(`删除失败: ${(err as Error).message}`);
    }
  }, [refreshFileList]);

  const formatSize = (type: string) => {
    return type === 'directory' ? '文件夹' : '文件';
  };

  return (
    <CWindow width={500} height={400} {...restProps}>
      <CWindowTitle
        actionButton={
          <div>
            <CButton compact showFocusEffect={false} onClick={createTxtFile}>
              新建TXT
            </CButton>
            <CButton compact showFocusEffect={false} onClick={closeWindow}>
              x
            </CButton>
          </div>
        }
      >
        {windowProps.title}
      </CWindowTitle>
      <div className="cm-window__body" style={{ padding: '8px', overflow: 'auto' }}>
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CButton compact onClick={goBack} disabled={currentPath === '/memory'}>
            ← 返回
          </CButton>
          <span style={{ fontSize: '12px', color: '#666' }}>
            当前路径: {currentPath}
          </span>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '8px', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ border: '1px solid #ccc', borderRadius: '4px', minHeight: '200px' }}>
          {files.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
              📭 目录为空
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file.path}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderBottom: '1px solid #eee',
                  cursor: file.type === 'directory' ? 'pointer' : 'default',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
                onClick={() => file.type === 'directory' && enterDirectory(file.path)}
              >
                <span style={{ marginRight: '8px' }}>
                  {file.type === 'directory' ? '📁' : '📄'}
                </span>
                <span style={{ flex: 1, fontSize: '12px' }}>{file.name}</span>
                <span style={{ fontSize: '10px', color: '#999', marginRight: '8px' }}>
                  {formatSize(file.type)}
                </span>
                <CButton
                  compact
                  showFocusEffect={false}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    deleteFile(file.path);
                  }}
                  style={{ fontSize: '10px', padding: '2px 4px' }}
                >
                  删除
                </CButton>
              </button>
            ))
          )}
        </div>

        <div style={{ marginTop: '8px' }}>
          <CButton compact onClick={refreshFileList}>
            刷新列表
          </CButton>
        </div>
      </div>
    </CWindow>
  );
};
