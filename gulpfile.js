var gulp = require('gulp');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('default', function() {
	gulp.watch('css/chat.css', ['min-style']);
});

gulp.task('prefix', function() {
	gulp.src('css/chat.css')
	.pipe(autoprefixer({
		browsers: ['last 2 versions'],
		cascade: false
	}))
	.pipe(gulp.dest('css/dist'))
	console.log('Prefixed. Minifying...');
});

gulp.task('min-style', function() {
	return gulp.src('css/dist/chat.css')
	.pipe(csso())
	.pipe(gulp.dest('css/dist'));
	console.log('Minified. Watching for changes...');
});
