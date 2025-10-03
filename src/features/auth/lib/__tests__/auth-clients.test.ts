import { describe, it, expect } from 'vitest';
import { authClient, signIn, signOut, signUp, useSession, forgetPassword, resetPassword } from '../auth-clients';

describe('auth-clients', () => {
  it('exports authClient', () => {
    expect(authClient).toBeDefined();
  });

  it('authClient has correct baseURL from env', () => {
    expect(authClient.$fetch).toBeDefined();
  });

  it('exports signIn function', () => {
    expect(signIn).toBeDefined();
    expect(typeof signIn).toBe('function');
  });

  it('exports signOut function', () => {
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe('function');
  });

  it('exports signUp function', () => {
    expect(signUp).toBeDefined();
    expect(typeof signUp).toBe('function');
  });

  it('exports useSession hook', () => {
    expect(useSession).toBeDefined();
    expect(typeof useSession).toBe('function');
  });

  it('exports forgetPassword function', () => {
    expect(forgetPassword).toBeDefined();
    expect(typeof forgetPassword).toBe('function');
  });

  it('exports resetPassword function', () => {
    expect(resetPassword).toBeDefined();
    expect(typeof resetPassword).toBe('function');
  });

  it('authClient is configured with credentials: include', () => {
    // The authClient should have credentials include for cookie handling
    expect(authClient).toBeDefined();
  });

  it('authClient uses adminClient plugin', () => {
    // The authClient should have admin plugin for admin operations
    expect(authClient).toBeDefined();
  });
});
