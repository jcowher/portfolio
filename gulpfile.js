'use strict';

const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const gulp = require('gulp');
const del = require('del');
const fs = require('fs');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const paths = {
  "build": process.env.BUILD_DIR || "dist",
  "html": "*.html",
  "scripts": {
    "vendor": [
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/what-input/dist/what-input.min.js",
      "node_modules/foundation-sites/dist/js/foundation.min.js"
    ],
    "site": [
      "js/**/*.js"
    ]
  },
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
  "plumber": {
    "errorHandler": function (err) {
      notify.onError({
        "title": "Gulp error in " + err.plugin,
        "message": err.toString()
      })(err);
    }
  },
  "scripts": {
    "babel": {
      "presets": ["@babel/preset-env"]
    },
    "settings": {
      "sourcemaps": true
    }
  },
  "styles": {
    "autoprefixer": ["last 2 versions"],
    "sass": {
      "includePaths": ["node_modules/foundation-sites/scss"]
    }
  }
};

function clean() {
  return del(paths.build, config.clean);
}

function copyHtml() {
  return gulp.src(paths.html)
      .pipe(gulp.dest(paths.build))
}

function copyFoundationSettings(done) {
  if (!fs.existsSync(paths.foundation.settings.dest)) {
    return gulp.src(paths.foundation.settings.src)
        .pipe(gulp.dest(paths.foundation.settings.dest));
  }

  done();
}

function compileSiteScripts() {
  return gulp.src(paths.scripts.site)
      .pipe(plumber(config.plumber))
      .pipe(concat('main.js'))
      .pipe(babel(config.scripts.babel))
      .pipe(uglify())
      .pipe(gulp.dest(`${paths.build}/js`));
}

function compileThirdPartyScripts() {
  return gulp.src(paths.scripts.vendor)
      .pipe(plumber(config.plumber))
      .pipe(concat('thirdparty.js'))
      .pipe(gulp.dest(`${paths.build}/js`));
}

function compileStyles() {
  return gulp.src(paths.styles)
      .pipe(plumber(config.plumber))
      .pipe(sourcemaps.init())
      .pipe(sass(config.styles.sass))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(`${paths.build}/css`));
}

function watchStyles(done) {
  gulp.watch(paths.styles, compileStyles);
  done();
}

function watchScripts(done) {
  gulp.watch(paths.scripts.site, compileSiteScripts);
  gulp.watch(paths.scripts.vendor, compileThirdPartyScripts);
  done();
}

function watchHtml(done) {
  gulp.watch(paths.html, copyHtml);
  done();
}

gulp.task('build', gulp.series(clean, gulp.parallel(copyHtml, compileThirdPartyScripts, compileSiteScripts, compileStyles)));
gulp.task('init', copyFoundationSettings);
gulp.task('watch', gulp.series('build', gulp.parallel(watchStyles, watchScripts, watchHtml)));
