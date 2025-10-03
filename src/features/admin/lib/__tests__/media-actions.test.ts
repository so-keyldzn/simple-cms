import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia } from '../media-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    media: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

describe('media-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllMedia', () => {
    it('returns all media when no folder filter', async () => {
      const mockMedia = [
        {
          id: '1',
          filename: 'image.jpg',
          url: '/uploads/image.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          user: { id: '1', name: 'User', email: 'user@example.com' },
          folder: null,
        },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.findMany).mockResolvedValue(mockMedia as any);

      const result = await getAllMedia();

      expect(result.data).toEqual(mockMedia);
      expect(result.error).toBeNull();
    });

    it('filters media by folder', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.findMany).mockResolvedValue([]);

      await getAllMedia('folder-1');

      expect(prisma.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { folderId: 'folder-1' },
        })
      );
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getAllMedia();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when user lacks permissions', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'user' },
        session: { id: '1' },
      } as any);

      const result = await getAllMedia();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Accès refusé');
    });
  });

  describe('getMediaById', () => {
    it('returns media by ID', async () => {
      const mockMedia = {
        id: '1',
        filename: 'image.jpg',
        url: '/uploads/image.jpg',
        user: { id: '1', name: 'User', email: 'user@example.com' },
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.findUnique).mockResolvedValue(mockMedia as any);

      const result = await getMediaById('1');

      expect(result.data).toEqual(mockMedia);
      expect(result.error).toBeNull();
    });

    it('returns error when media not found', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.findUnique).mockResolvedValue(null);

      const result = await getMediaById('invalid');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Média non trouvé');
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getMediaById('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('createMedia', () => {
    it('creates media successfully', async () => {
      const mockMedia = {
        id: '1',
        filename: 'new-image.jpg',
        url: '/uploads/new-image.jpg',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.create).mockResolvedValue(mockMedia as any);

      const result = await createMedia({
        filename: 'new-image.jpg',
        originalName: 'image.jpg',
        url: '/uploads/new-image.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
      });

      expect(result.data).toEqual(mockMedia);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createMedia({
        filename: 'test.jpg',
        originalName: 'test.jpg',
        url: '/test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('updateMedia', () => {
    it('updates media successfully', async () => {
      const mockMedia = {
        id: '1',
        filename: 'updated.jpg',
        alt: 'Updated alt text',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.update).mockResolvedValue(mockMedia as any);

      const result = await updateMedia('1', { alt: 'Updated alt text' });

      expect(result.data).toEqual(mockMedia);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateMedia('1', { alt: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('deleteMedia', () => {
    it('deletes media successfully', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.media.delete).mockResolvedValue({ id: '1' } as any);

      const result = await deleteMedia('1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await deleteMedia('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });
});
