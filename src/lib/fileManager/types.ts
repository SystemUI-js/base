/**
 * FileManager 类型定义
 * 
 * 定义文件管理器组件所需的接口和类型
 */

/** 交互模式类型 */
export type FileManagerInteractionMode = 'mouse' | 'touch' | 'auto'

/** 文件系统目录项接口 */
export interface FileManagerDirent {
  name: string
  isDirectory(): boolean
  isFile?(): boolean
  isSymbolicLink?(): boolean
}

/** 文件系统接口 */
export interface FileSystemLike {
  promises: {
    readdir(path: string, options: { withFileTypes: true }): Promise<FileManagerDirent[]>
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
}
