/**
 * Product feature toggles.
 * Flip these to re-enable later without hunting call sites.
 */
export const FEATURE_FLAGS = {
  /**
   * Free domain status watch (email alerts via RDAP).
   * Disabled for now — re-enable when we promote the feature.
   */
  domainWatch: false,
  /**
   * AI Domain Assistant (auto rank + MCP tools).
   * Phase 0–1: auto API live; UI/MCP follow.
   */
  domainAgent: true,
} as const;
