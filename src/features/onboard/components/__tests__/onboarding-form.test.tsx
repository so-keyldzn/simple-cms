import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingForm } from '../onboarding-form';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

vi.mock('../../lib/onboard-actions', () => ({
	createFirstAdmin: vi.fn(),
	completeOnboarding: vi.fn(),
}));

describe('OnboardingForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Admin Step', () => {
		it('renders admin creation form', () => {
			render(<OnboardingForm />);

			expect(screen.getByText('Créer le compte Super Admin')).toBeInTheDocument();
			expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
			expect(screen.getByLabelText(/Nom complet/)).toBeInTheDocument();
			expect(screen.getByLabelText(/^Mot de passe/)).toBeInTheDocument();
			expect(screen.getByLabelText(/Confirmer le mot de passe/)).toBeInTheDocument();
		});

		it('disables submit button when fields are empty', () => {
			render(<OnboardingForm />);

			const submitButton = screen.getByRole('button', { name: /Suivant/i });
			expect(submitButton).toBeDisabled();
		});

		it('enables submit button when all fields are filled', async () => {
			render(<OnboardingForm />);

			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});

			const submitButton = screen.getByRole('button', { name: /Suivant/i });
			expect(submitButton).not.toBeDisabled();
		});

		it('shows error when passwords do not match', async () => {
			render(<OnboardingForm />);

			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'DifferentPass123' },
			});

			const submitButton = screen.getByRole('button', { name: /Suivant/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith('Les mots de passe ne correspondent pas');
			});
		});

		it('creates admin and moves to site setup step on success', async () => {
			const { createFirstAdmin } = await import('../../lib/onboard-actions');
			vi.mocked(createFirstAdmin).mockResolvedValue({
				data: { userId: 'user-123' },
				error: null,
			});

			render(<OnboardingForm />);

			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});

			const submitButton = screen.getByRole('button', { name: /Suivant/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith('Super admin créé avec succès !');
				expect(screen.getByText('Configuration du site')).toBeInTheDocument();
			});
		});

		it('shows error message on admin creation failure', async () => {
			const { createFirstAdmin } = await import('../../lib/onboard-actions');
			vi.mocked(createFirstAdmin).mockResolvedValue({
				data: null,
				error: 'Email already exists',
			});

			render(<OnboardingForm />);

			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});

			const submitButton = screen.getByRole('button', { name: /Suivant/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith('Email already exists');
			});
		});
	});

	describe('Site Setup Step', () => {
		it('renders site setup form after admin creation', async () => {
			const { createFirstAdmin } = await import('../../lib/onboard-actions');
			vi.mocked(createFirstAdmin).mockResolvedValue({
				data: { userId: 'user-123' },
				error: null,
			});

			render(<OnboardingForm />);

			// Fill admin form
			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});

			fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

			await waitFor(() => {
				expect(screen.getByText('Configuration du site')).toBeInTheDocument();
				expect(screen.getByLabelText(/Nom du site/)).toBeInTheDocument();
				expect(screen.getByLabelText(/Description du site/)).toBeInTheDocument();
			});
		});

		it('allows going back to admin step', async () => {
			const { createFirstAdmin } = await import('../../lib/onboard-actions');
			vi.mocked(createFirstAdmin).mockResolvedValue({
				data: { userId: 'user-123' },
				error: null,
			});

			render(<OnboardingForm />);

			// Move to site setup step
			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

			await waitFor(() => {
				expect(screen.getByText('Configuration du site')).toBeInTheDocument();
			});

			// Go back
			const backButton = screen.getByRole('button', { name: /Retour/i });
			fireEvent.click(backButton);

			expect(screen.getByText('Créer le compte Super Admin')).toBeInTheDocument();
		});

		it('requires site name to complete setup', async () => {
			const { createFirstAdmin } = await import('../../lib/onboard-actions');
			vi.mocked(createFirstAdmin).mockResolvedValue({
				data: { userId: 'user-123' },
				error: null,
			});

			render(<OnboardingForm />);

			// Move to site setup step
			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

			await waitFor(() => {
				expect(screen.getByText('Configuration du site')).toBeInTheDocument();
			});

			const completeButton = screen.getByRole('button', { name: /Terminer la configuration/i });
			expect(completeButton).toBeDisabled();
		});

		it('completes onboarding and redirects on success', async () => {
			const { createFirstAdmin, completeOnboarding } = await import('../../lib/onboard-actions');

			vi.mocked(createFirstAdmin).mockResolvedValue({
				data: { userId: 'user-123' },
				error: null,
			});
			vi.mocked(completeOnboarding).mockResolvedValue({
				data: { success: true },
				error: null,
			});

			const mockPush = vi.fn();
			const mockRefresh = vi.fn();

			// Mock useRouter before render
			vi.mocked(await import('next/navigation')).useRouter = vi.fn(() => ({
				push: mockPush,
				refresh: mockRefresh,
			})) as any;

			render(<OnboardingForm />);

			// Complete admin step
			fireEvent.change(screen.getByLabelText(/Email/), {
				target: { value: 'admin@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/Nom complet/), {
				target: { value: 'Admin User' },
			});
			fireEvent.change(screen.getByLabelText(/^Mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
				target: { value: 'SecurePass123' },
			});
			fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

			await waitFor(() => {
				expect(screen.getByText('Configuration du site')).toBeInTheDocument();
			});

			// Complete site setup
			fireEvent.change(screen.getByLabelText(/Nom du site/), {
				target: { value: 'My Awesome Site' },
			});

			const completeButton = screen.getByRole('button', { name: /Terminer la configuration/i });
			fireEvent.click(completeButton);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith('Configuration terminée !');
				expect(mockPush).toHaveBeenCalledWith('/admin');
				expect(mockRefresh).toHaveBeenCalled();
			});
		});
	});
});
