import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import type { FileManagerDirent } from '../lib/fileManager/types';

const testEntries: FileManagerDirent[] = [
  { name: 'test.txt', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
  { name: 'docs', isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false },
];

vi.mock('@system-ui-js/file-system-browser', () => {
  const readdir = vi.fn<(...args: any[]) => Promise<FileManagerDirent[]>>()
    .mockResolvedValue([
      { name: 'test.txt', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
      { name: 'docs', isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false },
    ]);
  const rm = vi.fn().mockResolvedValue(undefined);
  const writeFile = vi.fn().mockResolvedValue(undefined);
  const mkdir = vi.fn().mockResolvedValue(undefined);
  const rename = vi.fn().mockResolvedValue(undefined);
  const exists = vi.fn().mockResolvedValue(false);

  return {
    default: { promises: { readdir, rm, writeFile, mkdir, rename, exists } },
    registerPlugin: vi.fn(),
    usePlugin: vi.fn(),
  };
});

import { FileBrowserWindow } from './file-browser-window';

// 重新导入被 mock 的模块，获取工厂内部创建的 mock 引用
const fsBrowserModule = await import('@system-ui-js/file-system-browser') as any;
const mockFs = fsBrowserModule.default as {
  promises: {
    readdir: ReturnType<typeof vi.fn>;
    rm: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
    mkdir: ReturnType<typeof vi.fn>;
    rename: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
  };
};

function getItemButtons(): HTMLElement[] {
  const list = document.querySelector('.cm-list');
  if (!list) return [];
  return Array.from(list.querySelectorAll('li > div > button.cm-list__item-action'));
}

function makeProps() {
  const state = { windows: [], closeWindow: vi.fn(), setWindowState: vi.fn() };
  const store = {
    getState: () => state,
    setState: () => {},
    subscribe: () => () => {},
    getInitialState: () => state,
  } as any;

  return {
    title: '文件浏览器',
    id: 'fb-1',
    store,
    screenId: 'screen-1',
    windowProps: { title: '文件浏览器', id: 'fb-1' },
  };
}

describe('FileBrowserWindow external controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.promises.readdir.mockResolvedValue(testEntries);
    mockFs.promises.rm.mockResolvedValue(undefined);
    mockFs.promises.writeFile.mockResolvedValue(undefined);
    mockFs.promises.rename.mockResolvedValue(undefined);
    mockFs.promises.exists.mockResolvedValue(false);
  });

  it('renders Back/Forward/Delete/New Folder/Upload controls outside the FileManager list', async () => {
    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons().length).toBeGreaterThan(0);
    });

    const backBtn = screen.getByText('← 返回');
    const forwardBtn = screen.getByText('前进 →');
    const deleteBtn = screen.getByText('删除');
    const newFolderBtn = screen.getByText('新建文件夹');
    const uploadBtn = screen.getByText('上传');

    expect(backBtn).toBeInTheDocument();
    expect(forwardBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();
    expect(newFolderBtn).toBeInTheDocument();
    expect(uploadBtn).toBeInTheDocument();

    const listItems = getItemButtons();
    for (const btn of [backBtn, forwardBtn, deleteBtn, newFolderBtn, uploadBtn]) {
      expect(listItems).not.toContain(btn);
    }
  });

  it('Back and Forward buttons are disabled initially (empty history)', async () => {
    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons().length).toBeGreaterThan(0);
    });

    const backBtn = screen.getByText('← 返回');
    const forwardBtn = screen.getByText('前进 →');

    expect(backBtn).toBeDisabled();
    expect(forwardBtn).toBeDisabled();
  });

  it('Delete button is disabled when no file is selected', async () => {
    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons().length).toBeGreaterThan(0);
    });

    const deleteBtn = screen.getByText('删除');
    expect(deleteBtn).toBeDisabled();
  });

  it('Delete button becomes enabled after selecting a file, and deletion refreshes list', async () => {
    const afterDeleteEntries: FileManagerDirent[] = [
      { name: 'docs', isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false },
    ];
    mockFs.promises.readdir
      .mockResolvedValueOnce(testEntries)
      .mockResolvedValueOnce(afterDeleteEntries);

    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2);
    });

    const deleteBtn = screen.getByText('删除');
    expect(deleteBtn).toBeDisabled();

    await act(async () => {
      fireEvent.click(getItemButtons()[0]);
    });

    expect(deleteBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    await waitFor(() => {
      expect(mockFs.promises.rm).toHaveBeenCalledWith(
        expect.stringContaining('test.txt'),
        { recursive: true, force: true },
      );
    });

    await waitFor(() => {
      const items = getItemButtons();
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('docs');
    });
  });

  it('Upload button triggers hidden file input click', async () => {
    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons().length).toBeGreaterThan(0);
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    expect(fileInput.style.display).toBe('none');

    const clickSpy = vi.spyOn(fileInput, 'click');

    const uploadBtn = screen.getByText('上传');
    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it('file upload writes to current directory and refreshes list', async () => {
    const afterUploadEntries: FileManagerDirent[] = [
      ...testEntries,
      { name: 'photo.jpg', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
    ];
    mockFs.promises.readdir
      .mockResolvedValueOnce(testEntries)
      .mockResolvedValueOnce(afterUploadEntries);

    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2);
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const mockFile = new File(['hello'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      configurable: true,
    });

    await act(async () => {
      fireEvent.change(fileInput);
    });

    await waitFor(() => {
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('photo.jpg'),
        expect.any(Uint8Array),
      );
    });

    await waitFor(() => {
      const items = getItemButtons();
      expect(items).toHaveLength(3);
      expect(items[2]).toHaveTextContent('photo.jpg');
    });
  });

  /** FileManagerEntry 对象工厂，用于拖拽 payload */
  function mkDragEntry(name: string, path: string, isDir: boolean) {
    return {
      name,
      path,
      isDirectory: () => isDir,
      isFile: () => !isDir,
      isSymbolicLink: () => false,
    };
  }

  /**
   * CList 不转发 onItemDragInto 到 DOM，需通过 React fiber 树向上遍历获取。
   * 参见 T7: src/lib/fileManager/fileManager.test.tsx
   */
  function getCListDragIntoHandler() {
    const clistEl = document.querySelector('.cm-list');
    if (!clistEl) throw new Error('CList not rendered — .cm-list not found');

    const fiberKey = Object.keys(clistEl).find((k) => k.startsWith('__reactFiber$'));
    if (!fiberKey) throw new Error('React fiber key not found on .cm-list element');

    let fiber = (clistEl as any)[fiberKey];
    while (fiber) {
      if (typeof fiber.memoizedProps?.onItemDragInto === 'function') {
        return fiber.memoizedProps.onItemDragInto as (
          payload: {
            source: { item: ReturnType<typeof mkDragEntry>; key: string; index: number };
            target: { item: ReturnType<typeof mkDragEntry>; key: string; index: number };
            position: 'inside';
            input: string;
          }
        ) => void;
      }
      fiber = fiber.return;
    }
    throw new Error('onItemDragInto not found in React fiber tree above .cm-list');
  }

  it('move error propagates to outer Demo error state without internal buttons', async () => {
    mockFs.promises.rename.mockRejectedValueOnce(new Error('disk full'));

    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons().length).toBeGreaterThan(0);
    });

    // Given: 通过 fiber 树拿到 CList 的 onItemDragInto 回调
    const handler = getCListDragIntoHandler();

    // When: 拖拽 test.txt 到 docs 文件夹，rename 拒绝
    await act(async () => {
      await handler({
        source: { item: mkDragEntry('test.txt', '/test.txt', false), key: '/test.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      });
    });

    // Then: 错误信息显示在 Demo 外层（FileManager 列表外部）
    await waitFor(() => {
      expect(screen.getByText(/移动失败/)).toBeInTheDocument();
    });

    const errorEl = screen.getByText(/移动失败/);
    const list = document.querySelector('.cm-list');
    expect(list).not.toBeNull();
    expect(list!.contains(errorEl)).toBe(false);
  });
});
