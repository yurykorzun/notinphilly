
module.exports = function(app) {
    // Insert routes below
    app.use('/api/users', require('./api/user'));

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function(req, res) {
            res.sendFile(path.resolve(app.get('clientPath') + '/index.html'));
        });
};
