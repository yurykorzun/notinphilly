var httpIP = process.env.NODEJS_IP || process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var httpPort = process.env.NODEJS_PORT || process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var databaseName = process.env.DATABASE_NAME || "notinphiladelphia";
var mongodburl = process.env.MONGO_DB_URL || "mongodb://mongo/"

module.exports = {
  DATABASE_NAME: databaseName,
  AUTH_COOKIE_NAME: 'auth cookie name',
  SECRET_TOKEN: 'secret token',
  HTTP_IP: process.env.NODEJS_IP || process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
  HTTP_PORT: process.env.NODEJS_PORT || process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  DB_CONNECTION_STRING: process.env.OPENSHIFT_MONGO_DB_URL  + process.env.OPENSHIFT_APP_NAME || mongodburl + databaseName || "mongodb://localhost/" + databaseName
};
