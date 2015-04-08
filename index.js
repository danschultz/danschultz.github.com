var Metalsmith = require("metalsmith");
var markdown = require("metalsmith-markdown");
var templates  = require('metalsmith-templates');
var sass = require("metalsmith-sass");
var autoprefixer = require("metalsmith-autoprefixer");

Metalsmith(__dirname)
  .use(markdown())
  .use(templates("handlebars"))
  .use(sass({
    outputStyle: "expanded",
    outputDir: "css/"
  }))
  .use(autoprefixer())
  .destination("./build")
  .build(function(err, files) {
    if (err) { throw err; }
  });