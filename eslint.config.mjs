import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'

export default [
  { ignores: ['dist', 'out', 'build', 'node_modules'] },

  // --- CONFIG FOR MAIN & PRELOAD (Node + Browser) ---
  {
    files: ['src/main/**/*.{js,ts,mjs,cjs}', 'src/preload/**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node, // Allows process, __dirname
        ...globals.browser, // Allows window, document (FIXED THIS)
        ...globals.es2021
      }
    },
    plugins: {
      prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  },

  // --- CONFIG FOR RENDERER (React) ---
  {
    files: ['src/renderer/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': 'error'
    }
  },

  // --- GENERIC CONFIG ---
  {
    files: ['*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node
    },
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' }
  }
]
