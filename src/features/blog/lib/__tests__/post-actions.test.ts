import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listPostsAction, createPostAction, updatePostAction, deletePostAction } from '../post-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    postTag: {
      deleteMany: vi.fn(),
    },
    comment: {
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

describe('post-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPostsAction', () => {
    it('returns all posts with pagination when authenticated', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'First Post',
          slug: 'first-post',
          author: { name: 'John', email: 'john@example.com' },
          category: { id: 'cat-1', name: 'Tech' },
          tags: [],
        },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);
      vi.mocked(prisma.post.count).mockResolvedValue(1);

      const result = await listPostsAction({ limit: 10, offset: 0 });

      expect(result.data).toEqual({ posts: mockPosts, total: 1 });
      expect(result.error).toBeNull();
    });

    it('filters posts by search query', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue([]);
      vi.mocked(prisma.post.count).mockResolvedValue(0);

      await listPostsAction({ search: 'test query' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'test query', mode: 'insensitive' } },
              { excerpt: { contains: 'test query', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('filters posts by published status', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue([]);
      vi.mocked(prisma.post.count).mockResolvedValue(0);

      await listPostsAction({ published: true });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            published: true,
          }),
        })
      );
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await listPostsAction();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('createPostAction', () => {
    it('creates a new post with generated slug when authenticated', async () => {
      const mockPost = {
        id: '1',
        title: 'New Post',
        slug: 'new-post',
        content: 'Content here',
        published: false,
        author: { name: 'John', email: 'john@example.com' },
        category: null,
        tags: [],
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.create).mockResolvedValue(mockPost as any);

      const result = await createPostAction({
        title: 'New Post',
        content: 'Content here',
      });

      expect(result.data).toEqual(mockPost);
      expect(result.error).toBeNull();
      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Post',
            slug: 'new-post',
            content: 'Content here',
            authorId: '1',
          }),
        })
      );
    });

    it('creates post with tags when provided', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.create).mockResolvedValue({
        id: '1',
        title: 'Tagged Post',
        slug: 'tagged-post',
      } as any);

      await createPostAction({
        title: 'Tagged Post',
        content: 'Content',
        tags: ['tag-1', 'tag-2'],
      });

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: {
              create: [
                { tag: { connect: { id: 'tag-1' } } },
                { tag: { connect: { id: 'tag-2' } } },
              ],
            },
          }),
        })
      );
    });

    it('sets publishedAt when post is published', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.create).mockResolvedValue({ id: '1' } as any);

      await createPostAction({
        title: 'Published Post',
        content: 'Content',
        published: true,
      });

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            published: true,
            publishedAt: expect.any(Date),
          }),
        })
      );
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createPostAction({
        title: 'Test',
        content: 'Test',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('updatePostAction', () => {
    it('updates post successfully when authenticated', async () => {
      const mockPost = {
        id: '1',
        title: 'Updated Post',
        slug: 'updated-post',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.update).mockResolvedValue(mockPost as any);

      const result = await updatePostAction('1', {
        title: 'Updated Post',
      });

      expect(result.data).toEqual(mockPost);
      expect(result.error).toBeNull();
    });

    it('updates slug when title changes', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.update).mockResolvedValue({ id: '1' } as any);

      await updatePostAction('1', { title: 'New Title' });

      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Title',
            slug: 'new-title',
          }),
        })
      );
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updatePostAction('1', { title: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('deletePostAction', () => {
    it('deletes post successfully when authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.delete).mockResolvedValue({ id: '1' } as any);

      const result = await deletePostAction('1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await deletePostAction('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });
});
