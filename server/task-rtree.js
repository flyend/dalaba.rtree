var imports = require('src-import-curt');
var gulp = require('gulp');
var gulpWatch = require('gulp-watch');
var gulpRename = require('gulp-rename');
var gulpHeader = require('gulp-header');
var pkg = require('../package.json');

var formatDate = function(timestamp){
    var date = new Date(timestamp),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate();
    var pad = function (v, p){
        return v > -1 && v < 10 ? (p = p || "0") + v : v;
    };
    return [
        year, "/",
        pad(month + 1, "0"), "/",
        pad(day, "0")
    ].join("");
};


var comment = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @date ' + formatDate(new Date().getTime()),
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

module.exports = function (channel, conf, globalConf, utils) {
    var bundle = function () {
        utils.log('Task', 'Dalaba.RTree');
        return gulp.src(conf.src.entriesJs)
            .pipe(imports({keyword: "require"}))
            .on('error', function (err) {
                if (err.stack) {
                    console.log(err.message);
                    console.log(err.stack);
                }
                else {
                    console.log(err);
                }
            })
            // .pipe(source(conf.dest.jsFile))
            .pipe(gulpRename(conf.dest.jsFile))
            .pipe(gulpHeader(comment, {
                pkg: pkg
            }))
            .pipe(gulp.dest(conf.dest.jsPath));
    };
    gulpWatch(conf.src.watches, function () {
        bundle().on('end', function () {
            channel.emit('RELOAD', 'Dalaba.RTree', conf.reload.target);
        });
    });

    // 监听mchart 的html变更
    gulpWatch(conf.src.html, function () {
        channel.emit('RELOAD', 'liveload', conf.reload.target);
    });

    bundle();
};