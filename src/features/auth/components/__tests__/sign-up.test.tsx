import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '../sign-up';

// Mock dependencies
vi.mock('@/features/auth/lib/auth-clients', () => ({
  signUp: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('SignUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign up form', () => {
    render(<SignUp />);

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('has a submit button', () => {
    render(<SignUp />);
    const button = screen.getByRole('button', { name: /create an account/i });
    expect(button).toBeInTheDocument();
  });

  it('updates form fields on user input', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  it('has password fields with correct type', () => {
    render(<SignUp />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('displays better-auth branding', () => {
    render(<SignUp />);

    expect(screen.getByText(/secured by/i)).toBeInTheDocument();
    expect(screen.getByText(/better-auth/i)).toBeInTheDocument();
  });

  it('displays image upload section', () => {
    render(<SignUp />);

    const imageInput = screen.getByLabelText(/profile image/i);
    expect(imageInput).toBeInTheDocument();
    expect(imageInput).toHaveAttribute('type', 'file');
  });

  it('has proper input placeholders', () => {
    render(<SignUp />);

    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Robinson')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument();
  });

  it('has autocomplete attributes on password fields', () => {
    render(<SignUp />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
  });
});
