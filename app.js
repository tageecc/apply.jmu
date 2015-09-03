var express = require('express');
var path = require('path');
var dburl = require('./config/dburl');
var favicon = require('serve-favicon');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);//把会话信息存储在数据库
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');//解析请求体，支持 application/json， application/x-www-form-urlencoded, 和 multipart/form-data。
var routes = require('./config/route');

var app = express();

mongoose.connect(dburl.dbUrl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs-mate'));
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, 'public', 'icon.ico')));
app.use(logger('dev'));//在开发环境下使用，在终端显示简单的不同颜色的日志
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//提供会话支持，设置 store 参数为 MongoStore 实例，把会话信息存储到数据库中
app.use(session({
    secret: dburl.cookieSecret,
    store: new MongoStore({
        url: dburl.dbUrl,
        collection: 'sessions'
    }),
    resave: false,
    saveUninitialized: true
}));

routes(app);
app.locals.moment = require('moment');//时间格式化模块


app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));//设置根目录下的 public 文件夹为静态文件服务器，存放 image、css、js 文件于此。



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
//开发环境下的错误处理，输出错误信息。
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
