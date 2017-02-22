var gulp = require("gulp"),
    source = require("vinyl-source-stream"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    sourcemaps = require("gulp-sourcemaps"),
    cleanCSS = require('gulp-clean-css'),
    uglify = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    mergeStream = require("merge-stream"),
    mocha = require("gulp-mocha"),
    istanbul = require("gulp-istanbul"),
    del = require('del'),
    jsonminify = require('gulp-jsonminify'),
    include = require("gulp-include");

var SRC_PATH = "./src";
var DIST_PATH = "./dist";

gulp.task("lint", function () {
    return gulp.src([
        SRC_PATH + "/**/**.ts",
    ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

////////// BUILD //////////
gulp.task("build-ts", function () {
    var tsProject = tsc.createProject("tsconfig.json");
    return gulp.src([
        SRC_PATH + "/**/*.ts",
    ], { base: SRC_PATH })
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        //.pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task("build", function (cb) {
    return runSequence("build-ts", cb);
});

////////// PUBLISH //////////
gulp.task("transfer-js", function () {
    return gulp.src([SRC_PATH + "/script/**/*.js"], { base: SRC_PATH })
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task("transfer-css", function () {
    return gulp.src([SRC_PATH + "/**/*.css"], { base: SRC_PATH })
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task("transfer-html", function () {
    return gulp.src([
        SRC_PATH + "/*.html",
    ], { base: SRC_PATH + "/" })
        .pipe(include())
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task("transfer-misc", function () {
    return gulp.src([
        SRC_PATH + "/data/**/*",
        SRC_PATH + "/font/**/*",
    ], { base: SRC_PATH + "/" })
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task("minify-json", function () {
    return gulp.src([DIST_PATH + "/**/*.json"], { base: "./" })
        .pipe(jsonminify())
        .pipe(gulp.dest("./"));
});

gulp.task("transfer", function (cb) {
    return runSequence(["transfer-html", "transfer-misc","transfer-js", "transfer-css"], ["minify-json"], cb);
});

gulp.task("cleanup-dist", function () {
    return del([DIST_PATH + "/*.html", DIST_PATH + "/**/*.js", DIST_PATH + "/**/*.css", DIST_PATH + "/**/*.map"]);
});

gulp.task("publish", function (cb) {
    return runSequence("cleanup-dist", "build", "transfer", cb);
});
