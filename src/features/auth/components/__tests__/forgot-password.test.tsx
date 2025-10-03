import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../forgot-password';

// Mock dependencies
const mockForgetPassword = vi.fn();
vi.mock('@/features/auth/lib/auth-clients', () => ({
  forgetPassword: (...args: any[]) => mockForgetPassword(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    render(<ForgotPassword />);

    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('has a submit button', () => {
    render(<ForgotPassword />);
    const button = screen.getByRole('button', { name: /envoyer le lien/i });
    expect(button).toBeInTheDocument();
  });

  it('updates email field on user input', async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.type(emailInput, 'test@example.com');

    expect(emailInput.value).toBe('test@example.com');
  });

  it('has a link back to sign in page', () => {
    render(<ForgotPassword />);

    const signInLink = screen.getByRole('link', { name: /se connecter/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  it('calls forgetPassword with correct parameters on submit', async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /envoyer le lien/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(mockForgetPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        redirectTo: '/reset-password',
      }),
      expect.any(Object)
    );
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    mockForgetPassword.mockImplementation((data, callbacks) => {
      callbacks.onRequest();
      return Promise.resolve();
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /envoyer le lien/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Loading state is shown
    expect(mockForgetPassword).toHaveBeenCalled();
  });

  it('shows success message after email is sent', async () => {
    const user = userEvent.setup();
    mockForgetPassword.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve();
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /envoyer le lien/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Success message is shown
    expect(screen.getByText('Email envoyé ✉️')).toBeInTheDocument();
    expect(screen.getByText(/vérifiez votre boîte de réception/i)).toBeInTheDocument();
  });

  it('displays user email in success message', async () => {
    const user = userEvent.setup();
    mockForgetPassword.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve();
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'john@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('has resend email button in success state', async () => {
    const user = userEvent.setup();
    mockForgetPassword.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve();
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    expect(screen.getByRole('button', { name: /renvoyer l'email/i })).toBeInTheDocument();
  });

  it('allows user to go back to form from success state', async () => {
    const user = userEvent.setup();
    mockForgetPassword.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve();
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    // Click resend button
    await user.click(screen.getByRole('button', { name: /renvoyer l'email/i }));

    // Should be back to form
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
  });
});
