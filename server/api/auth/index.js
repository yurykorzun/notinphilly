var express    = require('express');
var passport   = require('passport');
var controller = require('./auth.controller');

var router = express.Router();

router.post('/login', passport.authenticate('local'), controller.login);
router.post('/logout', controller.logout);
router.get('/session', controller.session);
router.get('/isauthenticated', controller.isAuthenticated);

module.exports = router;
