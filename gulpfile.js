'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');
let plumber = require('gulp-plumber');
let sourcemap = require('gulp-sourcemaps');
let mincss = require('gulp-csso');
let rename = require('gulp-rename');
let del = require('del');
let server = require('browser-sync').create();

let paths = {
  src: 'src/',
  scssEntry: 'src/styles/style.scss',
  scssSrc: 'src/styles/**/*.scss',
  htmlSrc: 'src/*.html',
  jsSrc: 'src/scripts/*.js',
  assetsSrc: 'src/assets/**/*.*',
  buildDest: 'docs/',
};

gulp.task('clean', function (done) {
  del(paths.buildDest);
  done();
});

gulp.task('css', function () {
  return gulp.src(paths.scssEntry)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(mincss())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest(paths.buildDest))
    .pipe(server.stream());
});

gulp.task('server', function () {
  server.init({
    server: paths.buildDest
  });

  gulp.watch(paths.scssSrc, gulp.series('css'));
  gulp.watch(paths.htmlSrc, gulp.series('html', 'reload'));
  gulp.watch(paths.jsSrc, gulp.series('js', 'reload'));
});

gulp.task('html', function () {
  return gulp.src(paths.htmlSrc)
    .pipe(gulp.dest(paths.buildDest));
});

gulp.task('js', function () {
  return gulp.src(paths.jsSrc, {
    base: paths.src
  })
    .pipe(gulp.dest(paths.buildDest));
});

gulp.task('copy', function () {
  return gulp.src(paths.assetsSrc, {
    base: paths.src
  })
    .pipe(gulp.dest(paths.buildDest));
});

gulp.task('reload', function (done) {
  server.reload();
  done();
});

gulp.task('build', gulp.series('css', 'html', 'js', 'copy'));

gulp.task('dev', gulp.series('build', 'server'));
