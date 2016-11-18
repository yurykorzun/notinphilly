// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var serverSettings = require('./server/config/serverSettings');

// set our port
var port = serverSettings.HTTP_PORT;
var ip = serverSettings.HTTP_IP;

// configuration ===========================================
require('./server/config/express')(app, serverSettings.SECRET_TOKEN);
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
