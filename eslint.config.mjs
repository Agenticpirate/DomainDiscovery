import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// ESLint 9 flat config (replaces .eslintrc.json; `next lint` was removed in Next 16).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/self-closing-comp': ['warn', { component: true, html: true }],
      // New React Compiler rules (eslint-plugin-react-hooks 7). Existing code predates them;
      // keep them visible as warnings until those components are refactored.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    '.next-*/**',
    'out/**',
    'dist/**',
    'coverage/**',
    '.wrangler/**',
    'next-env.d.ts',
    'scripts/learn_translate/cache/**',
  ]),
]);
