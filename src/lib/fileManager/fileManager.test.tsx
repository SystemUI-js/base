/**
 * FileManager 组件测试
 *
 * 覆盖：渲染顺序、dotfiles、选中、鼠标双击、触摸二次点击、
 * auto 模式、错误态、root clamp、refreshKey、防竞态、加载态、空态
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FileManager from './index'
import type { FileManagerDirent } from './types'

/** 创建 mock 目录项 */
function mkEntry(name: string, isDir: boolean): FileManagerDirent {
  return {
    name,
    isDirectory: () => isDir,
    isFile: () => !isDir,
    isSymbolicLink: () => false,
  }
}

/** 创建 mock 文件系统 */
function createMockFs(entries: FileManagerDirent[]) {
  return {
    promises: {
      readdir: vi.fn().mockResolvedValue(entries),
    },
  }
}

/** 创建可手动 resolve 的 Promise（避免非空断言） */
function createDeferred<T>() {
  let resolve!: (v: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

/** 获取 CList 渲染的列表项按钮（li > button） */
function getItemButtons(): HTMLElement[] {
  const list = document.querySelector('.cm-list')
  if (!list) return []
  return Array.from(list.querySelectorAll('li > div > button.cm-list__item-action'))
}

describe('FileManager', () => {
  it('renders entries in exact readdir order including dotfiles', async () => {
    const entries = [
      mkEntry('b.txt', false),
      mkEntry('.env', false),
      mkEntry('docs', true),
    ]
    const fs = createMockFs(entries)
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
      />
    )

    await waitFor(() => {
      const buttons = getItemButtons()
      expect(buttons).toHaveLength(3)
    })

    const buttons = getItemButtons()
    expect(buttons[0]).toHaveTextContent('b.txt')
    expect(buttons[1]).toHaveTextContent('.env')
    expect(buttons[2]).toHaveTextContent('docs')
  })

  it('click selects file and calls onSelectionChange', async () => {
    const entries = [mkEntry('file.txt', false), mkEntry('dir', true)]
    const fs = createMockFs(entries)
    const onSelectionChange = vi.fn()
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        onSelectionChange={onSelectionChange}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    // 点击第一个文件
    await act(async () => {
      fireEvent.click(getItemButtons()[0])
    })

    expect(onSelectionChange).toHaveBeenCalledWith('/file.txt')
  })

  it('mouse double-click on directory calls onPathChange', async () => {
    const entries = [mkEntry('folder', true)]
    const fs = createMockFs(entries)
    const onPathChange = vi.fn()
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={onPathChange}
        interactionMode="mouse"
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(1)
    })

    // 双击 li 元素（CList 在 li 上绑定 onDoubleClick）
    const li = getItemButtons()[0].closest('li')
    expect(li).not.toBeNull()
    await act(async () => {
      fireEvent.doubleClick(li as HTMLElement)
    })

    expect(onPathChange).toHaveBeenCalledWith('/folder')
  })

  it('touch mode: first click selects, second click on selected directory opens', async () => {
    const entries = [mkEntry('folder', true)]
    const fs = createMockFs(entries)
    const onSelectionChange = vi.fn()
    const onPathChange = vi.fn()
    const { rerender } = render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={onPathChange}
        onSelectionChange={onSelectionChange}
        interactionMode="touch"
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(1)
    })

    const button = getItemButtons()[0]

    // 第一次点击：选中
    await act(async () => {
      fireEvent.click(button)
    })
    expect(onSelectionChange).toHaveBeenCalledWith('/folder')
    expect(onPathChange).not.toHaveBeenCalled()

    // 更新 selectedPath 以反映选中态
    rerender(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={onPathChange}
        onSelectionChange={onSelectionChange}
        interactionMode="touch"
        selectedPath="/folder"
      />
    )

    // 第二次点击：打开目录
    await act(async () => {
      fireEvent.click(getItemButtons()[0])
    })
    expect(onPathChange).toHaveBeenCalledWith('/folder')
  })

  it('auto mode with mouse pointerType behaves like mouse (no open on click)', async () => {
    const entries = [mkEntry('folder', true)]
    const fs = createMockFs(entries)
    const onSelectionChange = vi.fn()
    const onPathChange = vi.fn()
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={onPathChange}
        onSelectionChange={onSelectionChange}
        interactionMode="auto"
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(1)
    })

    const button = getItemButtons()[0]

    // 鼠标单击在 auto 模式下只选中，不打开目录
    await act(async () => {
      fireEvent.click(button)
    })
    expect(onSelectionChange).toHaveBeenCalledWith('/folder')
    expect(onPathChange).not.toHaveBeenCalled()
  })

  it('shows error message when readdir fails', async () => {
    const fs = {
      promises: {
        readdir: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    }
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/protected"
        onPathChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Permission denied')).toBeInTheDocument()
    })
  })

  it('clamps attempted navigation outside root', async () => {
    // 验证组件传入的 fileSystem 收到的是 clamp 后的路径
    const entries = [mkEntry('safe.txt', false)]
    const fs = createMockFs(entries)
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/root/../../etc"
        onPathChange={vi.fn()}
        root="/root"
      />
    )

    // clampToRoot 应将路径限制在 /root 内
    await waitFor(() => {
      expect(fs.promises.readdir).toHaveBeenCalled()
    })

    const calledPath = fs.promises.readdir.mock.calls[0][0]
    expect(calledPath.startsWith('/root')).toBe(true)
  })

  it('refreshKey change triggers re-read', async () => {
    const entries1 = [mkEntry('a.txt', false)]
    const entries2 = [mkEntry('a.txt', false), mkEntry('b.txt', false)]
    const fs = {
      promises: {
        readdir: vi.fn()
          .mockResolvedValueOnce(entries1)
          .mockResolvedValueOnce(entries2),
      },
    }

    const { rerender } = render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        refreshKey={1}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(1)
    })

    // 更改 refreshKey 触发重新读取
    await act(async () => {
      rerender(
        <FileManager
          fileSystem={fs}
          currentPath="/"
          onPathChange={vi.fn()}
          refreshKey={2}
        />
      )
    })

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    expect(fs.promises.readdir).toHaveBeenCalledTimes(2)
  })

  it('stale request protection - old request does not overwrite newer path', async () => {
    const deferred = createDeferred<FileManagerDirent[]>()
    const fs = {
      promises: {
        readdir: vi.fn()
          .mockReturnValueOnce(deferred.promise)
          .mockResolvedValueOnce([mkEntry('new.txt', false)]),
      },
    }

    const { rerender } = render(
      <FileManager
        fileSystem={fs}
        currentPath="/old"
        onPathChange={vi.fn()}
      />
    )

    // 切换到新路径（触发第二次 readdir）
    await act(async () => {
      rerender(
        <FileManager
          fileSystem={fs}
          currentPath="/new"
          onPathChange={vi.fn()}
        />
      )
    })

    // 第二次请求的结果应该显示
    await waitFor(() => {
      const buttons = getItemButtons()
      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveTextContent('new.txt')
    })

    // 现在让第一次的慢请求返回
    await act(async () => {
      deferred.resolve([mkEntry('old.txt', false)])
    })

    // 应该仍然显示新路径的内容，旧请求结果被丢弃
    const buttons = getItemButtons()
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveTextContent('new.txt')
  })

  it('shows loading state while fetching', async () => {
    const deferred = createDeferred<FileManagerDirent[]>()
    const fs = {
      promises: {
        readdir: vi.fn().mockReturnValue(deferred.promise),
      },
    }

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
      />
    )

    expect(screen.getByText('加载中...')).toBeInTheDocument()

    await act(async () => {
      deferred.resolve([mkEntry('file.txt', false)])
    })

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    })
  })

  it('shows empty state when directory is empty', async () => {
    const fs = createMockFs([])
    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('目录为空')).toBeInTheDocument()
    })
  })
})
