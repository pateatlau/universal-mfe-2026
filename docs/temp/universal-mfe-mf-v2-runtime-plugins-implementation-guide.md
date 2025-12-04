# Module Federation v2 Runtime Plugins - Implementation Guide

**Date:** 2026-01-XX  
**Status:** 📋 **PLANNING** - Not Yet Implemented  
**Context:** Universal MFE Platform - Future Enhancement

---

## ⚠️ Important Notice

**This guide documents how to implement runtime plugins in the future. Runtime plugins are NOT currently implemented in the codebase.**

**DO NOT implement these plugins without:**
1. Thorough testing in a development environment
2. Understanding the impact on existing functionality
3. Having a rollback plan ready
4. Team review and approval

---

## Overview

Module Federation v2 runtime plugins allow you to hook into the module loading lifecycle to add custom behavior such as:
- Error handling and retry logic
- Performance monitoring
- Logging and debugging
- Security validation
- Custom loading strategies

---

## Current Status

**✅ What We Have:**
- MF v2 plugin configured (`@module-federation/enhanced/rspack`)
- Basic remote loading working
- No runtime plugins implemented

**📋 What We Can Add:**
- Runtime plugins for enhanced functionality
- Lifecycle hooks for monitoring and error handling
- Custom loading strategies

---

## Runtime Plugin API

### Available Lifecycle Hooks

Based on `@module-federation/enhanced` v0.21.6, the following hooks are available:

1. **`beforeInit`** - Before MF instance initializes
2. **`init`** - After MF instance initializes
3. **`beforeRequest`** - Before resolving remote path
4. **`afterResolve`** - After resolving remote path
5. **`onLoad`** - When federated module is loaded
6. **`handlePreloadModule`** - Manages preloading logic
7. **`errorLoadRemote`** - When loading remotes fails
8. **`loadShare`** - When loading shared dependencies
9. **`beforeLoadShare`** - Before loading shared dependencies

---

## Example Plugin Implementations

### Example 1: Error Handling Plugin

**Purpose:** Centralized error handling with retry logic

**File:** `packages/web-shell/src/plugins/mf-error-handler.ts` (to be created)

```typescript
/**
 * Module Federation v2 Error Handling Plugin
 * 
 * Provides:
 * - Retry logic for failed remote loads
 * - User-friendly error messages
 * - Error logging
 * 
 * ⚠️ NOT YET IMPLEMENTED - This is a reference example
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

interface ErrorHandlerOptions {
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
      
      /**
       * Handle errors when loading remotes fails
       */
      async errorLoadRemote(args) {
        const { id, error, from } = args;
        
        console.error(`[MF Error Handler] Failed to load remote: ${id}`, {
          error,
          from,
          timestamp: new Date().toISOString(),
        });

        // Call custom error handler if provided
        if (onError) {
          onError(error as Error, id);
        }

        // Could implement retry logic here
        // For now, just log and rethrow
        throw error;
      },

      /**
       * Log before requesting remote
       */
      beforeRequest(args) {
        console.log(`[MF Error Handler] Requesting remote: ${args.id}`, {
          from: args.from,
        });
        return args;
      },
    };
  };
}
```

**Usage in Config (Future):**

```javascript
// packages/web-shell/rspack.config.mjs
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { createErrorHandlerPlugin } from './src/plugins/mf-error-handler.ts';

new ModuleFederationPlugin({
  name: "web_shell",
  remotes: { /* ... */ },
  runtimePlugins: [
    [createErrorHandlerPlugin, {
      maxRetries: 3,
      retryDelay: 1000,
    }],
  ],
  // ... rest of config
});
```

---

### Example 2: Performance Monitoring Plugin

**Purpose:** Track remote loading performance metrics

**File:** `packages/web-shell/src/plugins/mf-performance-monitor.ts` (to be created)

