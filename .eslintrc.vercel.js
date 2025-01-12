module.exports = {
    extends: ['./.eslintrc.js'],
    rules: {
      // Disable or modify rules specifically for Vercel deployment
      '@typescript-eslint/no-explicit-any': 'off',
    },
  };