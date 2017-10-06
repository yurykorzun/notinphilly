var databaseName = "notinbronx";

module.exports = {
  ADMIN_EMAIL: "korzun.yury@gmail.com",
  WEB_SITE_URL: "http://notinphilly.org",
  DATABASE_NAME: databaseName,
  AUTH_COOKIE_NAME: 'notinbronxtoken.sid',
  SECRET_TOKEN: 'notinphillynotinphilly',
  HTTP_IP: "127.0.0.1",
  HTTP_PORT: 8080,
  DB_CONNECTION_STRING: "mongodb://localhost/" + databaseName
};