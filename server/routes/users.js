// grab the nerd model we just created
var Users = require('../models/users');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  // sample api route
  app.get('/api/users', function(req, res) {
      // use mongoose to get all nerds in the database
      Users.find(function(err, users) {

          // if there is an error retrieving, send the error.
                          // nothing after res.send(err) will execute
          if (err)
              res.send(err);

          res.json(users); // return all users in JSON format
      });
  });

  // route to handle creating goes here (app.post)
  // route to handle delete goes here (app.delete)

};
