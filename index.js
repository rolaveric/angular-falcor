// Starts API server

// Hooks into babel to transpile all ES6 code to ES5 on require()
require('babel/register');

// Start the Web API module
require('./api/index.js').start();