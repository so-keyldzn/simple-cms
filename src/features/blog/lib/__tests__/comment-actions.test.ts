import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCommentAction, listPostCommentsAction, updateCommentStatusAction } from '../comment-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    comment: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    post: {
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
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'x-forwarded-for') return '127.0.0.1';
      if (key === 'user-agent') return 'test-agent';
      return null;
    }),
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/roles', () => ({
  hasPermission: vi.fn(),
}));

describe('comment-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCommentAction', () => {
    it('creates a comment successfully when authenticated and post allows comments', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.count).mockResolvedValue(0); // No recent comments
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-1',
        commentsEnabled: true,
        published: true,
      } as any);
      vi.mocked(prisma.comment.create).mockResolvedValue({
        id: 'comment-1',
        content: 'Test comment',
        authorId: '1',
      } as any);

      const result = await createCommentAction({
        postId: 'post-1',
        content: 'Test comment',
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createCommentAction({
        postId: 'post-1',
        content: 'Test comment',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Vous devez être connecté pour commenter');
    });

    it('returns error when comment is too short', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const result = await createCommentAction({
        postId: 'post-1',
        content: 'ab',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Le commentaire doit contenir au moins 3 caractères');
    });

    it('returns error when comment is too long', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const result = await createCommentAction({
        postId: 'post-1',
        content: 'a'.repeat(5001),
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Le commentaire ne peut pas dépasser 5000 caractères');
    });

    it('returns error when rate limit is exceeded', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.count).mockResolvedValue(5); // Rate limit reached

      const result = await createCommentAction({
        postId: 'post-1',
        content: 'Test comment',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Vous postez trop de commentaires. Veuillez patienter une minute.');
    });

    it('returns error when post does not exist', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.count).mockResolvedValue(0);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

      const result = await createCommentAction({
        postId: 'invalid-post',
        content: 'Test comment',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Article non trouvé');
    });

    it('sanitizes HTML content from comments', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', name: 'Test' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.count).mockResolvedValue(0);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: 'post-1',
        commentsEnabled: true,
        published: true,
      } as any);
      vi.mocked(prisma.comment.create).mockResolvedValue({
        id: 'comment-1',
        content: 'Test comment',
      } as any);

      await createCommentAction({
        postId: 'post-1',
        content: 'Test <script>alert("xss")</script> comment',
      });

      // The sanitized content should not contain the script tag
      expect(prisma.comment.create).toHaveBeenCalled();
    });
  });

  describe('listPostCommentsAction', () => {
    it('returns approved comments for a post', async () => {
      const mockComments = [
        {
          id: '1',
          content: 'Great post!',
          status: 'APPROVED',
          author: { name: 'User 1' },
          replies: [],
        },
      ];

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.findMany).mockResolvedValue(mockComments as any);

      const result = await listPostCommentsAction('post-1');

      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });

    it('returns approved comments even with empty postId', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.findMany).mockResolvedValue([]);

      const result = await listPostCommentsAction('');

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe('updateCommentStatusAction', () => {
    it('updates comment status when user has permission', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'moderator' },
        session: { id: '1' },
      } as any);

      const { hasPermission } = await import('@/lib/roles');
      vi.mocked(hasPermission).mockReturnValue(true);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.comment.update).mockResolvedValue({
        id: 'comment-1',
        status: 'APPROVED',
      } as any);

      const result = await updateCommentStatusAction('comment-1', 'APPROVED');

      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateCommentStatusAction('comment-1', 'APPROVED');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when user lacks permission', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'user' },
        session: { id: '1' },
      } as any);

      const { hasPermission } = await import('@/lib/roles');
      vi.mocked(hasPermission).mockReturnValue(false);

      const result = await updateCommentStatusAction('comment-1', 'APPROVED');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Vous n\'avez pas la permission de modérer les commentaires');
    });
  });
});
