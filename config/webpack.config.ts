import webpack from 'webpack';
import WebpackUserscript from 'webpack-userscript';
import { isEnvProduction } from './env';
import paths from './paths';

const commonConfig: webpack.Configuration = {
  mode: isEnvProduction ? 'production' : 'development',
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 1% in KR, not ie > 0'
              }]
            ]
          }
        }
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]
  }
};

const userscriptConfig: webpack.Configuration = {
  name: 'userscript',
  entry: paths.appUserscript,
  plugins: [
    new WebpackUserscript({
      headers: {
        name: isEnvProduction ? 'KLAS Helper' : 'KLAS Helper Development',
        namespace: 'https://github.com/nbsp1221',
        match: 'https://klas.kw.ac.kr/*',
        updateURL: 'https://openuserjs.org/meta/nbsp1221/KLAS_Helper.meta.js',
        downloadURL: 'https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js',
        grant: 'GM.xmlHttpRequest',
        copyright: '2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)',
        license: 'MIT',
        'run-at': 'document-start'
      }
    })
  ],
  optimization: {
    minimize: false
  },
  output: {
    filename: 'klas-helper.js',
    path: isEnvProduction ? paths.appDist : paths.appDev
  },
  ...commonConfig
};

const mainConfig: webpack.Configuration = {
  name: 'main',
  entry: paths.appMain,
  output: {
    filename: 'main.js',
    path: paths.appDist
  },
  ...commonConfig
};

const mainExtConfig: webpack.Configuration = {
  name: 'main-ext',
  entry: paths.appExtMain,
  output: {
    filename: 'main-ext.js',
    path: paths.appDist
  },
  ...commonConfig
};

export default [userscriptConfig, mainConfig, mainExtConfig];