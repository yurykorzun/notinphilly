// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// configuration ===========================================
// config files
var db = require('./server/config/db');

// set our port
var port = process.env.PORT || 8080;

mongoose.connection.on('error', console.log);
mongoose.connect("mongodb://localhost/notinphilly");

//seed the database
var dbseeder = require('./server/config/dbseeder');

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// routes ==================================================
//require('./app/routes/home')(app); // configure our routes
//require('./app/routes/users')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;
