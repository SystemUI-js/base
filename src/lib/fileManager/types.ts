/**
 * FileManager 类型定义
 * 
 * 定义文件管理器组件所需的接口和类型
 */

import type { ReactNode } from 'react'

/** 交互模式类型 */
export type FileManagerInteractionMode = 'mouse' | 'touch' | 'auto'

/** 文件系统目录项接口 */
export interface FileManagerDirent {
  name: string
  isDirectory(): boolean
  isFile?(): boolean
  isSymbolicLink?(): boolean
}

/** 展示模式：仅支持 list 与 icon */
export type FileManagerDisplayMode = 'list' | 'icon'

/** 当前展示列表中的零基索引（list 与 icon 模式都传索引） */
export type FileManagerRenderPosition = number

/** 传递给 renderItem 与移动回调的条目信息 */
export interface FileManagerEntryInfo {
  name: string
  path: string
  isDirectory: boolean
  isFile?: boolean
  isSymbolicLink?: boolean
}

/** 移动上下文：来源、目标文件夹、目标完整路径与当前路径 */
export interface FileManagerMoveContext {
  source: FileManagerEntryInfo
  target: FileManagerEntryInfo
  targetPath: string
  currentPath: string
}

/** 移动错误的原因分类 */
export type FileManagerMoveErrorReason =
  | 'invalid-target'
  | 'self-target'
  | 'descendant-target'
  | 'same-parent'
  | 'conflict'
  | 'cancelled'
  | 'rename-failed'

/** 移动错误对象 */
export interface FileManagerMoveError {
  reason: FileManagerMoveErrorReason
  message: string
  cause?: unknown
}

/** 文件系统接口 */
export interface FileSystemLike {
  promises: {
    readdir(path: string, options: { withFileTypes: true }): Promise<FileManagerDirent[]>
    /** 重命名/移动文件或目录 */
    rename(oldPath: string, newPath: string): Promise<void>
    /** 检查路径是否存在（可选） */
    exists?(path: string): Promise<boolean>
  }
}

/** FileManager 组件属性 */
export interface FileManagerProps {
  /** 文件系统实例（必需） */
  fileSystem: FileSystemLike
  
  /** 当前路径（必需，受控模式） */
  currentPath: string
  
  /** 路径变化回调（必需，受控模式） */
  onPathChange: (path: string) => void
  
  /** 根路径限制，默认 '/' */
  root?: string
  
  /** 选中的文件路径 */
  selectedPath?: string | null
  
  /** 选中项变化回调 */
  onSelectionChange?: (path: string | null) => void
  
  /** 交互模式，默认 'auto' */
  interactionMode?: FileManagerInteractionMode
  
  /** 刷新键，变化时触发重新加载 */
  refreshKey?: unknown
  
  /** 自定义类名 */
  className?: string
  
  /** 测试标识符 */
  'data-testid'?: string

  /** 展示模式，默认 'list' */
  displayMode?: FileManagerDisplayMode

  /** 调用方自定义的尺寸比例，0..1，超出会被夹紧；非有限值取 1 */
  sizeRatio?: number

  /** 自定义渲染函数，参数固定为 (displayMode, sizeRatio, entry, position) */
  renderItem?: (
    displayMode: FileManagerDisplayMode,
    sizeRatio: number,
    entry: FileManagerEntryInfo,
    position: FileManagerRenderPosition
  ) => ReactNode

  /** 是否启用拖拽移动，默认 false */
  draggable?: boolean

  /** 移动前拦截：返回 false 或 Promise<false> 可取消移动 */
  onBeforeMove?: (context: FileManagerMoveContext) => boolean | Promise<boolean>

  /** 移动成功回调 */
  onMoveSuccess?: (context: FileManagerMoveContext) => void | Promise<void>

  /** 移动失败/被阻止回调 */
  onMoveError?: (
    error: FileManagerMoveError,
    context: FileManagerMoveContext
  ) => void | Promise<void>
}
