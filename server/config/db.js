var express         = require('express');
var mongoose        = require('mongoose');
var promise         = require('promise');
var merge           = require('mongoose-merge-plugin');
var serverSettings  = require('./serverSettings');
var logger          = require('../components/logger');

module.exports = function(app) {
    logger.log("debug", "init db");

    var connectionString = serverSettings.DB_CONNECTION_STRING;

    var dbOptions = {
      server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
    };
    mongoose.plugin(merge);
    mongoose.Promise = promise;
    mongoose.connection.on('error', function(err) {
        logger.error('MongoDB connection error: ' + err);
        process.exit(-1);
    	}
    );
    mongoose.connect(connectionString, dbOptions);
};
