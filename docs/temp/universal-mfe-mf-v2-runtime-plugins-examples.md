# Module Federation v2 Runtime Plugins - Code Examples

**Date:** 2026-01-XX  
**Status:** 📋 **REFERENCE ONLY** - Example Code  
**Context:** Universal MFE Platform - Future Implementation

---

## ⚠️ Important

**These are example implementations for reference. They are NOT currently in the codebase.**

**DO NOT copy these directly into the project without:**
1. Reviewing the implementation guide
2. Understanding the impact
3. Testing thoroughly
4. Team approval

---

## Example Plugin Files

### 1. Error Handler Plugin

**Location:** `packages/web-shell/src/plugins/mf-error-handler.ts`

```typescript
/**
 * Module Federation v2 Error Handling Plugin
 * 
 * Features:
 * - Automatic retry on failure
 * - User-friendly error messages
 * - Error logging and reporting
 * 
 * ⚠️ REFERENCE IMPLEMENTATION - Not yet in codebase
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

export interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, remote: string) => void;
}

export function createErrorHandlerPlugin(
  options: ErrorHandlerOptions = {}
): () => ModuleFederationRuntimePlugin {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
  } = options;

  return function errorHandlerPlugin() {
    return {
      name: 'mf-error-handler',
      
      async errorLoadRemote(args) {
        const { id, error, from } = args;
        const errorObj = error as Error;
        
        console.error(`[MF] Failed to load remote "${id}":`, {
          message: errorObj.message,
          stack: errorObj.stack,
          from,
          timestamp: new Date().toISOString(),
        });

        // Call custom error handler
        if (onError) {
          try {
            onError(errorObj, id);
          } catch (handlerError) {
            console.error('[MF] Error handler callback failed:', handlerError);
          }
        }

        // Re-throw to allow other error handlers
        throw error;
      },

      beforeRequest(args) {
        // Log remote requests for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MF] Loading remote: ${args.id}`);
        }
        return args;
      },
    };
  };
}
```

---

### 2. Performance Monitor Plugin

**Location:** `packages/web-shell/src/plugins/mf-performance-monitor.ts`

```typescript
/**
 * Module Federation v2 Performance Monitoring Plugin
 * 
 * Features:
 * - Load time tracking
 * - Performance metrics collection
 * - Performance reporting
 * 
 * ⚠️ REFERENCE IMPLEMENTATION - Not yet in codebase
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

export interface PerformanceMetrics {
  [remoteId: string]: {
    loadTime: number;
    loadCount: number;
    lastLoadTime: Date;
    errors: number;
    averageLoadTime: number;
  };
}

const metrics: PerformanceMetrics = {};

export function createPerformanceMonitorPlugin(): () => ModuleFederationRuntimePlugin {
  return function performanceMonitorPlugin() {
    return {
      name: 'mf-performance-monitor',
      
      beforeRequest(args) {
        // Store start time
        (args as any).__mfStartTime = performance.now();
        return args;
      },

      onLoad(args) {
        const { id } = args;
        const startTime = (args as any).__mfStartTime;
        
        if (startTime) {
          const loadTime = performance.now() - startTime;
          
          if (!metrics[id]) {
            metrics[id] = {
              loadTime: 0,
              loadCount: 0,
              lastLoadTime: new Date(),
              errors: 0,
              averageLoadTime: 0,
            };
          }
          
          const metric = metrics[id];
          metric.loadTime = loadTime;
          metric.loadCount++;
          metric.lastLoadTime = new Date();
          metric.averageLoadTime = 
            (metric.averageLoadTime * (metric.loadCount - 1) + loadTime) / metric.loadCount;
          
          // Log in development
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[MF Performance] ${id}: ${loadTime.toFixed(2)}ms ` +
              `(avg: ${metric.averageLoadTime.toFixed(2)}ms)`
            );
          }
        }
        
        return args;
      },

      async errorLoadRemote(args) {
        const { id } = args;
        
        if (!metrics[id]) {
          metrics[id] = {
            loadTime: 0,
            loadCount: 0,
            lastLoadTime: new Date(),
            errors: 0,
            averageLoadTime: 0,
          };
        }
        
        metrics[id].errors++;
        
        throw args.error;
      },
    };
  };
}

/**
 * Get current performance metrics
 * Can be exposed via window object or API
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * Reset performance metrics
 */
