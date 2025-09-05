import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

export default {
  mode: process.env.NODE_ENV || 'development',
  target: 'web',
  experiments: {
    outputModule: true
  },
  entry: {
    'background/service-worker': './src/background/service-worker.mjs',
    'popup/popup': './src/popup/popup.mjs'
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].mjs',
    clean: true,
    module: true,
    chunkFormat: 'module'
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: { chrome: '88' },
                modules: false
              }]
            ]
          }
        },
        type: 'javascript/esm'
      },
      {
        test: /\.css$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/popup/popup.css', to: 'popup/popup.css' },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/lib', to: 'lib' },
        { from: 'src/config', to: 'config' }
      ]
    })
  ],
  resolve: {
    extensions: ['.mjs', '.js']
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  optimization: {
    minimize: process.env.NODE_ENV === 'production'
  }
};