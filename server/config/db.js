var express        = require('express');
var mongoose       = require('mongoose');
var expressSession = require('express-session');
var mongoStore     = require('connect-mongo')(expressSession);

module.exports = function(app) {
    var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.AWS_MONGO_DB_URL || "mongodb://localhost/notinphilly"

    var dbOptions = {
      server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
    };
    mongoose.connection.on('error', function(err) {
    	console.error('MongoDB connection error: ' + err);
    	process.exit(-1);
    	}
    );
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

    //seed the database
    //var dbseeder = require('./server/config/dbseeder');
    //uncomment to seed
    //dbseeder();
};
