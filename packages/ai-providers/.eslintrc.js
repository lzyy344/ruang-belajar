module.exports = {
  env: { es2022: true, node: true, browser: true },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'require-yield': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};