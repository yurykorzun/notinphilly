if (!process.env.EMAIL_API_KEY) console.log('config EMAIL_API_KEY missing');
if (!process.env.EMAIL_DOMAIN) console.log('config EMAIL_DOMAIN missing');
if (!process.env.MAP_BOX_USER) console.log('config MAP_BOX_USER missing');
if (!process.env.MAP_BOX_API_KEY) console.log('config MAP_BOX_API_KEY missing');
if (!process.env.MAP_BOX_MAP_ID) console.log('config MAP_BOX_MAP_ID missing');
if (!process.env.GOOGLE_API_KEY) console.log('config GOOGLE_API_KEY missing');
if (!process.env.GOOGLE_CALENDAR_ID) console.log('config GOOGLE_CALENDAR_ID missing');
if (!process.env.FACEBOOK_APP_ID) console.log('config FACEBOOK_APP_ID missing');
if (!process.env.FACEBOOK_SECRET) console.log('config FACEBOOK_SECRET missing');
if (!process.env.FACEBOOK_NAMESPACE) console.log('config FACEBOOK_NAMESPACE missing');
if (!process.env.FACEBOOK_CALLBACK_URL) console.log('config FACEBOOK_CALLBACK_URL missing');
if (!process.env.FACEBOOK_GROUP) console.log('config FACEBOOK_GROUP missing');

module.exports = {
  EMAIL_API_KEY: process.env.EMAIL_API_KEY ? process.env.EMAIL_API_KEY.trim() : '',
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN ? process.env.EMAIL_DOMAIN.trim() : '',
  MAP_BOX_USER: process.env.MAP_BOX_USER ? process.env.MAP_BOX_USER.trim() : '',
  MAP_BOX_API_KEY: process.env.MAP_BOX_API_KEY? process.env.MAP_BOX_API_KEY.trim() : '',
  MAP_BOX_MAP_ID: process.env.MAP_BOX_MAP_ID ? process.env.MAP_BOX_MAP_ID.trim() : '',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.trim() : '',
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID ? process.env.GOOGLE_CALENDAR_ID.trim() : '', 
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ? process.env.FACEBOOK_APP_ID.trim() : '',
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET ? process.env.FACEBOOK_SECRET.trim() : '',
  FACEBOOK_NAMESPACE: process.env.FACEBOOK_NAMESPACE ? process.env.FACEBOOK_NAMESPACE.trim() : '',
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL ? process.env.FACEBOOK_CALLBACK_URL.trim() : '',
  FACEBOOK_GROUP: process.env.FACEBOOK_GROUP ? process.env.FACEBOOK_GROUP.trim() : ''
};
