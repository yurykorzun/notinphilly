if (!process.env.ADMIN_EMAIL) console.log('config ADMIN_EMAIL missing');
if (!process.env.WEB_SITE_URL) console.log('config WEB_SITE_URL missing');
if (!process.env.DATABASE_NAME) console.log('config DATABASE_NAME missing');
if (!process.env.AUTH_COOKIE_NAME) console.log('config AUTH_COOKIE_NAME missing');
if (!process.env.SECRET_TOKEN) console.log('config SECRET_TOKEN missing');
if (!process.env.HTTP_IP) console.log('config HTTP_IP missing');
if (!process.env.HTTP_PORT) console.log('config HTTP_PORT missing');
if (!process.env.DB_CONNECTION_STRING) console.log('config DB_CONNECTION_STRING missing');

module.exports = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '',
  WEB_SITE_URL: process.env.WEB_SITE_URL? process.env.WEB_SITE_URL.trim() : '',
  DATABASE_NAME: process.env.DATABASE_NAME ? process.env.DATABASE_NAME.trim() : '',
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME? process.env.AUTH_COOKIE_NAME.trim() : '',
  SECRET_TOKEN: process.env.SECRET_TOKEN? process.env.SECRET_TOKEN.trim() : '',
  HTTP_IP: process.env.HTTP_IP ? process.env.HTTP_IP.trim() : '',
  HTTP_PORT: process.env.HTTP_PORT ? process.env.HTTP_PORT.trim() : '',
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING.trim() : ''
};
