const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const dotenv = require('dotenv');

// Determine environment from Webpack's mode
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

// Load environment variables from the appropriate .env file
const env = dotenv.config({ path: envFile }).parsed || {};

// Convert to format DefinePlugin expects: { 'process.env.KEY': JSON.stringify(value) }
const envKeys = Object.fromEntries(
  Object.entries(env).map(([key, val]) => [
    `process.env.${key}`,
    JSON.stringify(val),
  ])
);

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './frontend/src/index.js',
    output: {
      path: path.resolve(__dirname, 'frontend', 'dist'),
      filename: 'bundle.js'
    },
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'source-map' : false, // Enable source maps only in dev
    optimization: {
      minimize: !isDevelopment // Minify only in production
    },
    resolve: {
      alias: {
        react: path.resolve('./node_modules/react'),
        'react-dom': path.resolve('./node_modules/react-dom')
      },
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'styles.css',
      }),
      new webpack.DefinePlugin(envKeys), // Inject env variables
    ]
  };
};