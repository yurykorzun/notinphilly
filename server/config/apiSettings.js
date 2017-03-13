var serverSettings = require("./serverSettings");

module.exports = {
  EMAIL_API_KEY: 'key-9c7663b6947df059523a2c1081483fbc',
  EMAIL_DOMAIN: 'mail.notinphilly.org',
  MAP_BOX_API_KEY: "pk.eyJ1IjoieXVyeWtvcnp1biIsImEiOiJjaXVsbHBnOTgwMDc4MnlwazkxYWhoNnY2In0.iU-SAfTXEZSsTEJK74wfeA",
  MAP_BOX_MAP_ID: "yurykorzun.nljndeg0",
  GOOGLE_API_KEY: "AIzaSyAUptjRjLzbBPVOUu2PxQhOLQ5DSNAPEX8",
  FACEBOOK_APP_ID: "267668170316874",
  FACEBOOK_SECRET: "e6f762e0d6673e8f6c3539a69819a71d",
  FACEBOOK_NAMESPACE: "notinphilly",
  FACEBOOK_CALLBACK_URL: serverSettings.WEB_SITE_URL + "/api/facebook/callback"
};
