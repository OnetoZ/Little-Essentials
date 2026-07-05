import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // These React 19 compiler-oriented rules are advisory here; the codebase
      // uses standard fetch-on-mount / prefill patterns. Keep as warnings.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
    },
  },
  {
    // Server / serverless code + tooling run in Node.
    files: ['api/**/*.js', 'server.js', 'dev-run.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
