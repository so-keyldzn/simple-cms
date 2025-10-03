import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile, getProfile } from '../profile-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('profile-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('updates user profile successfully when authenticated', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'john@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await updateProfile({
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      });

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'John Doe',
          image: 'https://example.com/avatar.jpg',
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateProfile({ name: 'John Doe' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('handles null image value', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'john@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      } as any);

      const result = await updateProfile({ name: 'John Doe', image: null });

      expect(result.error).toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'John Doe', image: null },
      });
    });

    it('returns error when database update fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'john@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database error'));

      const result = await updateProfile({ name: 'John Doe' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la mise à jour du profil');
    });
  });

  describe('getProfile', () => {
    it('returns user profile when authenticated', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'john@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await getProfile();

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getProfile();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when user is not found', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '999', email: 'nonexistent@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await getProfile();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Utilisateur non trouvé');
    });

    it('returns error when database query fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'john@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));

      const result = await getProfile();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la récupération du profil');
    });
  });
});
