import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VerificationEmail } from '../verification-email';

describe('VerificationEmail', () => {
  const mockUrl = 'https://example.com/verify?token=abc123';

  it('renders the email template', () => {
    const { container } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    expect(container).toBeTruthy();
  });

  it('displays the verification URL in the button', () => {
    const { getByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    const button = getByText('Vérifier mon email');
    expect(button).toHaveAttribute('href', mockUrl);
  });

  it('displays the verification URL in the fallback link', () => {
    const { getByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    const links = getByText(mockUrl);
    expect(links).toHaveAttribute('href', mockUrl);
  });

  it('displays the user name when provided', () => {
    const { getByText } = render(
      <VerificationEmail userName="John Doe" verificationUrl={mockUrl} />
    );
    expect(getByText(/Bonjour John Doe/)).toBeInTheDocument();
  });

  it('does not display greeting when userName is not provided', () => {
    const { queryByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    expect(queryByText(/Bonjour/)).not.toBeInTheDocument();
  });

  it('contains the correct heading text', () => {
    const { getByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    expect(getByText('Vérification de votre adresse email')).toBeInTheDocument();
  });

  it('contains instructions for the user', () => {
    const { getByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    expect(getByText(/Merci de vous être inscrit/)).toBeInTheDocument();
  });

  it('contains fallback instructions', () => {
    const { getByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    expect(getByText(/Si le bouton ne fonctionne pas/)).toBeInTheDocument();
  });

  it('contains ignore instructions', () => {
    const { getByText } = render(
      <VerificationEmail verificationUrl={mockUrl} />
    );
    expect(getByText(/Si vous n'avez pas créé de compte/)).toBeInTheDocument();
  });
});
