import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSettings, getSettingsByCategory, updateSettings } from '../setting-actions';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    setting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      setting: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    })),
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

describe('setting-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns all settings ordered by category and key', async () => {
      const mockSettings = [
        { id: '1', key: 'site_name', value: 'My Site', category: 'general', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', key: 'from_email', value: 'test@example.com', category: 'email', createdAt: new Date(), updatedAt: new Date() },
      ];

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.setting.findMany).mockResolvedValue(mockSettings as any);

      const result = await getSettings();

      expect(result.data).toEqual(mockSettings);
      expect(result.error).toBeNull();
      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      });
    });

    it('returns error when database query fails', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.setting.findMany).mockRejectedValue(new Error('Database error'));

      const result = await getSettings();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la récupération des paramètres');
    });
  });

  describe('getSettingsByCategory', () => {
    it('returns settings filtered by category when authenticated', async () => {
      const mockSettings = [
        { id: '1', key: 'site_name', value: 'My Site', category: 'general', createdAt: new Date(), updatedAt: new Date() },
      ];

      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.setting.findMany).mockResolvedValue(mockSettings as any);

      const result = await getSettingsByCategory('general');

      expect(result.data).toEqual(mockSettings);
      expect(result.error).toBeNull();
      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        where: { category: 'general' },
        orderBy: { key: 'asc' },
      });
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getSettingsByCategory('general');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });

    it('returns error when database query fails', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.setting.findMany).mockRejectedValue(new Error('Database error'));

      const result = await getSettingsByCategory('email');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la récupération des paramètres');
    });
  });

  describe('updateSettings', () => {
    it('updates multiple settings successfully when authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'admin' },
        session: { id: '1' },
      } as any);

      const mockResults = [
        { id: '1', key: 'site_name', value: 'New Site Name', category: 'general', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', key: 'from_email', value: 'new@example.com', category: 'email', createdAt: new Date(), updatedAt: new Date() },
      ];

      const settingsToUpdate = [
        { key: 'site_name', value: 'New Site Name', category: 'general' as const },
        { key: 'from_email', value: 'new@example.com', category: 'email' as const },
      ];

      const result = await updateSettings(settingsToUpdate);

      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });

    it('returns error when user is not authenticated', async () => {
      const { auth } = await import('@/features/auth/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateSettings([]);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Non autorisé');
    });
  });
});
