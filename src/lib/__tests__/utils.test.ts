import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'font-bold')).toBe('text-red-500 font-bold')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', false && 'hidden', 'visible')).toBe('base-class visible')
    })

    it('should handle tailwind conflicts correctly', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('px-2 py-1', 'p-3')
      expect(result).toBe('p-3')
    })

    it('should handle undefined and null values', () => {
      expect(cn('text-sm', undefined, null, 'font-bold')).toBe('text-sm font-bold')
    })

    it('should handle empty strings', () => {
      expect(cn('', 'text-lg', '')).toBe('text-lg')
    })

    it('should handle array of classes', () => {
      expect(cn(['text-sm', 'font-bold'], 'text-red-500')).toBe('text-sm font-bold text-red-500')
    })
  })
})
