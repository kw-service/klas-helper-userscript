import webpack from 'webpack';
import WebpackUserscript from 'webpack-userscript';
import paths from './paths';

const getConfig = (useUserscript: boolean): webpack.Configuration => ({
  mode: 'production',
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts']
  },
  entry: useUserscript ? paths.appUserscript : paths.appMain,
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
  },
  plugins:
    useUserscript ?
      [
        new WebpackUserscript({
          headers: paths.appHeaders
        })
      ] :
      [],
  optimization: {
    minimize: !useUserscript
  },
  output: {
    filename: useUserscript ? 'klas-helper.js' : 'main.js',
    path: paths.appDist
  }
});

export default [getConfig(true), getConfig(false)];