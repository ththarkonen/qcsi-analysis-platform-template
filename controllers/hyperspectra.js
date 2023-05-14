const fsp = require('fs').promises;
const path = require('path');
const spawn = require('child_process').spawn;
const toRegexRange = require('to-regex-range');

const login = require('../controllers/login.js');
const analysis = require('../controllers/analysis.js');
const gen = require("./common/general.js");

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
});

exports.setupAPI = ( app, up) => {

    const postCallbacks = [ login.authenticate, up.single("file")];

    app.post("/uploadHyperspectrum", postCallbacks, ( req, res) => {
        uploadHyperspectrum( req, res);
    });

    app.post("/extractLayer", postCallbacks, ( req, res) => {
        layer( req, res);
    });

    app.post("/extractMIP", postCallbacks, ( req, res) => {
        extractMIP( req, res);
    });

    app.post("/extractMeanSpectrum", postCallbacks, ( req, res) => {
        computeMeanSpectrum( req, res);
    });

    app.post("/pcaColor", postCallbacks, ( req, res) => {
        analysis.pcaColor( req, res);
    });

    app.post("/getLoadings", postCallbacks, ( req, res) => {
        analysis.getLoadings( req, res);
    });

    app.post("/uploadRegionOfInterest", postCallbacks, ( req, res) => {
        uploadROI( req, res);
    });

    return app;
}

async function layer( req, res) {

    const layerIndex = req.body.layer;
    const baseKey = req.body.key;
    const key = baseKey + "layers/" + "." + layerIndex

    const layerParameters = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
    };

    s3.getObject( layerParameters, (err, data) => {
        if (err) {
            throw err;
        };

        var responseObject = {};
        responseObject.layer = JSON.parse( data.Body );

        res.send( responseObject );
    });
};

async function extractMIP( req, res) {

    const baseKey = req.body.key;
    const key = baseKey + ".mip";
  
    const mipParameters = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
    };
  
    s3.getObject( mipParameters, (err, data) => {
        if (err) {
            throw err;
        };

        var responseObject = {};
        responseObject.mip = JSON.parse( data.Body );

        res.send( responseObject );
    });
};

async function uploadROI( req, res){

    const timestamp = Date.now();
    const baseKey = req.body.key;
    const fileData = req.body.roiData;
    
    const fileName = "roi_" + timestamp;
    const filePath = baseKey + "roi/" + fileName;
  
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: filePath,
      Body: fileData
    };
  
    await s3.upload( params ).promise();
    res.send("ROI uploaded.")
};

async function uploadHyperspectrum( req, res){

    const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
    const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]
  
    var file = req.file;
    const filePath = file.path;
  
    var user = accessToken.payload.username;
    var folder = req.body.folder;
    var fileName = file.originalname;
    const date = Date.now();
  
    const fileExtension = path.extname( fileName );
    console.log( fileExtension )
  
    const baseKey = user + folder + date + "_" + fileName;
    const folderPath = user + folder;
  
    const dataKey = baseKey + "/.data"
    
    const spectraBaseKey = baseKey + "/spectra/";
    const spectraField = ['data', {recurse: true}, 'y'];
  
    const keyLoadings = baseKey + "/pca/.loadings";
    const fieldLoadings = ['pca', {recurse: true}, 'loadings'];
  
    const keyScores = baseKey + "/pca/.scores";
    const fieldScores = ['pca', {recurse: true}, 'scores'];
  
    const keyColors = baseKey + "/pcaColor/";
    const fieldColors = 'pcaColor';
  
    const keyMIP = baseKey + "/.mip";
    const fieldMIP = "mip";
  
    const keyLayers = baseKey + "/layers/";
    const fieldLayers = 'layers';
  
    await gen.setPreprocessing( baseKey );
    res.json("Hyperspectral pre-processing started.")
  
    await gen.uploadS3( dataKey, file, res);
    
    if( fileExtension == ".oir" ){
  
      await preprocessHyperspectrumOIR( filePath, baseKey + "/");
    } else {
  
      const maxComponents = 10;
      await analysis.partitionSpectra( filePath, spectraBaseKey);
      await analysis.hpca( filePath, maxComponents);
      await analysis.mip( filePath );
      await analysis.pcac( filePath );
    
      await gen.uploadFieldS3( keyLoadings, filePath + "hpca", fieldLoadings, false);
      await gen.uploadMultiFieldS3( keyColors, filePath + "pcac", fieldColors, true);
      await gen.uploadFieldS3( keyScores, filePath + "hpca", fieldScores, true);
    
      await gen.uploadFieldS3( keyMIP, filePath + "mip", fieldMIP, false);
      await gen.uploadMultiFieldS3( keyLayers, filePath + "mip", fieldLayers, true);
    };
    
    await fsp.unlink( filePath );
    await gen.quitPreprocessing( baseKey );
};


