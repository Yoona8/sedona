"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var del = require("del");
var svgmin = require("gulp-svgmin");
var svgSprite = require("gulp-svg-sprite");
var cheerio = require("gulp-cheerio");
var replace = require("gulp-replace");
var mqpacker = require("css-mqpacker");
var cssMin = require("gulp-csso");
var rename = require("gulp-rename");
var imgMin = require("gulp-imagemin");
var server = require("browser-sync").create();

gulp.task("dev", ["copy:html", "copy:svg", "copy:fonts", "optimise:img", "style", "sprite:svg"]);

gulp.task("copy:html", function () {
  return gulp.src("*.html")
    .pipe(gulp.dest("./build/"));
});

gulp.task("optimise:img", function () {
  return gulp.src("./img/**/*.{png,jpg,gif}")
    .pipe(imgMin([
      imgMin.optipng({optimizationLevel: 3}),
      imgMin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("./build/img/"));
});

gulp.task("copy:svg", function () {
  return gulp.src(["./img/**/*.svg", "!./img/**/icon-*.svg"])
    .pipe(gulp.dest("./build/img"));
});

gulp.task("copy:fonts", function () {
  return gulp.src("./fonts/**/*.*")
    .pipe(gulp.dest("./build/fonts"));
});

gulp.task("style", function() {
  return gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]})
    ]))
    .pipe(gulp.dest("./build/css"))
    .pipe(cssMin())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("./build/css"))
    .pipe(server.stream());
});

gulp.task("clean", function(e) {
  return del('./build', e);
});

gulp.task("sprite:svg", function() {
  return gulp.src('./img/icon-*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(gulp.dest("./build/img/"));
});

gulp.task("serve", ["dev"], function() {
  server.init({
    server: "./build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.scss", ["style"]);
  gulp.watch("img/icon-*.svg", ["sprite:svg"]);
  gulp.watch("img/**/*.{png,jpg,gif}", ["optimise:img"]);
  gulp.watch("*.html", ["copy:html"]);
  gulp.watch(["build/**/*.*", "!build/**/*.html"]).on("change", server.stream);
  gulp.watch("./build/*.html").on("change", server.reload);
});
