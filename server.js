// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var passport       = require('passport');
var settings       = require('./server/config/settings');

// set our port
var port = settings.serverSettings.HTTP_PORT;
var ip = settings.serverSettings.HTTP_IP;

// configuration ===========================================
require('./server/config/db')(app);
require('./server/config/express')(app);
require('./server/config/passport')(app);

app.use(passport.initialize());
app.use(passport.session());

var server = require('http').createServer(app);

// routes ==================================================
require('./server/routes')(app);

console.log('Express server starting on %s %d', ip, port);
// start app ===============================================
// startup our app at http://localhost:PORT
server.listen(port, ip, function () {
  console.log('Express server listening on %s  %d', ip, port);
});

// expose app
exports = module.exports = app;
