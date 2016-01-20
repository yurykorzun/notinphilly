var mongoose = require('mongoose');
var UserModel = require('./user.model');
var mailer = require('nodemailer');
var smtpTransport = {};

if (process.env.OS_EMAIL_ADDR && process.env.OS_EMAIL_PASSWD) {
  smtpTransport =  mailer.createTransport( process.env.OS_EMAIL_ADDR +':'+ process.env.OS_EMAIL_PASSWD + '@host244.hostmonster.com');
} else {
  smtpTransport =  mailer.createTransport('smtps://notinphilly%40antsdesigns.net:Test123!@host244.hostmonster.com');
}
/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
    UserModel.find({}, '-salt -hashedPassword', function(err, users) {
        if (err) return res.status(500).send(err);
        res.status(200).json(users);
    });
};

var checkForErrors = function(userInfo) {
  if (userInfo.email === '' || typeof userInfo.email === 'undefined'){
    return "Please enter email address";
  }
  if (userInfo.fistName === '' || typeof userInfo.firstName === 'undefined'){
    return "Please enter your First name";
  }
  if (userInfo.email === '' || typeof userInfo.lastName === 'undefined'){
    return "Please enter your last name";
  }
  if (userInfo.password === '' || typeof userInfo.password === 'undefined'){
    return "Please enter password and confirm your password";
  }
  if (userInfo.password !== userInfo.passwordConfirm) {
    return "Your passwords do not match";
  }
  return "false";
}

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
  mongoose.models["User"].findOne({email: req.body.email}, function(err, user) {
    if(err) throw err;

    if(user) {
      console.log('user already registred');
      res.status(409).send('User with this email alreay has an account');
      return "User already exists";
    }

     errorMessage = checkForErrors(req.body);
     console.log('errorMessage' + errorMessage);
    if (errorMessage === "false") {
      UserModel.create(
        {
          firstName: req.body.fistName,
          middleName: req.body.middleName,
          lastName: req.body.lastName,
          birthDate: req.body.birthDate,
          phoneNumber: req.body.phoneArea + req.body.phoneNumber1 + req.body.phoneNumber2 ,
          email: req.body.email,
          role: [1],
          businesName: req.body.businessName,
          addressLine1: req.body.houseNumber + " " + req.body.addressLine1 + " " + req.body.aptNumber,
          addressLine2: req.body.addressLine2,
          active: false,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          password: req.body.password
        }, function(err, thor){
          console.log(err);
          if (err) {
            res.status(500).send('There was an issue. Please try again later');
          };
          res.status(200).send('Successfully Added the user');
          console.log('Finished adding the user');
        }
      )
      mongoose.models["User"].findOne({email: req.body.email}, function(err, user) {
        sendConfirmationEmail(req, user);
    });
      res.status(200).send('Successfully Sent Confirmation Email');
    } else {
      res.status(409).send(errorMessage);
    }
  });
};

/**
 * Send confirmation email
 */

//Use tempaltes instead of TEXT
var sendConfirmationEmail = function(req, user) {
  var mailOptions = { from: "noreply <noreply@notinphilly.org>",
                      to:  req.body.firstName + " " + req.body.lastName + " " +"<"+ req.body.email +">",
                      subject: "NotInPhilly. Confirm reservation.",
                      text: "Hi " + req.body.firstName + ", \n Please follow the link in order to finish the registration: \n http://notinphilly.org/api/users/confirm/" + user.activationHash + "\n \n \n #NotInPhilly Team"
                    };
//Send confirmation email
smtpTransport.sendMail(mailOptions, function(error, response){
 if(error){
     console.log("Encounter error: " + error);
 }else{
     console.log("Message sent.");
 }
});
}

/**
 * Get a single user
 */
exports.get = function(req, res, next) {
    var userId = req.params.id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Incorrect username or password');
        if (user.active === false) return res.status(401).send('Please confirm the user. Check your email.');
        res.json(user);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {

};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var confirmId = req.params.confirmId;
  UserModel.findOne({activationHash: confirmId}, function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).send('Could not find the user with activation tag: ' + req.params.confirmId);
      user.activationHash = this.encryptPassword(new Date().getTime().toString());
      user.activationHash = user.activationHash.replace(/\//gi, '');
      user.password = req.body.password;
      user.save(function (err) {
        if (err) {
          console.log("Error while saving user" + err);
        } else {
          res.statusCode = 302;
          res.setHeader("Location", "/");
          res.end();
          console.log("Password has been changed");
        }
      })
  });
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findOne({_id: userId}, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        if (user.active != true) return res.status(401).send('Please activate your user');
        res.json(user);
    });
};

exports.update = function(req, res) {

};

exports.activate = function(req, res) {
  var confirmId = req.params.confirmId;
  UserModel.findOne({activationHash: confirmId}, function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).send('Could not find the user with activation tag: ' + req.params.confirmId);
      user.active = true;
      user.activationHash = this.encryptPassword(new Date().getTime().toString());
      user.activationHash = user.activationHash.replace(/\//gi, '');
      user.save(function (err) {
        if (err) {
          console.log("Error while saving user" + err);
        } else {
          res.statusCode = 302;
          res.setHeader("Location", "/confirm.html");
          res.end();
          //return res.status(200).send("User has been confirmed");

          console.log("Successfully Confirmed user");
        }
      })
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
