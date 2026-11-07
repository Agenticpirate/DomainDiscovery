import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vinext from 'vinext';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  resolve: {
    alias: {
      // jspdf exports only "node" and "browser" conditions; workerd matches neither.
      jspdf: fileURLToPath(new URL('./node_modules/jspdf/dist/jspdf.es.min.js', import.meta.url)),
    },
  },
  plugins: [
    {
      // Data-only JSON (learn articles, TLD encyclopedia, price tables) produced ~60 MiB of
      // sourcemaps, over Cloudflare's 60 MiB upload cap, with no debugging value. Emit empty
      // maps for them; application code keeps full sourcemaps.
      name: 'dd:no-sourcemap-for-data-json',
      enforce: 'post',
      // Runs after files are on disk: rolldown serializes maps itself, so editing
      // chunk.map in generateBundle has no effect.
      writeBundle(options, bundle) {
        if (!options.dir) return;
        for (const output of Object.values(bundle)) {
          if (output.type !== 'chunk') continue;
          const mapPath = path.join(options.dir, `${output.fileName}.map`);
          if (!fs.existsSync(mapPath)) continue;
          const map = JSON.parse(fs.readFileSync(mapPath, 'utf8')) as {
            sources?: string[];
            sourcesContent?: (string | null)[];
          };
          if (!map.sourcesContent || !map.sources?.some((s) => /[\\/]src[\\/]data[\\/]/.test(s))) continue;
          map.sourcesContent = map.sourcesContent.map((content, i) =>
            /[\\/]src[\\/]data[\\/]/.test(map.sources?.[i] ?? '') ? null : content
          );
          fs.writeFileSync(mapPath, JSON.stringify(map));
        }
      },
    },
    vinext(),
    cloudflare({
      viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
    }),
  ],
});
