/**
 * Shared routing types for the Universal MFE Platform.
 *
 * IMPORTANT: Routing Ownership Rules
 * ==================================
 * 1. Hosts own all routes - Route definitions live exclusively in host applications
 * 2. MFEs emit navigation intents - Remotes use event bus to request navigation
 * 3. MFEs never import routers - No useNavigate, useLocation, or router imports in remotes
 * 4. MFEs never reference URLs - Remotes are URL-agnostic; hosts map events to routes
 *
 * This package provides:
 * - Route ID constants (NOT URLs) for type-safe navigation intents
 * - Navigation intent types for event bus communication
 * - Type definitions that hosts and remotes share
 */

// =============================================================================
// Route Identifiers
// =============================================================================

/**
 * Route identifiers used for navigation intents.
 * These are semantic names, NOT URLs. Hosts map these to actual routes.
 */
export type RouteId =
  | 'home'
  | 'settings'
  | 'profile'
  | 'remote-hello'
  | 'remote-detail'
  | 'login'
  | 'signup'
  | 'forgot-password';

/**
 * Parameters that can be passed with navigation intents.
 * Each route can define its own parameter types.
 */
export interface RouteParams {
  home: undefined;
  settings: undefined;
  profile: { userId?: string };
  'remote-hello': undefined;
  'remote-detail': { id: string };
  login: undefined;
  signup: undefined;
  'forgot-password': undefined;
}

/**
 * Helper type to get params for a specific route.
 */
export type ParamsFor<R extends RouteId> = RouteParams[R];

// =============================================================================
// Navigation Intent Types
// =============================================================================

/**
 * Navigation intent emitted by MFEs via event bus.
 * Hosts listen for these and perform the actual navigation.
 */
export interface NavigationIntent<R extends RouteId = RouteId> {
  /** The route identifier to navigate to */
  routeId: R;
  /** Parameters for the route (if any) */
  params?: ParamsFor<R>;
  /** Whether to replace the current history entry */
  replace?: boolean;
  /** Optional state to pass to the route */
  state?: Record<string, unknown>;
}

/**
 * Navigation result returned by host after navigation completes.
 */
export interface NavigationResult {
  /** Whether navigation was successful */
  success: boolean;
  /** The route that was navigated to */
  routeId: RouteId;
  /** Error message if navigation failed */
  error?: string;
}

/**
 * Back navigation intent.
 */
export interface BackNavigationIntent {
  /** Number of steps to go back (default: 1) */
  delta?: number;
  /** Fallback route if history is empty */
  fallbackRouteId?: RouteId;
}

// =============================================================================
// Route Metadata Types
// =============================================================================

/**
 * Metadata about a route for display purposes.
 * Hosts can use this to build navigation menus, breadcrumbs, etc.
 */
export interface RouteMetadata {
  /** Route identifier */
  id: RouteId;
  /** Display name for the route (i18n key recommended) */
  labelKey: string;
  /** Icon name (if using an icon library) */
  icon?: string;
  /** Whether the route should appear in main navigation */
  showInNav?: boolean;
  /** Order in navigation menu */
  navOrder?: number;
  /** Whether authentication is required */
  requiresAuth?: boolean;
  /** Required roles for access */
  requiredRoles?: string[];
}

// =============================================================================
// Navigation Guard Types
// =============================================================================

/**
 * Result from a navigation guard check.
 */
export interface GuardResult {
  /** Whether navigation should proceed */
  canNavigate: boolean;
  /** If blocked, where to redirect (optional) */
  redirectTo?: RouteId;
  /** Message to display if blocked */
  message?: string;
}

/**
 * Function type for navigation guards.
 * Guards run before navigation and can block or redirect.
 */
export type NavigationGuard = (
  to: NavigationIntent,
  from: RouteId | null
) => GuardResult | Promise<GuardResult>;

// =============================================================================
// Location State Types
// =============================================================================

/**
 * Type-safe location state that can be passed during navigation.
 */
export interface LocationState {
  /** Where the user came from (for "back" functionality) */
  from?: RouteId;
  /** Any additional data passed during navigation */
  data?: Record<string, unknown>;
  /** Timestamp of navigation */
  timestamp?: number;
}

// =============================================================================
// Hook Return Types (for host implementations)
// =============================================================================

/**
 * Return type for useNavigationIntent hook (implemented by hosts).
 */
export interface UseNavigationIntentReturn {
  /** Navigate to a route */
  navigate: <R extends RouteId>(intent: NavigationIntent<R>) => void;
  /** Go back in history */
  goBack: (intent?: BackNavigationIntent) => void;
  /** Current route ID */
  currentRoute: RouteId | null;
  /** Whether navigation is in progress */
  isNavigating: boolean;
}

/**
 * Return type for useRouteParams hook (implemented by hosts).
 */
export interface UseRouteParamsReturn<R extends RouteId> {
  /** Route parameters */
  params: ParamsFor<R>;
  /** Whether params are still loading */
  isLoading: boolean;
}
