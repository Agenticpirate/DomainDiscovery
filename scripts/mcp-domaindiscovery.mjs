#!/usr/bin/env node
/**
 * AI Domain Assistant MCP server (stdio) for Cursor / Claude Desktop / local agents.
 *
 * Usage:
 *   npm run mcp:server
 *   node scripts/mcp-domaindiscovery.mjs
 *
 * Prefer HTTP when the Next app is running:
 *   { "mcpServers": { "ai-domain-assistant": { "url": "http://localhost:5001/api/mcp" } } }
 *
 * stdio config (Claude Desktop / Cursor):
 * {
 *   "mcpServers": {
 *     "ai-domain-assistant": {
 *       "command": "node",
 *       "args": ["/absolute/path/to/scripts/mcp-domaindiscovery.mjs"],
 *       "cwd": "/absolute/path/to/Domain DIscovery"
 *     }
 *   }
 * }
 *
 * Loads TypeScript sources via tsx when available.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const entry = path.join(root, 'scripts', 'mcp-domaindiscovery-entry.ts');

if (!fs.existsSync(entry)) {
  console.error('Missing', entry);
  process.exit(1);
}

// Prefer local tsx, then npx tsx
const tsxBin = path.join(root, 'node_modules', '.bin', 'tsx');
const useLocal = fs.existsSync(tsxBin);

const child = spawn(
  useLocal ? tsxBin : 'npx',
  useLocal ? [entry] : ['--yes', 'tsx', entry],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      TSX_TSCONFIG_PATH: path.join(root, 'tsconfig.json'),
    },
  }
);

child.on('exit', (code) => process.exit(code ?? 1));
