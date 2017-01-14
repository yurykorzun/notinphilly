var handlebarsEngine = require("handlebars");
var apiSettings = require('../config/apiSettings');
var mailgun = require('mailgun-js')({ apiKey: apiSettings.EMAIL_API_KEY, domain: apiSettings.EMAIL_DOMAIN });

//common
var emailFrom = "noreply <noreply@notinphilly.org>";

var emailCopy = "notinphilly@gmail.com";

var emailToTemplate = handlebarsEngine.compile("{{firstName}} {{lastName}} <{{email}}>");

//confirmation email
var userConfirmationSubject = "NotInPhilly.org confirm registration";

var activationUrl = handlebarsEngine.compile("http://notinphilly.org/api/users/confirm/{{activationHash}}");

var userConfirmationEmailPlainTemplate = handlebarsEngine.compile("Hi {{firstName}},\n Just a reminder that have launched this project in the Walnut Hill neighborhood right now. Sign up wherever you live and we'll let you know when we expand to your neighborhood! \n\n Please follow the link in order to finish the registration: \n {{ url }}\n\nBe sure to tag pictures of your cleaned blocks with @notinphilly and #notinphilly on Instagram to be entered for prizes! \n\n \n #NotInPhilly Team");

var userConfirmationEmailHtmlTemplate = handlebarsEngine.compile("<p>Hi {{firstName}},<p> <p>Just a reminder that have launched this project in the Walnut Hill neighborhood right now. Sign up wherever you live and we'll let you know when we expand to your neighborhood!</p> <p>Please follow the link in order to finish the registration:</p> <p><a href='{{ url }}'>{{ url }}</a></p> <p>Be sure to tag pictures of your cleaned blocks with @notinphilly and #notinphilly on Instagram to be entered for prizes!</p> <div><b>#NotInPhilly Team</b></div>");

//reset email
var userPasswordResetSubjectTemplate = "NotInPhilly.org reset password confirmation";

var userPasswordResetPlainTemplate = handlebarsEngine.compile("Hi {{firstName}},\n Your temporary password for notinphilly.org is: {{newPassword}}\nPlease don't forget to change your password after login. \n\n\n #NotInPhilly Team");

var userPasswordResetHtmlTemplate = handlebarsEngine.compile("<p>Hi {{firstName}},</p><p>Your temporary password for notinphilly.org is: <p><b>{{newPassword}}</b></p></p><p>Please don't forget to change your password after login.</p> <p><b>#NotInPhilly Team</b></p>");


exports.sendUserConfirmationEmail = function(email, firstName, lastName, activationHash) {
    var emailTo = emailToTemplate({ firstName: firstName, lastName: lastName, email: email });
    var url = activationUrl({ activationHash: activationHash });

    var data = {
        from: emailFrom,
        // cc: emailCopy,
        to: emailTo,
        subject: userConfirmationSubject,
        text: userConfirmationEmailPlainTemplate({ firstName: firstName, url: url }),
        html: userConfirmationEmailHtmlTemplate({ firstName: firstName, url: url })
    };

    mailgun.messages().send(data, function(error, body) {});
};

exports.sendResetPasswordEmail = function(firstName, lastName, email, newPassword) {
    var emailTo = emailToTemplate({ firstName: firstName, lastName: lastName, email: email });

    var data = {
        from: emailFrom,
        //cc: emailCopy,
        to: emailTo,
        subject: userPasswordResetSubjectTemplate,
        text: userPasswordResetPlainTemplate({ firstName: firstName, newPassword: newPassword }),
        html: userPasswordResetHtmlTemplate({ firstName: firstName, newPassword: newPassword })
    };

    mailgun.messages().send(data, function(error, body) {});
};