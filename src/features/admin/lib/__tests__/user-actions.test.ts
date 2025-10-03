import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUsersAction, createUserAction, setRoleAction, deleteUserAction, banUserAction } from '../user-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      createUser: vi.fn(),
      setRole: vi.fn(),
      banUser: vi.fn(),
      unbanUser: vi.fn(),
      removeUser: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('user-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsersAction', () => {
    it('returns users when user is admin', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
        { id: '2', name: 'User 2', email: 'user2@example.com', role: 'editor' },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
      vi.mocked(prisma.user.count).mockResolvedValue(2);

      const result = await listUsersAction();

      expect(result.data).toBeTruthy();
      expect(result.data?.users).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('filters super-admins when user is not super-admin', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
        { id: '2', name: 'Super Admin', email: 'super@example.com', role: 'super-admin' },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
      vi.mocked(prisma.user.count).mockResolvedValue(2);

      const result = await listUsersAction();

      expect(result.data?.users).toHaveLength(1);
      expect(result.data?.users[0].role).not.toContain('super-admin');
    });

    it('supports search by name', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      await listUsersAction({
        searchValue: 'John',
        searchField: 'name',
        searchOperator: 'contains',
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'John', mode: 'insensitive' },
          }),
        })
      );
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await listUsersAction();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when user is not admin', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'user@example.com', role: 'user' },
        session: { id: '1' },
      } as any);

      const result = await listUsersAction();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Accès refusé');
    });
  });

  describe('createUserAction', () => {
    it('creates user using Better Auth API', async () => {
      const mockUser = {
        id: '1',
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.createUser).mockResolvedValue(mockUser as any);

      const result = await createUserAction({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'user',
      });

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(auth.api.createUser).toHaveBeenCalled();
    });

    it('returns error when user creation fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.createUser).mockRejectedValue(new Error('Email already exists'));

      const result = await createUserAction({
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'user',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('setRoleAction', () => {
    it('sets user role successfully when admin', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        role: 'user',
      } as any);

      vi.mocked(auth.api.setRole).mockResolvedValue({ success: true } as any);

      const result = await setRoleAction('1', 'editor');

      expect(result.error).toBeNull();
      expect(auth.api.setRole).toHaveBeenCalled();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await setRoleAction('1', 'editor');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('deleteUserAction', () => {
    it('deletes user using Better Auth API', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.removeUser).mockResolvedValue(undefined);

      const result = await deleteUserAction('1');

      expect(result.error).toBeNull();
      expect(auth.api.removeUser).toHaveBeenCalled();
    });

    it('returns error when deletion fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.removeUser).mockRejectedValue(new Error('User not found'));

      const result = await deleteUserAction('1');

      expect(result.error).toBe('User not found');
    });
  });

  describe('banUserAction', () => {
    it('bans user using Better Auth API', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.banUser).mockResolvedValue(undefined);

      const result = await banUserAction('1', 'Violation of terms', undefined);

      expect(result.error).toBeNull();
      expect(auth.api.banUser).toHaveBeenCalled();
    });

    it('returns error when ban fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.banUser).mockRejectedValue(new Error('Cannot ban admin'));

      const result = await banUserAction('1', 'Reason', undefined);

      expect(result.error).toBe('Cannot ban admin');
    });
  });
});
