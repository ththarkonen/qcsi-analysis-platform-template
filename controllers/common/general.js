const fsp = require('fs').promises;

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
});

exports.setPreprocessing = setPreprocessing;
exports.quitPreprocessing = quitPreprocessing;

exports.uploadS3 = uploadS3;
exports.uploadFieldS3 = uploadFieldS3;
exports.uploadMultiFieldS3 = uploadMultiFieldS3;


async function setPreprocessing( baseKey ){

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: baseKey + "/.preprocessing",
        Body: "0.0"
    };

    await s3.upload( params ).promise();
    console.log( "Set preprocessing flag: " + baseKey );
};
  
async function quitPreprocessing( baseKey ){

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: baseKey + "/.preprocessing",
    };

    await s3.deleteObject( params ).promise();  
    console.log( "Removed preprocessing flag: " + baseKey );
};



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

async function uploadS3( key, file){

    const fileData = await fsp.readFile( file.path );
  
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: fileData
    };
  
    await s3.upload( params ).promise();
  
    console.log( "File uploaded: " + key );
    return 0;
  }