/**
 * Minimal declaration for the Workers runtime module. Only the Worker build imports it
 * (src/lib/dataFiles.workers.ts); Node code paths never load it.
 */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
