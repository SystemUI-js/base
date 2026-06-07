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

/** 创建 mock 文件系统，可选传入 rename/exists mock */
function createMockFs(
  entries: FileManagerDirent[],
  options?: { rename?: ReturnType<typeof vi.fn>; exists?: ReturnType<typeof vi.fn> }
) {
  return {
    promises: {
      readdir: vi.fn().mockResolvedValue(entries),
      rename: options?.rename ?? vi.fn().mockResolvedValue(undefined),
      exists: options?.exists,
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

  // ============================================================
  // Render contract tests
  // ============================================================

  it('renderItem receives displayMode sizeRatio entryInfo index', async () => {
    const entries = [mkEntry('file.txt', false), mkEntry('docs', true)]
    const fs = createMockFs(entries)
    const renderItem = vi.fn().mockReturnValue(null)

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        displayMode="icon"
        sizeRatio={0.5}
        renderItem={renderItem}
      />
    )

    await waitFor(() => {
      expect(renderItem).toHaveBeenCalled()
    })

    // 第一次调用参数：(displayMode, effectiveSizeRatio, entryInfo, index)
    const [displayMode, sizeRatio, entryInfo, index] = renderItem.mock.calls[0]

    expect(displayMode).toBe('icon')
    expect(sizeRatio).toBe(0.5)
    expect(index).toBe(0)
    // entryInfo 是普通对象，isDirectory 是 boolean 而非函数
    expect(entryInfo).toEqual(
      expect.objectContaining({
        name: 'file.txt',
        path: '/file.txt',
        isDirectory: false,
      })
    )
    expect(typeof entryInfo.isDirectory).toBe('boolean')

    // 第二项是 docs 目录
    const [, , entryInfo2, index2] = renderItem.mock.calls[1]
    expect(entryInfo2.name).toBe('docs')
    expect(entryInfo2.isDirectory).toBe(true)
    expect(index2).toBe(1)
  })

  it('displayMode=icon renders wrapper with icon class and CList type=icon', async () => {
    const entries = [mkEntry('file.txt', false)]
    const fs = createMockFs(entries)

    const { container } = render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        displayMode="icon"
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(1)
    })

    // 包裹元素包含 icon 修饰类
    const wrapper = container.querySelector('.system-ui-js__file-manager')
    expect(wrapper).not.toBeNull()
    expect(wrapper!.classList.contains('system-ui-js__file-manager--icon')).toBe(true)

    // CList 收到 type="icon"（通过 fiber 树验证）
    const clistEl = container.querySelector('.cm-list')
    expect(clistEl).not.toBeNull()
    const fiberKey = Object.keys(clistEl!).find((k) => k.startsWith('__reactFiber$'))
    expect(fiberKey).toBeDefined()
    let fiber = (clistEl as any)[fiberKey!]
    let clistType: string | undefined
    while (fiber) {
      if (fiber.memoizedProps?.type && fiber.memoizedProps?.items) {
        clistType = fiber.memoizedProps.type
        break
      }
      fiber = fiber.return
    }
    expect(clistType).toBe('icon')
  })

  it('sizeRatio=2 clamps effectiveSizeRatio to 1', async () => {
    const entries = [mkEntry('f.txt', false)]
    const fs = createMockFs(entries)
    const renderItem = vi.fn().mockReturnValue(null)

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        sizeRatio={2}
        renderItem={renderItem}
      />
    )

    await waitFor(() => {
      expect(renderItem).toHaveBeenCalled()
    })

    // effectiveSizeRatio = Math.max(0, Math.min(1, 2)) = 1
    expect(renderItem.mock.calls[0][1]).toBe(1)
  })

  it('sizeRatio=-0.5 clamps effectiveSizeRatio to 0', async () => {
    const entries = [mkEntry('f.txt', false)]
    const fs = createMockFs(entries)
    const renderItem = vi.fn().mockReturnValue(null)

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        sizeRatio={-0.5}
        renderItem={renderItem}
      />
    )

    await waitFor(() => {
      expect(renderItem).toHaveBeenCalled()
    })

    // effectiveSizeRatio = Math.max(0, Math.min(1, -0.5)) = 0
    expect(renderItem.mock.calls[0][1]).toBe(0)
  })

  it('sizeRatio=0.7 passes 0.7 unchanged to renderItem', async () => {
    const entries = [mkEntry('f.txt', false)]
    const fs = createMockFs(entries)
    const renderItem = vi.fn().mockReturnValue(null)

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        sizeRatio={0.7}
        renderItem={renderItem}
      />
    )

    await waitFor(() => {
      expect(renderItem).toHaveBeenCalled()
    })

    expect(renderItem.mock.calls[0][1]).toBe(0.7)
  })

  // ============================================================
  // Drag / move contract tests
  // ============================================================

  /** 创建 FileManagerEntry 风格的对象，用于拖拽 payload */
  function mkDragEntry(name: string, path: string, isDir: boolean) {
    return {
      name,
      path,
      isDirectory: () => isDir,
      isFile: () => !isDir,
      isSymbolicLink: () => false,
    }
  }

  /**
   * 通过 React fiber 树向上查找 CList 组件，返回其 onItemDragInto 回调。
   * CList 不会把 onItemDragInto 传给 DOM 元素，所以需要遍历 fiber 树。
   */
  function getCListDragIntoHandler() {
    const clistEl = document.querySelector('.cm-list')
    if (!clistEl) throw new Error('CList not rendered — .cm-list not found')

    const fiberKey = Object.keys(clistEl).find((k) => k.startsWith('__reactFiber$'))
    if (!fiberKey) throw new Error('React fiber key not found on .cm-list element')

    let fiber = (clistEl as any)[fiberKey]
    while (fiber) {
      if (typeof fiber.memoizedProps?.onItemDragInto === 'function') {
        return fiber.memoizedProps.onItemDragInto as (
          payload: Parameters<typeof import('@system-ui-js/chameleon').CListItemDragIntoPayload<any>>[0]
        ) => void
      }
      fiber = fiber.return
    }
    throw new Error('onItemDragInto not found in React fiber tree above .cm-list')
  }

  it('draggable=false prevents move even when handler invoked', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('docs', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })

    const { container } = render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable={false}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    // 即使手动调用 handler，draggable=false 也会静默返回
    const handler = getCListDragIntoHandler()
    await act(async () => {
      handler({
        source: { item: mkDragEntry('a.txt', '/a.txt', false), key: '/a.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    expect(renameMock).not.toHaveBeenCalled()
  })

  it('drag into folder moves file via rename and triggers onMoveSuccess', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('docs', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveSuccess = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveSuccess={onMoveSuccess}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const readdirCountBefore = fs.promises.readdir.mock.calls.length

    const handler = getCListDragIntoHandler()
    await act(async () => {
      await handler({
        source: { item: mkDragEntry('a.txt', '/a.txt', false), key: '/a.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    // rename 被调用：从 /a.txt 移动到 /docs/a.txt
    expect(renameMock).toHaveBeenCalledWith('/a.txt', '/docs/a.txt')
    expect(renameMock).toHaveBeenCalledTimes(1)

    // 内部刷新触发 readdir 重新调用
    await waitFor(() => {
      expect(fs.promises.readdir.mock.calls.length).toBeGreaterThan(readdirCountBefore)
    })

    // onMoveSuccess 接收到正确的 context
    expect(onMoveSuccess).toHaveBeenCalledTimes(1)
    expect(onMoveSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        source: expect.objectContaining({ name: 'a.txt', path: '/a.txt', isDirectory: false }),
        target: expect.objectContaining({ name: 'docs', path: '/docs', isDirectory: true }),
        targetPath: '/docs/a.txt',
        currentPath: '/',
      })
    )
  })

  it('onBeforeMove returning false cancels move with cancelled reason', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('docs', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })
    const onBeforeMove = vi.fn().mockResolvedValue(false)
    const onMoveError = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onBeforeMove={onBeforeMove}
        onMoveError={onMoveError}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const handler = getCListDragIntoHandler()
    await act(async () => {
      await handler({
        source: { item: mkDragEntry('a.txt', '/a.txt', false), key: '/a.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    // onBeforeMove 被调用
    expect(onBeforeMove).toHaveBeenCalledWith(
      expect.objectContaining({
        source: expect.objectContaining({ name: 'a.txt' }),
        target: expect.objectContaining({ name: 'docs' }),
      })
    )

    // rename 未被调用
    expect(renameMock).not.toHaveBeenCalled()

    // onMoveError 接收到 cancelled 原因
    expect(onMoveError).toHaveBeenCalledTimes(1)
    expect(onMoveError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'cancelled' }),
      expect.any(Object)
    )
  })

  it('rename failure triggers onMoveError with rename-failed reason', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('docs', true)]
    const renameError = new Error('Permission denied')
    const renameMock = vi.fn().mockRejectedValue(renameError)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveError = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveError={onMoveError}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const handler = getCListDragIntoHandler()
    await act(async () => {
      await handler({
        source: { item: mkDragEntry('a.txt', '/a.txt', false), key: '/a.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    expect(onMoveError).toHaveBeenCalledTimes(1)
    expect(onMoveError).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'rename-failed',
        message: 'Permission denied',
        cause: renameError,
      }),
      expect.any(Object)
    )
  })

  it('drag to non-directory target reports invalid-target', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('b.txt', false)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveError = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveError={onMoveError}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const handler = getCListDragIntoHandler()
    await act(async () => {
      handler({
        source: { item: mkDragEntry('a.txt', '/a.txt', false), key: '/a.txt', index: 0 },
        target: { item: mkDragEntry('b.txt', '/b.txt', false), key: '/b.txt', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    expect(onMoveError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'invalid-target' }),
      expect.any(Object)
    )
    expect(renameMock).not.toHaveBeenCalled()
  })

  it('drag to self reports self-target', async () => {
    // 必须是目录才能通过 "target not directory" 守卫，触发 self-target 检查
    const entries = [mkEntry('docs', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveError = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveError={onMoveError}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(1)
    })

    const handler = getCListDragIntoHandler()
    const selfEntry = mkDragEntry('docs', '/docs', true)
    await act(async () => {
      handler({
        source: { item: selfEntry, key: '/docs', index: 0 },
        target: { item: selfEntry, key: '/docs', index: 0 },
        position: 'inside',
        input: 'pointer',
      })
    })

    expect(onMoveError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'self-target' }),
      expect.any(Object)
    )
  })

  it('drag folder into its own descendant reports descendant-target', async () => {
    const entries = [mkEntry('docs', true), mkEntry('sub', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveError = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveError={onMoveError}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const handler = getCListDragIntoHandler()
    await act(async () => {
      handler({
        source: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 0 },
        target: { item: mkDragEntry('sub', '/docs/sub', true), key: '/docs/sub', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    expect(onMoveError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'descendant-target' }),
      expect.any(Object)
    )
  })

  it('drag to same-parent is silent no-op with no callbacks', async () => {
    // parentOf('/docs/a.txt') === '/docs' → 静默返回，无任何回调
    const entries = [mkEntry('a.txt', false), mkEntry('docs', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveError = vi.fn()
    const onMoveSuccess = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveError={onMoveError}
        onMoveSuccess={onMoveSuccess}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const handler = getCListDragIntoHandler()
    await act(async () => {
      handler({
        source: { item: mkDragEntry('a.txt', '/docs/a.txt', false), key: '/docs/a.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    expect(renameMock).not.toHaveBeenCalled()
    expect(onMoveError).not.toHaveBeenCalled()
    expect(onMoveSuccess).not.toHaveBeenCalled()
  })

  it('existing target path reports conflict without rename', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('docs', true)]
    const renameMock = vi.fn().mockResolvedValue(undefined)
    const existsMock = vi.fn().mockResolvedValue(true)
    const fs = createMockFs(entries, { rename: renameMock, exists: existsMock })
    const onMoveError = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveError={onMoveError}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(2)
    })

    const handler = getCListDragIntoHandler()
    await act(async () => {
      await handler({
        source: { item: mkDragEntry('a.txt', '/a.txt', false), key: '/a.txt', index: 0 },
        target: { item: mkDragEntry('docs', '/docs', true), key: '/docs', index: 1 },
        position: 'inside',
        input: 'pointer',
      })
    })

    // exists 被调用检查目标路径
    expect(existsMock).toHaveBeenCalledWith('/docs/a.txt')

    // 冲突错误，不调用 rename
    expect(onMoveError).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'conflict' }),
      expect.objectContaining({ targetPath: '/docs/a.txt' })
    )
    expect(renameMock).not.toHaveBeenCalled()
  })

  it('move in flight ignores second drop silently', async () => {
    const entries = [mkEntry('a.txt', false), mkEntry('b.txt', false), mkEntry('docs', true)]
    const deferred = createDeferred<void>()
    const renameMock = vi.fn().mockReturnValue(deferred.promise)
    const fs = createMockFs(entries, { rename: renameMock })
    const onMoveSuccess = vi.fn()

    render(
      <FileManager
        fileSystem={fs}
        currentPath="/"
        onPathChange={vi.fn()}
        draggable
        onMoveSuccess={onMoveSuccess}
      />
    )

    await waitFor(() => {
      expect(getItemButtons()).toHaveLength(3)
    })

    const handler = getCListDragIntoHandler()
    const sourceA = mkDragEntry('a.txt', '/a.txt', false)
    const sourceB = mkDragEntry('b.txt', '/b.txt', false)
    const target = mkDragEntry('docs', '/docs', true)

    // 第一次拖拽（rename 挂起，moveInFlightRef = true）
    // 注意：不 await，让 rename 保持 pending 状态
    let firstMovePromise: Promise<void>
    await act(async () => {
      firstMovePromise = handler({
        source: { item: sourceA, key: '/a.txt', index: 0 },
        target: { item: target, key: '/docs', index: 2 },
        position: 'inside',
        input: 'pointer',
      })
    })

    // 第二次拖拽（moveInFlightRef 为 true，静默忽略）
    await act(async () => {
      handler({
        source: { item: sourceB, key: '/b.txt', index: 1 },
        target: { item: target, key: '/docs', index: 2 },
        position: 'inside',
        input: 'pointer',
      })
    })

    // 只有第一次的 rename 被调用
    expect(renameMock).toHaveBeenCalledTimes(1)
    expect(renameMock).toHaveBeenCalledWith('/a.txt', '/docs/a.txt')

    // 释放第一次 rename
    await act(async () => {
      deferred.resolve()
      await firstMovePromise!
    })

    // onMoveSuccess 只触发一次，且是第一次的 context
    expect(onMoveSuccess).toHaveBeenCalledTimes(1)
    expect(onMoveSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        source: expect.objectContaining({ path: '/a.txt' }),
        targetPath: '/docs/a.txt',
      })
    )
  })
})
