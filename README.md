# gulp-vue-compiler

This plugin compiles [Vue](https://vuejs.org/) single file components ([SFC](https://vuejs.org/v2/guide/single-file-components.html)) to plain JavaScript.

## Installation

```bash
npm install gulp-vue-compiler --save-dev
```

Any other plugin or dependency such as `babel-core` should be installed as well.


## Usage

```javascript
var vueCompiler = require('gulp-vue-compiler');

gulp.task('vue-compile', function() {
  return gulp.src('components/**/*.vue')
    .pipe(vueCompiler({ /* options */ }))
    .pipe(gulp.dest('./dist/'));
});
```

### Implementation details and options

* `options.newExtension`: Optionally modifies the output files extension to the new string.

* v0: Vueify's API is used internally. Therefore, any valid option for Vueify is valid here as well. See [Vueify options here](https://github.com/vuejs/vueify#configuring-options). Additionally, `options.ESModules` boolean option is available for removing the closure that Vueify adds automatically (which breaks ES modules). Passing `modules: false` in Babel's `env` preset automatically activates this option.

* v1: Uses [`vue-component-compiler`](https://github.com/vuejs/vue-component-compiler) internally ([more info here](https://github.com/vuejs/vue-component-compiler/issues/28)). `options.esModule` (default `true`), `options.parserConfig`, `options.templateCompilerConfig`, `options.babel`. Beta release does not support `style` tags.

## Examples

* Compiling `*.vue` components to plain JavaScript using Babel and ES modules:

```javascript
return gulp.src('components/**/*.vue')
  .pipe(vueCompiler({
    newExtension: 'js', // *.vue => *.js
    babel: {
      babelrc: false,
      presets: [
        ['env', {
          modules: false, // Keep ES modules in 'script' tag
          targets: {
            browsers: [ '> 1%', 'last 2 versions' ]
          }
        }],
        'stage-3'
      ]
    }
  }))
  .pipe(gulp.dest('./dist/'));
```
