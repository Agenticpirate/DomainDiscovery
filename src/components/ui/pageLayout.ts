/**
 * Layout class constants shared by server and client pages.
 * Kept out of Breadcrumb.tsx ('use client') so server components get the
 * real string instead of a client reference.
 */

/**
 * Standard main top offset under fixed nav (see --nav-clearance in globals.css).
 * Do not stack extra pt-* here — that created a large empty gap under the header.
 */
export const PAGE_MAIN_CLASS = 'relative page-main';

/** Standard horizontal padding for content bands */
export const PAGE_GUTTER_CLASS = 'page-gutter';
