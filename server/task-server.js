var connect = require('gulp-connect');
var gulp = require('gulp');

var registerReload = function (channel, globalConf, utils) {
    channel.addListener('RELOAD', function (taskName, reloadFiles) {
        if (reloadFiles) {
            utils.log('Task', 'Reload By [' + taskName + ']');
            gulp.src(reloadFiles)
                .pipe(connect.reload());
        }
    });
};
var cors = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
};

var taskServer = function (channel, conf, globalConf, utils) {
    utils.log('Sys', 'Starting Server');
    var middlewareList = [cors];
    connect.server({
        root: [globalConf.root],
        port: conf.port,
        debug: !!globalConf.debug,
        livereload: {
            port: conf.port * 10
        },
        middleware: function () {
            return middlewareList;
        },
        fallback: conf.fallback
    });

    // 注册刷新
    registerReload(channel, globalConf, utils);
};

module.exports = taskServer;