const fs = require('fs');
var spawn = require('child_process').spawn;
var crypto = require("crypto");

const JSONStream = require('JSONStream')
const { Readable } = require('stream');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
});

const colorBasis = [[1,0,0],
              [0,0,1],
              [0,1,0],
              [1,0,1],
              [1,1,0],
              [0,1,1],
              [1,1,1],
              [1,0.5,0.5],
              [0.5,1,0.5],
              [0.5,0.5,1.0]
            ];

const colorBasisString = JSON.stringify( colorBasis );

exports.lineNarrowing = (req, res) => {

  console.log("Initiating line narrowing.");

  const lnObjectString = req.body.lineNarrowingObject;

  var id = crypto.randomBytes(20).toString('hex');

  const fileName = './exe/temp/lna_' + id + '.txt';

  const inputData = new Uint8Array(Buffer.from( lnObjectString ));
  fs.writeFile( fileName, inputData, (err) => {
    if (err) {
      fs.unlinkSync( fileName );
      throw err;
    };

    console.log('Temporary file has been saved!');

    const options = { silent: true};
    var exeChild = spawn( "./exe/lna", [fileName], options );

    exeChild.stdout.on( 'data', function(data) {
      var percent = data.toString();

      console.log(percent)

      if( isNaN(percent) ){
        console.log(percent);
      } else {
        console.log("progress: " + percent)
        //res.write(percent);
      };
    });

    exeChild.on( 'exit', function (code, signal) {

      fs.readFile( fileName, 'utf8', function ( err, data) {
        if (err) {
          return console.log(err);
        }

        fs.unlinkSync( fileName );
        res.send( data )
      });

    });

  });

};

exports.smc = async function (req, res) {

  console.log("Initiating SMC..");

  const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
  const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]

  const user = accessToken.payload.username;

  const key = req.body.key;
  const dataFolder = req.body.dataFolder;

  const exe = req.body.exe;
  const workflow = req.body.workflow;
  const projectData = JSON.parse( req.body.projectData );
  const smcObject = req.body.smcObject;

  const progressFileName = user + dataFolder + ".progress";

  var resultData = {};
  resultData[key] = 0.0;

  const readProgressParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: progressFileName,
  };

  var writeProgressParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: progressFileName,
      Body: JSON.stringify( resultData ),
  };

  var result;

  try {

    result = await s3.getObject( readProgressParams ).promise();
    console.log("Progress file found");

    const resultStr = result.Body.toString('utf-8')

    resultData = JSON.parse( resultStr );
    resultData[key] = 0.0;

    writeProgressParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: progressFileName,
        Body: JSON.stringify( resultData ),
    };

    result = await s3.putObject( writeProgressParams ).promise();
    console.log("Progress file updated");

  } catch (err) {

    result = await s3.putObject( writeProgressParams ).promise();
    console.log("File not found, progress file written.");
    console.log(result);
  };

  console.log("Here")

  var id = crypto.randomBytes(20).toString('hex');

  const fileName = './exe/temp/' + exe + '_' + id + '.txt';

  const inputData = new Uint8Array(Buffer.from( smcObject ));
  fs.writeFile( fileName, inputData, (err) => {
    if (err) {
      fs.unlinkSync( fileName );
      throw err;
    };

    console.log('Temporary file has been saved!');

    const options = { silent: true};
    var exeChild = spawn( "./exe/" + exe, [fileName], options );

    exeChild.stdout.on( 'data', async function(data) {
      var percent = data.toString();

      console.log(percent)

      try {
        fs.unlinkSync( fileName );
      } catch(e) {

      };

      if( isNaN(percent) ){
        console.log(percent);
      } else {
        console.log("progress: " + percent)

        try{

          result = await s3.getObject( readProgressParams ).promise();
          console.log("Progress file found");

          const resultStr = result.Body.toString('utf-8')

          resultData = JSON.parse( resultStr );

          resultData[key] = percent;

          writeProgressParams = {
              Bucket: process.env.AWS_BUCKET,
              Key: progressFileName,
              Body: JSON.stringify( resultData ),
          };

          result = await s3.putObject( writeProgressParams ).promise();
          console.log("Progress file updated, " + percent);

        } catch (err) {
          console.log(err);
          console.log("Progress file update failed.")
        };

      };
    });

    exeChild.on( 'exit', function (code, signal) {

      fs.readFile( fileName, 'utf8', function ( err, data) {
        if (err) {
          return console.log(err);
        }

        fs.unlinkSync( fileName );

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: key + "." + exe,
            Body: data
        };

        s3.putObject( params, async function(err, data) {
          if (err) {
            throw err;
          };

          try{

            result = await s3.getObject( readProgressParams ).promise();
            console.log("Progress file found");

            const resultStr = result.Body.toString('utf-8')

            resultData = JSON.parse( resultStr );

            delete resultData[key];

            writeProgressParams = {
                Bucket: process.env.AWS_BUCKET,
                Key: progressFileName,
                Body: JSON.stringify( resultData ),
            };

            result = await s3.putObject( writeProgressParams ).promise();
            console.log("Progress file updated, current progress deleted.");

          } catch (err) {
            console.log(err);
            console.log("Progress file update failed.")
          };

          console.log(`File data updated successfully: ` + key);
          return res.json(`File data updated successfully: ` + key);
        });
      });

    });

  });

};

