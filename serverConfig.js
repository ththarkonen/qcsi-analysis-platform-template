const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const cors = require('cors');
const multer = require("multer");
const express = require('express');

const vt = require('./controllers/login.js');

exports.setup = app => {

    app.use( bodyParser.json() );
    app.use( cors() );
    app.use( express.urlencoded({ extended: true }) );
    app.use( cookieParser() );
    
    return app;
}

exports.setupUploading = () => {

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb( null, './uploads/')
        },
        filename: function (req, file, cb) {

            const originalName = file.originalname;
            const fileName = Date.now() + path.extname( originalName );
            cb( null, fileName) 
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fieldSize: 5120 * 1024 * 1024 },
    });

    return upload;
}