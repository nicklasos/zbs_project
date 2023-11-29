const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const nodemon = require('gulp-nodemon');

const FILES = [
    'index.js',
    'src/**/*.handlebars',
    'src/*.json',
    'src/**/*.json',
    'src/api/swagger/*.yaml',
    'config/**/*.json',
    'config/**/*.yaml',
    'config/**/*.js',
    // 'storage',
];

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
});

gulp.task('start', ['watch'], function () {
    nodemon({
        script: 'dist/index.js',
        ext: 'js handlebars',
        env: {'NODE_ENV': 'dev'},
        delay: 1,
    })
});

gulp.task('watch', ['assets', 'scripts'], () => gulp.watch('**/*.ts', ['scripts']));

gulp.task('assets', () => gulp.src(FILES, {base: '.'}).pipe(gulp.dest('dist')));

gulp.task('default', ['watch', 'assets']);

gulp.task('build', ['assets', 'scripts']);
