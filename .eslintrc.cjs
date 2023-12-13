/** @type {import('eslint').Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    // forbid usage of unused variables (marked with an _)
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['parameter', 'variable'],
        leadingUnderscore: 'forbid',
        filter: {
          // keep this one open for destructuring
          regex: '_*',
          match: false,
        },
        format: null,
      },
      {
        selector: 'parameter',
        leadingUnderscore: 'require',
        format: null,
        modifiers: ['unused'],
      },
    ],
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
};

module.exports = config;
