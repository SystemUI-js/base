import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import type { FileManagerDirent } from '../lib/fileManager/types';

const testEntries: FileManagerDirent[] = [
  { name: 'test.txt', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
  { name: 'docs', isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false },
];

vi.mock('@system-ui-js/file-system-browser', () => {
  // vi.mock 工厂被提升到顶部，内部不能引用外部变量
  const readdir = vi.fn<(...args: any[]) => Promise<FileManagerDirent[]>>()
    .mockResolvedValue([
      { name: 'test.txt', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
      { name: 'docs', isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false },
    ]);
  const rm = vi.fn().mockResolvedValue(undefined);
  const writeFile = vi.fn().mockResolvedValue(undefined);

  return {
    default: { promises: { readdir, rm, writeFile } },
    registerPlugin: vi.fn(),
    usePlugin: vi.fn(),
  };
});

vi.mock('@system-ui-js/file-system-plugin-memory', () => ({
  createMemoryStoragePlugin: {},
}));

import { FileBrowserWindow } from './file-browser-window';

// 重新导入被 mock 的模块，获取工厂内部创建的 mock 引用
const fsBrowserModule = await import('@system-ui-js/file-system-browser') as any;
const mockFs = fsBrowserModule.default as {
  promises: {
    readdir: ReturnType<typeof vi.fn>;
    rm: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
  };
};

function getItemButtons(): HTMLElement[] {
  const list = document.querySelector('.cm-list');
  if (!list) return [];
  return Array.from(list.querySelectorAll('li > div > button.cm-list__item-action'));
}

function makeProps() {
  const state = { windows: [], closeWindow: vi.fn() };
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
  });

  it('renders Back/Forward/Delete/Upload controls outside the FileManager list', async () => {
    render(<FileBrowserWindow {...makeProps()} />);

    await waitFor(() => {
      expect(getItemButtons().length).toBeGreaterThan(0);
    });

    const backBtn = screen.getByText('← 返回');
    const forwardBtn = screen.getByText('前进 →');
    const deleteBtn = screen.getByText('删除');
    const uploadBtn = screen.getByText('上传');

    expect(backBtn).toBeInTheDocument();
    expect(forwardBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();
    expect(uploadBtn).toBeInTheDocument();

    const listItems = getItemButtons();
    for (const btn of [backBtn, forwardBtn, deleteBtn, uploadBtn]) {
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
});
