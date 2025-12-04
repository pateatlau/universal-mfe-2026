/**
 * @universal/shared-auth-store
 * 
 * Unit tests for exported helper functions.
 */

import { hasRole, hasAnyRole, UserRole } from './index';
import type { User } from './index';

describe('RBAC Helper Functions', () => {
  describe('hasRole', () => {
    it('should return true for user with matching role', () => {
      const user: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };
      
      expect(hasRole(user, UserRole.ADMIN)).toBe(true);
    });

    it('should return false for user without matching role', () => {
      const user: User = {
        id: '1',
        email: 'customer@example.com',
        name: 'Customer User',
        role: UserRole.CUSTOMER,
      };
      
      expect(hasRole(user, UserRole.ADMIN)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasRole(null, UserRole.ADMIN)).toBe(false);
    });

    it('should work with all role types', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        role: UserRole.ADMIN,
      };
      
      const vendorUser: User = {
        id: '2',
        email: 'vendor@example.com',
        name: 'Vendor',
        role: UserRole.VENDOR,
      };
      
      const customerUser: User = {
        id: '3',
        email: 'customer@example.com',
        name: 'Customer',
        role: UserRole.CUSTOMER,
      };
      
      expect(hasRole(adminUser, UserRole.ADMIN)).toBe(true);
      expect(hasRole(vendorUser, UserRole.VENDOR)).toBe(true);
      expect(hasRole(customerUser, UserRole.CUSTOMER)).toBe(true);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has one of the roles', () => {
      const user: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };
      
      expect(hasAnyRole(user, [UserRole.ADMIN, UserRole.VENDOR])).toBe(true);
    });

    it('should return false if user has none of the roles', () => {
      const user: User = {
        id: '1',
        email: 'customer@example.com',
        name: 'Customer User',
        role: UserRole.CUSTOMER,
      };
      
      expect(hasAnyRole(user, [UserRole.ADMIN, UserRole.VENDOR])).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasAnyRole(null, [UserRole.ADMIN, UserRole.VENDOR])).toBe(false);
    });

    it('should return true when user matches any role in array', () => {
      const vendorUser: User = {
        id: '1',
        email: 'vendor@example.com',
        name: 'Vendor User',
        role: UserRole.VENDOR,
      };
      
      expect(hasAnyRole(vendorUser, [UserRole.ADMIN, UserRole.VENDOR, UserRole.CUSTOMER])).toBe(true);
    });

    it('should work with single role in array', () => {
      const user: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };
      
      expect(hasAnyRole(user, [UserRole.ADMIN])).toBe(true);
      expect(hasAnyRole(user, [UserRole.CUSTOMER])).toBe(false);
    });

    it('should work with empty array', () => {
      const user: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };
      
      expect(hasAnyRole(user, [])).toBe(false);
    });
  });
});

