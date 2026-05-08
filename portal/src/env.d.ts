/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by middleware after the built-in admin session cookie verifies. */
    isAdmin?: boolean;
  }
}
