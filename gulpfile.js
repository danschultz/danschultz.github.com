var gulp = require("gulp");
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var gulpsmith = require("gulpsmith");
var markdown = require("metalsmith-markdown");
var templates  = require('metalsmith-templates');
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var ignore = require("metalsmith-ignore");
var gulpFrontMatter = require('gulp-front-matter');
var assign = require('lodash.assign');

var srcDir = "./src";
var srcSassDir = joinDir([srcDir, "sass/*.scss"]);

var buildDir = "./build";
var buildCssDir = joinDir([buildDir, "css"]);

gulp.task("metalsmith", function() {
  var metalsmith = gulpsmith()
    .use(markdown())
    .use(templates("handlebars"))
    .use(ignore([
      "sass/*"
    ]));

  gulp.src(joinDir([srcDir, "**/*"]))
    .pipe(gulpFrontMatter()).on("data", function(file) {
      assign(file, file.frontMatter); 
      delete file.frontMatter;
    })
    .pipe(metalsmith)
    .pipe(gulp.dest(buildDir));
});

gulp.task("css", function() {
  return gulp.src(srcSassDir)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(buildCssDir))
    .pipe(reload({stream: true}));
});

gulp.task("build", ["metalsmith", "css"]);

gulp.task("serve", ["build"], function() {
  browserSync({server: buildDir});

  gulp.watch(srcSassDir, ["css"]);
});

// Util functions
function joinDir(parts) {
  return parts.join("/");
}