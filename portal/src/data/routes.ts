import { navGroups } from './constants';
import type { NavGroup, NavRoute } from './constants';

// Re-export for backward compatibility with Sidebar.astro
export type RouteGroup = NavGroup;
export type RouteItem = NavRoute;
export const routes = navGroups;
