/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** auth.users.id of the current request, set by middleware after getUser(). */
    userId?: string;
    /** auth.users.email of the current request. */
    userEmail?: string;
  }
}
