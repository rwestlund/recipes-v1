var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var compression = require('compression');
// auth
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// binary files
var Grid = require('gridfs-stream');
// file uploads
var busboy = require('connect-busboy');

// my custom config file
var config = require('./config/config');

var routes = require('./routes/index');
var users = require('./routes/users');
var templates = require('./routes/templates.js');
var models = require('./routes/models.js');
//var files = require('./routes/files.js');
var recipes = require('./routes/recipes');


// init mongoose
//mongoose.set('debug', true);
mongoose.connect(config.mongo_connection_string);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
// once the DB connects, register mongoose models
db.once('open', function() {
    console.log('connection opened');
    var models_path = __dirname + '/models/';
    fs.readdirSync(models_path).forEach(function(file) {
        if (file.match(/^[^.].*\.js/)) {
            console.log('requiring ' + models_path + file);
            require(models_path + file);
        }
    });
});
// DB
var User = require('./models/user');

// make sure at least one user is in DB
User.count(function(err, count) {
    console.log(count, 'users in DB');
    if(!count) {
        console.log('adding default admin', config.DEFAULT_ADMIN);
        var user = new User({
            email: config.DEFAULT_ADMIN,
            role: 'ADMIN',
        });
        user.save(function(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        });
    }

});


var app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

////TODO make a favicon
//app.use(favicon(path.join(__dirname, 'public/resources/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboy());
app.use(cookieParser());
// cache for one day (number in ms)
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));
// auth
app.use(passport.initialize());

// connection setup
app.use(function(req, res, next) {
    // enforce https
    if (!req.secure) {
        console.log('redirecting to https');
        return res.redirect('https://' + req.headers.host + req.url);
    }

    // get configs from DB here
    // pass gridfs ref
    req.gfs = Grid(db.db, mongoose.mongo);

    next();
});

passport.use(new GoogleStrategy(
    {
        clientID: config.google_client_id,
        clientSecret: config.google_client_secret,
        callbackURL: config.CALLBACK_URL,
    },
    function(accessToken, refreshToken, params, profile, callback) {
        console.log('user:', profile.emails[0].value);
        console.log('token:', accessToken);

        console.log('looking for user in DB');
        // get user with this email
        User.find({ email: profile.emails[0].value }, function(err, users) {
            if (err) return callback(err);
	        if (!users.length) {
                console.log('no such user', profile.emails[0].value);
                return callback('no user by this email:',
                    profile.emails[0].value);
            }

            // add token
            users[0].token = { token: accessToken, timestamp: Date.now() };
            users[0].name = profile.displayName;
            // save it
            users[0].save(function(err, user) {
                callback(err, user);
            });
        });
    }
));

// when users hit this route, redirect to google for login
app.get('/auth/google', passport.authenticate('google',
    //{ scope: [ 'profile', 'email', 'https://www.googleapis.com/auth/calendar' ],
    { scope: [ 'profile', 'email'] }
        //accessType: 'offline' }
));

app.get('/oauth2callback', function(req, res, next) {
    passport.authenticate('google', function(err, user, info) {
        if (err || !user) {
            console.log('user is unauthorized');
            console.log(err);
            return res.redirect('/#/unauthorized');
        }
        // auth is good, send back
        res.redirect('/#/?user=' + JSON.stringify(user)
            + '&token=' + user.token.token);
    })(req, res, next);
});

// make sure token is in DB
function ensure_auth(req, res, next) {
    // get token from headers
    var token = req.headers.authorization;
    // if not there, check cookie (could be file request)
    if (!token) token = req.cookies.authorization;
    if (!token) {
        console.log('no token present');
        return res.status(401).end();
    }
    // find user by token
    User.findOneAndUpdate({ 'token.token': token }, { lastlog: new Date() },
        function(err, user) {
            if (err) return next(err);
            if (!user) {
                console.log("token doesn't match a user");
                return res.status(401).end();
            }
            console.log(user.name, 'has good auth');
            req.user = user;
            next();
        }
    );
};




// routes
app.use('/', routes);
app.use('/templates', templates);

// YOU SHALL NOT PASS! (without an auth token)
app.use('*', ensure_auth);

app.use('/users', users);
app.use('/models', models);
//app.use('/files', files);
app.use('/recipes', recipes);

// logout handler, delete token
app.delete('/tokens', function(req, res, next) {
    console.log('got request to delete token');
    User.find({ 'token.token': req.headers.authorization },
        function(err, users) {
            if (err) return next(err);
            // no match, so we clearly don't have the token
            if (!users.length) {
                return res.status(200).end();
            }
            console.log('deleting', users[0].name + "'s token");
            users[0].token = {};
            users[0].save(function(err, data) {
                if (err) return next(err);
                res.status(200).end();
            });
        }
    );
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.dir(err);
    console.log(err.stack);
    // send to client
    res.send({
        message: "There was an error I can't handle. Please copy this text and submit a detailed error report, including exactly what you were doing.  Here's everything I know:",
        items: [ err.name + ' ' + (err.status || 500), err.message, err.stack ],
    });
});

// production error handler
// no stacktraces leaked to user

console.log('initialization complete');

module.exports = app;
