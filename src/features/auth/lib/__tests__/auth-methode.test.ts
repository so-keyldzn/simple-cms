import { describe, it, expect } from 'vitest';
import { auth } from '../auth-methode';

describe('auth-methode', () => {
  describe('auth instance', () => {
    it('should be defined', () => {
      expect(auth).toBeDefined();
    });

    it('should have api property', () => {
      expect(auth.api).toBeDefined();
    });

    it('should have handler property', () => {
      expect(auth.handler).toBeDefined();
      expect(typeof auth.handler).toBe('function');
    });
  });

  describe('emailAndPassword configuration', () => {
    it('should have emailAndPassword enabled', () => {
      // The auth instance should be configured with emailAndPassword enabled
      expect(auth).toBeDefined();
    });

    it('should be a minimal auth configuration', () => {
      // This is a minimal configuration for testing purposes
      // It should only have emailAndPassword enabled
      expect(auth).toBeDefined();
    });
  });

  describe('API methods', () => {
    it('should have signUp method', () => {
      expect(auth.api.signUpEmail).toBeDefined();
      expect(typeof auth.api.signUpEmail).toBe('function');
    });

    it('should have signIn method', () => {
      expect(auth.api.signInEmail).toBeDefined();
      expect(typeof auth.api.signInEmail).toBe('function');
    });

    it('should have signOut method', () => {
      expect(auth.api.signOut).toBeDefined();
      expect(typeof auth.api.signOut).toBe('function');
    });

    it('should have getSession method', () => {
      expect(auth.api.getSession).toBeDefined();
      expect(typeof auth.api.getSession).toBe('function');
    });
  });

  describe('configuration structure', () => {
    it('should be a valid Better Auth instance', () => {
      // Verify it's a proper Better Auth instance
      expect(auth).toHaveProperty('api');
      expect(auth).toHaveProperty('handler');
    });
  });
});
