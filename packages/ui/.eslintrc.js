module.exports = {
  env: { es2022: true, node: true, browser: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { 'no-console': 'off', 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] },
  ignorePatterns: ['dist/', 'node_modules/'],
};