exports.hpca = async function( filePath, maxComponents) {
  return new Promise( (resolve, reject) => {

    console.log("Initiating Hyperspectral PCA..");

    const exe = "hpca";
    const options = { silent: true};

    var exeChild = spawn( "./exe/" + exe, [filePath, maxComponents], options );

    exeChild.stdout.on( 'data', async function(data) {

      var percent = data.toString();
      console.log(percent)
    });

    exeChild.on( 'exit', function (code, signal) {

      resolve("PCA done.");
    });
  })
};

exports.mip = async function( filePath ) {
  return new Promise( (resolve, reject) => {

    console.log("Initiating Hyperspectral MIP..");

    const exe = "mip";
    const options = { silent: true};

    var exeChild = spawn( "./exe/" + exe, [filePath], options );

    exeChild.stdout.on( 'data', async function(data) {

      var percent = data.toString();
      console.log(percent)
    });

    exeChild.on( 'exit', function (code, signal) {

      resolve("MIP done.");
    });
  })
};

exports.pcac = async function( filePath ) {
  return new Promise( (resolve, reject) => {

    const nComponents = 10;

    console.log("Initiating Hyperspectral Coloring..");

    const exe = "pcac";
    const options = { silent: true};

    const arguments = [filePath, colorBasisString, filePath + "hpca", nComponents];
    var exeChild = spawn( "./exe/" + exe, arguments, options );

    exeChild.stdout.on( 'data', async function(data) {

      var percent = data.toString();
      console.log(percent)
    });

    exeChild.on( 'exit', function (code, signal) {
      console.log( code )
      console.log( signal )
      resolve("PCA coloring done.");
    });
  })
};



exports.partitionSpectra = async function( filePath, baseKey){
  return new Promise( (resolve, reject) => {

    console.log("Initiating hyperspectrum partitioning...");

    const exe = "./python/partitionHyperspectrum.py";
    const options = { silent: true};

    var exeChild = spawn( "python3", [exe, filePath, baseKey, 128], options );

    exeChild.stdout.on( 'data', async function(data) {

      var percent = data.toString();
      console.log(percent)
    });

    exeChild.on( 'exit', function (code, signal) {

      console.log( "Partitioning done." )
      resolve("Partitioning done.");
    });
  })
}

exports.pcaColor = function( request, response) {

  const index = request.body.nComponents;
  const baseKey = request.body.key;
  const key = baseKey + "pcaColor/" + "." + index

  const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
  };

  s3.getObject( params, function(err, data) {
    if (err) {
      throw err;
    };

    const outputColor = JSON.parse( data.Body );

    var responseObject = {};
    responseObject.pcaColor = outputColor;

    response.send( responseObject );
  });
};



exports.getLoadings = function( request, response) {
  return new Promise( (resolve, reject) => {

    const baseKey = request.body.key;
    const key = baseKey + "pca/.loadings";

    console.log(key)

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
    };

    s3.getObject( params, function(err, data) {
      if (err) {
        throw err;
      };

      var responseObject = {};
      responseObject.loadings = JSON.parse( data.Body );
      return response.send( responseObject );
    });
  });
};

