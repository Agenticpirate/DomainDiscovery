/** Shared by dataFiles.ts (Node) and dataFiles.workers.ts (Cloudflare Worker). */

/** src/data subdirectories published as static assets under /_data/. */
export const DATA_ASSET_DIRS = ['learn-locales', 'tld-about'] as const;

/** `dir/name.json` inside one of the published directories; no traversal. */
export function isSafeRelPath(relPath: string): boolean {
  const [dir, file, ...rest] = relPath.split('/');
  return (
    rest.length === 0 &&
    (DATA_ASSET_DIRS as readonly string[]).includes(dir) &&
    /^[a-z0-9-]+\.json$/.test(file ?? '')
  );
}
