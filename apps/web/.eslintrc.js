module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': 'error',
    'react/no-unescaped-entities': 'off',
  },
  settings: {
    react: { version: '18' },
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
};