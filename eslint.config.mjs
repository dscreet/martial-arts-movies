import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vitest from '@vitest/eslint-plugin';
import playwright from 'eslint-plugin-playwright';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ts
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // avoids non-issue error
          ignoreRestSiblings: true,
        },
      ],
      // ensures importing types as `import type`
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },

  // import sorting
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // tailwind
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': [
        'warn',
        {
          printWidth: 160,
          preferSingleLine: true,
        },
      ],
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/app/globals.css',
      },
    },
  },

  // tests
  {
    files: ['tests/unit/**', 'tests/integration/**'],
    ...vitest.configs.recommended,
  },
  {
    files: ['tests/e2e/**'],
    ...playwright.configs['flat/recommended'],
  },

  // should be able to mock next/image for tests and not have to set alt
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': 'off',
    },
  },

  // ensures no conflicts with prettier config
  prettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // custom
    'src/components/ui/**',
    'src/scripts/**',
    'coverage/**',
  ]),
]);

export default eslintConfig;
