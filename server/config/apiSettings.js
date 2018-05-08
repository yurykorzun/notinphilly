// if (!process.env.EMAIL_API_KEY) console.log('config EMAIL_API_KEY missing');
// if (!process.env.EMAIL_DOMAIN) console.log('config EMAIL_DOMAIN missing');
// if (!process.env.MAP_BOX_USER) console.log('config MAP_BOX_USER missing');
// if (!process.env.MAP_BOX_API_KEY) console.log('config MAP_BOX_API_KEY missing');
// if (!process.env.MAP_BOX_MAP_ID) console.log('config MAP_BOX_MAP_ID missing');
// if (!process.env.GOOGLE_API_KEY) console.log('config GOOGLE_API_KEY missing');
// if (!process.env.GOOGLE_CALENDAR_ID) console.log('config GOOGLE_CALENDAR_ID missing');
// if (!process.env.FACEBOOK_APP_ID) console.log('config FACEBOOK_APP_ID missing');
// if (!process.env.FACEBOOK_SECRET) console.log('config FACEBOOK_SECRET missing');
// if (!process.env.FACEBOOK_NAMESPACE) console.log('config FACEBOOK_NAMESPACE missing');
// if (!process.env.FACEBOOK_CALLBACK_URL) console.log('config FACEBOOK_CALLBACK_URL missing');
// if (!process.env.FACEBOOK_GROUP) console.log('config FACEBOOK_GROUP missing');

// module.exports = {
//   EMAIL_API_KEY: process.env.EMAIL_API_KEY ? process.env.EMAIL_API_KEY.trim() : '',
//   EMAIL_DOMAIN: process.env.EMAIL_DOMAIN ? process.env.EMAIL_DOMAIN.trim() : '',
//   MAP_BOX_USER: process.env.MAP_BOX_USER ? process.env.MAP_BOX_USER.trim() : '',
//   MAP_BOX_API_KEY: process.env.MAP_BOX_API_KEY? process.env.MAP_BOX_API_KEY.trim() : '',
//   MAP_BOX_MAP_ID: process.env.MAP_BOX_MAP_ID ? process.env.MAP_BOX_MAP_ID.trim() : '',
//   GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.trim() : '',
//   GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID ? process.env.GOOGLE_CALENDAR_ID.trim() : '',
//   FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ? process.env.FACEBOOK_APP_ID.trim() : '',
//   FACEBOOK_SECRET: process.env.FACEBOOK_SECRET ? process.env.FACEBOOK_SECRET.trim() : '',
//   FACEBOOK_NAMESPACE: process.env.FACEBOOK_NAMESPACE ? process.env.FACEBOOK_NAMESPACE.trim() : '',
//   FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL ? process.env.FACEBOOK_CALLBACK_URL.trim() : '',
//   FACEBOOK_GROUP: process.env.FACEBOOK_GROUP ? process.env.FACEBOOK_GROUP.trim() : ''
// };

var serverSettings = require("./serverSettings");
module.exports = {
  EMAIL_API_KEY: 'key-9c7663b6947df059523a2c1081483fbc',
  EMAIL_DOMAIN: 'mail.notinphilly.org',
  MAP_BOX_API_KEY: "pk.eyJ1IjoieXVyeWtvcnp1biIsImEiOiJjaXVsbHBnOTgwMDc4MnlwazkxYWhoNnY2In0.iU-SAfTXEZSsTEJK74wfeA",
  MAP_BOX_MAP_ID: "yurykorzun.nljndeg0",
  GOOGLE_API_KEY: "AIzaSyA05MqXZbU9PutI74DfnFNYwvoMmkhYB8w",
  FACEBOOK_APP_ID: "267756506974707",
  FACEBOOK_SECRET: "bc1675d566b520c5af48f8a09b9e418c",
  FACEBOOK_NAMESPACE: "notinphillytest",
  FACEBOOK_CALLBACK_URL: serverSettings.WEB_SITE_URL + "api/facebook/callback"
};
