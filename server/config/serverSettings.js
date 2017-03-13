
var databaseName = "notinphilly";

module.exports = {
  ADMIN_EMAIL: "notinphilly@gmail.com",
  WEB_SITE_URL: "http://notinphilly.org",
  HTTP_PORT:  process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  DATABASE_NAME: databaseName,
  AUTH_COOKIE_NAME: 'notinphillytoken.sid',
  SECRET_TOKEN: 'notinphillynotinphilly',
  HTTP_IP: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
  HTTP_PORT: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  DB_CONNECTION_STRING: process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || process.env.MONGODB_URL + databaseName || process.env.AWS_MONGO_DB_URL || "mongodb://localhost/" + databaseName
};
