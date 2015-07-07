'use strict';

var gulp = require('gulp'),
babel    = require('gulp-babel'),
uglify   = require('gulp-uglify'),
rename   = require('gulp-rename');

gulp.task('transpile', function() {
    return gulp.src('src/backbone.choosy.js')
      .pipe(babel())
      .pipe(gulp.dest('dist'));
});

gulp.task('build', ['transpile'], function() {
    return gulp.src('dist/backbone.choosy.js')
      .pipe(uglify())
      .pipe(rename('backbone.choosy.min.js'))
      .pipe(gulp.dest('dist'));
});