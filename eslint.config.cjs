const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  {
    ignores: ['**/dist', '**/coverage', '**/node_modules', 'docs']
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  },
  {
    files: ['packages/react/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules
    }
  },
  eslintPluginPrettierRecommended
);
