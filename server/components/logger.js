 var winston = require('winston');

/*
error,
warn,
info,
verbose,
debug
*/

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { timestamp: true });
winston.add(winston.transports.File, { filename: 'nodejs.log' });

module.exports = winston;