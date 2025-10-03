import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from '../session-provider';

// Mock dependencies
const mockRefresh = vi.fn();
const mockUseSession = vi.fn();

vi.mock('@/features/auth/lib/auth-clients', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
  }),
}));

describe('SessionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    mockUseSession.mockReturnValue({
      data: null,
    });

    render(
      <SessionProvider>
        <div>Test Content</div>
      </SessionProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    mockUseSession.mockReturnValue({
      data: null,
    });

    render(
      <SessionProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </SessionProvider>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('does not crash when session is null', () => {
    mockUseSession.mockReturnValue({
      data: null,
    });

    expect(() => {
      render(
        <SessionProvider>
          <div>Content</div>
        </SessionProvider>
      );
    }).not.toThrow();
  });

  it('does not crash when session exists', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    });

    expect(() => {
      render(
        <SessionProvider>
          <div>Content</div>
        </SessionProvider>
      );
    }).not.toThrow();
  });
});
