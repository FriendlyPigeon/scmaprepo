const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/client/index.html",
  filename: "./index.html",
  publicPath: "/"
});

module.exports = {
  entry: './src/client/index.js',
  output: {
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '../../theme.config$': path.join(__dirname, 'semantic-theme/theme.config')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ],
        test: /\.less$/
      },

      // this handles images
      {
          test: /\.jpe?g$|\.gif$|\.ico$|\.png$|\.svg$/,
          use: 'file-loader?name=[name].[ext]?[hash]'
      },

      // the following rules handle font extraction
      {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
          test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader'
      },
      {
          test: /\.otf(\?.*)?$/,
          use: 'file-loader?name=/fonts/[name].[ext]&mimetype=application/font-otf'
      }
    ]
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/auth': 'http://localhost:8080'
    },
    historyApiFallback: true,
  },
  plugins: [
    htmlPlugin,
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    })
  ]
};