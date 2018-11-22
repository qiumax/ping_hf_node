var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://sa_ping:wending0304@172.30.0.5:27017/ping', { useNewUrlParser: true })
    .then(() =>  console.log('connection succesful'))
.catch((err) => console.error(err));

var session = require('express-session');
const RedisStore = require('connect-redis')(session);
var redis = require("redis");
var client = redis.createClient(6379, '172.30.0.4');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    store: new RedisStore({
        host: "172.30.0.4",
        port: 6379,
        pass: 'wending0304',
        ttl: 3600,
        client: client
    }),
    secret: "sany_truck",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

var user = require('./routes/user');
var product = require('./routes/product');
var ping = require('./routes/ping');
var wx = require('./routes/wx');
var sms = require('./routes/sms');
var activity = require('./routes/activity');

// passport configuration
var User = require('./models/User');
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy({
        usernameField:'username',
        passwordField:'password'
    },
    function (username, password, done) {
        User.findOne({'openid': username}).then(function (user) {
            // console.log('user');
            // console.log(user);
            if(user) {
                return done(null, user);
            }
            else {
                return done(null, false, {message: '用户不存在'});
            }
        })
    }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/api', function (req, res, next) {
    // console.log(req.body);
    var session_id = req.body.s_id;
    var user_id = req.body.user_id;
    console.log("session_id: " + session_id);
    console.log("user_id: " + user_id);

    if(session_id && user_id) {
        client.get(session_id, function (err, reply) {
            if(reply) {
                var sess = JSON.parse(reply);
                var user_id_in_session = sess.uid;
                if(user_id_in_session==user_id) {
                    return next();
                }
                else {
                    res.json({err: "expired"});
                }
            }
            else {
                res.json({err: "expired"});
            }
        })
    }
    else {
        res.json({err: "expired"});
    }
});

app.use('/api/user', user);
app.use('/api/product', product);
app.use('/api/ping', ping);
app.use('/wx', wx);
app.use('/api/sms', sms);
app.use('/api/activity', activity);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// schedule
var schedule = require("node-schedule");
var PingController = require('./controllers/PingController');

schedule.scheduleJob('0 * * * * ?', function(){
    console.log(new Date());
    PingController.startActivity();
})

schedule.scheduleJob('0 * * * * ?', function(){
    console.log(new Date());
    PingController.updateCurrentPing();
})

schedule.scheduleJob('0 */5 * * * ?', function(){
    console.log(new Date());
    // Ping.updateFullPing();
})

schedule.scheduleJob('30 */1 * * * ?', function(){
    console.log(new Date());
    // Ping.updateExpiredPing();
})

module.exports = app;
