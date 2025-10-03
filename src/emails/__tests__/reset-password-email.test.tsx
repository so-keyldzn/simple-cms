import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResetPasswordEmail } from '../reset-password-email';

describe('ResetPasswordEmail', () => {
  const mockUrl = 'https://example.com/reset-password?token=xyz789';

  it('renders the email template', () => {
    const { container } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(container).toBeTruthy();
  });

  it('displays the reset URL in the button', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    const button = getByText('Réinitialiser mon mot de passe');
    expect(button).toHaveAttribute('href', mockUrl);
  });

  it('displays the reset URL in the fallback link', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    const links = getByText(mockUrl);
    expect(links).toHaveAttribute('href', mockUrl);
  });

  it('displays the user name when provided', () => {
    const { getByText } = render(
      <ResetPasswordEmail userName="Jane Doe" resetUrl={mockUrl} />
    );
    expect(getByText(/Bonjour Jane Doe/)).toBeInTheDocument();
  });

  it('does not display greeting when userName is not provided', () => {
    const { queryByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(queryByText(/Bonjour/)).not.toBeInTheDocument();
  });

  it('contains the correct heading text', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(getByText('Réinitialisation de votre mot de passe')).toBeInTheDocument();
  });

  it('contains instructions for the user', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(getByText(/Vous avez demandé à réinitialiser/)).toBeInTheDocument();
  });

  it('contains security warning about expiration', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(getByText(/Ce lien expirera dans 1 heure/)).toBeInTheDocument();
  });

  it('contains fallback instructions', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(getByText(/Si le bouton ne fonctionne pas/)).toBeInTheDocument();
  });

  it('contains ignore instructions', () => {
    const { getByText } = render(
      <ResetPasswordEmail resetUrl={mockUrl} />
    );
    expect(getByText(/Si vous n'avez pas demandé/)).toBeInTheDocument();
  });
});
