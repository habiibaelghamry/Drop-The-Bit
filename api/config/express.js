var config = require('./config'),
    express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    flash = require('connect-flash'),
    session = require('express-session'),
    schedule = require('node-schedule'),
    async = require('async'),
    multer = require('multer');



module.exports = function() {

    var app = express();

    app.use('*',function(req, res, next){
     
     var allowedOrigins = [null,'http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://www.facebook.com'];
    //   var allowedOrigins = [null,'http://54.187.92.64:8000', 'http://54.187.92.64:8000', 'http://54.187.92.64:3000', 'http://54.187.92.64:3000', 'https://www.facebook.com'];

      var origin = req.headers.origin;
      if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
        res.setHeader('Access-Contro-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, Accept, X-HTTP-Method-Override");
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // app.use(bodyParser()); // get information from html forms
    app.use(cookieParser()); // read cookies (needed for auth)

    app.use(flash());

    app.use(session({
        saveUninitialized: true,
        resave: false,
        secret: 'OurSuperSecretCookieSecret'
    }));


    require('./passport')(passport);

    app.use(passport.initialize());
    app.use(passport.session());

    app.set('views', '../angular/views');

    var router = require('../app/routes');

    app.use(router);


    app.use( express.static("../angular") );
    app.use( express.static("./uploads") );


    return app;
};
