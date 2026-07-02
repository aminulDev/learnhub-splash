var gulp = require("gulp"),
  del = require("del"),
  browsersync = require("browser-sync").create(),
  sass = require("gulp-sass")(require("sass")),
  notify = require("gulp-notify"),
  plumber = require("gulp-plumber"),
  sourcemaps = require("gulp-sourcemaps"),
  fileInclude = require("gulp-file-include"),
  beautifyCode = require("gulp-beautify-code"),
  cached = require("gulp-cached"),
  src = {
    root: "./src/",
    rootHtml: "./src/*.html",
    rootPartials: "./src/partials/",
    fontsAll: "./src/assets/fonts/**/*",
    rootVendorCss: "./src/assets/css/vendor/*.css",
    rootPluginsCss: "./src/assets/css/plugins/*.css",
    styleScss: "./src/assets/scss/*.scss",
    scssAll: "./src/assets/scss/**/*",
    rootVendorJs: "./src/assets/js/vendor/*.js",
    mainJs: "./src/assets/js/main.js",
    rootimage: "./src/assets/images/**/*",
  },
  dest = {
    root: "./dest/",
    fonts: "./dest/assets/fonts/",
    rootCss: "./dest/assets/css",
    rootVendorCss: "./dest/assets/css/vendor/",
    rootPluginsCss: "./dest/assets/css/plugins/",
    rootJs: "./dest/assets/js",
    rootVendorJs: "./dest/assets/js/vendor/",
    images: "./dest/assets/images",
    scss: "./dest/assets/scss/",
  };

function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
      sound: "Glass",
    }),
  });
}

gulp.task("browsersync", function (callback) {
  browsersync.init({
    server: {
      baseDir: [dest.root, src.root],
    },
  });
  callback();
});

gulp.task("browsersyncReload", function (callback) {
  browsersync.reload();
  callback();
});

gulp.task("watch", function () {
  gulp.watch(src.scssAll, gulp.series("styleCss", "browsersyncReload"));
  gulp.watch(src.scssAll, gulp.series("scss", "browsersyncReload"));
  gulp.watch(src.rootVendorCss, gulp.series("vendorCss", "browsersyncReload"));
  gulp.watch(src.rootPluginsCss, gulp.series("pluginsCss", "browsersyncReload"));
  gulp.watch(src.rootVendorJs, gulp.series("vendorJs", "browsersyncReload"));
  gulp.watch(src.mainJs, gulp.series("mainJs", "browsersyncReload"));
  gulp.watch(src.fontsAll, gulp.series("rbtFonts", "browsersyncReload"));
  gulp.watch(src.rootimage, gulp.series("rbtImage", "browsersyncReload"));
  gulp.watch(src.rootPartials, gulp.series("html", "browsersyncReload"));
  gulp.watch(src.rootHtml, gulp.series("html", "browsersyncReload"));
});

gulp.task("styleCss", function () {
  return gulp
    .src(src.styleScss)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(dest.rootCss))
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest(dest.rootCss));
});

gulp.task("scss", function () {
  return gulp
    .src(src.scssAll)
    .pipe(customPlumber("Error On Compiling Style Scss"))
    .pipe(gulp.dest(dest.scss));
});

gulp.task("vendorCss", function () {
  return gulp
    .src(src.rootVendorCss)
    .pipe(customPlumber("Error On Copying Vendor CSS"))
    .pipe(gulp.dest(dest.rootVendorCss));
});

gulp.task("pluginsCss", function () {
  return gulp
    .src(src.rootPluginsCss)
    .pipe(customPlumber("Error On Copying Plugins CSS"))
    .pipe(gulp.dest(dest.rootPluginsCss));
});

gulp.task("html", function () {
  return gulp
    .src(src.rootHtml)
    .pipe(customPlumber("Error On Compile HTML"))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: src.rootPartials,
      })
    )
    .pipe(cached())
    .pipe(beautifyCode())
    .pipe(gulp.dest(dest.root));
});

gulp.task("vendorJs", function () {
  return gulp
    .src(src.rootVendorJs)
    .pipe(customPlumber("Error On Copying Vendor JS"))
    .pipe(gulp.dest(dest.rootVendorJs));
});

gulp.task("mainJs", function () {
  return gulp
    .src(src.mainJs)
    .pipe(customPlumber("Error On Copying Main Js File"))
    .pipe(gulp.dest(dest.rootJs));
});

gulp.task("rbtFonts", function () {
  return gulp
    .src(src.fontsAll)
    .pipe(customPlumber("Error On Copy Fonts"))
    .pipe(gulp.dest(dest.fonts));
});

gulp.task("rbtImage", function () {
  return gulp
    .src(src.rootimage)
    .pipe(customPlumber("Error On Compiling Images"))
    .pipe(gulp.dest(dest.images));
});

gulp.task("clean:dest", function (callback) {
  del.sync(dest.root);
  callback();
});

gulp.task(
  "build",
  gulp.series(
    "clean:dest",
    gulp.parallel(
      "html",
      "styleCss",
      "scss",
      "vendorCss",
      "pluginsCss",
      "vendorJs",
      "mainJs",
      "rbtFonts",
      "rbtImage"
    )
  )
);

gulp.task(
  "default",
  gulp.series(
    "build",
    gulp.parallel("browsersync", "watch")
  )
);
