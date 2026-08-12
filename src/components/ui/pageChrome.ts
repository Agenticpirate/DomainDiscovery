/**
 * Layout class constants shared by page shells.
 *
 * Kept in a module WITHOUT 'use client' on purpose: string exports from a
 * client module become client-reference objects when imported by Server
 * Components, so `className={PAGE_MAIN_CLASS}` rendered "[object Object]"
 * and pages lost the fixed-nav clearance entirely.
 */

/**
 * Standard main top offset under fixed nav (see --nav-clearance in globals.css).
 * Do not stack extra pt-* here — that created a large empty gap under the header.
 */
export const PAGE_MAIN_CLASS = 'relative page-main';

/** Standard horizontal padding for content bands */
export const PAGE_GUTTER_CLASS = 'page-gutter';
