const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const brotli = require('gulp-brotli');
const zopfli = require('gulp-zopfli-green');
const clean = require('gulp-clean');

gulp.task('clean', () => gulp.src('dist/', { read: false })
    .pipe(clean()));

gulp.task('build', () => gulp.src('src/index.html')
    .pipe(inline({
        base: 'src/',
        js: uglify,
        css: cleanCSS,
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/')));

gulp.task('favicon', () => gulp.src('src/favicon.ico')
    .pipe(gulp.dest('dist/')));

gulp.task('brotli', () => gulp.src(['dist/*', '!dist/*.gz', '!dist/*.br'])
    .pipe(brotli.compress())
    .pipe(gulp.dest('dist/')));

gulp.task('zopfli', () => gulp.src(['dist/*', '!dist/*.gz', '!dist/*.br'])
    .pipe(zopfli({ format: 'gzip' }))
    .pipe(gulp.dest('dist/')));

gulp.task('default', gulp.series('clean', 'build', 'favicon', 'zopfli', 'brotli'));
