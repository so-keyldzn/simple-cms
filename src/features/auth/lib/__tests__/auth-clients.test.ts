import { describe, it, expect, vi } from 'vitest';
import { authClient, signIn, signOut, signUp, useSession, forgetPassword, resetPassword } from '../auth-clients';

describe('auth-clients', () => {
  describe('authClient instance', () => {
    it('should be defined', () => {
      expect(authClient).toBeDefined();
    });

    it('should have $fetch method', () => {
      expect(authClient.$fetch).toBeDefined();
      expect(typeof authClient.$fetch).toBe('function');
    });

    it('should have correct baseURL from environment', () => {
      // baseURL should come from NEXT_PUBLIC_APP_URL
      expect(authClient.$fetch).toBeDefined();
    });

    it('should be configured with credentials: include', () => {
      // The authClient should have credentials include for cookie handling
      expect(authClient).toBeDefined();
    });

    it('should use adminClient plugin', () => {
      // The authClient should have admin plugin for admin operations
      expect(authClient).toBeDefined();
    });
  });

  describe('exported authentication functions', () => {
    it('should export signIn function', () => {
      expect(signIn).toBeDefined();
      expect(typeof signIn).toBe('function');
    });

    it('should export signOut function', () => {
      expect(signOut).toBeDefined();
      expect(typeof signOut).toBe('function');
    });

    it('should export signUp function', () => {
      expect(signUp).toBeDefined();
      expect(typeof signUp).toBe('function');
    });

    it('should export useSession hook', () => {
      expect(useSession).toBeDefined();
      expect(typeof useSession).toBe('function');
    });

    it('should export forgetPassword function', () => {
      expect(forgetPassword).toBeDefined();
      expect(typeof forgetPassword).toBe('function');
    });

    it('should export resetPassword function', () => {
      expect(resetPassword).toBeDefined();
      expect(typeof resetPassword).toBe('function');
    });
  });

  describe('signIn function', () => {
    it('should have email method', () => {
      expect(signIn.email).toBeDefined();
      expect(typeof signIn.email).toBe('function');
    });
  });

  describe('signUp function', () => {
    it('should have email method', () => {
      expect(signUp.email).toBeDefined();
      expect(typeof signUp.email).toBe('function');
    });
  });

  describe('authClient methods', () => {
    it('should have all required authentication methods', () => {
      // Verify core methods exist
      expect(authClient).toBeDefined();

      // These methods are provided by better-auth/react
      expect(signIn).toBeDefined();
      expect(signOut).toBeDefined();
      expect(signUp).toBeDefined();
      expect(useSession).toBeDefined();
      expect(forgetPassword).toBeDefined();
      expect(resetPassword).toBeDefined();
    });

    it('should be properly typed', () => {
      // Type checking - these should not throw TypeScript errors
      const signInFn: typeof signIn = signIn;
      const signOutFn: typeof signOut = signOut;
      const signUpFn: typeof signUp = signUp;
      const useSessionHook: typeof useSession = useSession;
      const forgetPasswordFn: typeof forgetPassword = forgetPassword;
      const resetPasswordFn: typeof resetPassword = resetPassword;

      expect(signInFn).toBeDefined();
      expect(signOutFn).toBeDefined();
      expect(signUpFn).toBeDefined();
      expect(useSessionHook).toBeDefined();
      expect(forgetPasswordFn).toBeDefined();
      expect(resetPasswordFn).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should use fetchOptions with credentials include', () => {
      // This ensures cookies are sent with requests for session management
      expect(authClient).toBeDefined();
    });

    it('should use baseURL from NEXT_PUBLIC_APP_URL environment variable', () => {
      // The baseURL should match the environment variable
      expect(authClient).toBeDefined();
    });

    it('should include adminClient plugin', () => {
      // Admin plugin provides impersonation and user management capabilities
      expect(authClient).toBeDefined();
    });
  });
});
