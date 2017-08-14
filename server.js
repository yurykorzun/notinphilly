// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var serverSettings = require('./server/config/serverSettings');
var logger         = require('./server/components/logger');

logger.level = "debug";

// set our port
var port = serverSettings.HTTP_PORT;
var ip = serverSettings.HTTP_IP;

// configuration ===========================================
require('./server/config/express')(app, serverSettings.SECRET_TOKEN);
require('./server/config/db')(app);
require('./server/config/passport')(app);

// routes ==================================================
require('./server/routes')(app);

app.use(function (err, req, res, next) {
  logger.error(err);
});

// start app ===============================================
// startup our app at http://localhost:PORT
app.listen(port, ip, function () {
  logger.debug('Express server listening', { "ip" : ip, "port" : port });
});

process.on('unhandledRejection', (reason) => {
    console.log('Reason: ' + reason);
});
  
module.exports = app;
