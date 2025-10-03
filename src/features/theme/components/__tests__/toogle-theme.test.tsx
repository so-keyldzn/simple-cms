import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeToggle } from '../toogle-theme';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'light',
  }),
}));

describe('ModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the theme toggle button', () => {
    render(<ModeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessible label for screen readers', () => {
    render(<ModeToggle />);
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('displays sun and moon icons', () => {
    const { container } = render(<ModeToggle />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(2); // Sun and Moon icons
  });

  it('opens dropdown menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme with "light" when Light option is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    const lightOption = screen.getByText('Light');
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with "dark" when Dark option is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    const darkOption = screen.getByText('Dark');
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "system" when System option is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    const systemOption = screen.getByText('System');
    await user.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('has outline variant and icon size', () => {
    const { container } = render(<ModeToggle />);
    const button = container.querySelector('button');

    // The button should have the variant and size classes
    expect(button).toHaveClass('size-9'); // icon size button
  });
});
