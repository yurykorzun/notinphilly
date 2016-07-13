module.exports.serverSettings = {
  EMAIL_TRASPORT_URL: (process.env.OS_EMAIL_ADDR && process.env.OS_EMAIL_PASSWD) ?
                                      "smtps://" + process.env.OS_EMAIL_ADDR +':'+ process.env.OS_EMAIL_PASSWD + '@host244.hostmonster.com' :
                                      "smtps://notinphilly%40antsdesigns.net:Test123!@host244.hostmonster.com",
  HTTP_IP: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
  HTTP_PORT: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  DB_CONNECTION_STRING: process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || process.env.AWS_MONGO_DB_URL || "mongodb://localhost/notinphilly"
};

module.exports.clientSettings = {
  MAP_BOX_API_KEY: "pk.eyJ1IjoieXVyeWtvcnp1biIsImEiOiJjaWY2eTN2aHMwc3VncnptM3QxMzU3d3hxIn0.Mt0JldEMvvTdWW4GW2RSlQ",
  MAP_BOX_MAP_ID: "yurykorzun.nljndeg0"
};
