(function() {

'use strict';

var through = require('through2');
var PluginError = require('plugin-error')
var replaceExtension = require('replace-ext');
var compiler = require('vue-component-compiler');
var babel = require('babel-core');
var path = require('path');

var PLUGIN_NAME = 'gulp-vue-compiler';

function gulpVueCompiler (options) {
  options = Object.assign({ esModule: true }, options || {});
  var parserConfig = Object.assign({ needMap: false }, options.parserConfig || {});
  var templateCompilerConfig = Object.assign({}, options.templateCompilerConfig || {}, { esModule: options.esModule });

  return through.obj(function (file, encode, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'));
      return callback();
    }

    if (options.newExtension) {
      file.path = replaceExtension(file.path, '.' + options.newExtension);
    }

    try {
      var descriptor = compiler.parse(file.contents.toString(), file.path, parserConfig);
      var script = descriptor.script.content;
      var template = compiler.compileTemplate({
        code: descriptor.template.content,
        descriptor: descriptor.template
      }, file.path, templateCompilerConfig).code;

      // Assemble ESM / CJS
      var replaceExport, exportDefault;
      if (options.esModule) {
        replaceExport = /^export\s+default/m;
        exportDefault = '\n\nexport default';
      } else {
        replaceExport = /^module\.exports =/m;
        exportDefault = '\n\nmodule.exports =';
      }

      script = script.replace(replaceExport, 'var __script__ =');
      template = template.replace(replaceExport, 'var __template__ =');
      var component = [script, template, exportDefault + ' Object.assign({}, __script__, __template__);'].join('\n\n');
      component = babel.transform(component, options.babel).code;

      file.contents = new Buffer(component);
      callback(null, file);

    } catch (err) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        'In file ' + path.relative(process.cwd(), file.path) + ':\n' + err.message));
      return callback();
    }
  });
}

module.exports = gulpVueCompiler;

})()

