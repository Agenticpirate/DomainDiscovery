/**
 * API-related type definitions
 * @module types/api
 */

/**
 * Represents an API error
 */
export interface APIError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional additional error details */
  details?: Record<string, unknown>;
}

/**
 * Standard API response wrapper
 * @template T - The type of data returned on success
 */
export interface APIResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** The response data (present on success) */
  data?: T;
  /** Error information (present on failure) */
  error?: APIError;
  /** Optional metadata about the response */
  meta?: {
    /** Unix timestamp of when the response was generated */
    timestamp: number;
    /** Whether the response was served from cache */
    cached: boolean;
  };
}
