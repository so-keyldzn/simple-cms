import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAnalyticsStats, getPostsPerDay, getTopCategories, getTopAuthors } from '../analytics-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    tag: {
      count: vi.fn(),
    },
    comment: {
      count: vi.fn(),
    },
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    media: {
      count: vi.fn(),
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

vi.mock('@/lib/analytics-utils', () => ({
  ANALYTICS_LIMITS: {
    TOP_CATEGORIES: 5,
    TOP_AUTHORS: 5,
    RECENT_ACTIVITY: 10,
  },
  DEFAULT_DAYS_RANGE: 30,
}));

describe('analytics-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalyticsStats', () => {
    it('returns comprehensive analytics statistics', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.count)
        .mockResolvedValueOnce(100) // totalPosts
        .mockResolvedValueOnce(75); // publishedPosts
      vi.mocked(prisma.category.count).mockResolvedValue(10);
      vi.mocked(prisma.tag.count).mockResolvedValue(25);
      vi.mocked(prisma.comment.count)
        .mockResolvedValueOnce(50) // totalComments
        .mockResolvedValueOnce(10) // pendingComments
        .mockResolvedValueOnce(35) // approvedComments
        .mockResolvedValueOnce(5); // rejectedComments
      vi.mocked(prisma.user.count).mockResolvedValue(20);
      vi.mocked(prisma.media.count).mockResolvedValue(150);

      const result = await getAnalyticsStats();

      expect(result.data).toEqual({
        totalPosts: 100,
        publishedPosts: 75,
        draftPosts: 25,
        totalCategories: 10,
        totalTags: 25,
        totalComments: 50,
        pendingComments: 10,
        approvedComments: 35,
        rejectedComments: 5,
        totalUsers: 20,
        totalMedia: 150,
      });
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getAnalyticsStats();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('calculates draft posts correctly', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.count)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30);
      vi.mocked(prisma.category.count).mockResolvedValue(0);
      vi.mocked(prisma.tag.count).mockResolvedValue(0);
      vi.mocked(prisma.comment.count).mockResolvedValue(0);
      vi.mocked(prisma.user.count).mockResolvedValue(0);
      vi.mocked(prisma.media.count).mockResolvedValue(0);

      const result = await getAnalyticsStats();

      expect(result.data?.draftPosts).toBe(20);
    });
  });

  describe('getPostsPerDay', () => {
    it('returns post creation statistics over time', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue([
        { createdAt: new Date('2024-01-01') },
        { createdAt: new Date('2024-01-01') },
        { createdAt: new Date('2024-01-02') },
      ] as any);

      const result = await getPostsPerDay(7);

      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getPostsPerDay();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getTopCategories', () => {
    it('returns categories with most posts', async () => {
      const mockCategories = [
        { id: '1', name: 'Technology', _count: { posts: 50 } },
        { id: '2', name: 'Design', _count: { posts: 30 } },
        { id: '3', name: 'Business', _count: { posts: 20 } },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const result = await getTopCategories();

      expect(result.data).toEqual(mockCategories);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getTopCategories();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getTopAuthors', () => {
    it('returns authors with most posts', async () => {
      const mockAuthors = [
        { id: '1', name: 'John Doe', email: 'john@example.com', _count: { posts: 25 } },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', _count: { posts: 20 } },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockAuthors as any);

      const result = await getTopAuthors();

      expect(result.data).toEqual(mockAuthors);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getTopAuthors();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });
});
