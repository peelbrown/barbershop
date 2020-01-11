const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const smartgrid = require('smart-grid');


const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);

// let cssFiles = [
// 	'./node_modules/normalize.css/normalize.css',
// 	'./src/css/base.css',
// 	'./src/css/grid.css',
// 	'./src/css/humans.css'
// ];

function clear(){
	return del('build/*');
}

function styles(){
	return 	gulp.src('./src/less/style.less')
			   	.on('error', console.error.bind(console))
			   	.pipe(gulpif(isDev, sourcemaps.init()))
				.pipe(less())
				// .pipe(concat('style.css'))
			   	.pipe(gcmq())
			   	.pipe(autoprefixer({
		            browsers: ['> 0.1%'],
		            cascade: false
		        }))
			   	.pipe(gulpif(isProd, cleanCSS({
			   		level: 2
			   	})))
			   	.pipe(gulpif(isDev, sourcemaps.write()))
			   	.pipe(gulp.dest('./build/css'))
			   	.pipe(gulpif(isSync, browserSync.stream()));
}

function img(){
	return gulp.src('./src/img/**/*')
			   .pipe(gulp.dest('./build/img'))
}

function html(){
	return gulp.src('./src/*.html')
			   .pipe(gulp.dest('./build'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function watch(){
	if(isSync){
		browserSync.init({
	        server: {
	            baseDir: "./build/",
	        }
	    });
	}

	gulp.watch('./src/less/**/*.less', styles);
	gulp.watch('./src/*.html', html);
	gulp.watch('./smartgrid.js', grid);
}

function grid(done) {
	delete require.cache[require.resolve('./smartgrid.js')];
	let settings = require('./smartgrid.js');
	smartgrid('./src/less', settings);
	done();
}

let build = gulp.series(clear, 
	gulp.parallel(styles, img, html)
);

gulp.task('build', gulp.series(grid, build));
gulp.task('watch', gulp.series(build, watch));
gulp.task('grid', grid);
