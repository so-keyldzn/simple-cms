import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserGrowth,
  getCommentsTrends,
  getMediaStorageStats,
  getContentPerformance,
  getUserActivityStats,
  getPublishingFrequency,
  getNavigationStats,
} from '../advanced-analytics-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
    },
    media: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    post: {
      findMany: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    navigationMenu: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    navigationItem: {
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
    TOP_UPLOADERS: 5,
    MOST_COMMENTED_POSTS: 10,
    MOST_USED_TAGS: 10,
    ACTIVE_AUTHORS: 10,
  },
  DEFAULT_DAYS_RANGE: {
    USER_GROWTH: 30,
    COMMENTS_TRENDS: 30,
    PUBLISHING_FREQUENCY: 90,
  },
}));

describe('advanced-analytics-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserGrowth', () => {
    it('returns user growth statistics by day', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { createdAt: new Date('2024-01-01') },
        { createdAt: new Date('2024-01-01') },
        { createdAt: new Date('2024-01-02') },
      ] as any);

      const result = await getUserGrowth(7);

      expect(result.data).toBeTruthy();
      expect(result.data?.length).toBe(2); // 2 unique days
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getUserGrowth();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getCommentsTrends', () => {
    it('returns comment trends by status and day', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.findMany).mockResolvedValue([
        { createdAt: new Date('2024-01-01'), status: 'APPROVED' },
        { createdAt: new Date('2024-01-01'), status: 'PENDING' },
        { createdAt: new Date('2024-01-02'), status: 'REJECTED' },
      ] as any);

      const result = await getCommentsTrends(7);

      expect(result.data).toBeTruthy();
      expect(result.data?.length).toBe(2); // 2 unique days
      expect(result.error).toBeNull();
    });

    it('groups comments by status correctly', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.findMany).mockResolvedValue([
        { createdAt: new Date('2024-01-01'), status: 'APPROVED' },
        { createdAt: new Date('2024-01-01'), status: 'APPROVED' },
        { createdAt: new Date('2024-01-01'), status: 'PENDING' },
      ] as any);

      const result = await getCommentsTrends(7);

      expect(result.data?.[0]).toMatchObject({
        date: '2024-01-01',
        approved: 2,
        pending: 1,
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getCommentsTrends();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getMediaStorageStats', () => {
    it('returns comprehensive media storage statistics', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.aggregate).mockResolvedValue({
        _sum: { size: 1024000 },
      } as any);
      vi.mocked(prisma.media.groupBy)
        .mockResolvedValueOnce([
          { mimeType: 'image/png', _count: 10, _sum: { size: 500000 } },
          { mimeType: 'image/jpeg', _count: 5, _sum: { size: 300000 } },
        ] as any)
        .mockResolvedValueOnce([
          { userId: 'user-1', _count: 8, _sum: { size: 400000 } },
          { userId: 'user-2', _count: 7, _sum: { size: 300000 } },
        ] as any);
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'user-1', name: 'John', email: 'john@example.com' },
        { id: 'user-2', name: 'Jane', email: 'jane@example.com' },
      ] as any);

      const result = await getMediaStorageStats();

      expect(result.data).toEqual({
        totalSize: 1024000,
        mediaTypes: [
          { mimeType: 'image/png', count: 10, size: 500000 },
          { mimeType: 'image/jpeg', count: 5, size: 300000 },
        ],
        topUploaders: [
          { id: 'user-1', name: 'John', email: 'john@example.com', count: 8, totalSize: 400000 },
          { id: 'user-2', name: 'Jane', email: 'jane@example.com', count: 7, totalSize: 300000 },
        ],
      });
      expect(result.error).toBeNull();
    });

    it('handles null user names in top uploaders', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.aggregate).mockResolvedValue({
        _sum: { size: 0 },
      } as any);
      vi.mocked(prisma.media.groupBy)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { userId: 'user-1', _count: 5, _sum: { size: 200000 } },
        ] as any);
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'user-1', name: null, email: 'user@example.com' },
      ] as any);

      const result = await getMediaStorageStats();

      expect(result.data?.topUploaders[0].name).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getMediaStorageStats();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getContentPerformance', () => {
    it('returns content performance statistics', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', _count: { comments: 20 } },
        { id: '2', title: 'Post 2', _count: { comments: 15 } },
      ];
      const mockTags = [
        { id: '1', name: 'Tech', _count: { posts: 10 } },
        { id: '2', name: 'Design', _count: { posts: 8 } },
      ];
      const mockCategories = [
        { id: '1', name: 'Technology', _count: { posts: 25 } },
        { id: '2', name: 'Business', _count: { posts: 15 } },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);
      vi.mocked(prisma.tag.findMany).mockResolvedValue(mockTags as any);
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const result = await getContentPerformance();

      expect(result.data).toEqual({
        mostCommentedPosts: mockPosts,
        mostUsedTags: mockTags,
        categoryDistribution: mockCategories,
      });
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getContentPerformance();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getUserActivityStats', () => {
    it('returns user activity statistics', async () => {
      const mockAuthors = [
        {
          id: '1',
          name: 'John',
          email: 'john@example.com',
          role: 'author',
          _count: { posts: 10, comments: 5, media: 15 },
        },
      ];
      const mockRoleDistribution = [
        { role: 'admin', _count: 2 },
        { role: 'editor', _count: 5 },
        { role: 'author', _count: 10 },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockAuthors as any);
      vi.mocked(prisma.user.groupBy).mockResolvedValue(mockRoleDistribution as any);
      vi.mocked(prisma.user.count).mockResolvedValue(3);

      const result = await getUserActivityStats();

      expect(result.data).toEqual({
        activeAuthors: mockAuthors,
        roleDistribution: [
          { role: 'admin', count: 2 },
          { role: 'editor', count: 5 },
          { role: 'author', count: 10 },
        ],
        bannedUsers: 3,
      });
      expect(result.error).toBeNull();
    });

    it('handles null role values', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: null, _count: 5 },
      ] as any);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const result = await getUserActivityStats();

      expect(result.data?.roleDistribution[0].role).toBe('user');
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getUserActivityStats();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getPublishingFrequency', () => {
    it('returns publishing frequency grouped by week', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue([
        { publishedAt: new Date('2024-01-01') },
        { publishedAt: new Date('2024-01-02') },
        { publishedAt: new Date('2024-01-08') },
      ] as any);

      const result = await getPublishingFrequency(30);

      expect(result.data).toBeTruthy();
      expect(result.data?.length).toBe(2); // 2 different weeks
      expect(result.error).toBeNull();
    });

    it('handles posts with null publishedAt', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.post.findMany).mockResolvedValue([
        { publishedAt: null },
        { publishedAt: new Date('2024-01-01') },
      ] as any);

      const result = await getPublishingFrequency(30);

      expect(result.data?.length).toBe(1); // Only 1 valid week
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getPublishingFrequency();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('getNavigationStats', () => {
    it('returns navigation statistics', async () => {
      const mockActiveMenus = [
        { id: '1', name: 'main', label: 'Main Menu', _count: { items: 5 } },
        { id: '2', name: 'footer', label: 'Footer Menu', _count: { items: 3 } },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.count).mockResolvedValue(5);
      vi.mocked(prisma.navigationItem.count).mockResolvedValue(20);
      vi.mocked(prisma.navigationMenu.findMany).mockResolvedValue(mockActiveMenus as any);

      const result = await getNavigationStats();

      expect(result.data).toEqual({
        totalMenus: 5,
        totalItems: 20,
        activeMenus: mockActiveMenus,
      });
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getNavigationStats();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });
});
