var fs = require('fs');
var gulp = require("gulp");
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var gulpsmith = require("gulpsmith");
var markdown = require("metalsmith-markdown");
var templates  = require("metalsmith-templates");
var collections = require("metalsmith-collections");
var permalinks = require("metalsmith-permalinks");
var drafts = require("metalsmith-drafts");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var ignore = require("metalsmith-ignore");
var gulpFrontMatter = require("gulp-front-matter");
var assign = require("lodash.assign");
var filter = require("gulp-filter");
var util = require('util');
var moment = require("moment");
var Handlebars = require("handlebars");

var srcDir = "./src";
var srcSassDir = joinDir([srcDir, "sass/*.scss"]);

var buildDir = "./build";
var buildCssDir = joinDir([buildDir, "css"]);

gulp.task("metalsmith", function() {
  var metalsmith = gulpsmith()
    .metadata({name: "Dan Schultz"})
    .use(drafts())
    .use(collections({
      posts: {
        pattern: "posts/*.md",
        sortBy: "date",
        reverse: true
      }
    }))
    .use(markdown())
    .use(permalinks(":collections/:title"))
    .use(templates({
      engine: "handlebars",
      directory: joinDir([srcDir, "templates"]),
      partials: {
        head: 'partials/head'
      }
    }))
    .use(ignore([
      "sass/**/*",
      "templates/**/*"
    ]));

  var frontMatterFilter = filter("**/*.{html,md,hbt}");

  gulp.src(joinDir([srcDir, "**/*"]))
    .pipe(frontMatterFilter)
    .pipe(gulpFrontMatter()).on("data", function(file) {
      assign(file, file.frontMatter);
      delete file.frontMatter;
    })
    .pipe(frontMatterFilter.restore())
    .pipe(metalsmith)
    .pipe(gulp.dest(buildDir))
    .pipe(reload({stream:true}));
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
  browserSync({server: buildDir, open: false});

  gulp.watch(joinDir([srcDir, "**/*.{scss,css}"]), ["css"]);
  gulp.watch(joinDir([srcDir, "**/*.{html,md,hbt,jpg,png,svg}"]), ["metalsmith"]);
});

// Handlebar helpers
Handlebars.registerHelper("postDate", function(dateString) {
  var date = moment(dateString).utc();
  return date.format("DD MMM YYYY");
});

Handlebars.registerHelper("isoDate", function(dateString) {
  return moment(dateString).utc().format();
});

// Util functions
function joinDir(parts) {
  return parts.join("/");
}