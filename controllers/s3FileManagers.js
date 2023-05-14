var fs = require('fs');
var fsp = require('fs').promises;
const JSONStream = require('JSONStream')
const { Readable } = require('stream');
const toRegexRange = require('to-regex-range');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
});

exports.upload = function (req, res) {

  const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
  const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]

  var file = req.file;
  const filePath = file.path;

  var user = accessToken.payload.username;
  var folder = req.body.folder;
  var fileName = file.originalname;
  const date = Date.now();

  const baseKey = user + folder + date + "_" + fileName;
  const folderPath = user + folder;

  const dataKey = baseKey + "/.data"
  const fileData = fs.readFileSync( filePath );

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: dataKey,
    Body: fileData
  };

  s3.upload(params, function(err, data) {

    fs.unlinkSync( filePath );

    if (err) {
      throw err;
    };

    return res.json(`File uploaded. ${data.Location}`);
  });
};

exports.loadObject = function (req, res) {

  var key = req.body.key;

  console.log(key)

  const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
  };

  s3.getObject( params, function(err, data) {
    if (err) {
      throw err;
    };

    console.log(`File data loaded successfully. ${data.Location}`);

    const fileData = JSON.parse( data.Body );
    console.log( fileData )

    return res.send( fileData );
  });
};

exports.loadCARS = function (req, res) {

  var baseKey = req.body.key;
  const dataKey = baseKey + ".data";

  console.log(dataKey)

  const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: dataKey,
  };

  s3.getObject( params, function(err, data) {
    if (err) {
      throw err;
    };

    console.log(`File data loaded successfully. ${data.Location}`);

    const fileData = JSON.parse( data.Body );
    console.log( fileData )

    return res.send( fileData );
  });
};

exports.uploadObject = function (req,res) {

  const key = req.body.key;
  const fileData = req.body.fileData;

  const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: fileData
  };

  console.log("Updating object")
  console.log(key)

  s3.putObject( params, function(err, data) {
    if (err) {
      throw err;
    };

    console.log(`File data updated successfully: ` + key);
    return res.json(`File data updated successfully: ` + key);
  });

};

exports.loadProgressObject = function( req, res){

  const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
  const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]

  var user = accessToken.payload.username;
  var folder = req.body.folder;

  const key = user + folder + ".progress";

  const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
  };

  s3.getObject( params, function(err, data) {
    if (err) {
      const emptyProgressObject = {};
      return res.json( JSON.stringify( emptyProgressObject ) );
    };

    console.log(`Progress file loaded successfully. ${data.Location}`);

    return res.json( data.Body.toString('utf-8') );
  });

}

async function uploadFieldS3( key, filePath, field, unlink){

  const fileData = await fsp.readFile( filePath );
  const stream = Readable.from( fileData );

  var parser = JSONStream.parse(field);
  stream.pipe( parser );

  parser.on('data', output => {
    console.log("Found: " + field); // whatever you will do with each JSON object

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: JSON.stringify( output )
    };

    s3.upload(params, function(err, data) {

      if( unlink ){
        console.log( unlink );
        console.log( filePath );
        fs.unlinkSync( filePath );
      };

      if (err) {
        throw err;
      };

      console.log(`File ` + field + ` uploaded for: ` + filePath);
    });
  });

}

async function uploadPartitionSpectra( baseKey, filePath){

  const fileData = await fsp.readFile( filePath );
  var stream = Readable.from( fileData );

  const fields = ["nRows", "nColumns", "nSlices"];
  var dims = {};

  var promises = [];

  for( var ii = 0; ii < fields.length; ii++){

    var promise_ii = new Promise( (resolve, reject) => {

      var field_ii = fields[ii];
      var parserPath = [ "data", {recurse: true}, field_ii];
  
      var parser = JSONStream.parse( parserPath );
      stream.pipe( parser );

      parser.on('data', data => {
        
        dims[ field_ii ] = data;
        resolve( "Field read" );
      });  
    });

    promises.push( promise_ii );
  };

  await Promise.all( promises );

  const nRows = dims.nRows;
  const nCols = dims.nColumns;

  const partSize = 128;
  const partIndex = partSize - 1;

  const nRowPartitions = Math.ceil( nRows / partSize );
  const nColPartitions = Math.ceil( nCols / partSize );

  promises = [];

  for( var ii = 0; ii < nRowPartitions; ii++){
    for( var jj = 0; jj < nColPartitions; jj++){

      var promise_ii_jj = new Promise( (resolve, reject) =>{
        
        var minII = ii * partSize;
        var maxII = ( ii + 1 ) * partSize - 1;
  
        var minJJ = jj * partSize;
        var maxJJ = ( jj + 1 ) * partSize - 1;
  
        const regExpRangeStringII = toRegexRange( minII, maxII);
        const regExpRangeStringJJ = toRegexRange( minJJ, maxJJ);
  
        const regExpRanges = new RegExp("^y_" + regExpRangeStringII + "_" + regExpRangeStringJJ + "$");
        var parserPath = [ "data", "y", {emitKey: true}];
  
        var parser = JSONStream.parse( parserPath );
  
        var stream = Readable.from( fileData );
        stream.pipe( parser );

        var partition_ii_jj = {};
  
        parser.on('data', data => {
  
          if( regExpRanges.test( data.key ) ){

            partition_ii_jj[ data.key ] = data.value;
          };
  
        });

        parser.on("end", () => {

          const key_ii_jj = baseKey + "y_" + maxII + "_" + maxJJ;
          
          const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: key_ii_jj,
            Body: JSON.stringify( partition_ii_jj, null, 2)
          };

          s3.upload( params ).promise()
          .then( result => {
            resolve("Partition uploaded to S3.")
          });
        });

        
      });

      promises.push( promise_ii_jj );
    };
  };

  await Promise.all( promises );
  console.log( "Partitions uploaded" );
};

async function uploadMultiFieldS3( baseKey, filePath, field, unlink){

  const fileData = await fsp.readFile( filePath );
  const stream = Readable.from( fileData );

  var parser = JSONStream.parse(field);
  stream.pipe( parser );

  parser.on('data', output => {

    console.log("Found: " + field); // whatever you will do with each JSON object
    Object.keys( output ).forEach( fieldName => {

      var val = output[ fieldName ];
      var key = baseKey + "." + fieldName;

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: JSON.stringify( val )
      };

      s3.upload(params, function(err, data) {

        if (err) {
          throw err;
        };

        console.log(`File ` + field + ` uploaded for: ` + filePath);
      });
    });

    if( unlink ){
      console.log( unlink );
      console.log( filePath );
      fs.unlinkSync( filePath );
    };
  });

};


