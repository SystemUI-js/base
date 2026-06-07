/**
 * FileManager 组件
 *
 * 基于 CList 的文件管理器，支持鼠标/触摸交互模式、
 * 防竞争请求守卫、加载/空态/错误态展示。
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CList } from '@system-ui-js/chameleon'
import type {
  CListItemDoubleClickPayload,
  CListItemDragIntoPayload,
} from '@system-ui-js/chameleon'
import type {
  FileManagerProps,
  FileManagerDirent,
  FileManagerEntryInfo,
  FileManagerMoveContext,
  FileManagerMoveError,
} from './types'
import { normalizePath, joinPath, clampToRoot } from './path'
import './index.css'

/** 内部列表项类型，包含完整路径信息 */
interface FileManagerEntry {
  name: string
  path: string
  isDirectory: () => boolean
  isFile?: () => boolean
  isSymbolicLink?: () => boolean
}

function toEntryInfo(entry: FileManagerEntry): FileManagerEntryInfo {
  return {
    name: entry.name,
    path: entry.path,
    isDirectory: entry.isDirectory(),
    isFile: entry.isFile?.(),
    isSymbolicLink: entry.isSymbolicLink?.(),
  }
}

function parentOf(path: string): string {
  const normalizedPath = normalizePath(path)
  if (normalizedPath === '/') {
    return '/'
  }

  const lastSlashIndex = normalizedPath.lastIndexOf('/')
  return lastSlashIndex > 0 ? normalizedPath.slice(0, lastSlashIndex) : '/'
}

/**
 * FileManager 文件管理器组件
 *
 * 使用 CList 渲染文件系统目录内容，支持：
 * - 受控路径与选中态
 * - 鼠标点击/双击、触摸点选/二次点选导航
 * - 加载中、空目录、读取错误三种状态
 * - 防竞争请求守卫（stale-result guard）
 */
