
const path = require('path');

// Require the MBEE.js file for the M object.
require(path.join('..', '..', 'mbee.js'));

//const gulp = require('gulp');
//const concat = require('gulp-concat');
//const minify = require('gulp-minify');
//const sass = require('gulp-sass');
//const markdown = require('gulp-markdown');
const webpack = require('webpack');
//const validators = M.require('lib.validators');

function build() {
  return new Promise((resolve, reject) => {
      // Set mode
      let mode = M.config.server.ui.mode || 'production';

      M.log.info(`  + Transpiling react in ${mode} mode...`);
      webpack({
          mode: mode,
          entry: {
            reqApp: path.join(__dirname, 'src', 'app.jsx')
          },
          output: {
            path: path.join(M.root, 'build', 'public', 'js'),
            filename: '[name].js'
          },
          devServer: {
            historyApiFallback: true
          },
          module: {
            rules: [
              {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                  presets: ['babel-preset-env', 'babel-preset-react']
                }
              }
            ]
          }
          }, (err, stats) => {
          if (err || stats.hasErrors()) {
            // eslint-disable-next-line no-console
            console.log(stats.compilation.errors);
            return reject();
          }
          return resolve();
      });
  }).then(() => {
    M.log.info('Build Complete.');
  })
  .catch(() => {
    M.log.warn('React build FAILED');
    M.log.info('Build Complete.');
  });
}

// Call build when script executed
build();
