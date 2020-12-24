let gulp = require('gulp');
let postcss = require('gulp-postcss');
let pxtorem = require('postcss-pxtransform');
gulp.task('css', function () {
    let processors = [
        pxtorem({
            platform: 'weapp',
            designWidth: 750,
            deviceRatio: {
                640: 2.34 * 4,
                750: 2,
                828: 1.81 * 4
            }
        })
    ];
    return gulp.src(['miniprogram/miniprogram_npm/@vant/**/*.wxss'])
        .pipe(postcss(processors))
        .pipe(gulp.dest('miniprogram/miniprogram_npm/@vant/'));
});