export default function FileManager(props: FileManagerProps): React.ReactElement {
  const {
    fileSystem,
    currentPath,
    onPathChange,
    root = '/',
    selectedPath,
    onSelectionChange,
    interactionMode = 'auto',
    refreshKey,
    className,
    'data-testid': dataTestId,
    displayMode = 'list',
    sizeRatio = 1,
    renderItem: customRenderItem,
    draggable = false,
    onBeforeMove,
    onMoveSuccess,
    onMoveError,
  } = props

  /** 夹紧 sizeRatio：非有限值取 1，否则限制在 [0, 1] */
  const effectiveSizeRatio = Number.isFinite(sizeRatio)
    ? Math.max(0, Math.min(1, sizeRatio))
    : 1

  const [items, setItems] = useState<FileManagerEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastReadPath, setLastReadPath] = useState<string | null>(null)
  const [lastRefreshKey, setLastRefreshKey] = useState<unknown>(undefined)
  const [lastInternalRefreshTick, setLastInternalRefreshTick] = useState(0)
  const [internalRefreshTick, setInternalRefreshTick] = useState(0)
  const requestIdRef = useRef(0)
  const moveInFlightRef = useRef(false)

  /** 规范化根路径与当前路径，并限制读取范围 */
  const normalizedRoot = normalizePath(root)
  const normalizedCurrentPath = normalizePath(currentPath)
  const readPath = clampToRoot(normalizedCurrentPath, normalizedRoot)

  /** 是否正在加载：当最后完成的路径/刷新键与当前不一致时视为加载中 */
  const loading =
    lastReadPath !== readPath ||
    lastRefreshKey !== refreshKey ||
    lastInternalRefreshTick !== internalRefreshTick

  /** 加载目录内容 */
  useEffect(() => {
    const requestId = ++requestIdRef.current

    fileSystem.promises
      .readdir(readPath, { withFileTypes: true })
      .then((entries: FileManagerDirent[]) => {
        if (requestId !== requestIdRef.current) {
          return
        }

        const mapped: FileManagerEntry[] = entries.map((entry) => ({
          name: entry.name,
          path: joinPath(readPath, entry.name),
          isDirectory: entry.isDirectory.bind(entry),
          isFile: entry.isFile?.bind(entry),
          isSymbolicLink: entry.isSymbolicLink?.bind(entry),
        }))

        setItems(mapped)
        setError(null)
        setLastReadPath(readPath)
        setLastRefreshKey(refreshKey)
        setLastInternalRefreshTick(internalRefreshTick)
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) {
          return
        }

        setItems([])
        setError(err instanceof Error ? err.message : String(err))
        setLastReadPath(readPath)
        setLastRefreshKey(refreshKey)
        setLastInternalRefreshTick(internalRefreshTick)
      })
  }, [fileSystem, readPath, refreshKey, internalRefreshTick])

  /** 处理点击事件：选择，触摸模式下二次点击打开目录 */
  const handleItemClick = useCallback(
    (
      entry: FileManagerEntry,
      index: number,
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      // index 在 CList 回调中占位，供扩展使用
      void index

      const entryPath = entry.path

      // 通知选中态变化
      onSelectionChange?.(entryPath)

      // 确定实际交互模式
      let mode = interactionMode
      if (mode === 'auto') {
        const pointerEvent = event.nativeEvent as unknown as PointerEvent
        mode = pointerEvent.pointerType === 'touch' ? 'touch' : 'mouse'
      }

      // 触摸模式：已在选中态的目录第二次点击时进入
      if (mode === 'touch') {
        if (entryPath === selectedPath && entry.isDirectory()) {
          onPathChange(entryPath)
        }
      }
    },
    [interactionMode, onSelectionChange, selectedPath, onPathChange]
  )

  /** 处理双击事件：鼠标模式下打开目录 */
  const handleItemDoubleClick = useCallback(
    (payload: CListItemDoubleClickPayload<FileManagerEntry>) => {
      const entry = payload.item
      if (entry.isDirectory()) {
        onPathChange(entry.path)
      }
    },
    [onPathChange]
  )

  const handleItemDragInto = useCallback(
    async (payload: CListItemDragIntoPayload<FileManagerEntry>) => {
      if (!draggable) {
        return
      }

      if (payload.position !== 'inside') {
        return
      }

      const source = payload.source.item
      const target = payload.target.item
      const targetPath = joinPath(target.path, source.name)
      const context: FileManagerMoveContext = {
        source: toEntryInfo(source),
        target: toEntryInfo(target),
        targetPath,
        currentPath,
      }

      if (!target.isDirectory()) {
        onMoveError?.(
          {
            reason: 'invalid-target',
            message: '只能移动到文件夹中',
          },
          context
        )
        return
      }

      if (source.path === '/') {
        onMoveError?.(
          {
            reason: 'invalid-target',
            message: '不能移动根路径',
          },
          context
        )
        return
      }

      if (source.path === target.path) {
        onMoveError?.(
          {
            reason: 'self-target',
            message: '不能移动到自身',
          },
          context
        )
        return
      }

      if (source.isDirectory() && target.path.startsWith(`${source.path}/`)) {
        onMoveError?.(
          {
            reason: 'descendant-target',
            message: '不能移动到自己的子目录中',
          },
          context
        )
        return
      }

      if (parentOf(source.path) === target.path) {
        return
      }

      if (moveInFlightRef.current) {
        return
      }

      moveInFlightRef.current = true
      try {
        const exists = fileSystem.promises.exists
        if (typeof exists === 'function' && (await exists(targetPath))) {
          onMoveError?.(
            {
              reason: 'conflict',
              message: '目标路径已存在',
            },
            context
          )
          return
        }

        if (onBeforeMove && (await onBeforeMove(context)) === false) {
          onMoveError?.(
            {
              reason: 'cancelled',
              message: '移动已取消',
            },
            context
          )
          return
        }

        await fileSystem.promises.rename(source.path, targetPath)
        setInternalRefreshTick((tick) => tick + 1)

        if (selectedPath === source.path) {
          onSelectionChange?.(null)
        }

        await onMoveSuccess?.(context)
      } catch (err: unknown) {
        const error: FileManagerMoveError = {
          reason: 'rename-failed',
          message: err instanceof Error ? err.message : String(err),
          cause: err,
        }
        onMoveError?.(error, context)
      } finally {
        moveInFlightRef.current = false
      }
    },
    [
      draggable,
      fileSystem,
      currentPath,
      selectedPath,
      onBeforeMove,
      onMoveSuccess,
      onMoveError,
      onSelectionChange,
    ]
  )

  /** 渲染单个文件/目录项：customRenderItem 存在时委托，否则使用默认 emoji 渲染 */
  const renderListItem = useCallback(
    (entry: FileManagerEntry, index: number): React.ReactNode => {
      if (customRenderItem) {
        const entryInfo: FileManagerEntryInfo = {
          name: entry.name,
          path: entry.path,
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile?.(),
          isSymbolicLink: entry.isSymbolicLink?.(),
        }
        return customRenderItem(displayMode, effectiveSizeRatio, entryInfo, index)
      }

      const isSelected = entry.path === selectedPath
      const isDirectory = entry.isDirectory()

      return (
        <div
          className={[
            'system-ui-js__file-manager-item',
            isSelected ? 'system-ui-js__file-manager-item--selected' : '',
            isDirectory
              ? 'system-ui-js__file-manager-item--directory'
              : 'system-ui-js__file-manager-item--file',
          ].join(' ')}
        >
          <span className="system-ui-js__file-manager-item__icon">
            {isDirectory ? '📁' : '📄'}
          </span>
          <span className="system-ui-js__file-manager-item__name">
            {entry.name}
          </span>
        </div>
      )
    },
    [selectedPath, customRenderItem, displayMode, effectiveSizeRatio]
  )

  /** 空列表时展示的加载/错误/空态节点 */
  const emptyState =
    items.length === 0 ? (
      <div className="system-ui-js__file-manager-status">
        {loading ? (
          <span className="system-ui-js__file-manager-status__loading">
            加载中...
          </span>
        ) : error ? (
          <span className="system-ui-js__file-manager-status__error">
            {error}
          </span>
        ) : (
          <span className="system-ui-js__file-manager-status__empty">
            目录为空
          </span>
        )}
      </div>
    ) : null

  return (
    <div
      className={[
        'system-ui-js__file-manager',
        `system-ui-js__file-manager--${displayMode}`,
        className || '',
      ]
        .join(' ')
        .trim()}
      data-testid={dataTestId}
    >
      <CList<FileManagerEntry>
        type={displayMode}
        items={items}
        renderItem={renderListItem}
        getItemKey={(entry) => entry.path}
        onItemClick={handleItemClick}
        onItemDoubleClick={handleItemDoubleClick}
        draggable={draggable}
        onItemDragInto={handleItemDragInto}
        emptyState={emptyState}
      />
    </div>
  )
}
