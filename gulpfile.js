const {src, dest, watch, series, parallel} = require('gulp')
const loadplugins = require('gulp-load-plugins')
const del = require('del')
const browsersync = require('browser-sync')
const plugins = loadplugins()
const bs = browsersync.create()
// 编译样式文件
const style = () => {
    return src('src/assets/styles/*.scss', {base: 'src'})
        .pipe(plugins.sass({outputStyle: 'expanded'}))
        .pipe(dest('dist'))
}
// 脚本编译
const script = () => {
    return src('src/assets/scripts/*.js', {base: 'src'})
        .pipe(plugins.babel({presets: ['@babel/preset-env']}))
        .pipe(dest('dist'))
}
// 页面模版编译
const page = () => {
    return src('src/*.html', {base: 'src'})
        .pipe(plugins.swig())
        .pipe(dest('dist'))
}
// 图片压缩
const img = () => {
    return src('src/assets/images/**', {base: 'src'})
        .pipe(imagemin())
        .pipe(dest('dist'))
}
// 字体文件转换
const font = () => {
    return src('src/assets/fonts/**', {base: 'src'})
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}
// 拷贝其他不需要加工的文件
const extra = () => {
    return src('public/**', {base: 'public'})
        .pipe(dest('dist'))
}
// 清空 dist 文件夹
const clean = () => {
    return del(['dist'])
}
// 开发服务器
const server = () => {
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch([
        'src/assets/image/**',
        'src/assets/fonts/**',
        'public/**'
    ], bs.reload)
    watch('src/*.html', page)
    bs.init({
        notify: false,
        port: 8000,
        open: true,
        files: 'dist/**',
        server: {
            baseDir: 'dist',
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}
// 文件压缩
const useref = () => {
    return src('dist/*.html', {base: 'dist'})
        .pipe(plugins.useref({searchPath: ['dist', '.']}))
        .pipe(plugins.if(/\.js$/,plugins.uglify()))
        .pipe(plugins.if(/\.css$/,plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/,plugins.htmlmin({
            collapseWhitespace:true,
            minfyCss: true,
            minfyJs: true
        })))
        .pipe(dest('release'))
}
const compile = parallel(style, script, page)
const develop = series(compile, server)
const build = series(
    clean,
    parallel(
        series(compile, useref),
        img, font, extra
    )
)
module.exports = {
    clean,
    build,
    develop
}