```typescript
/**
 * Module Federation v2 Performance Monitoring Plugin
 * 
 * Provides:
 * - Load time tracking
 * - Performance metrics
 * - Performance logging
 * 
 * ⚠️ NOT YET IMPLEMENTED - This is a reference example
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

interface PerformanceMetrics {
  [remoteId: string]: {
    loadTime: number;
    loadCount: number;
    lastLoadTime: Date;
    errors: number;
  };
}

const metrics: PerformanceMetrics = {};

export function createPerformanceMonitorPlugin(): () => ModuleFederationRuntimePlugin {
  return function performanceMonitorPlugin() {
    return {
      name: 'mf-performance-monitor',
      
      /**
       * Track when remote loading starts
       */
      beforeRequest(args) {
        const { id } = args;
        const startTime = performance.now();
        
        // Store start time (could use WeakMap for better memory management)
        (args as any).__startTime = startTime;
        
        return args;
      },

      /**
       * Track when remote loading completes
       */
      onLoad(args) {
        const { id } = args;
        const startTime = (args as any).__startTime;
        
        if (startTime) {
          const loadTime = performance.now() - startTime;
          
          if (!metrics[id]) {
            metrics[id] = {
              loadTime: 0,
              loadCount: 0,
              lastLoadTime: new Date(),
              errors: 0,
            };
          }
          
          metrics[id].loadTime = loadTime;
          metrics[id].loadCount++;
          metrics[id].lastLoadTime = new Date();
          
          console.log(`[MF Performance] Remote ${id} loaded in ${loadTime.toFixed(2)}ms`);
        }
        
        return args;
      },

      /**
       * Track errors
       */
      async errorLoadRemote(args) {
        const { id } = args;
        
        if (!metrics[id]) {
          metrics[id] = {
            loadTime: 0,
            loadCount: 0,
            lastLoadTime: new Date(),
            errors: 0,
          };
        }
        
        metrics[id].errors++;
        console.error(`[MF Performance] Remote ${id} failed to load`);
        
        throw args.error;
      },

      /**
       * Get performance metrics (for external access)
       */
      getMetrics() {
        return { ...metrics };
      },
    };
  };
}

/**
 * Helper function to get current metrics
 * Can be called from application code
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  // This would need to be exposed through the plugin system
  // For now, this is a placeholder
  return {};
}
```

---

### Example 3: Logging Plugin

**Purpose:** Comprehensive logging for debugging

**File:** `packages/web-shell/src/plugins/mf-logging.ts` (to be created)

```typescript
/**
 * Module Federation v2 Logging Plugin
 * 
 * Provides:
 * - Comprehensive logging of MF lifecycle events
 * - Debug mode support
 * - Structured logging
 * 
 * ⚠️ NOT YET IMPLEMENTED - This is a reference example
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

interface LoggingOptions {
  enabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includeTimestamps?: boolean;
}

export function createLoggingPlugin(
  options: LoggingOptions = {}
): () => ModuleFederationRuntimePlugin {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logLevel = 'info',
    includeTimestamps = true,
  } = options;

  const shouldLog = (level: string) => {
    if (!enabled) return false;
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(logLevel);
  };

  const log = (level: string, message: string, data?: any) => {
    if (!shouldLog(level)) return;
    
    const timestamp = includeTimestamps ? `[${new Date().toISOString()}]` : '';
    const prefix = `[MF ${level.toUpperCase()}]${timestamp}`;
    
    if (data) {
      console[level as keyof Console](prefix, message, data);
    } else {
      console[level as keyof Console](prefix, message);
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
        log('info', 'MF initialized', args);
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

## Implementation Strategy

### Phase 1: Planning & Preparation (No Code Changes)

1. ✅ **Documentation** (This document)
2. ✅ **Example plugins** (Reference implementations)
3. ⏳ **Team review** (Get approval)
4. ⏳ **Testing strategy** (Define test cases)

### Phase 2: Development (Safe Implementation)

1. **Create plugin directory structure:**
   ```
   packages/web-shell/src/plugins/
   ├── mf-error-handler.ts
   ├── mf-performance-monitor.ts
   ├── mf-logging.ts
   └── index.ts (exports)
   ```

2. **Implement one plugin at a time:**
   - Start with logging plugin (lowest risk)
   - Test thoroughly
   - Then add error handler
   - Finally add performance monitor

3. **Enable plugins conditionally:**
   ```javascript
   // Only enable in development initially
   const runtimePlugins = process.env.NODE_ENV === 'development'
     ? ['./src/plugins/mf-logging.ts']
     : [];
   ```

### Phase 3: Testing & Validation

1. **Unit tests** for each plugin
2. **Integration tests** with actual remotes
3. **Performance tests** to ensure no regression
4. **Error scenario tests** to verify error handling

### Phase 4: Gradual Rollout

1. **Development environment** - Enable all plugins
2. **Staging environment** - Enable with monitoring
3. **Production** - Enable one at a time with monitoring

---

## Configuration Examples

### Minimal Configuration (Logging Only)

```javascript
// packages/web-shell/rspack.config.mjs
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

new ModuleFederationPlugin({
  name: "web_shell",
  remotes: { /* ... */ },
  runtimePlugins: [
    './src/plugins/mf-logging.ts',
  ],
  // ... rest of config
});
```

### Full Configuration (All Plugins)

```javascript
// packages/web-shell/rspack.config.mjs
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { createErrorHandlerPlugin } from './src/plugins/mf-error-handler.ts';
import { createPerformanceMonitorPlugin } from './src/plugins/mf-performance-monitor.ts';
import { createLoggingPlugin } from './src/plugins/mf-logging.ts';

