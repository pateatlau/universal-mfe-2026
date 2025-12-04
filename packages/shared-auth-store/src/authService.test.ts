/**
 * @universal/shared-auth-store
 * 
 * Unit tests for mock authentication service.
 */

import { mockLogin, mockSignup, mockLogout } from './authService';
import { UserRole } from './types';

describe('Mock Authentication Service', () => {
  describe('mockLogin', () => {
    it('should login successfully with valid admin credentials', async () => {
      const user = await mockLogin('admin@example.com', 'admin123');
      
      expect(user).not.toBeNull();
      expect(user.email).toBe('admin@example.com');
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.name).toBe('Admin User');
    });

    it('should login successfully with valid vendor credentials', async () => {
      const user = await mockLogin('vendor@example.com', 'vendor123');
      
      expect(user).not.toBeNull();
      expect(user.email).toBe('vendor@example.com');
      expect(user.role).toBe(UserRole.VENDOR);
      expect(user.name).toBe('Vendor User');
    });

    it('should login successfully with valid customer credentials', async () => {
      const user = await mockLogin('customer@example.com', 'customer123');
      
      expect(user).not.toBeNull();
      expect(user.email).toBe('customer@example.com');
      expect(user.role).toBe(UserRole.CUSTOMER);
      expect(user.name).toBe('Customer User');
    });

    it('should throw error for invalid email', async () => {
      await expect(mockLogin('invalid@example.com', 'password123')).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      await expect(mockLogin('admin@example.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for non-existent user', async () => {
      await expect(mockLogin('nonexistent@example.com', 'password123')).rejects.toThrow('Invalid email or password');
    });

    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await mockLogin('admin@example.com', 'admin123');
      const endTime = Date.now();
      
      // Should take at least 500ms (mock delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(400); // Allow some margin
    });
  });

  describe('mockSignup', () => {
    it('should signup successfully with new email', async () => {
      const email = `newuser${Date.now()}@example.com`;
      const user = await mockSignup(email, 'password123');
      
      expect(user).not.toBeNull();
      expect(user.email).toBe(email);
      expect(user.id).toBeTruthy();
      expect(user.name).toBe(email.split('@')[0]);
    });

    it('should throw error for existing email', async () => {
      // First signup should succeed
      await mockSignup('existing@example.com', 'password123');
      
      // Second signup with same email should fail
      await expect(mockSignup('existing@example.com', 'password123')).rejects.toThrow('Email already registered');
    });

    it('should assign ADMIN role for email containing "admin"', async () => {
      const user = await mockSignup('adminuser@example.com', 'password123');
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should assign VENDOR role for email containing "vendor"', async () => {
      const user = await mockSignup('vendoruser@example.com', 'password123');
      expect(user.role).toBe(UserRole.VENDOR);
    });

    it('should assign CUSTOMER role for regular email', async () => {
      const user = await mockSignup('regularuser@example.com', 'password123');
      expect(user.role).toBe(UserRole.CUSTOMER);
    });

    it('should assign CUSTOMER role for email with mixed case', async () => {
      const user = await mockSignup('AdminUser@Example.com', 'password123');
      expect(user.role).toBe(UserRole.ADMIN); // Case-insensitive check
    });

    it('should generate unique IDs for different signups', async () => {
      const email1 = `user1${Date.now()}@example.com`;
      const email2 = `user2${Date.now() + 1}@example.com`;
      
      const user1 = await mockSignup(email1, 'password123');
      const user2 = await mockSignup(email2, 'password123');
      
      expect(user1.id).not.toBe(user2.id);
    });

    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await mockSignup('newuser@example.com', 'password123');
      const endTime = Date.now();
      
      // Should take at least 500ms (mock delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(400); // Allow some margin
    });
  });

  describe('mockLogout', () => {
    it('should complete without error', async () => {
      await expect(mockLogout()).resolves.toBeUndefined();
    });

    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await mockLogout();
      const endTime = Date.now();
      
      // Should take at least 200ms (mock delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(150); // Allow some margin
    });
  });
});

