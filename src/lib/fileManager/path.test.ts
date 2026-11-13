import { describe, expect, it } from 'vitest'
import { clampToRoot, getParentPath, joinPath, normalizePath } from './path'

describe('FileManager Path Utilities', () => {
  describe('normalizePath', () => {
    it('should normalize duplicate slashes', () => {
      expect(normalizePath('foo//bar/')).toBe('/foo/bar')
    })

    it('should handle root path', () => {
      expect(normalizePath('/')).toBe('/')
    })

    it('should remove trailing slash', () => {
      expect(normalizePath('/foo/bar/')).toBe('/foo/bar')
    })

    it('should add leading slash if missing', () => {
      expect(normalizePath('foo/bar')).toBe('/foo/bar')
    })

    it('should handle empty string', () => {
      expect(normalizePath('')).toBe('/')
    })

    it('should handle multiple slashes', () => {
      expect(normalizePath('///foo///bar///')).toBe('/foo/bar')
    })
  })

  describe('joinPath', () => {
    it('should join parent and name', () => {
      expect(joinPath('/foo', 'bar')).toBe('/foo/bar')
    })

    it('should handle root as parent', () => {
      expect(joinPath('/', 'foo')).toBe('/foo')
    })

    it('should handle trailing slash in parent', () => {
      expect(joinPath('/foo/', 'bar')).toBe('/foo/bar')
    })

    it('should handle name with slash', () => {
      expect(joinPath('/foo', 'bar/')).toBe('/foo/bar')
    })
  })

  describe('getParentPath', () => {
    it('should return parent path', () => {
      expect(getParentPath('/foo/bar', '/')).toBe('/foo')
    })

    it('should clamp to root when at root', () => {
      expect(getParentPath('/', '/')).toBe('/')
    })

    it('should not escape custom root', () => {
      expect(getParentPath('/root/sub', '/root')).toBe('/root')
    })

    it('should handle nested paths with custom root', () => {
      expect(getParentPath('/root/a/b', '/root')).toBe('/root/a')
    })

    it('should return root for paths outside root', () => {
      expect(getParentPath('/other/path', '/root')).toBe('/root')
    })
  })

  describe('clampToRoot', () => {
    it('should clamp path with .. to root', () => {
      expect(clampToRoot('/root/../x', '/root')).toBe('/root/x')
    })

    it('should handle normal path within root', () => {
      expect(clampToRoot('/root/sub', '/root')).toBe('/root/sub')
    })

    it('should handle root path', () => {
      expect(clampToRoot('/root', '/root')).toBe('/root')
    })

    it('should handle path that tries to escape', () => {
      expect(clampToRoot('/root/../../etc', '/root')).toBe('/root/etc')
    })

    it('should handle . in path', () => {
      expect(clampToRoot('/root/./sub', '/root')).toBe('/root/sub')
    })

    it('should never return outside root', () => {
      const result = clampToRoot('/root/../x', '/root')
      expect(result.startsWith('/root')).toBe(true)
    })
  })
})
