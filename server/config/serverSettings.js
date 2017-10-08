var databaseName = "notinphilly";

module.exports = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '' || 'mailgun api key here',
  WEB_SITE_URL: process.env.WEB_SITE_URL? process.env.WEB_SITE_URL.trim() : '' || 'mailgun api key here',
  DATABASE_NAME: process.env.DATABASE_NAME ? process.env.DATABASE_NAME.trim() : '' || 'mailgun api key here',
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME? process.env.AUTH_COOKIE_NAME.trim() : '' || 'mailgun api key here',
  SECRET_TOKEN: process.env.SECRET_TOKEN? process.env.SECRET_TOKEN.trim() : '' || 'mailgun api key here',
  HTTP_IP: process.env.HTTP_IP ? process.env.HTTP_IP.trim() : '' || 'mailgun api key here',
  HTTP_PORT: process.env.HTTP_PORT ? process.env.HTTP_PORT.trim() : '' || 'mailgun api key here',
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING.trim() : '' || 'mailgun api key here',
};
