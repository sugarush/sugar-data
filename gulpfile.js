const { src, dest, parallel } = require('gulp');

function js() {
  return src('lib/*.js')
    .pipe(dest('dist'));
}

exports.js = js;
exports.default = parallel(js);
