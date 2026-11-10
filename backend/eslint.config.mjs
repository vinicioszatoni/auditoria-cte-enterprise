import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {defineConfig} from 'eslint/config';

export default defineConfig(
  {
    name: 'app/ignores',
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.config.{js,ts}',
      'tsconfig.json',
      // @scf-region eslint-ignore

      '**/migrations/**',
      '**/seeders/**',
      '**/models/**'
      // @end-scf-region
    ]
  },
  {
    name: 'app/base',
    files: ['**/*.{js,ts}'],
    extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-require-imports': 'off', // Permite o uso de require() no backend Node.js
      '@typescript-eslint/no-explicit-any': 'off' // Desliga os avisos de "any" nos arquivos .ts
    }
  }
);
