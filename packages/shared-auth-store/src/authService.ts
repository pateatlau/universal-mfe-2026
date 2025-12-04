/**
 * @universal/shared-auth-store
 * 
 * Mock authentication service.
 * 
 * This service provides mock implementations for authentication operations.
 * In production, this would be replaced with actual API calls.
 * 
 * Features:
 * - Mock login
 * - Mock signup
 * - Mock user data generation
 * - Role assignment based on email patterns
 */

import { User, UserRole } from './types';

/**
 * Mock user database (in-memory for development)
 * In production, this would be replaced with actual API calls
 */
const mockUsers: Map<string, { password: string; user: User }> = new Map([
  // Pre-seeded users for testing
  ['admin@example.com', {
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  }],
  ['vendor@example.com', {
    password: 'vendor123',
    user: {
      id: 'vendor-1',
      email: 'vendor@example.com',
      name: 'Vendor User',
      role: UserRole.VENDOR,
    },
  }],
  ['customer@example.com', {
    password: 'customer123',
    user: {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: UserRole.CUSTOMER,
    },
  }],
]);

/**
 * Simulate network delay
 */
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine user role based on email pattern
 */
function determineRole(email: string): UserRole {
  const emailLower = email.toLowerCase();
  if (emailLower.includes('admin')) {
    return UserRole.ADMIN;
  }
  if (emailLower.includes('vendor')) {
    return UserRole.VENDOR;
  }
  return UserRole.CUSTOMER;
}

/**
 * Mock login service
 * 
 * @param email - User email
 * @param password - User password
 * @returns Promise resolving to User object
 * @throws Error if credentials are invalid
 */
export async function mockLogin(email: string, password: string): Promise<User> {
  // Simulate network delay
  await delay(500);

  // Check if user exists in mock database
  const userData = mockUsers.get(email);
  
  if (!userData) {
    throw new Error('Invalid email or password');
  }

  if (userData.password !== password) {
    throw new Error('Invalid email or password');
  }

  // Return user object
  return userData.user;
}

/**
 * Mock signup service
 * 
 * @param email - User email
 * @param password - User password
 * @returns Promise resolving to User object
 * @throws Error if email already exists
 */
export async function mockSignup(email: string, password: string): Promise<User> {
  // Simulate network delay
  await delay(500);

  // Check if user already exists
  if (mockUsers.has(email)) {
    throw new Error('Email already registered');
  }

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email,
    name: email.split('@')[0], // Derive name from email
    role: determineRole(email), // Determine role based on email pattern
  };

  // Store in mock database
  mockUsers.set(email, {
    password: password,
    user: newUser,
  });

  // Return new user object
  return newUser;
}

/**
 * Mock logout service (no-op for mock)
 * 
 * In production, this would invalidate tokens on the server
 */
export async function mockLogout(): Promise<void> {
  // Simulate network delay
  await delay(200);
  // No-op for mock - actual implementation would invalidate tokens
}

