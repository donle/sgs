const path = require('path');
console.log(path.resolve(__dirname, '../../../core'));
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'css-modules-typescript-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader' }],
        include: __dirname
      }
    ]
  }
};
