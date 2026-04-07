/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** True for /inside/* requests where the page should log a dd_views row. */
    shouldLogView?: boolean;
    /** auth.users.id of the current request, set by middleware after getUser(). */
    userId?: string;
    /** auth.users.email of the current request. */
    userEmail?: string;
    /** Display name pulled from access_requests.name (or email fallback). */
    viewerName?: string;
    /** access_requests.org for the current viewer (corporate domain or null). */
    viewerOrg?: string | null;
    /** profiles.welcomed_at for the current viewer — drives the WelcomeCard. */
    welcomedAt?: string | null;
  }
}
