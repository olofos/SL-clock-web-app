const gulp = require('gulp');
const inline = require('gulp-inline');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const zopfli = require('gulp-zopfli-green');
const clean = require('gulp-clean');
const fileChecksum = require('gulp-file-checksum');


gulp.task('clean', () => gulp.src('dist/', { read: false })
    .pipe(clean()));

gulp.task('minify-html', () => gulp.src('src/*.html')
    .pipe(inline({
        base: 'src/',
        js: uglify,
        css: cleanCSS,
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/')));

gulp.task('uglify-es', () => gulp.src(['src/*.js', '!src/splash-code.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist/')));

gulp.task('minify-css', () => gulp.src(['src/*.css', '!src/splash-style.css'])
    .pipe(cleanCSS({}))
    .pipe(gulp.dest('dist')));

gulp.task('favicon', () => gulp.src('src/favicon.ico')
    .pipe(gulp.dest('dist/')));

gulp.task('zopfli', () => gulp.src(['dist/*', '!dist/*.gz'])
    .pipe(zopfli({ format: 'gzip' }))
    .pipe(gulp.dest('dist/')));

gulp.task('checksum', () => gulp.src(['dist/*', '!dist/*.gz'], { buffer: false })
    .pipe(fileChecksum({
        template: '{sha1} {size}',
        output: '{basename}.hs',
    }))
    .pipe(gulp.dest('dist')));

gulp.task('default', gulp.series('clean', 'minify-html', 'uglify-es', 'minify-css', 'favicon', 'zopfli', 'checksum'));
