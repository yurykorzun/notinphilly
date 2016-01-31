var mailer = require('nodemailer');
var settings = require('../config/settings');

var smtpTransport = mailer.createTransport(settings.serverSettings.EMAIL_TRASPORT_URL);

module.exports.sendMail = function(mailOptions) {
  smtpTransport.sendMail(mailOptions, function(error, response){
   if(error){
       console.log("Encounter error: " + error);
   }else{
       console.log("Message sent.");
   }
  });
}

module.exports.getSmtpTransport = function() {
  return smtpTransport;
}
