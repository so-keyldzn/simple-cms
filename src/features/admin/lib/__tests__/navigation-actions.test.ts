import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNavigationMenus, getNavigationMenu, getNavigationMenuByName } from '../navigation-actions';

// Mock Resend to prevent API key errors
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    navigationMenu: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('navigation-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNavigationMenus', () => {
    it('returns all navigation menus with item counts', async () => {
      const mockMenus = [
        {
          id: '1',
          name: 'header',
          label: 'Header Menu',
          description: 'Main header navigation',
          isActive: true,
          _count: { items: 5 },
        },
        {
          id: '2',
          name: 'footer',
          label: 'Footer Menu',
          description: 'Footer navigation',
          isActive: true,
          _count: { items: 3 },
        },
      ];

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findMany).mockResolvedValue(mockMenus as any);

      const result = await getNavigationMenus();

      expect(result.data).toEqual(mockMenus);
      expect(result.error).toBeNull();
      expect(prisma.navigationMenu.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });
    });

    it('returns error when database query fails', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findMany).mockRejectedValue(new Error('Database error'));

      const result = await getNavigationMenus();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la récupération des menus');
    });
  });

  describe('getNavigationMenu', () => {
    it('returns navigation menu with items', async () => {
      const mockMenu = {
        id: '1',
        name: 'header',
        label: 'Header Menu',
        description: 'Main header navigation',
        isActive: true,
        items: [
          { id: 'item-1', title: 'Home', href: '/', order: 1, children: [] },
          { id: 'item-2', title: 'About', href: '/about', order: 2, children: [] },
        ],
      };

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockResolvedValue(mockMenu as any);

      const result = await getNavigationMenu('1');

      expect(result.data).toEqual(mockMenu);
      expect(result.error).toBeNull();
      expect(prisma.navigationMenu.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          items: {
            orderBy: { order: 'asc' },
            include: {
              children: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
    });

    it('returns error when menu is not found', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockResolvedValue(null);

      const result = await getNavigationMenu('invalid-id');

      expect(result.data).toBeNull();
    });

    it('returns error when database query fails', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockRejectedValue(new Error('Database error'));

      const result = await getNavigationMenu('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la récupération du menu');
    });
  });

  describe('getNavigationMenuByName', () => {
    it('returns active navigation menu by name with hierarchical items', async () => {
      const mockMenu = {
        id: '1',
        name: 'header',
        label: 'Header Menu',
        description: 'Main header navigation',
        isActive: true,
        items: [
          {
            id: 'item-1',
            title: 'Home',
            href: '/',
            order: 1,
            parentId: null,
            children: [],
          },
          {
            id: 'item-2',
            title: 'Services',
            href: '/services',
            order: 2,
            parentId: null,
            children: [
              {
                id: 'item-3',
                title: 'Web Development',
                href: '/services/web',
                order: 1,
                parentId: 'item-2',
                children: [],
              },
            ],
          },
        ],
      };

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockResolvedValue(mockMenu as any);

      const result = await getNavigationMenuByName('header');

      expect(result.data).toEqual(mockMenu);
      expect(result.error).toBeNull();
      expect(prisma.navigationMenu.findUnique).toHaveBeenCalledWith({
        where: { name: 'header', isActive: true },
        include: {
          items: {
            where: { parentId: null },
            orderBy: { order: 'asc' },
            include: {
              children: {
                orderBy: { order: 'asc' },
                include: {
                  children: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('returns null when menu is not active', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockResolvedValue(null);

      const result = await getNavigationMenuByName('inactive-menu');

      expect(result.data).toBeNull();
    });

    it('returns error when database query fails', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockRejectedValue(new Error('Database error'));

      const result = await getNavigationMenuByName('header');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erreur lors de la récupération du menu');
    });

    it('supports nested navigation items up to 3 levels', async () => {
      const mockMenu = {
        id: '1',
        name: 'header',
        items: [
          {
            id: 'item-1',
            title: 'Level 1',
            children: [
              {
                id: 'item-2',
                title: 'Level 2',
                children: [
                  {
                    id: 'item-3',
                    title: 'Level 3',
                  },
                ],
              },
            ],
          },
        ],
      };

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.navigationMenu.findUnique).mockResolvedValue(mockMenu as any);

      const result = await getNavigationMenuByName('header');

      expect(result.data).toEqual(mockMenu);
      expect(result.data?.items[0].children?.[0].children).toBeDefined();
    });
  });
});
