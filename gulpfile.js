const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const run = require('gulp-run-command').default;

gulp.task('clean', run('rm -rf dist'));

gulp.task('gzip', run("bash -c 'gzip -9 -q -k dist/* 2> /dev/null || true'"));

gulp.task('build', function () {
    return gulp.src('src/index.html')
        .pipe(inline({
            base: 'src/',
            js: uglify,
            css: cleanCSS,
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', gulp.series('clean', 'build', 'gzip'));
