import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllFolders, createFolder, updateFolder, deleteFolder } from '../folder-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mediaFolder: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    media: {
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

describe('folder-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllFolders', () => {
    it('returns folders in hierarchical structure', async () => {
      const mockFolders = [
        { id: '1', name: 'Root', slug: 'root', parentId: null, order: 1, _count: { media: 5 } },
        { id: '2', name: 'Child', slug: 'child', parentId: '1', order: 1, _count: { media: 2 } },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.mediaFolder.findMany).mockResolvedValue(mockFolders as any);

      const result = await getAllFolders();

      expect(result.data).toBeTruthy();
      expect(result.data?.length).toBe(1); // Only root folder
      expect(result.data?.[0].children.length).toBe(1); // One child
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getAllFolders();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when user lacks permissions', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'user' },
        session: { id: '1' },
      } as any);

      const result = await getAllFolders();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Accès refusé');
    });
  });

  describe('createFolder', () => {
    it('creates folder with generated slug', async () => {
      const mockFolder = {
        id: '1',
        name: 'New Folder',
        slug: 'new-folder',
        order: 1,
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.mediaFolder.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.mediaFolder.count).mockResolvedValue(0);
      vi.mocked(prisma.mediaFolder.create).mockResolvedValue(mockFolder as any);

      const result = await createFolder({
        name: 'New Folder',
        description: 'Test folder',
      });

      expect(result.data).toEqual(mockFolder);
      expect(result.error).toBeNull();
    });

    it('generates slug from French characters', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.mediaFolder.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.mediaFolder.count).mockResolvedValue(0);
      vi.mocked(prisma.mediaFolder.create).mockResolvedValue({
        id: '1',
        name: 'Médias Été',
        slug: 'medias-ete',
      } as any);

      await createFolder({ name: 'Médias Été' });

      expect(prisma.mediaFolder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'medias-ete',
          }),
        })
      );
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createFolder({ name: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('updateFolder', () => {
    it('updates folder successfully', async () => {
      const mockFolder = {
        id: '1',
        name: 'Updated Folder',
        slug: 'updated-folder',
      };

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.mediaFolder.findUnique).mockResolvedValue({ id: '1', slug: 'old-slug' } as any);
      vi.mocked(prisma.mediaFolder.update).mockResolvedValue(mockFolder as any);

      const result = await updateFolder('1', { name: 'Updated Folder' });

      expect(result.data).toEqual(mockFolder);
      expect(result.error).toBeNull();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateFolder('1', { name: 'Test' });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });

  describe('deleteFolder', () => {
    it('deletes folder and updates media references', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'editor' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.mediaFolder.findUnique).mockResolvedValue({
        id: '1',
        _count: { media: 3, children: 0 },
      } as any);
      vi.mocked(prisma.media.updateMany).mockResolvedValue({ count: 3 } as any);
      vi.mocked(prisma.mediaFolder.delete).mockResolvedValue({ id: '1' } as any);

      const result = await deleteFolder('1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(prisma.media.updateMany).toHaveBeenCalledWith({
        where: { folderId: '1' },
        data: { folderId: null },
      });
      expect(prisma.mediaFolder.delete).toHaveBeenCalled();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await deleteFolder('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });
});
