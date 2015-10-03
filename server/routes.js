
module.exports = function(app) {
    // Insert routes below
    app.use('/api/users', require('./api/user'));
};
