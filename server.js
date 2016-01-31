// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var passport       = require('passport');
var settings       = require('./server/config/settings');

// set our port
var port = settings.serverSettings.HTTP_PORT;

// configuration ===========================================
require('./server/config/db')(app);
require('./server/config/express')(app);
require('./server/config/passport')(app);

app.use(passport.initialize());
app.use(passport.session());

var server = require('http').createServer(app);

// routes ==================================================
require('./server/routes')(app);

// start app ===============================================
// startup our app at http://localhost:PORT
app.listen(port, function () {
  console.log('Express server listening on %d', port);
});

// expose app
exports = module.exports = app;
