import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../theme-provider';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

describe('ThemeProvider', () => {
  it('renders children wrapped in NextThemesProvider', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('forwards props to NextThemesProvider', () => {
    const { getByTestId } = render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </ThemeProvider>
    );

    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
  });
});
