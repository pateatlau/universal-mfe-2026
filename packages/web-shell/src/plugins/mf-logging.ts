/**
 * Module Federation v2 Logging Plugin
 *
 * Provides comprehensive logging of MF lifecycle events for debugging.
 * Safe to use - only logs, doesn't modify MF behavior.
 *
 * @module-federation/enhanced/rspack runtime plugin
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

export interface LoggingOptions {
  enabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includeTimestamps?: boolean;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

export function createLoggingPlugin(
  options: LoggingOptions = {}
): () => ModuleFederationRuntimePlugin {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logLevel = 'info',
    includeTimestamps = true,
  } = options;

  const shouldLog = (level: keyof typeof LOG_LEVELS): boolean => {
    if (!enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[logLevel];
  };

  const log = (
    level: keyof typeof LOG_LEVELS,
    message: string,
    data?: any
  ): void => {
    if (!shouldLog(level)) return;

    const timestamp = includeTimestamps ? `[${new Date().toISOString()}]` : '';
    const prefix = `[MF ${level.toUpperCase()}]${timestamp}`;

    const logMethod = console[level] || console.log;

    if (data) {
      logMethod(prefix, message, data);
    } else {
      logMethod(prefix, message);
    }
  };

  return function loggingPlugin() {
    return {
      name: 'mf-logging',

      beforeInit(args) {
        log('debug', 'Before MF initialization', args);
        return args;
      },

      init(args) {
        log('info', 'MF runtime initialized', {
          options: args.options,
        });
        return args;
      },

      beforeRequest(args) {
        log('debug', `Requesting remote: ${args.id}`, {
          options: args.options,
        });
        return args;
      },

      afterResolve(args) {
        log('debug', `Resolved remote: ${args.id}`, {
          remote: args.remote,
        });
        return args;
      },

      onLoad(args) {
        log('info', `Remote loaded: ${args.id}`, {
          expose: args.expose,
          pkgNameOrAlias: args.pkgNameOrAlias,
        });
        return args;
      },

      async errorLoadRemote(args) {
        log('error', `Failed to load remote: ${args.id}`, {
          error: args.error,
        });
        throw args.error;
      },

      async loadShare(args) {
        // Log available properties from args
        const pkgName = 'pkgName' in args ? args.pkgName : 'unknown';
        log('debug', `Loading shared: ${pkgName}`);
      },

      async beforeLoadShare(args) {
        const pkgName = 'pkgName' in args ? args.pkgName : 'unknown';
        log('debug', `Before loading shared: ${pkgName}`);
        return args;
      },
    };
  };
}