export function resetPerformanceMetrics(): void {
  Object.keys(metrics).forEach(key => delete metrics[key]);
}
```

---

### 3. Logging Plugin

**Location:** `packages/web-shell/src/plugins/mf-logging.ts`

```typescript
/**
 * Module Federation v2 Logging Plugin
 * 
 * Features:
 * - Comprehensive lifecycle logging
 * - Configurable log levels
 * - Structured logging
 * 
 * ⚠️ REFERENCE IMPLEMENTATION - Not yet in codebase
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
};

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
    
    const timestamp = includeTimestamps 
      ? `[${new Date().toISOString()}]` 
      : '';
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
          name: args.name,
        });
        return args;
      },

      beforeRequest(args) {
        log('debug', `Requesting remote: ${args.id}`, {
          from: args.from,
        });
        return args;
      },

      afterResolve(args) {
        log('debug', `Resolved remote: ${args.id}`, {
          entry: args.entry,
        });
        return args;
      },

      onLoad(args) {
        log('info', `Remote loaded: ${args.id}`, {
          exports: Object.keys(args.exports || {}),
        });
        return args;
      },

      async errorLoadRemote(args) {
        log('error', `Failed to load remote: ${args.id}`, {
          error: args.error,
          from: args.from,
        });
        throw args.error;
      },

      async loadShare(args) {
        log('debug', `Loading shared: ${args.shareConfig.name}`, {
          version: args.shareConfig.version,
          shareScope: args.shareScope,
        });
      },

      async beforeLoadShare(args) {
        log('debug', `Before loading shared: ${args.shareConfig.name}`);
        return args;
      },
    };
  };
}
```

---

### 4. Plugin Index (Exports)

**Location:** `packages/web-shell/src/plugins/index.ts`

```typescript
/**
 * Module Federation v2 Runtime Plugins
 * 
 * Central export for all MF v2 runtime plugins
 * 
 * ⚠️ REFERENCE IMPLEMENTATION - Not yet in codebase
 */

export { createErrorHandlerPlugin } from './mf-error-handler';
export type { ErrorHandlerOptions } from './mf-error-handler';

export { createPerformanceMonitorPlugin, getPerformanceMetrics, resetPerformanceMetrics } from './mf-performance-monitor';
export type { PerformanceMetrics } from './mf-performance-monitor';

export { createLoggingPlugin } from './mf-logging';
export type { LoggingOptions } from './mf-logging';
```

---

## Configuration Usage Examples

### Minimal Setup (Logging Only)

```javascript
// packages/web-shell/rspack.config.mjs
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { createLoggingPlugin } from './src/plugins/mf-logging.ts';

export default {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: "web_shell",
      remotes: {
        hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
      },
      runtimePlugins: [
        [createLoggingPlugin, {
          enabled: process.env.NODE_ENV === 'development',
          logLevel: 'debug',
        }],
      ],
      shared: { /* ... */ },
    }),
  ],
};
```

### Full Setup (All Plugins)

```javascript
// packages/web-shell/rspack.config.mjs
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import {
  createErrorHandlerPlugin,
  createPerformanceMonitorPlugin,
  createLoggingPlugin,
} from './src/plugins/index.ts';

const isDevelopment = process.env.NODE_ENV === 'development';

export default {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: "web_shell",
      remotes: {
        hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
      },
      runtimePlugins: [
        // Logging (development only)
        ...(isDevelopment ? [
          [createLoggingPlugin, { logLevel: 'debug' }]
        ] : []),
        
        // Error handler (always enabled)
        [createErrorHandlerPlugin, {
          maxRetries: 3,
          retryDelay: 1000,
        }],
        
        // Performance monitor (development and staging)
        ...(process.env.NODE_ENV !== 'production' ? [
          createPerformanceMonitorPlugin
        ] : []),
      ],
      shared: { /* ... */ },
    }),
  ],
};
```

---

## Testing Examples

### Unit Test Example

```typescript
// packages/web-shell/src/plugins/__tests__/mf-logging.test.ts
import { createLoggingPlugin } from '../mf-logging';

describe('LoggingPlugin', () => {
  it('should log before request', () => {
    const plugin = createLoggingPlugin({ enabled: true, logLevel: 'debug' });
    const instance = plugin();
    
    const consoleSpy = jest.spyOn(console, 'debug');
    
    instance.beforeRequest({
      id: 'test-remote',
      from: 'test',
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[MF DEBUG]'),
      expect.stringContaining('Requesting remote: test-remote')
    );
  });
  
  it('should not log when disabled', () => {
    const plugin = createLoggingPlugin({ enabled: false });
    const instance = plugin();
    
    const consoleSpy = jest.spyOn(console, 'debug');
    
    instance.beforeRequest({
      id: 'test-remote',
      from: 'test',
    });
    
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
```

---

## Notes

- All plugins are designed to be **non-breaking** - they don't modify core MF behavior
- Plugins can be **enabled/disabled** via configuration
- Plugins are **composable** - you can use multiple plugins together
- All plugins include **error handling** to prevent plugin failures from breaking MF

---

**Last Updated:** 2026-01-XX  
**Status:** 📋 Reference Examples - Not Implemented

