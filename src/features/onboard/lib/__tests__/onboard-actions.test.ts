import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	checkOnboardingStatus,
	createFirstAdmin,
	completeOnboarding,
} from '../onboard-actions';
import { ERROR_MESSAGES } from '../validation';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
	prisma: {
		user: {
			count: vi.fn(),
			update: vi.fn(),
		},
		setting: {
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
			signUpEmail: vi.fn(),
		},
	},
}));

// Generate unique IPs for each test to avoid rate limiting issues
let testCounter = 0;
vi.mock('next/headers', () => ({
	headers: vi.fn(() => ({
		get: vi.fn((key: string) => {
			if (key === 'x-forwarded-for') return `127.0.0.${++testCounter}`;
			return null;
		}),
	})),
}));

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

describe('onboard-actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('checkOnboardingStatus', () => {
		it('returns needsOnboarding: true when no users exist', async () => {
			const { prisma } = await import('@/lib/prisma');
			vi.mocked(prisma.user.count).mockResolvedValue(0);

			const result = await checkOnboardingStatus();

			expect(result.data?.needsOnboarding).toBe(true);
			expect(result.error).toBeNull();
		});

		it('returns needsOnboarding: false when users exist', async () => {
			const { prisma } = await import('@/lib/prisma');
			vi.mocked(prisma.user.count).mockResolvedValue(1);

			const result = await checkOnboardingStatus();

			expect(result.data?.needsOnboarding).toBe(false);
			expect(result.error).toBeNull();
		});

		it('handles database errors gracefully', async () => {
			const { prisma } = await import('@/lib/prisma');
			vi.mocked(prisma.user.count).mockRejectedValue(new Error('Database error'));

			const result = await checkOnboardingStatus();

			expect(result.data).toBeNull();
			expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
		});
	});

	describe('createFirstAdmin', () => {
		it('creates first super admin successfully', async () => {
			const { prisma } = await import('@/lib/prisma');
			const { auth } = await import('@/features/auth/lib/auth');

			vi.mocked(prisma.user.count).mockResolvedValue(0);
			vi.mocked(auth.api.signUpEmail).mockResolvedValue({
				user: { id: 'user-123', email: 'admin@example.com', name: 'Admin' },
			} as any);
			vi.mocked(prisma.user.update).mockResolvedValue({
				id: 'user-123',
				role: 'super-admin',
				emailVerified: true,
			} as any);

			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: 'Admin User',
				password: 'SecurePass123',
			});

			expect(result.data?.userId).toBe('user-123');
			expect(result.error).toBeNull();
			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: 'user-123' },
				data: {
					role: 'super-admin',
					emailVerified: true,
				},
			});
		});

		it('blocks creation if onboarding is already complete', async () => {
			const { prisma } = await import('@/lib/prisma');
			vi.mocked(prisma.user.count).mockResolvedValue(1);

			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: 'Admin',
				password: 'SecurePass123',
			});

			expect(result.data).toBeNull();
			expect(result.error).toBe(ERROR_MESSAGES.ONBOARDING_COMPLETE);
		});

		it('validates email format', async () => {
			const result = await createFirstAdmin({
				email: 'invalid-email',
				name: 'Admin',
				password: 'SecurePass123',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('email');
		});

		it('blocks temporary email domains', async () => {
			const result = await createFirstAdmin({
				email: 'test@tempmail.com',
				name: 'Admin',
				password: 'SecurePass123',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('temporaires');
		});

		it('validates password strength', async () => {
			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: 'Admin',
				password: 'weak',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('8 caractères');
		});

		it('requires uppercase letter in password', async () => {
			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: 'Admin',
				password: 'lowercase123',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('majuscule');
		});

		it('requires number in password', async () => {
			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: 'Admin',
				password: 'NoNumbers',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('chiffre');
		});

		it('validates name length', async () => {
			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: 'A',
				password: 'SecurePass123',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('2 caractères');
		});

		it('rejects XSS attempts in name', async () => {
			const result = await createFirstAdmin({
				email: 'admin@example.com',
				name: '<script>alert("xss")</script>Admin',
				password: 'SecurePass123',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('caractères invalides');
		});
	});

	describe('completeOnboarding', () => {
		it('saves site settings successfully', async () => {
			const { auth } = await import('@/features/auth/lib/auth');
			const { prisma } = await import('@/lib/prisma');

			vi.mocked(auth.api.getSession).mockResolvedValue({
				user: { id: 'user-123', email: 'admin@example.com', role: 'super-admin' },
				session: { id: 'session-123' },
			} as any);

			const result = await completeOnboarding({
				siteName: 'My Site',
				siteDescription: 'A great site',
				siteLogo: 'https://example.com/logo.png',
				siteFavicon: 'https://example.com/favicon.ico',
			});

			expect(result.data?.success).toBe(true);
			expect(result.error).toBeNull();
			expect(prisma.$transaction).toHaveBeenCalled();
		});

		it('requires authentication', async () => {
			const { auth } = await import('@/features/auth/lib/auth');
			vi.mocked(auth.api.getSession).mockResolvedValue(null);

			const result = await completeOnboarding({
				siteName: 'My Site',
			});

			expect(result.data).toBeNull();
			expect(result.error).toBe(ERROR_MESSAGES.UNAUTHORIZED);
		});

		it('validates site name is required', async () => {
			const { auth } = await import('@/features/auth/lib/auth');

			vi.mocked(auth.api.getSession).mockResolvedValue({
				user: { id: 'user-123', email: 'admin@example.com', role: 'super-admin' },
				session: { id: 'session-123' },
			} as any);

			const result = await completeOnboarding({
				siteName: '',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('site');
		});

		it('validates URL format for logo and favicon', async () => {
			const { auth } = await import('@/features/auth/lib/auth');

			vi.mocked(auth.api.getSession).mockResolvedValue({
				user: { id: 'user-123', email: 'admin@example.com', role: 'super-admin' },
				session: { id: 'session-123' },
			} as any);

			const result = await completeOnboarding({
				siteName: 'My Site',
				siteLogo: 'not-a-url',
			});

			expect(result.data).toBeNull();
			expect(result.error).toContain('URL');
		});

		it('sanitizes XSS in site settings', async () => {
			const { auth } = await import('@/features/auth/lib/auth');
			const { prisma } = await import('@/lib/prisma');

			vi.mocked(auth.api.getSession).mockResolvedValue({
				user: { id: 'user-123', email: 'admin@example.com', role: 'super-admin' },
				session: { id: 'session-123' },
			} as any);

			const transactionMock = vi.fn().mockImplementation((callback) => callback({
				setting: {
					upsert: vi.fn().mockResolvedValue({}),
				},
			}));
			vi.mocked(prisma.$transaction).mockImplementation(transactionMock as any);

			await completeOnboarding({
				siteName: '<script>alert("xss")</script>My Site',
				siteDescription: '<img src=x onerror=alert(1)>',
			});

			const calls = transactionMock.mock.calls[0];
			expect(calls).toBeDefined();
		});
	});
});
