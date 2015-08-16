// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');

// configuration ===========================================

// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
// mongoose.connect(db.url);

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

app.get('/js/jquery.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','jquery', 'dist', 'jquery.js'));
});

app.get('/js/leaflet.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','leaflet', 'dist', 'leaflet-src.js'));
});

app.get('/js/leaflet-providers.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','leaflet-providers', 'leaflet-providers.js'));
});

app.get('/js/angular.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','angular','angular.js'));
});

app.get('/js/angular-route.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','angular-route','angular-route.js'));
});

app.get('/js/angular.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','angular','angular.js'));
});

app.get('/js/bootstrap.js',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','bootstrap', 'dist', 'js', 'bootstrap.js'));
});

app.get('/css/bootstrap.css',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','bootstrap', 'dist', 'css', 'bootstrap.css'));
});

app.get('/css/bootstrap-theme.css',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','bootstrap', 'dist', 'css', 'bootstrap-theme.css'));
});

app.get('/css/leaflet.css',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules','leaflet', 'dist', 'leaflet.css'));
});

app.get('/css/control.layers.minimap.css',function(req,res) {
    res.sendfile(path.join(__dirname,'node_modules', 'leaflet-providers', 'preview', 'control.layers.minimap.css'));
});


// routes ==================================================
require('./app/routes/home')(app); // configure our routes
require('./app/routes/users')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;
