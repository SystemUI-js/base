/**
 * FileManager 组件
 *
 * 基于 CList 的文件管理器，支持鼠标/触摸交互模式、
 * 防竞争请求守卫、加载/空态/错误态展示。
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CList } from '@system-ui-js/chameleon'
import type { CListItemDoubleClickPayload } from '@system-ui-js/chameleon'
import type { FileManagerProps, FileManagerDirent } from './types'
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
  } = props

  const [items, setItems] = useState<FileManagerEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastReadPath, setLastReadPath] = useState<string | null>(null)
  const [lastRefreshKey, setLastRefreshKey] = useState<unknown>(undefined)
  const requestIdRef = useRef(0)

  /** 规范化根路径与当前路径，并限制读取范围 */
  const normalizedRoot = normalizePath(root)
  const normalizedCurrentPath = normalizePath(currentPath)
  const readPath = clampToRoot(normalizedCurrentPath, normalizedRoot)

  /** 是否正在加载：当最后完成的路径/刷新键与当前不一致时视为加载中 */
  const loading = lastReadPath !== readPath || lastRefreshKey !== refreshKey

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
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) {
          return
        }

        setItems([])
        setError(err instanceof Error ? err.message : String(err))
        setLastReadPath(readPath)
        setLastRefreshKey(refreshKey)
      })
  }, [fileSystem, readPath, refreshKey])

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

  /** 渲染单个文件/目录项 */
  const renderItem = useCallback(
    (entry: FileManagerEntry): React.ReactNode => {
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
    [selectedPath]
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
      className={['system-ui-js__file-manager', className || ''].join(' ').trim()}
      data-testid={dataTestId}
    >
      <CList<FileManagerEntry>
        type="list"
        items={items}
        renderItem={renderItem}
        getItemKey={(entry) => entry.path}
        onItemClick={handleItemClick}
        onItemDoubleClick={handleItemDoubleClick}
        emptyState={emptyState}
      />
    </div>
  )
}
