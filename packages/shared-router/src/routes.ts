/**
 * Route constants for the Universal MFE Platform.
 *
 * IMPORTANT: These are route IDENTIFIERS, not URLs!
 * ================================================
 * MFEs use these constants to emit navigation intents via event bus.
 * Hosts are responsible for mapping these to actual URLs/routes.
 *
 * This separation ensures:
 * 1. MFEs remain URL-agnostic and independently deployable
 * 2. Hosts can change URL structure without affecting MFEs
 * 3. Different hosts can have different URL schemes for the same routes
 */

import type { RouteId, RouteMetadata } from './types';

// =============================================================================
// Route ID Constants
// =============================================================================

/**
 * Route identifiers as constants for type-safe usage.
 * Use these instead of string literals.
 *
 * @example
 * ```ts
 * // In MFE - emit navigation intent
 * eventBus.emit({
 *   type: 'NAVIGATE_TO',
 *   payload: { routeId: Routes.SETTINGS }
 * });
 *
 * // In Host - handle navigation
 * navigate(routeIdToPath[Routes.SETTINGS]);
 * ```
 */
export const Routes = {
  HOME: 'home' as const,
  SETTINGS: 'settings' as const,
  PROFILE: 'profile' as const,
  REMOTE_HELLO: 'remote-hello' as const,
  REMOTE_DETAIL: 'remote-detail' as const,
  // Auth routes
  LOGIN: 'login' as const,
  SIGNUP: 'signup' as const,
  FORGOT_PASSWORD: 'forgot-password' as const,
} satisfies Record<string, RouteId>;

/**
 * Type for route constant values.
 */
export type RouteConstant = (typeof Routes)[keyof typeof Routes];

// =============================================================================
// Route Metadata Registry
// =============================================================================

/**
 * Metadata for all routes.
 * Used for building navigation menus, breadcrumbs, access control, etc.
 *
 * Note: `labelKey` values are i18n keys from the shared-i18n package.
 */
export const routeMetadata: Record<RouteId, RouteMetadata> = {
  [Routes.HOME]: {
    id: Routes.HOME,
    labelKey: 'navigation.home',
    icon: 'home',
    showInNav: true,
    navOrder: 1,
    requiresAuth: false,
  },
  [Routes.SETTINGS]: {
    id: Routes.SETTINGS,
    labelKey: 'navigation.settings',
    icon: 'settings',
    showInNav: true,
    navOrder: 3,
    requiresAuth: false,
  },
  [Routes.PROFILE]: {
    id: Routes.PROFILE,
    labelKey: 'navigation.profile',
    icon: 'user',
    showInNav: true,
    navOrder: 2,
    requiresAuth: true,
  },
  [Routes.REMOTE_HELLO]: {
    id: Routes.REMOTE_HELLO,
    labelKey: 'navigation.remoteHello',
    icon: 'puzzle',
    showInNav: true,
    navOrder: 4,
    requiresAuth: false,
  },
  [Routes.REMOTE_DETAIL]: {
    id: Routes.REMOTE_DETAIL,
    labelKey: 'navigation.remoteDetail',
    icon: 'file',
    showInNav: false,
    requiresAuth: false,
  },
  // Auth routes
  [Routes.LOGIN]: {
    id: Routes.LOGIN,
    labelKey: 'navigation.login',
    icon: 'login',
    showInNav: false,
    requiresAuth: false,
  },
  [Routes.SIGNUP]: {
    id: Routes.SIGNUP,
    labelKey: 'navigation.signUp',
    icon: 'user-plus',
    showInNav: false,
    requiresAuth: false,
  },
  [Routes.FORGOT_PASSWORD]: {
    id: Routes.FORGOT_PASSWORD,
    labelKey: 'navigation.forgotPassword',
    icon: 'key',
    showInNav: false,
    requiresAuth: false,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get routes that should appear in the main navigation.
 * Returns routes sorted by navOrder.
 */
export function getNavigationRoutes(): RouteMetadata[] {
  return Object.values(routeMetadata)
    .filter((route) => route.showInNav)
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0));
}

/**
 * Get routes that require authentication.
 */
export function getProtectedRoutes(): RouteMetadata[] {
  return Object.values(routeMetadata).filter((route) => route.requiresAuth);
}

/**
 * Check if a route requires authentication.
 */
export function isProtectedRoute(routeId: RouteId): boolean {
  return routeMetadata[routeId]?.requiresAuth ?? false;
}

/**
 * Get metadata for a specific route.
 */
export function getRouteMetadata(routeId: RouteId): RouteMetadata | undefined {
  return routeMetadata[routeId];
}

/**
 * Check if a string is a valid route ID.
 */
export function isValidRouteId(value: string): value is RouteId {
  return value in routeMetadata;
}
