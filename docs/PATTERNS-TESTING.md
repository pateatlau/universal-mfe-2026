# Testing Patterns

This document describes the testing architecture and patterns across all levels in the Universal MFE Platform.

## Testing Pyramid

```text
                    ┌─────────────┐
                    │    E2E      │  Playwright (Web), Maestro (Mobile)
                    │   Tests     │  User workflows, cross-platform
                   ─┴─────────────┴─
                  ┌─────────────────┐
                  │  Integration    │  Provider composition, routing
                  │    Tests        │  State persistence, MFE loading
                 ─┴─────────────────┴─
                ┌───────────────────────┐
                │      Unit Tests       │  Components, hooks, utilities
                │                       │  Isolated, fast, mocked deps
               ─┴───────────────────────┴─
```

## Test Configuration

### Root Jest Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Filter noisy console warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('Animated')) return;
  originalWarn.apply(console, args);
};
```

### Package Jest Config

```javascript
// packages/shared-hello-ui/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  moduleNameMapper: {
    '^@universal/(.*)$': '<rootDir>/../$1/src',
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
```

## Unit Testing

### React Native Component Testing

Since React Native components can't run in jsdom directly, we use mocks:

```typescript
// packages/shared-hello-ui/src/__mocks__/react-native.ts
import React from 'react';

export const View = ({ children, style, ...props }) => (
  <div style={style} {...props}>{children}</div>
);

export const Text = ({ children, style, ...props }) => (
  <span style={style} {...props}>{children}</span>
);

export const Pressable = ({ children, onPress, disabled, ...props }) => (
  <button
    onClick={onPress}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

export const StyleSheet = {
  create: (styles) => styles,
};

export const Platform = {
  OS: 'web',
  select: (options) => options.web ?? options.default,
};
```

### Component Test Pattern

```typescript
// packages/shared-hello-ui/src/__tests__/HelloUniversal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@universal/shared-theme-context';
import { I18nProvider, locales } from '@universal/shared-i18n';
import { HelloUniversal } from '../HelloUniversal';

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider translations={locales} initialLocale="en">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}

describe('HelloUniversal', () => {
  it('should render greeting with name', () => {
    render(
      <TestProviders>
        <HelloUniversal name="World" />
      </TestProviders>
    );

    expect(screen.getByText(/Hello, World/)).toBeInTheDocument();
  });

  it('should call onPress when button is pressed', () => {
    const handlePress = jest.fn();

    render(
      <TestProviders>
        <HelloUniversal name="World" onPress={handlePress} />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('should have accessible label', () => {
    render(
      <TestProviders>
        <HelloUniversal name="World" />
      </TestProviders>
    );

    expect(screen.getByLabelText(/greeting card/i)).toBeInTheDocument();
  });

  it('should render in Hindi', () => {
    render(
      <I18nProvider translations={locales} initialLocale="hi">
        <ThemeProvider>
          <HelloUniversal name="दुनिया" />
        </ThemeProvider>
      </I18nProvider>
    );

    expect(screen.getByText(/नमस्ते, दुनिया/)).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// packages/shared-theme-context/src/__tests__/ThemeProvider.test.tsx
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to light theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.themeName).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.themeName).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorage.getItem('@universal/theme')).toBe('dark');
  });
});
```

### Utility Testing

```typescript
// packages/shared-utils/src/index.test.ts
import { getGreeting, formatMessage } from './';

describe('getGreeting', () => {
  it('should return morning greeting before noon', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T09:00:00'));

    expect(getGreeting()).toBe('Good morning');

    jest.useRealTimers();
  });

  it('should return evening greeting after 6pm', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T19:00:00'));

    expect(getGreeting()).toBe('Good evening');

    jest.useRealTimers();
  });
});

