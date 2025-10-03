import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPassword from '../reset-password';

// Mock dependencies
const mockResetPassword = vi.fn();
const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('@/features/auth/lib/auth-clients', () => ({
  resetPassword: (...args: any[]) => mockResetPassword(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue('valid-token');
  });

  it('renders the reset password form', () => {
    render(<ResetPassword />);

    expect(screen.getByRole('button', { name: /réinitialiser le mot de passe/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
  });

  it('has a submit button', () => {
    render(<ResetPassword />);
    const button = screen.getByRole('button', { name: /réinitialiser le mot de passe/i });
    expect(button).toBeInTheDocument();
  });

  it('updates password fields on user input', async () => {
    const user = userEvent.setup();
    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i) as HTMLInputElement;
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i) as HTMLInputElement;

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    expect(passwordInput.value).toBe('newpassword123');
    expect(confirmInput.value).toBe('newpassword123');
  });

  it('has password fields with correct type', () => {
    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');
  });

  it('has a link back to sign in page', () => {
    render(<ResetPassword />);

    const signInLink = screen.getByRole('link', { name: /la connexion/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  it('displays minimum password length requirement', () => {
    render(<ResetPassword />);

    expect(screen.getByText(/minimum 8 caractères/i)).toBeInTheDocument();
  });

  it('has minLength attribute on password inputs', () => {
    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);

    expect(passwordInput).toHaveAttribute('minLength', '8');
    expect(confirmInput).toHaveAttribute('minLength', '8');
  });

  it('calls resetPassword with correct parameters on submit', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockImplementation(() => Promise.resolve());

    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');
    await user.click(submitButton);

    expect(mockResetPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        newPassword: 'newpassword123',
        token: 'valid-token',
      }),
      expect.any(Object)
    );
  });

  it('shows success message after password reset', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve();
    });

    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');
    await user.click(submitButton);

    expect(screen.getByText('Mot de passe réinitialisé !')).toBeInTheDocument();
  });

  it('has sign in link in success state', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve();
    });

    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');
    await user.click(submitButton);

    const signInLink = screen.getByRole('link', { name: /se connecter/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  it('disables button when no token is available', () => {
    mockGet.mockReturnValue(null);
    render(<ResetPassword />);

    const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i });
    expect(submitButton).toBeDisabled();
  });
});
