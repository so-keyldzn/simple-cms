import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../category-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    post: {
      updateMany: vi.fn(),
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

describe('category-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCategoriesAction', () => {
    it('returns all categories with post counts', async () => {
      const mockCategories = [
        { id: '1', name: 'Technology', slug: 'technology', description: 'Tech posts', _count: { posts: 5 } },
        { id: '2', name: 'Design', slug: 'design', description: 'Design posts', _count: { posts: 3 } },
      ];

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const result = await listCategoriesAction();

      expect(result.data).toEqual(mockCategories);
      expect(result.error).toBeNull();
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
      });
    });

    it('returns error when database query fails', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.category.findMany).mockRejectedValue(new Error('Database error'));

      const result = await listCategoriesAction();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('createCategoryAction', () => {
    it('creates a new category with generated slug when authenticated', async () => {
      const mockCategory = {
        id: '1',
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

      const result = await createCategoryAction({
        name: 'New Category',
        description: 'A new category',
      });

      expect(result.data).toEqual(mockCategory);
      expect(result.error).toBeNull();
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'New Category',
          slug: 'new-category',
          description: 'A new category',
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
      vi.mocked(prisma.category.create).mockResolvedValue({
        id: '1',
        name: 'Développement',
        slug: 'developpement',
        description: null,
      } as any);

      await createCategoryAction({ name: 'Développement' });

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Développement',
          slug: 'developpement',
          description: undefined,
        },
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createCategoryAction({ name: 'Test' });

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
      vi.mocked(prisma.category.create).mockRejectedValue(new Error('Unique constraint failed'));

      const result = await createCategoryAction({ name: 'Duplicate' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Unique constraint failed');
    });
  });

  describe('updateCategoryAction', () => {
    it('updates category successfully when authenticated', async () => {
      const mockCategory = {
        id: '1',
        name: 'Updated Category',
        slug: 'updated-category',
        description: 'Updated description',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

      const result = await updateCategoryAction('1', {
        name: 'Updated Category',
        description: 'Updated description',
      });

      expect(result.data).toEqual(mockCategory);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateCategoryAction('1', { name: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('deleteCategoryAction', () => {
    it('deletes category successfully when authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.updateMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.category.delete).mockResolvedValue({ id: '1' } as any);

      const result = await deleteCategoryAction('1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(prisma.post.updateMany).toHaveBeenCalledWith({
        where: { categoryId: '1' },
        data: { categoryId: null },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await deleteCategoryAction('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when category deletion fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.updateMany).mockResolvedValue({ count: 0 } as any);
      vi.mocked(prisma.category.delete).mockRejectedValue(
        new Error('Database error')
      );

      const result = await deleteCategoryAction('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });
});
