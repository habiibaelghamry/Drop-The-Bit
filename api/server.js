process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var WebAdmin = require('./app/models/WebAdmin');
var Business = require('./app/models/Business');
var mongoose = require('./config/mongoose'),
    config   = require('./config/config'),
    express  = require('./config/express'),
    db       = mongoose(),
    app      = express();

app.listen(config.port);



module.exports = app;
console.log(process.env.NODE_ENV  + ' server running at http://localhost:' + config.port);
