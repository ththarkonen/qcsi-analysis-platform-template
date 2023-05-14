const fs = require('fs');
const fsp = require('fs').promises;
const login = require('./login.js');

const path = require("path")
const s3Zip = require('s3-zip')
const XmlStream = require('xml-stream')

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
});

exports.setupAPI = ( app, up) => {
  
	const uploadCallbacks = [ login.authenticate, up.single("file")];

    app.post("/deleteProject", uploadCallbacks, ( req, res) => {
        deleteProject( req, res);
    });

	app.post("/listProjects", uploadCallbacks, ( req, res) => {
		listProjects( req, res);
	});

	app.post("checkProjectMetadata", uploadCallbacks, ( req, res) => {
		metadataExists( req, res);
	});

	app.get("/downloadProject", uploadCallbacks, ( req, res) => {
		downloadProject( req, res);
	});

	app.post("/checkMetadata", uploadCallbacks, ( req, res) => {
		checkMetadata( req, res);
	});

	app.post("/uploadMetadata", uploadCallbacks, ( req, res) => {
		uploadMetadata( req, res);
	});

    return app;
};

async function downloadProject( req, res){

	console.log("Downloading project...");

	const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
	const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]

	var user = accessToken.payload.username;
	var folder = req.query.key

	console.log( folder )

	const fileParts = folder.split( "/");
	const nParts = fileParts.length;
	const fileName = fileParts[nParts - 2];

	console.log(fileName)

	const folderPath = req.query.key;

	var folderParameters = {
		Bucket: process.env.AWS_BUCKET,
		Prefix: folderPath
	};

	const filesArray = []
	const files = s3.listObjects( folderParameters ).createReadStream()
	const xml = new XmlStream(files)
	xml.collect('Key')
	xml.on('endElement: Key', function(item) {
		filesArray.push(item['$text'].substr(folder.length))
	})

	xml
	.on('end', function () {
		zip( folderPath, filesArray, res, fileName)
	})

};

function zip( folder, files, res, fileName) {
	console.log( folder )
	console.log( files )
	console.log( process.env.AWS_BUCKET )

	const outputPath = path.join(__dirname, '../downloads/' + fileName + '.zip')
	const zipPath = '/downloads/' + fileName + '.zip'

	//const output = fs.createReadStream( outputPath );
	var stream = s3Zip
	 .archive({ s3: s3, bucket: process.env.AWS_BUCKET, preserveFolderStructure: true, debug: true}, folder, files)
	 .pipe(res)
	 
  }

async function uploadMetadata(req, res){
  
	const baseKey = req.body.folder;
	const file = req.file;
	const filePath = file.path;

	const dataKey = baseKey + ".metadata"
	const fileData = await fsp.readFile( filePath );
  
	console.log( dataKey )
  
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

checkMetadata = ( req, res) => {

	const key = req.body.key;
	const metadataPath = key + ".metadata";

	console.log( metadataPath )

	const exists = fileExists( metadataPath )
	exists.then( response => {
		console.log( response )
		res.send( response );
	})
};

deleteProject = ( req, res) => {

    var key = req.body.key;
  
	emptyS3Directory( process.env.AWS_BUCKET, key)
	.then( () => {
		return res.json(`Project deleted: ` + key);
	})
};

async function metadataExists ( req, res){

	const key = req.body.key;
	const metadataPath = key + "/.metadata";

	const exists = fileExists( metadataPath );
	res.send( exists );
}


async function listProjects( req, res){

	const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
	const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]

	var user = accessToken.payload.username;
	var folder = req.body.folder;

	const folderPath = user + folder;

	var folderParameters = {
		Bucket: process.env.AWS_BUCKET,
		Delimiter: '/',
		Prefix: folderPath
	};

	const folderFiles = await s3.listObjects( folderParameters ).promise();

	const contents = folderFiles.CommonPrefixes;
	const nProjects = contents.length;

	var preprocessing = Array( nProjects );

	for( var ii = 0; ii < nProjects; ii++){

		var project_ii = contents[ii].Prefix;
		var preprocessingKey_ii = project_ii + ".preprocessing";
		var preprocessing_ii = await fileExists( preprocessingKey_ii );

		preprocessing[ii] = preprocessing_ii;
	};

	console.log( folderPath )

	var responseObject = {};
	responseObject.folderFiles = contents;
	responseObject.preprocessing = preprocessing;

	return res.send( responseObject );
}

async function emptyS3Directory( bucket, directory) {

    const directoryParameters = {
        Bucket: bucket,
        Prefix: directory
    };

    const listedObjects = await s3.listObjectsV2( directoryParameters ).promise();

    if( listedObjects.Contents.length === 0 ) return;

    const deleteParameters = {
        Bucket: bucket,
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParameters.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects( deleteParameters ).promise();
    // The s3 delete API can only delete 1000 items at once
    // so we need to recursively delete items below.
    if( listedObjects.IsTruncated ) await emptyS3Directory( bucket, directory);
}

async function fileExists( key ){

	const fileParameters = {
		Bucket: process.env.AWS_BUCKET,
		Key: key
	};

	try{
		await s3.headObject( fileParameters ).promise();
		return true;
	} catch {
		return false;
	};
}