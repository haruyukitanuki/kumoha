const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  {
    ignores: ['dist', 'docs', 'coverage']
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    // plugins: {
    //   'react-hooks': reactHooks,
    //   'react-refresh': reactRefresh
    // },
    rules: {
      // ...reactHooks.configs.recommended.rules,
      // 'react-refresh/only-export-components': [
      //   'warn',
      //   { allowConstantExport: true }
      // ],
      // 'react/react-in-jsx-scope': 'off',
      // 'react-hooks/exhaustive-deps': 'off'
    }
  },
  eslintPluginPrettierRecommended
);
