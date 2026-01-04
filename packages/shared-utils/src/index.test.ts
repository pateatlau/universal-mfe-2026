import { getGreeting, formatMessage } from './index';

describe('shared-utils', () => {
  describe('getGreeting', () => {
    it('should return greeting with provided name', () => {
      expect(getGreeting('Claude')).toBe('Hello, Claude!');
    });

    it('should return default greeting when no name provided', () => {
      expect(getGreeting()).toBe('Hello, World!');
    });

    it('should handle empty string name', () => {
      expect(getGreeting('')).toBe('Hello, !');
    });
  });

  describe('formatMessage', () => {
    it('should format message with prefix', () => {
      expect(formatMessage('test message', 'INFO')).toBe('INFO: test message');
    });

    it('should return message without prefix when none provided', () => {
      expect(formatMessage('test message')).toBe('test message');
    });

    it('should handle empty message', () => {
      expect(formatMessage('', 'WARN')).toBe('WARN: ');
    });
  });
});
