var path    = require('path');
var logger  = require('./components/logger');

module.exports = function(app) {
    logger.debug("init routes");

    // Insert routes below
    app.use('/api/neighborhoods', require('./api/neighborhood'));
    app.use('/api/blocks', require('./api/block'));    
    app.use('/api/streets', require('./api/street'));
    app.use('/api/city', require('./api/city'));
    app.use('/api/zipcodes', require('./api/zipcode'));
   
    app.use('/api/users', require('./api/user'));
    app.use('/api/roles', require('./api/role'));
    app.use('/api/userstats', require('./api/userstats'));
    app.use('/api/inventory', require('./api/inventory'));
    app.use('/api/toolrequests', require('./api/toolRequests'));

    app.use('/api/auth', require('./api/auth'));
    app.use('/api/facebook', require('./api/facebook'));    
    app.use('/api/external', require('./api/external'));

    // All other routes should redirect to the index.html
    app.route('/*').get(function(req, res) {
        var pathToIndex = path.resolve(app.get('clientPath') + '/index.html');
        res.sendFile(pathToIndex);
    });
};
