module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', '.next/'],
};