describe('formatMessage', () => {
  it('should interpolate variables', () => {
    expect(formatMessage('Hello, {{name}}!', { name: 'World' })).toBe(
      'Hello, World!'
    );
  });
});
```

## Integration Testing

### Integration Test Config

```javascript
// packages/web-shell/jest.integration.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/__integration__'],
  testMatch: ['**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/__integration__/setup.ts'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@universal/(.*)$': '<rootDir>/../$1/src',
  },
  testTimeout: 15000,
};
```

### Integration Test Setup

```typescript
// packages/web-shell/src/__integration__/setup.ts
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
```

### Provider Integration Test

```typescript
// packages/web-shell/src/__integration__/providers.test.tsx
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryProvider } from '@universal/shared-data-layer';
import { EventBusProvider } from '@universal/shared-event-bus';
import { I18nProvider, locales } from '@universal/shared-i18n';
import { ThemeProvider } from '@universal/shared-theme-context';

function TestApp({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryProvider>
        <EventBusProvider>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </MemoryRouter>
  );
}

describe('Provider Integration', () => {
  it('should compose all providers without error', () => {
    render(
      <TestApp>
        <div>App Content</div>
      </TestApp>
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('should share theme across nested components', () => {
    function ThemeConsumer() {
      const { themeName, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{themeName}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    }

    render(
      <TestApp>
        <ThemeConsumer />
      </TestApp>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    act(() => {
      screen.getByRole('button').click();
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});
```

### Routing Integration Test

```typescript
// packages/web-shell/src/__integration__/routing.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { Routes as RouteIds } from '@universal/shared-router';

function TestApp({ initialEntries }: { initialEntries: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <nav>
        <Link to={`/${RouteIds.HOME}`}>Home</Link>
        <Link to={`/${RouteIds.SETTINGS}`}>Settings</Link>
      </nav>
      <Routes>
        <Route path={`/${RouteIds.HOME}`} element={<div>Home Page</div>} />
        <Route path={`/${RouteIds.SETTINGS}`} element={<div>Settings Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Routing', () => {
  it('should render home page by default', () => {
    render(<TestApp initialEntries={['/home']} />);

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('should navigate to settings', async () => {
    render(<TestApp initialEntries={['/home']} />);

    await userEvent.click(screen.getByRole('link', { name: /settings/i }));

    expect(screen.getByText('Settings Page')).toBeInTheDocument();
  });

  it('should preserve state across navigation', async () => {
    // Test implementation...
  });
});
```

## E2E Testing (Web - Playwright)

### Playwright Config

```typescript
// packages/web-shell/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,

  use: {
    baseURL: 'http://localhost:9001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: process.env.CI
      ? 'npx serve dist -l 9001'
      : 'yarn dev',
    url: 'http://localhost:9001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Smoke Tests

```typescript
// packages/web-shell/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the app', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Universal MFE/);
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('should display home page content', async ({ page }) => {
    await page.goto('/home');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/home');

    const themeToggle = page.getByLabel(/toggle theme/i);
    await themeToggle.click();

    // Verify theme changed (check for dark mode indicator)
    await expect(page.getByText('🌙')).toBeVisible();
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('should load within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
```

### Routing Tests

```typescript
// packages/web-shell/e2e/routing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Routing', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText('Settings')).toBeVisible();

    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/home');
    await page.getByRole('link', { name: /settings/i }).click();

    await page.goBack();
    await expect(page).toHaveURL(/\/home/);

    await page.goForward();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should preserve theme across navigation', async ({ page }) => {
    await page.goto('/home');

    // Toggle to dark theme
    await page.getByLabel(/toggle theme/i).click();
    await expect(page.getByText('🌙')).toBeVisible();

    // Navigate and verify theme persisted
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page.getByText('🌙')).toBeVisible();
  });
});
```

### Remote Loading Tests

```typescript
// packages/web-shell/e2e/remote-loading.spec.ts
import { test, expect } from '@playwright/test';

async function isRemoteAvailable(page): Promise<boolean> {
  try {
    const response = await page.request.get('http://localhost:9003/remoteEntry.js');
    return response.ok();
  } catch {
    return false;
  }
}

test.describe('Remote Loading', () => {
  test('should show load button', async ({ page }) => {
    await page.goto('/remote-hello');

    await expect(page.getByRole('button', { name: /load/i })).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    await page.goto('/remote-hello');

    await page.getByRole('button', { name: /load/i }).click();

    await expect(page.getByText(/loading/i)).toBeVisible();
  });

  test.describe('Remote Available', () => {
    test.skip(async ({ page }) => {
      return !(await isRemoteAvailable(page));
    }, 'Remote server not running');

    test('should load HelloRemote component', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByRole('button', { name: /load/i }).click();

      await expect(page.getByText(/Hello/)).toBeVisible({ timeout: 10000 });
    });

    test('should handle button interaction', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByRole('button', { name: /load/i }).click();

      await page.waitForSelector('text=Hello');
      await page.getByRole('button', { name: /press/i }).click();

      await expect(page.getByText(/pressed 1 time/i)).toBeVisible();
    });
  });
});
```

## E2E Testing (Mobile - Maestro)

### Maestro Flow Files

```yaml
# packages/mobile-host/.maestro/smoke.yaml
appId: com.mobilehosttmp
---
- launchApp
- assertVisible: "Welcome"
- assertVisible: "Home"
- assertVisible: "Settings"
```

```yaml
# packages/mobile-host/.maestro/navigation.yaml
appId: com.mobilehosttmp
---
- launchApp
- assertVisible: "Home"
- tapOn: "Settings"
- assertVisible: "Settings"
- tapOn: "Home"
- assertVisible: "Home"
```

```yaml
# packages/mobile-host/.maestro/theme.yaml
appId: com.mobilehosttmp
---
- launchApp
- tapOn: "Toggle theme"
- assertVisible: "🌙"
- tapOn: "Toggle theme"
- assertVisible: "☀️"
```

### Running Maestro Tests

```bash
# Android
yarn workspace @universal/mobile-host test:e2e:android

# iOS
yarn workspace @universal/mobile-host test:e2e:ios

# Smoke tests only
yarn workspace @universal/mobile-host test:e2e:android:smoke
```

## Testing Utilities

### Accessibility Matchers

```typescript
// From @universal/shared-a11y/testing
import { extendExpectWithA11yMatchers } from '@universal/shared-a11y/testing';

extendExpectWithA11yMatchers();

// In tests
expect(element).toHaveAccessibilityRole('button');
expect(element).toHaveAccessibilityLabel('Submit');
expect(element).toHaveAccessibilityState({ disabled: false });
expect(element).toBeAccessible();
expect(element).toHaveMinimumTouchTarget();
```

### Test Wrapper Factory

```typescript
// packages/shared-testing/src/createTestWrapper.tsx
export function createTestWrapper(options: {
  locale?: string;
  theme?: 'light' | 'dark';
  initialRoute?: string;
}) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[options.initialRoute ?? '/']}>
        <QueryProvider>
          <EventBusProvider>
            <I18nProvider translations={locales} initialLocale={options.locale ?? 'en'}>
              <ThemeProvider defaultTheme={options.theme ?? 'light'}>
                {children}
              </ThemeProvider>
            </I18nProvider>
          </EventBusProvider>
        </QueryProvider>
      </MemoryRouter>
    );
  };
}

// Usage
const wrapper = createTestWrapper({ locale: 'hi', theme: 'dark' });
const { result } = renderHook(() => useTheme(), { wrapper });
```

## CI Test Commands

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:integration": "turbo run test:integration",
    "test:e2e": "turbo run test:e2e",
    "test:coverage": "turbo run test -- --coverage"
  }
}
```

## Key Principles

1. **Test Pyramid**: Unit > Integration > E2E (quantity)
2. **Provider Wrapping**: Always wrap components with full provider stack
3. **Mock Boundaries**: Mock external dependencies, not internal modules
4. **Accessibility Testing**: Include a11y checks in component tests
5. **Cross-Platform**: Test behavior, not implementation details
6. **CI Optimization**: Skip expensive tests on PRs, run on merge

## File Locations

| Test Type | Location |
|-----------|----------|
| Unit tests | `packages/*/src/**/*.test.{ts,tsx}` |
| RN mocks | `packages/*/src/__mocks__/` |
| Integration tests | `packages/*/src/__integration__/` |
| E2E web tests | `packages/web-shell/e2e/` |
| E2E mobile flows | `packages/mobile-host/.maestro/` |
| Test setup | `jest.setup.js`, `packages/*/jest.config.js` |
