var express        = require('express');
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');
var path           = require('path');
var expressSession = require('express-session');
var mongoStore     = require('connect-mongo/es5')(expressSession);

module.exports = function(app, secretToken) {
  console.log("init express");

  var assetsPath = path.normalize(__dirname + '/../../client/');
  app.use(express.static(assetsPath));;

  app.set('clientPath', assetsPath);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  //make the app use the passport/express session
  app.use(expressSession({
    name: "notinphillytoken.sid",
    resave: false,
    saveUninitialized: false,
    secret: secretToken,
    cookie: {
      secure : false,
      maxAge: 3600000
    },
    store: new mongoStore({
        mongooseConnection: mongoose.connection,
        db: 'notinphilly'
    })
  }));
};
