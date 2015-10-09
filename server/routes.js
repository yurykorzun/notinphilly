var path = require('path');

module.exports = function(app) {
    // Insert routes below
    app.use('/api/users', require('./api/user'));
    app.use('/api/neighborhoods', require('./api/neighborhood'));
    app.use('/api/streets', require('./api/street'));

    // All other routes should redirect to the index.html
    /*app.route('/*')
        .get(function(req, res) {
            var pathToIndex = path.resolve(app.get('clientPath') + '/index.html');
            res.sendfile(pathToIndex);
        });*/
};
