const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].[contenthash:8].js',
    clean: true,
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
        generator: { filename: 'assets/images/[name].[contenthash:8][ext]' }
      },
      // HTML files are processed by HtmlWebpackPlugin's template handling
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'assets/css/[name].[contenthash:8].css' }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      filename: path.resolve(__dirname, 'index.html'),
      inject: 'body',
      scriptLoading: 'defer'
    })
  ],
  resolve: { extensions: ['.js'] }
};
