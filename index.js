(function() {

'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var compiler = require('vueify').compiler;
var path = require('path');

var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-vue-compiler';

function gulpVueCompiler (options) {
  return through.obj(function (file, encode, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'));
      return callback();
    }

    if (options) {
      compiler.applyConfig(options);
    }

    compiler.compile(file.contents.toString(), file.path, function (err, result) {
      if (err) {
        this.emit('error', new PluginError(PLUGIN_NAME,
          'In file ' + path.relative(process.cwd(), file.path) + ':\n' + err.message));
        return callback();
      }

      if (options && options.newExtension) {
        file.path = gutil.replaceExtension(file.path, '.' + options.newExtension);
      }

      if (options) {
        // options.ESModules or options.babel.presets->env.modules === false

        var esm = options.ESModules;
        if (!esm && options.babel && options.babel.presets instanceof Array) {
          esm = options.babel.presets.some(function(preset) {
            if (preset instanceof Array && preset[1] && preset[1].modules === false) {
              return true;
            }
          });
        }

        // Remove closure automatically added by Vueify that breaks ESModules
        if (esm) {
          result = result.substring(result.indexOf('import '));
          result = result.replace(/^}\)\(\)(\nif\s+\(module\.exports\.__esModule)/m, '$1');
        }
      }

      file.contents = new Buffer(result);
      callback(null, file);
    }.bind(this));
  });
}

module.exports = gulpVueCompiler;

})()
