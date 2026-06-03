/**
 * FileManager 路径工具函数
 * 
 * 提供 POSIX 路径处理、规范化、拼接和安全限制功能
 */

/**
 * 规范化路径为绝对 POSIX 路径
 * - 处理重复斜杠
 * - 移除尾部斜杠（根路径除外）
 * - 确保以斜杠开头
 */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  
  const parts = path.split('/').filter(Boolean)
  const normalized = `/${parts.join('/')}`
  
  return normalized === '/' ? '/' : normalized.replace(/\/+$/, '')
}

/**
 * 拼接父路径和名称
 */
export function joinPath(parent: string, name: string): string {
  const normalizedParent = normalizePath(parent)
  const normalizedName = name.replace(/\/+$/, '')
  
  if (normalizedParent === '/') {
    return `/${normalizedName}`
  }
  
  return `${normalizedParent}/${normalizedName}`
}

/**
 * 获取父路径，确保不超出根路径限制
 */
export function getParentPath(path: string, root: string): string {
  const normalizedPath = normalizePath(path)
  const normalizedRoot = normalizePath(root)
  
  if (normalizedPath === normalizedRoot) {
    return normalizedRoot
  }
  
  const isUnderRoot = normalizedRoot === '/' 
    ? normalizedPath.startsWith('/')
    : normalizedPath.startsWith(`${normalizedRoot}/`)
  
  if (isUnderRoot) {
    const lastSlashIndex = normalizedPath.lastIndexOf('/')
    const parentPath = lastSlashIndex > 0 ? normalizedPath.substring(0, lastSlashIndex) : '/'
    
    if (normalizedRoot === '/') {
      return parentPath || '/'
    }
    
    if (parentPath.length < normalizedRoot.length) {
      return normalizedRoot
    }
    return parentPath
  }
  
  return normalizedRoot
}

/**
 * 限制路径在根路径范围内
 * - 解析相对路径（..）
 * - 确保结果不超出根路径
 */
export function clampToRoot(path: string, root: string): string {
  const normalizedPath = normalizePath(path)
  const normalizedRoot = normalizePath(root)
  
  if (normalizedPath === normalizedRoot) {
    return normalizedRoot
  }
  
  const pathParts = normalizedPath.split('/').filter(Boolean)
  const rootParts = normalizedRoot.split('/').filter(Boolean)
  
  const resolvedParts: string[] = [...rootParts]
  
  const startsWithRoot = normalizedRoot === '/'
    ? true
    : normalizedPath.startsWith(`${normalizedRoot}/`)
  
  const partsToProcess = startsWithRoot ? pathParts.slice(rootParts.length) : pathParts
  
  for (const part of partsToProcess) {
    if (part === '..') {
      if (resolvedParts.length > rootParts.length) {
        resolvedParts.pop()
      }
    } else if (part !== '.') {
      resolvedParts.push(part)
    }
  }
  
  const resolvedPath = `/${resolvedParts.join('/')}`
  
  const isUnderRoot = normalizedRoot === '/'
    ? resolvedPath.startsWith('/')
    : resolvedPath.startsWith(`${normalizedRoot}/`) || resolvedPath === normalizedRoot
  
  return isUnderRoot ? resolvedPath : normalizedRoot
}
