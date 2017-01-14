var express         = require('express');
var mongoose        = require('mongoose');
var promise         = require('promise');
var serverSettings  = require('./serverSettings');

module.exports = function(app) {
    console.log("init db");

    var connectionString = serverSettings.DB_CONNECTION_STRING;

    var dbOptions = {
      server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
    };
    mongoose.Promise = promise;
    mongoose.connection.on('error', function(err) {
        console.error('MongoDB connection error: ' + err);
        process.exit(-1);
    	}
    );
    mongoose.connect(connectionString, dbOptions);

    /*if (argv['seed-db']) {
      console.log('Seeding DB');
      var dbseeder = require('../components/dbseeder');
      dbseeder();
    }*/
};
