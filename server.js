// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');
var expressSession = require('express-session');
var mongoStore     = require('connect-mongo')(expressSession);
// Configuring Passport
var passport       = require('passport');


// configuration ===========================================
var db = require('./server/config/db');

// set our port
var port = process.env.PORT || 8080;
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.AWS_MONGO_DB_URL || "mongodb://localhost/notinphilly"

//app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());

var dbOptions = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
mongoose.connection.on('error', console.log);
mongoose.connect(connectionString, dbOptions);

//make the app use the passport/express session
app.use(expressSession({
  name: "notinphilly.sid",
  resave: false,
  saveUninitialized: false,
  secret: 'notinphillynotinphilly',
  cookie: {
    maxAge: 3600000
  },
  store: new mongoStore({
      mongooseConnection: mongoose.connection,
      db: 'notinphilly'
  })
}));

app.use(passport.initialize());
app.use(passport.session());

//Setup configuration
require('./server/config/passport');

var server = require('http').createServer(app);
require('./server/config/express')(app);

// routes ==================================================
require('./server/routes')(app);

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;
