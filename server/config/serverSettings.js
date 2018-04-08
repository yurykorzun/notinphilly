var databaseName = "notinphilly";

module.exports = {
  ADMIN_EMAIL: "korzun.yury@gmail.com",
  WEB_SITE_URL: "http://localhost:8080/",
  HTTP_PORT:  process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  DATABASE_NAME: databaseName,
  AUTH_COOKIE_NAME: 'notinnotinphillytoken.sid',
  SECRET_TOKEN: 'notinnotinphillynotinnotinphilly',
  HTTP_IP: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
  DB_CONNECTION_STRING: "mongodb://localhost/" + databaseName
};