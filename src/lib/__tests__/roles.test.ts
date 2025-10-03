import { describe, it, expect } from 'vitest'
import { ROLES, hasPermission, hasRole } from '../roles'

describe('Role System', () => {
  describe('hasPermission', () => {
    it('should return true when super-admin has any permission', () => {
      expect(hasPermission(ROLES.SUPER_ADMIN, 'canManageUsers')).toBe(true)
      expect(hasPermission(ROLES.SUPER_ADMIN, 'canManagePosts')).toBe(true)
      expect(hasPermission(ROLES.SUPER_ADMIN, 'canManageSettings')).toBe(true)
    })

    it('should return true when admin has admin permissions', () => {
      expect(hasPermission(ROLES.ADMIN, 'canManageUsers')).toBe(true)
      expect(hasPermission(ROLES.ADMIN, 'canManagePosts')).toBe(true)
      expect(hasPermission(ROLES.ADMIN, 'canViewAnalytics')).toBe(true)
    })

    it('should return false when editor tries to manage users', () => {
      expect(hasPermission(ROLES.EDITOR, 'canManageUsers')).toBe(false)
      expect(hasPermission(ROLES.EDITOR, 'canManageSettings')).toBe(false)
    })

    it('should return true when editor can manage posts', () => {
      expect(hasPermission(ROLES.EDITOR, 'canManagePosts')).toBe(true)
      expect(hasPermission(ROLES.EDITOR, 'canManageComments')).toBe(true)
    })

    it('should return true when author can create posts', () => {
      expect(hasPermission(ROLES.AUTHOR, 'canCreatePosts')).toBe(true)
      expect(hasPermission(ROLES.AUTHOR, 'canManageMedia')).toBe(true)
    })

    it('should return false when author tries to edit any post', () => {
      expect(hasPermission(ROLES.AUTHOR, 'canEditAnyPost')).toBe(false)
      expect(hasPermission(ROLES.AUTHOR, 'canDeleteAnyPost')).toBe(false)
    })

    it('should return true when moderator can manage comments', () => {
      expect(hasPermission(ROLES.MODERATOR, 'canManageComments')).toBe(true)
    })

    it('should return false when moderator tries to manage posts', () => {
      expect(hasPermission(ROLES.MODERATOR, 'canManagePosts')).toBe(false)
      expect(hasPermission(ROLES.MODERATOR, 'canCreatePosts')).toBe(false)
    })

    it('should return true when user can access dashboard', () => {
      expect(hasPermission(ROLES.USER, 'canAccessDashboard')).toBe(true)
    })

    it('should return false when user tries to manage anything', () => {
      expect(hasPermission(ROLES.USER, 'canManagePosts')).toBe(false)
      expect(hasPermission(ROLES.USER, 'canManageUsers')).toBe(false)
    })

    it('should return false when role is undefined', () => {
      expect(hasPermission(undefined, 'canManageUsers')).toBe(false)
    })

    it('should work with multiple roles (comma-separated)', () => {
      expect(hasPermission('author,moderator', 'canCreatePosts')).toBe(true)
      expect(hasPermission('author,moderator', 'canManageComments')).toBe(true)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the exact role', () => {
      expect(hasRole(ROLES.ADMIN, [ROLES.ADMIN])).toBe(true)
      expect(hasRole(ROLES.EDITOR, [ROLES.EDITOR])).toBe(true)
    })

    it('should return true when user has one of allowed roles', () => {
      expect(hasRole(ROLES.ADMIN, [ROLES.SUPER_ADMIN, ROLES.ADMIN])).toBe(true)
      expect(hasRole(ROLES.EDITOR, [ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR])).toBe(true)
    })

    it('should return false when user does not have any allowed role', () => {
      expect(hasRole(ROLES.USER, [ROLES.ADMIN, ROLES.EDITOR])).toBe(false)
      expect(hasRole(ROLES.AUTHOR, [ROLES.SUPER_ADMIN, ROLES.ADMIN])).toBe(false)
    })

    it('should return false when role is undefined', () => {
      expect(hasRole(undefined, [ROLES.ADMIN])).toBe(false)
    })

    it('should work with multiple user roles (comma-separated)', () => {
      expect(hasRole('editor,author', [ROLES.EDITOR])).toBe(true)
      expect(hasRole('author,moderator', [ROLES.MODERATOR])).toBe(true)
      expect(hasRole('user', [ROLES.ADMIN, ROLES.EDITOR])).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(hasRole('ADMIN', [ROLES.ADMIN])).toBe(false)
      expect(hasRole('admin', [ROLES.ADMIN])).toBe(true)
    })
  })

  describe('Role Constants', () => {
    it('should have all expected roles defined', () => {
      expect(ROLES.SUPER_ADMIN).toBe('super-admin')
      expect(ROLES.ADMIN).toBe('admin')
      expect(ROLES.EDITOR).toBe('editor')
      expect(ROLES.AUTHOR).toBe('author')
      expect(ROLES.MODERATOR).toBe('moderator')
      expect(ROLES.USER).toBe('user')
    })
  })
})
