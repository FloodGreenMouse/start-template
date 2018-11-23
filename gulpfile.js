var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-clean-css');
var minifyJS = require('gulp-minify');
var browserSync = require('browser-sync');
var imagemin = require('gulp-imagemin');
var zip = require('gulp-zip');
var fs = require('fs');


gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
	})
});

//SASS task
gulp.task('sass', function() {
	return gulp.src('app/sass/style.sass')
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers:['last 2 versions'],
		cascade: false
	}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

//CSS minification task
gulp.task('mini-css', function(){
	gulp.src(['app/css/**/*.css', '!app/css/minifyCSS/*.css', '!app/css/minifyCSS/**/*.css'])
	.pipe(sourcemaps.init())
	.pipe(minifyCSS({compatibility: 'ie8'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('app/css/minifyCSS'));
});

//JS minification task
gulp.task('mini-js', function() {
	gulp.src(['app/js/**/*.js', '!app/js/minifyJS/*.js', '!app/js/minifyJS/**/*.js'])
	.pipe(minifyJS({
		ext: {
			min: '.js',
		},
		noSource: true,
		ignoreFiles: ['bootsrtap.min.js'],
	}))
	.pipe(gulp.dest('app/js/minifyJS'));
});

//Image optimization task
gulp.task('opti-img', function() {
	gulp.src('app/img/*')
	.pipe(imagemin())
	.pipe(gulp.dest('app/img/optimizeIMG'));
});

//Build task
gulp.task('build', function(){
	//Minification CSS
	gulp.src(['app/css/**/*.css', '!app/css/minifyCSS/*.css', '!app/css/minifyCSS/**/*.css'])
	.pipe(sourcemaps.init())
	.pipe(minifyCSS({compatibility: 'ie8'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('build/css'));
	//Minification JS
	gulp.src(['app/js/**/*.js', '!app/js/minifyJS/*.js', '!app/js/minifyJS/**/*.js'])
	.pipe(minifyJS({
		ext: {
			min: '.js',
		},
		noSource: true,
	}))
	.pipe(gulp.dest('build/js'));
	//Optimization IMG
	gulp.src(['app/img/**', '!app/img/optimizeIMG/*', '!app/img/optimizeIMG/**/*'])
	.pipe(imagemin())
	.pipe(gulp.dest('build/img'));
	//Move fonts
	gulp.src('app/fonts/**')
	.pipe(gulp.dest('build/fonts'));
	//Move template folder if exists
	fs.readdir('app/templates', function(err, files){
		if (err) {
			console.log("Folder /templates doesn't exist");
		} else {
			if (files.length) {
				gulp.src('app/templates/**/*.html')
				.pipe(gulp.dest('build/templates'));
			} else {
				console.log("Files doesn't exist");
			}
		}
	});
	//Move index.html
	gulp.src('app/index.html')
	.pipe(gulp.dest('build'));
	//Move favicon
	gulp.src('app/favicon.ico')
	.pipe(gulp.dest('build'));
	gulp.src('build/**')
	.pipe(zip('build.zip'))
	.pipe(gulp.dest('./'));
});

//Watcher
gulp.task('default', ['browserSync', 'sass'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/css/**/*.css', browserSync.reload);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});