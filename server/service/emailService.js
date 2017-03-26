var promise             = require('promise');
var handlebarsEngine    = require("handlebars");
var fs                  = require('fs');
var path                = require('path');
var apiSettings         = require('../config/apiSettings');
var serverSettings      = require('../config/serverSettings');
var mailgun             = require('mailgun-js')({ apiKey: apiSettings.EMAIL_API_KEY, domain: apiSettings.EMAIL_DOMAIN });
var logger              = require('../components/logger');

var templateFolderPath = path.join(__dirname, "../templates");

//common
var emailFrom = "noreply <noreply@notinphilly.org>";
var emailToTemplate = handlebarsEngine.compile("{{firstName}} {{lastName}} <{{email}}>");

//confirmation email
var userConfirmationSubject = "NotInPhilly.org confirm registration";
var activationUrl = handlebarsEngine.compile(serverSettings.WEB_SITE_URL + "/api/users/confirm/{{activationHash}}");

//reset email
var userPasswordResetSubjectTemplate = "NotInPhilly.org reset password confirmation";

//admin notify
var adminEmail = serverSettings.ADMIN_EMAIL;

//confirmation email
var userWelcomeSubject = "Welcome to NotInPhilly.org!";

exports.sendUserWelcomeEmail = function(email, firstName, lastName) {
    var emailTo = emailToTemplate({ firstName: firstName, lastName: lastName, email: email });

    promise.all([getEmailTemplate("userWelcomeHtmlTemplate.html"), 
                getEmailTemplate("userWelcomePlainTemplate.html")])
                .then(function(templates){
                    var htmlTemplate = templates[0];
                    var plainTemplate = templates[1];

                    var data = {
                        from: emailFrom,
                        to: emailTo,
                        subject: userWelcomeSubject,
                        text: plainTemplate({firstName: firstName, websiteUrl: serverSettings.WEB_SITE_URL, adminEmail: serverSettings.ADMIN_EMAIL }),
                        html: htmlTemplate({firstName: firstName, websiteUrl: serverSettings.WEB_SITE_URL, adminEmail: serverSettings.ADMIN_EMAIL }),
                        inline: [ path.join(__dirname, "../resources/NotInPhillyLogo.jpg") ]
                    };

                    mailgun.messages().send(data, function(error, body) {
                        if (error) logger.error("emailService.sendUserWelcomeEmail " + error);
                    });
                },
                function(error) {
                    if (error) logger.error("emailService.sendUserWelcomeEmail " + error);
                });
}

exports.sendUserConfirmationEmail = function(email, firstName, lastName, activationHash) {
    promise.all([getEmailTemplate("userConfirmationEmailHtmlTemplate.html"), 
                getEmailTemplate("userConfirmationEmailPlainTemplate.html")])
                .then(function(templates){
                    var htmlTemplate = templates[0];
                    var plainTemplate = templates[1];

                    var emailTo = emailToTemplate({ firstName: firstName, lastName: lastName, email: email });
                    var url = activationUrl({ activationHash: activationHash });

                    var data = {
                        from: emailFrom,
                        to: emailTo,
                        subject: userConfirmationSubject,
                        text: plainTemplate({ firstName: firstName, url: url }),
                        html: htmlTemplate({ firstName: firstName, url: url })
                    };

                    mailgun.messages().send(data, function(error, body) {
                        if (error) logger.error("emailService.sendUserConfirmationEmail " + error);
                    });
                },
                function(error) {
                    if (error) logger.error("emailService.sendUserConfirmationEmail " + error);
                });
 
};

exports.sendResetPasswordEmail = function(firstName, lastName, email, newPassword) {
    var emailTo = emailToTemplate({ firstName: firstName, lastName: lastName, email: email });

    promise.all([getEmailTemplate("userPasswordResetHtmlTemplate.html"), 
                getEmailTemplate("userPasswordResetPlainTemplate.html")])
                .then(function(templates){
                    var htmlTemplate = templates[0];
                    var plainTemplate = templates[1];

                    var data = {
                        from: emailFrom,
                        to: emailTo,
                        subject: userPasswordResetSubjectTemplate,
                        text: plainTemplate({ firstName: firstName, newPassword: newPassword }),
                        html: htmlTemplate({ firstName: firstName, newPassword: newPassword })
                    };

                    mailgun.messages().send(data, function(error, body) {
                        if (error) logger.error("emailService.sendResetPasswordEmail " + error);
                    });
                },
                function(error) {
                    if (error) logger.error("emailService.sendUserConfirmationEmail " + error);
                });

 
};

exports.sendUserNotificationEmail = function(firstName, lastName, email, address) {
    promise.all([getEmailTemplate("userSignedUpNotificationHtmlTemplate.html"), 
                getEmailTemplate("userSignedUpNotificationPlainTemplate.html")])
                .then(function(templates){
                    var htmlTemplate = templates[0];
                    var plainTemplate = templates[1];

                      var data = {
                        from: adminEmail,
                        to: adminEmail,
                        subject: "Notinphilly.org: new user created account",
                        text: plainTemplate({ firstName: firstName, lastName: lastName, email: email, address: address }),
                        html: htmlTemplate({ firstName: firstName, lastName: lastName, email: email, address: address })
                    };

                    mailgun.messages().send(data, function(error, body) {
                        if (error) logger.error("emailService.sendUserNotificationEmail " + error);        
                    });
                },
                function(error) {
                    if (error) logger.error("emailService.sendUserConfirmationEmail " + error);
                });
};

var getEmailTemplate = function(fileName)
{
    var pathToTemplateFile = path.join(templateFolderPath, fileName);

    return new Promise(function (fulfill, reject){
        fs.readFile(pathToTemplateFile, function(err, templateData) {  
            if (err)
            {
                logger.error("emailService.getEmailTemplate " + err);
                reject("Failed retrieving email template " + err);
            }
            else
            {
                var compiledTemplate = handlebarsEngine.compile(templateData.toString());
                fulfill(compiledTemplate);
            }
        });
    });
}

var getImageAttachment = function(fileName)
{
    var pathToImageFile = path.join("../resources", fileName);

    return new Promise(function (fulfill, reject){
        fs.readFile(pathToImageFile, function(err, file) {  
            if (err)
            {
                logger.error("emailService.getImageAttachment " + err);
                reject("Failed retrieving image " + err);
            }
            else
            {
                var attachment = new mailgun.Attachment({data: file, filename: filename});
                fulfill(attachment);
            }
        });
    });
}