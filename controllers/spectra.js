const fsp = require('fs').promises;
const path = require('path');
const spawn = require('child_process').spawn;

const login = require('../controllers/login.js');
const analysis = require('../controllers/analysis.js');
const gen = require("./common/general.js");

exports.setupAPI = ( app, up) => {

    const uploadCallbacks = [ login.authenticate, up.single("file")];

    return app;
}