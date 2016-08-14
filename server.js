// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var settings       = require('./server/config/settings');

// set our port
var port = settings.serverSettings.HTTP_PORT;
var ip = settings.serverSettings.HTTP_IP;
var secretToken = 'notinphillynotinphilly';

// configuration ===========================================
require('./server/config/express')(app, secretToken);
require('./server/config/db')(app);
require('./server/config/passport')(app);

// routes ==================================================
require('./server/routes')(app);

// start app ===============================================
// startup our app at http://localhost:PORT
app.listen(port, ip, function () {
  console.log('Express server listening on %s  %d', ip, port);
});

// expose app
exports = module.exports = app;
