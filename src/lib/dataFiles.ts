/**
 * Read a large JSON file from src/data at request time, without bundling it into the server.
 *
 * Node (next dev, jest): reads src/data/<relPath> from disk.
 * Cloudflare Worker build: vite.config.ts swaps this module for dataFiles.workers.ts, which
 * reads the copy published as a static asset under /_data/<relPath>. Keeping these files out
 * of the Worker bundle (about 30 MB) keeps cold starts fast.
 */
import { DATA_ASSET_DIRS, isSafeRelPath } from './dataFiles.shared';

export { DATA_ASSET_DIRS, isSafeRelPath };

/** Resolves to null when the file does not exist. */
export async function readDataJson<T>(relPath: string): Promise<T | null> {
  if (!isSafeRelPath(relPath)) return null;
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  try {
    return JSON.parse(await readFile(join(process.cwd(), 'src/data', relPath), 'utf8')) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw err;
  }
}
