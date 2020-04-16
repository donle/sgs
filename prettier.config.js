module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'all',
  jsxSingleQuote: false,
  overrides: [
    {
      files: '*.css',
      options: {
        tabWidth: 4,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        tabWidth: 2,
      },
    },
  ],
};
