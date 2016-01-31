var path = require('path');

module.exports = function(app) {
    // Insert routes below
    app.use('/api/users', require('./api/user'));
    app.use('/api/neighborhoods', require('./api/neighborhood'));
    app.use('/api/streets', require('./api/street'));

    app.use('/api/auth', require('./api/auth'));
    app.use('/api/settings', require('./api/settings'));

    //misc stuff for development purposes
    app.use('/api/test', require('./api/test'));

    // All other routes should redirect to the index.html
    /*app.route('/*')
        .get(function(req, res) {
            var pathToIndex = path.resolve(app.get('clientPath') + '/index.html');
            res.sendfile(pathToIndex);
        });*/
};
