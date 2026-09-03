import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts'];

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/build/**', '**/.turbo/**', '**/tmp/**']
  },
  {
    files: ['eslint.config.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.node
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,
      'no-console': 'warn',
      'prettier/prettier': 'error'
    }
  },
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: tsFiles
  })),
  {
    files: tsFiles,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          minimumDescriptionLength: 10
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false
        }
      ],
      'no-case-declarations': 'off',
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['packages/ergo/src/**/*.{ts,tsx,mts}'],
    ignores: ['packages/ergo/src/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'The core ergo package must remain React-free. Use ergo-react instead.'
            },
            {
              name: 'react-dom',
              message: 'The core ergo package must remain React-free. Use ergo-react instead.'
            },
            {
              name: 'use-sync-external-store',
              message: 'The core ergo package must remain React-free. Use ergo-react instead.'
            },
            {
              name: 'zustand',
              message: 'Use zustand/vanilla from the core ergo package.'
            },
            {
              name: 'zustand/react',
              message: 'React bindings belong in ergo-react.'
            },
            {
              name: 'zustand/traditional',
              message: 'React bindings belong in ergo-react.'
            }
          ],
          patterns: [
            {
              group: ['react/*', 'react-dom/*', 'use-sync-external-store/*'],
              message: 'The core ergo package must remain React-free. Use ergo-react instead.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', 'packages/ergo-public-api-check/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off'
    }
  },
  {
    files: ['packages/ergo-react/src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser
    }
  }
);

export default config;
