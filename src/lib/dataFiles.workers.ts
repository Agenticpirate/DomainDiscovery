/**
 * Worker implementation of ./dataFiles: reads the JSON copy published as a static asset
 * (/_data/<relPath>, written by the dd:data-assets plugin in vite.config.ts) through the
 * ASSETS binding. Same exports as ./dataFiles.
 */
import { env } from 'cloudflare:workers';
import { DATA_ASSET_DIRS, isSafeRelPath } from './dataFiles.shared';

export { DATA_ASSET_DIRS, isSafeRelPath };

type AssetsBinding = { fetch: (input: Request | string) => Promise<Response> };

export async function readDataJson<T>(relPath: string): Promise<T | null> {
  if (!isSafeRelPath(relPath)) return null;
  const assets = (env as unknown as { ASSETS?: AssetsBinding }).ASSETS;
  if (!assets) throw new Error('ASSETS binding missing: add "binding": "ASSETS" to wrangler.jsonc assets');
  // The host is ignored by the assets binding; only the path is used.
  const res = await assets.fetch(new Request(`https://assets.local/_data/${relPath}`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Data asset /_data/${relPath} returned ${res.status}`);
  return (await res.json()) as T;
}
