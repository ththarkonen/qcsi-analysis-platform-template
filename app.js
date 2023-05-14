require('dotenv').config()
const port = process.env.PORT || 3000;
const hostname = '127.0.0.1';

const express = require('express');
const serveStatic = require('serve-static');

const login = require('./controllers/login.js');
const fm = require('./controllers/s3FileManagers.js');

const projects = require("./controllers/projects.js");
const spectra = require("./controllers/spectra.js");
const hyperspectra = require('./controllers/hyperspectra.js');
const analysis = require('./controllers/analysis.js');

const sc = require("./serverConfig.js");
const up = sc.setupUploading();

app = express();
app = sc.setup( app );
app = login.setupLoginAPI( app );
app = projects.setupAPI( app, up);

app = spectra.setupAPI( app, up);
app = hyperspectra.setupAPI( app, up);

const uploadCallbacks = [ login.authenticate, up.single("file")];

app.post("/upload", uploadCallbacks, ( req, res) => {
	fm.upload( req, res);
});

app.post("/uploadObject", uploadCallbacks, ( req, res) => {
	fm.uploadObject( req, res);
});

app.post("/loadObject", uploadCallbacks, ( req, res) => {
	fm.loadObject( req, res);
});

app.post("/update", uploadCallbacks, ( req, res) => {
	fm.updateObject(req,res);
});

app.post("/loadData", uploadCallbacks, ( req, res) => {
    fm.loadObject( req, res);
});

app.post("/loadSpectrumCARS", uploadCallbacks, ( req, res) => {

    fm.loadCARS( req, res);
});

app.post("/loadProgressObject", up.single("file"), function( req, res){

  const tokensValid = req.tokensValid;
  

  if( tokensValid ){
    fm.loadProgressObject(req,res);
  } else {
    app.use(serveStatic(__dirname + "/views/signin"));
    res.sendFile(__dirname + "/views/signin/index.html");
  };
});

app.post("/lineNarrowing", uploadCallbacks, ( req, res) => {
    analysis.lineNarrowing( req, res);
});

app.post("/smc", uploadCallbacks, ( req, res) => {
    analysis.smc( req, res);
});

app.post("/hpca", up.single("file"), function( req, res){

  const tokensValid = req.tokensValid;

  if( tokensValid ){
    analysis.hpca(req,res);
  } else {
    app.use(serveStatic(__dirname + "/views/signin"));
    res.sendFile(__dirname + "/views/signin/index.html");
  };
});

app.listen( port, hostname, () => {
   console.log(`Server running at http://${hostname}:${port}/`);
 });
