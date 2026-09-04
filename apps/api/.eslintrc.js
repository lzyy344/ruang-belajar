module.exports = {
  env: { es2022: true, node: true },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { 'no-console': 'off', 'no-unused-vars': 'off' },
  ignorePatterns: ['dist/', 'node_modules/'],
};