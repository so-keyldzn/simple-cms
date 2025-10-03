import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserDropdown from '../user-dropdown';

// Mock dependencies
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();
const mockPush = vi.fn();

vi.mock('@/features/auth/lib/auth-clients', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('UserDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    render(<UserDropdown />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('shows sign in and sign up buttons when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(<UserDropdown />);

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('sign in and sign up links have correct hrefs', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(<UserDropdown />);

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/sign-up');
  });

  it('shows user avatar button when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    const avatarButton = screen.getByRole('button', { name: /jd/i });
    expect(avatarButton).toBeInTheDocument();
  });

  it('displays user initials when no image is provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    const avatarButton = screen.getByRole('button');
    await user.click(avatarButton);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays profile and settings menu items', async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    const avatarButton = screen.getByRole('button');
    await user.click(avatarButton);

    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
  });

  it('displays logout menu item', async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    const avatarButton = screen.getByRole('button');
    await user.click(avatarButton);

    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('profile link has correct href', async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    const avatarButton = screen.getByRole('button');
    await user.click(avatarButton);

    const profileLink = screen.getByRole('menuitem', { name: /profile/i });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('settings link has correct href', async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    const avatarButton = screen.getByRole('button');
    await user.click(avatarButton);

    const settingsLink = screen.getByRole('menuitem', { name: /settings/i });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('handles user without name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: null,
          email: 'john@example.com',
        },
      },
      isPending: false,
    });

    render(<UserDropdown />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