preprocessHyperspectrumOIR = ( filePath, baseKey) => {
    return new Promise( (resolve, reject) => {

        console.log("Initiating OIR hyperspectrum preprocessing...");

        const exe = "./python/preprocessOIR.py";
        const options = { silent: true};

        var exeChild = spawn( "python3", [exe, filePath, baseKey, 128], options );

        exeChild.stdout.on( 'data', async function(data) {

        var percent = data.toString();
            console.log(percent)
        });

        exeChild.stderr.on('data', function(data) {
            console.error(data.toString());
        });

        exeChild.on( 'exit', (code, signal) => {

            console.log( "OIR preprocessing done." )
            resolve("OIR preprocessing done.");
        });
    })
}




computeMeanSpectrum = async function( request, response){

    const idToken = request.cookies[ process.env.ID_TOKEN_NAME ];
    const accessToken = request.cookies[ process.env.ACCESS_TOKEN_NAME ]
  
    const user = accessToken.payload.username;
    const baseKey = request.body.key;
    const key = baseKey + "spectra/";
  
    const partSize = 128;
    const indices = JSON.parse( request.body.indices );
  
    console.log( indices )
  
    const minII = indices.ii[0];
    const maxII = indices.ii[1];
  
    const minJJ = indices.jj[0];
    const maxJJ = indices.jj[1];
  
    var minFileII = minII / ( partSize - 1 );
    var maxFileII = maxII / ( partSize - 1 );
  
    var minFileJJ = minJJ / ( partSize - 1 );
    var maxFileJJ = maxJJ / ( partSize - 1 );
  
    if( minFileII == 0 ){
      minFileII = 1;
    };
  
    if( maxFileII == 0 ){
      maxFileII = 1;
    };
  
    if( minFileJJ == 0 ){
      minFileJJ = 1;
    };
  
    if( maxFileJJ == 0 ){
      maxFileJJ = 1;
    };
  
    minFileII = partSize * Math.ceil( minFileII ) - 1;
    maxFileII = partSize * Math.ceil( maxFileII ) - 1;
  
    minFileJJ = partSize * Math.ceil( minFileJJ ) - 1;
    maxFileJJ = partSize * Math.ceil( maxFileJJ ) - 1;
  
    console.log( minFileII, maxFileII, minFileJJ, maxFileJJ )
  
    const regExpRangeStringII = toRegexRange( minII, maxII);
    const regExpRangeStringJJ = toRegexRange( minJJ, maxJJ);
  
    const nSpectra = ( maxII - minII + 1 ) * ( maxJJ - minJJ + 1 );
    const regExpRanges = new RegExp("y_" + regExpRangeStringII + "_" + regExpRangeStringJJ + "$");
  
    var spectrum_ii_jj;
    var meanSpectrum = [];
  
    for( var ii = minFileII; ii <= maxFileII; ii += partSize){
      for( var jj = minFileJJ; jj <= maxFileJJ; jj += partSize){
  
        var params = {};
        params.Bucket = process.env.AWS_BUCKET;
        params.Key = key + "y_" + ii + "_" + jj;
  
        console.log( params.Key )
  
        try {
  
          const partitionFile_ii_jj = await s3.getObject( params ).promise();
          const partition_ii_jj = JSON.parse( partitionFile_ii_jj.Body );
    
          Object.keys( partition_ii_jj ).forEach( key => {
    
            
            if( regExpRanges.test( key ) ){
    
              spectrum_ii_jj = partition_ii_jj[ key ];
    
              if( meanSpectrum.length == 0 ){
    
                meanSpectrum = spectrum_ii_jj;
              } else {
      
                for(var kk = 0; kk < spectrum_ii_jj.length; kk++){
      
                  meanSpectrum[kk] = meanSpectrum[kk] + spectrum_ii_jj[kk];
                };
              };
            };
          });

          for(var kk = 0; kk < meanSpectrum.length; kk++){
            meanSpectrum[kk] = meanSpectrum[kk] / nSpectra;
          };

        } catch(e) {
          console.log( e );
          continue;
        };
      };
    };
  
    console.log( meanSpectrum );
  
    var responseObject = {};
    responseObject.meanSpectrum = meanSpectrum;
    response.send( responseObject );
  };

