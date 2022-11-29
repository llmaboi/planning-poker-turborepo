module.exports = {
  extends: [
    'turbo',
    'eslint:recommended',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'plugin:prettier/recommended',
  ],

  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],

  ignorePatterns: ['dist', 'node_modules'],

  rules: {
    'prettier/prettier': 'error',
    'react/jsx-key': 'off',

    // Code smell
    complexity: ['error'],
    'max-depth': ['warn'],
    'max-nested-callbacks': ['warn'],
  },
};