new ModuleFederationPlugin({
  name: "web_shell",
  remotes: { /* ... */ },
  runtimePlugins: [
    // Logging (always enabled in dev)
    process.env.NODE_ENV === 'development' 
      ? [createLoggingPlugin, { logLevel: 'debug' }]
      : null,
    // Error handler (always enabled)
    [createErrorHandlerPlugin, {
      maxRetries: 3,
      retryDelay: 1000,
    }],
    // Performance monitor (dev and staging)
    process.env.NODE_ENV !== 'production'
      ? createPerformanceMonitorPlugin
      : null,
  ].filter(Boolean), // Remove null entries
  // ... rest of config
});
```

### Environment-Specific Configuration

```javascript
// packages/web-shell/rspack.config.mjs
const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.NODE_ENV === 'staging';

const runtimePlugins = [];

// Always enable error handling
runtimePlugins.push('./src/plugins/mf-error-handler.ts');

// Development: Enable logging and performance monitoring
if (isDevelopment) {
  runtimePlugins.push('./src/plugins/mf-logging.ts');
  runtimePlugins.push('./src/plugins/mf-performance-monitor.ts');
}

// Staging: Enable performance monitoring only
if (isStaging) {
  runtimePlugins.push('./src/plugins/mf-performance-monitor.ts');
}

new ModuleFederationPlugin({
  name: "web_shell",
  remotes: { /* ... */ },
  runtimePlugins,
  // ... rest of config
});
```

---

## Testing Strategy

### 1. Unit Tests

Test each plugin in isolation:

```typescript
// packages/web-shell/src/plugins/__tests__/mf-error-handler.test.ts
import { createErrorHandlerPlugin } from '../mf-error-handler';

describe('ErrorHandlerPlugin', () => {
  it('should log errors when remote loading fails', () => {
    const plugin = createErrorHandlerPlugin();
    const pluginInstance = plugin();
    
    const consoleSpy = jest.spyOn(console, 'error');
    const error = new Error('Test error');
    
    expect(() => {
      pluginInstance.errorLoadRemote({
        id: 'test-remote',
        error,
        from: 'test',
      });
    }).toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests

Test plugins with actual remote loading:

```typescript
// packages/web-shell/src/__tests__/remote-loading.test.tsx
import { render, waitFor } from '@testing-library/react';
import App from '../App';

describe('Remote Loading with Plugins', () => {
  it('should load remote successfully with plugins enabled', async () => {
    const { getByText } = render(<App />);
    
    await waitFor(() => {
      expect(getByText(/Hello/i)).toBeInTheDocument();
    });
  });
  
  it('should handle remote loading errors gracefully', async () => {
    // Mock remote failure
    // Verify error handling plugin catches it
  });
});
```

### 3. Performance Tests

Ensure plugins don't degrade performance:

```typescript
// packages/web-shell/src/__tests__/performance.test.ts
describe('Plugin Performance Impact', () => {
  it('should not significantly increase remote load time', async () => {
    const startTime = performance.now();
    
    // Load remote with plugins
    await import('hello_remote/HelloRemote');
    
    const loadTime = performance.now() - startTime;
    
    // Should not exceed baseline by more than 10%
    expect(loadTime).toBeLessThan(baselineLoadTime * 1.1);
  });
});
```

---

## Rollback Plan

### If Issues Are Detected

1. **Immediate Rollback:**
   ```javascript
   // Remove runtimePlugins array or set to empty
   runtimePlugins: [],
   ```

2. **Gradual Disable:**
   ```javascript
   // Disable specific plugins
   runtimePlugins: [
     // './src/plugins/mf-logging.ts', // Disabled
     './src/plugins/mf-error-handler.ts', // Keep enabled
   ],
   ```

3. **Feature Flag:**
   ```javascript
   const ENABLE_MF_PLUGINS = process.env.ENABLE_MF_PLUGINS === 'true';
   
   runtimePlugins: ENABLE_MF_PLUGINS 
     ? ['./src/plugins/mf-logging.ts']
     : [],
   ```

---

## Safety Checklist

Before implementing runtime plugins:

- [ ] ✅ Documentation reviewed
- [ ] ✅ Example plugins understood
- [ ] ✅ Testing strategy defined
- [ ] ✅ Rollback plan prepared
- [ ] ✅ Team approval obtained
- [ ] ✅ Development environment ready
- [ ] ✅ Monitoring in place
- [ ] ✅ Feature flags configured

---

## Next Steps

1. **Review this guide** with the team
2. **Decide which plugins to implement first** (recommend: logging)
3. **Set up testing infrastructure**
4. **Implement in development environment**
5. **Test thoroughly**
6. **Gradually roll out to staging/production**

---

## Related Documentation

- **Future Enhancements:** `docs/temp/universal-mfe-mf-v2-future-enhancements-explained.md`
- **Quick Reference:** `docs/temp/universal-mfe-mf-v2-quick-reference.md`
- **Migration Complete:** `docs/temp/universal-mfe-mf-v2-migration-complete.md`

---

**Last Updated:** 2026-01-XX  
**Status:** 📋 Planning - Ready for Implementation Review

