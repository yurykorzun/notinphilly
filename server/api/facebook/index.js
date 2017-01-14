var express     = require('express');
var passport    = require('passport');

var router = express.Router();

router.get('/', passport.authenticate('facebook', {scope: [ 'public_profile', 'email', 'user_friends']}));
router.get('/callback', passport.authenticate('facebook',  { failureRedirect: '/' }));

module.exports = router;