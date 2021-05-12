const gulp = require('gulp');
const browserSync = require('browser-sync').create();

function start () {

	browserSync.init({
		server: {
			baseDir: "./src",
		}
	});

	gulp.watch('./src/**/*.*').on('change', browserSync.reload);

}

gulp.task('default', start);
