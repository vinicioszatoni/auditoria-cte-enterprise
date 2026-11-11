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
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': ['warn', {ignoreRestArgs: true}],
      'comma-dangle': ['error', 'never']
    }
  }
);
