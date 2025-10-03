import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTagsAction, createTagAction, updateTagAction, deleteTagAction } from '../tag-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    postTag: {
      deleteMany: vi.fn(),
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

describe('tag-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listTagsAction', () => {
    it('returns all tags with post counts', async () => {
      const mockTags = [
        { id: '1', name: 'JavaScript', slug: 'javascript', _count: { posts: 10 } },
        { id: '2', name: 'TypeScript', slug: 'typescript', _count: { posts: 5 } },
      ];

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.tag.findMany).mockResolvedValue(mockTags as any);

      const result = await listTagsAction();

      expect(result.data).toEqual(mockTags);
      expect(result.error).toBeNull();
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
      });
    });

    it('returns error when database query fails', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.tag.findMany).mockRejectedValue(new Error('Database error'));

      const result = await listTagsAction();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('createTagAction', () => {
    it('creates a new tag with generated slug when authenticated', async () => {
      const mockTag = {
        id: '1',
        name: 'React',
        slug: 'react',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.tag.create).mockResolvedValue(mockTag as any);

      const result = await createTagAction({ name: 'React' });

      expect(result.data).toEqual(mockTag);
      expect(result.error).toBeNull();
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: 'React',
          slug: 'react',
        },
      });
    });

    it('generates correct slug from French characters', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.tag.create).mockResolvedValue({
        id: '1',
        name: 'Développement Web',
        slug: 'developpement-web',
      } as any);

      await createTagAction({ name: 'Développement Web' });

      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: 'Développement Web',
          slug: 'developpement-web',
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createTagAction({ name: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when database create fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.tag.create).mockRejectedValue(new Error('Unique constraint failed'));

      const result = await createTagAction({ name: 'Duplicate' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Unique constraint failed');
    });
  });

  describe('updateTagAction', () => {
    it('updates tag successfully when authenticated', async () => {
      const mockTag = {
        id: '1',
        name: 'Updated Tag',
        slug: 'updated-tag',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.tag.update).mockResolvedValue(mockTag as any);

      const result = await updateTagAction('1', { name: 'Updated Tag' });

      expect(result.data).toEqual(mockTag);
      expect(result.error).toBeNull();
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated Tag',
          slug: 'updated-tag',
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateTagAction('1', { name: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('deleteTagAction', () => {
    it('deletes tag successfully when authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.postTag.deleteMany).mockResolvedValue({ count: 5 } as any);
      vi.mocked(prisma.tag.delete).mockResolvedValue({ id: '1' } as any);

      const result = await deleteTagAction('1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(prisma.postTag.deleteMany).toHaveBeenCalledWith({
        where: { tagId: '1' },
      });
      expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await deleteTagAction('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when deletion fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.postTag.deleteMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.tag.delete).mockRejectedValue(new Error('Database error'));

      const result = await deleteTagAction('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });
});
