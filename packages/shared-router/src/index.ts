// Types
export type {
  RouteId,
  RouteParams,
  ParamsFor,
  NavigationIntent,
  NavigationResult,
  BackNavigationIntent,
  RouteMetadata,
  GuardResult,
  NavigationGuard,
  LocationState,
  UseNavigationIntentReturn,
  UseRouteParamsReturn,
} from './types';

// Route constants and metadata
export {
  Routes,
  type RouteConstant,
  routeMetadata,
  getNavigationRoutes,
  getProtectedRoutes,
  isProtectedRoute,
  getRouteMetadata,
  isValidRouteId,
} from './routes';

// Re-export useful types from react-router for host implementations
// Hosts will import these from shared-router to ensure version consistency
export type {
  NavigateFunction,
  Location,
  NavigateOptions,
  To,
  Path,
  PathMatch,
  Params,
} from 'react-router';
