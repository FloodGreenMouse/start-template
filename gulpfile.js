var gulp = require('gulp');
var browserSync = require('browser-sync');
var prompt = require('gulp-prompt');
var promptColor = require('gulp-color');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var minifyJS = require('gulp-minify');
var imagemin = require('gulp-imagemin');
var htmlreplace = require('gulp-html-replace');
var download = require('gulp-download');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var fs = require('fs');

var replaceParamJS = '';
var replaceParamCSS = '';
var cleanFiles = [];

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

//Zip task
gulp.task('zip', function(){
	gulp.src('dist/**')
	.pipe(zip('build.zip'))
	.pipe(gulp.dest('./'));
})

//Build task
gulp.task('build', ['zip'], function(){
	//Minification CSS
	gulp.src(['app/css/**/*.css', '!app/css/minifyCSS/*.css', '!app/css/minifyCSS/**/*.css'])
	.pipe(sourcemaps.init())
	.pipe(minifyCSS({compatibility: 'ie8'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dist/css'));
	//Minification JS
	gulp.src(['app/js/**/*.js', '!app/js/minifyJS/*.js', '!app/js/minifyJS/**/*.js'])
	.pipe(minifyJS({
		ext: {
			min: '.js',
		},
		noSource: true,
	}))
	.pipe(gulp.dest('dist/js'));
	//Optimization IMG
	gulp.src(['app/img/**', '!app/img/optimizeIMG/*', '!app/img/optimizeIMG/**/*'])
	.pipe(imagemin())
	.pipe(gulp.dest('dist/img'));
	//Move fonts
	fs.readdir('app/fonts', function(err, files){
		if (err) {
			console.log("Folder /fonts doesn't exist");
		} else {
			if (files.length) {
				gulp.src('app/fonts/**')
				.pipe(gulp.dest('dist/fonts'));
			} else {
				console.log("Files doesn't exist in /fonts folder");
			}
		}
	});
	//Move template folder if exists
	fs.readdir('app/templates', function(err, files){
		if (err) {
			console.log("Folder /templates doesn't exist");
		} else {
			if (files.length) {
				gulp.src('app/templates/**/*.html')
				.pipe(gulp.dest('dist/templates'));
			} else {
				console.log("Files doesn't exist in /templates folder");
			}
		}
	});
	//Move index.html
	gulp.src('app/index.html')
	.pipe(gulp.dest('dist'));
	//Move favicon
	gulp.src('app/favicon.ico')
	.pipe(gulp.dest('dist'));
});

//Watcher
gulp.task('default', ['browserSync', 'sass'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/css/**/*.css', browserSync.reload);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

//Start task
gulp.task('start', function() {
	gulp.src('')
	.pipe(prompt.prompt({
		type: 'input',
		name: 'startChoice',
		message: promptColor(`
┌─┬┬─┬┬─┬┐
││││┬┤││││
││││┴┤││││
└┴─┴─┴─┴─┘
┌──┬─┬─┬─┬─┬┐┌──┬──┬─┐
└┐┌┤┬┤││││┼│││┌┐├┐┌┤┬┘
 │││┴┤││││┌┤└┤├┤││││┴┐
 └┘└─┴┴─┴┴┘└─┴┘└┘└┘└─┘`, 'CYAN')+
`\nWhat do you choose? \n`
+ promptColor(`[1]`, 'CYAN')+`Bootstrap 4 \n`
+ promptColor(`[2]`, 'CYAN')+`Bootstrap 4 grid only \n`
+ promptColor(`[3]`, 'CYAN')+`Semantic UI \n`
+ promptColor(`[4]`, 'CYAN')+`CSS with Normalize.css \n`
+ promptColor(`[5]`, 'CYAN')+`Nothing, blank template\n`
+ promptColor(`[0]`, 'CYAN')+`Exit\n`,
	}, function(result) {
		if(result.startChoice == '0' || result.startChoice == '1' || result.startChoice == '2' || result.startChoice == '3' || result.startChoice == '4' || result.startChoice == '5') {
			gulp.src('')
			.pipe(prompt.prompt({
				type:'input',
				name: 'confirmChoice',
				message: promptColor("WARNING", 'RED')+" \n Are you sure? (y/n)",
			}, function(res) {
					if(res.confirmChoice == 'Yes' || res.confirmChoice == 'y' || res.confirmChoice == 'yes' || res.confirmChoice == 'Y' ) {
						downloadUtils(result.startChoice);
					} else {
						gulp.start('start');
					}
				}))

		} else {
			gulp.start('start');
			console.log(promptColor("=== Wrong answer, please, try again === \n", 'RED'));
		}
	}))
})

//Download paths for start task
var downloadUtils = function (startChoice) {
	//Files for cleaning in css and js directories
	cleanFiles = ['app/js/bootstrap.min.js', 'app/js/semantic.min.js', 'app/js/popper.min.js', 'app/js/jquery-3.2.1.slim.min.js', 'app/css/normalize.css', 'app/css/semantic.min.css', 'app/css/bootstrap.min.css', 'app/css/bootstrap.min.css.map', 'app/css/bootstrap-grid.min.css', 'app/css/bootstrap-grid.min.css.map'];
	gulp.src(cleanFiles, {read: false})
	.pipe(clean());
	switch(startChoice) {
		case '1':
			download('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css')
			.pipe(gulp.dest('app/css'));
			download('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css.map')
			.pipe(gulp.dest('app/css'));
			download('https://code.jquery.com/jquery-3.2.1.slim.min.js')
			.pipe(gulp.dest('app/js'));
			download('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js')
			.pipe(gulp.dest('app/js'));
			download('https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js')
			.pipe(gulp.dest('app/js'));
			//Variables for replace in index.html
			replaceParamJS = ['<!-- build:js -->', 'js/jquery-3.2.1.slim.min.js', 'js/popper.min.js', 'js/bootstrap.min.js', '<!-- endbuild -->'];
			replaceParamCSS = ['<!-- build:css -->','css/bootstrap.min.css','<!-- endbuild -->'];
		break;
		case '2':
			download('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap-grid.min.css')
			.pipe(gulp.dest('app/css'));
			download('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap-grid.min.css.map')
			.pipe(gulp.dest('app/css'));
			download('https://code.jquery.com/jquery-3.2.1.slim.min.js')
			.pipe(gulp.dest('app/js'));
			download('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js')
			.pipe(gulp.dest('app/js'));
			//Variables for replace in index.html
			replaceParamJS = ['<!-- build:js -->', 'js/jquery-3.2.1.slim.min.js', 'js/bootstrap.min.js', '<!-- endbuild -->'];
			replaceParamCSS = ['<!-- build:css -->','css/bootstrap-grid.min.css','<!-- endbuild -->'];
		break;
		case '3':
			download('https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css')
			.pipe(gulp.dest('app/css'));
			download('https://code.jquery.com/jquery-3.2.1.slim.min.js')
			.pipe(gulp.dest('app/js'));
			download('https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.js')
			.pipe(gulp.dest('app/js'));
			//Variables for replace in index.html
			replaceParamJS = ['<!-- build:js -->', 'js/jquery-3.2.1.slim.min.js', 'js/semantic.min.js', '<!-- endbuild -->'];
			replaceParamCSS = ['<!-- build:css -->','css/semantic.min.css','<!-- endbuild -->'];
		break;
		case '4':
			download('https://necolas.github.io/normalize.css/8.0.1/normalize.css')
			.pipe(gulp.dest('app/css'));
			replaceParamJS = ['<!-- build:js -->','<!-- endbuild -->'];
			replaceParamCSS = ['<!-- build:css -->', 'css/normalize.css', '<!-- endbuild -->'];	
		break;
		case '5':
			replaceParamJS = ['<!-- build:js -->','<!-- endbuild -->'];
			replaceParamCSS = ['<!-- build:css -->','<!-- endbuild -->'];
			console.log('Done');
		break;
		case '0':
			return;
		break;
	}
	gulp.src('app/index.html')
	.pipe(htmlreplace({
		js: replaceParamJS,
		css: replaceParamCSS,
	}))
	.pipe(gulp.dest('app/'));
}