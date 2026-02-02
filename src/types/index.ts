/**
 * Central export file for all type definitions
 * @module types
 */

// Domain types
export type {
  DomainCheckResult,
  RegistrarLink,
  DomainSuggestion,
} from './domain';

// WHOIS types
export type { WHOISResult, RegistrantInfo } from './whois';

// Geographic types
export type { GeoLocation, GeoDomainResult } from './geo';

// API types
export type { APIResponse, APIError } from './api';
