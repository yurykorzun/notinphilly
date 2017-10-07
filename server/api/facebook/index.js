var express     = require('express');
var passport    = require('passport');
var apiSettings    = require('../../config/apiSettings');

var router = express.Router();

router.get('/', function(req, res, next) { 
	console.log(JSON.stringify(apiSettings));
	console.log(req.originalUrl);
	console.log(req.hostname);
	console.log(req.protocol);
	console.log(req.method);
	
	next();
}, passport.authenticate('facebook', {scope: [ 'public_profile', 'email', 'user_friends']}));
router.get('/callback',  function(req, res, next) { 
	console.log(JSON.stringify(apiSettings));
	console.log(req.originalUrl);
	console.log(req.hostname);
	console.log(req.protocol);
	console.log(req.method);
	
	next();
}, passport.authenticate('facebook',  { failureRedirect: '/public/pages/facebook-error.html' }));

module.exports = router;