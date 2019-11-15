'use strict';

const autoprefixer = require('autoprefixer');
const browserify = require('browserify');
const cssnano = require('cssnano');
const gulp = require('gulp');
const del = require('del');
const fs = require('fs');
const log = require('fancy-log');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

const paths = {
  "build": process.env.BUILD_DIR || "dist",
  "scripts": "js/**/*.js",
  "styles": "scss/**/*.scss",
  "foundation": {
    "settings": {
      "src": "node_modules/foundation-sites/scss/settings/_settings.scss",
      "dest": "scss/abstracts"
    }
  }
};

const config = {
  "clean": {
    "force": true
  },
  "scripts": {
    "filename": "main.js",
    "babelify": {
      "presets": ["@babel/preset-env"],
      "ignore": ["node_modules"]
    },
    "settings": {
      "sourcemaps": true
    }
  },
  "styles": {
    "filename": "main.css",
    "autoprefixer": ["last 2 versions"],
    "sass": {
      "includePaths": ["node_modules/foundation-sites/scss"]
    }
  }
};

function bundler() {
  let b = browserify({
    "entries": `js/${config.scripts.filename}`,
    "extensions": [".js"],
    "cache": {},
    "packageCache": {},
    "fullPaths": true,
    "debug": true
  });

  b.transform('babelify', config.scripts.babelify);

  return b;
}

function clean() {
  return del(paths.build, config.clean);
}

function copyHtml() {
  return gulp.src("*.html")
      .pipe(gulp.dest(paths.build))
}

function copyFoundationSettings(cb) {
  if (!fs.existsSync(paths.foundation.settings.dest)) {
    return gulp.src(paths.foundation.settings.src)
        .pipe(gulp.dest(paths.foundation.settings.dest));
  }

  cb();
}

function compileScripts() {
  return bundler().bundle()
      .pipe(source(`${config.scripts.filename}`))
      .on('error', log.error)
      .pipe(gulp.dest(`${paths.build}/js`));
}

function compileStyles() {
  return gulp.src(paths.styles)
      .pipe(sourcemaps.init())
      .pipe(sass(config.styles.sass)).on('error', sass.logError)
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(`${paths.build}/css`));
}

function watchStyles(cb) {
  gulp.watch(paths.styles, gulp.series(compileStyles));
  cb();
}

function watchScripts(cb) {
  let b = bundler().plugin(watchify);
  let rebundle = function () {
    return b.bundle()
        .pipe(source(`${config.scripts.filename}`))
        .on('error', log.error)
        .pipe(gulp.dest(`${paths.build}/js`));
  };

  b.on('update', rebundle);

  return rebundle();
}

gulp.task('build', gulp.series(clean, gulp.parallel(copyHtml, compileScripts, compileStyles)));
gulp.task('init', copyFoundationSettings);
gulp.task('watch', gulp.series('build', gulp.parallel(watchStyles, watchScripts)));
