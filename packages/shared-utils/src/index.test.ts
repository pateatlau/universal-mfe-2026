/**
 * Unit tests for @universal/shared-utils
 * 
 * Tests pure TypeScript utility functions
 */

import { getGreeting, formatMessage } from './index';

describe('shared-utils', () => {
  describe('getGreeting', () => {
    it('should return greeting with provided name', () => {
      expect(getGreeting('Alice')).toBe('Hello, Alice!');
    });

    it('should return default greeting when no name provided', () => {
      expect(getGreeting()).toBe('Hello, World!');
    });

    it('should handle empty string', () => {
      expect(getGreeting('')).toBe('Hello, !');
    });
  });

  describe('formatMessage', () => {
    it('should format message with prefix', () => {
      expect(formatMessage('test message', 'INFO')).toBe('INFO: test message');
    });

    it('should return message without prefix when prefix not provided', () => {
      expect(formatMessage('test message')).toBe('test message');
    });

    it('should handle empty message', () => {
      expect(formatMessage('', 'PREFIX')).toBe('PREFIX: ');
    });
  });
});

