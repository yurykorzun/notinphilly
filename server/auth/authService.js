exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    if(req.user) {
      next();
    }
    else {
      res.send(400, "Not logged in");
    }
  }
  else {
    res.send(401);
  }
};

/**
 * Checks if the user role meets the minimum requirements of the route
 */
exports.hasRole = function (user, role) {
  if(user.roles.indexOf(role) > -1)
  {
    return true;
  }

  return false;
}

exports.isAdmin = function (req, res, next) {
  var adminRoleId = 1;

  if (req.isAuthenticated()) {
    if(req.user.roles.indexOf(adminRoleId) > -1)
    {
      next();
    }
  }
  else {
    res.send(401);
  }
}

exports.isAdmin = function () {
  var adminRoleId = 1;
  
  if (req.isAuthenticated()) {
    if(req.user.userInfo.roles.indexOf(adminRoleId) > -1)
    {
      next();
    }
  }
  else {
    res.send(401);
  }
}
