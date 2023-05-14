const fs = require('fs');
var child = require('child_process').execFile;
var spawn = require('child_process').spawn;
var crypto = require("crypto");

var inputJSON = {};
inputJSON.data = {};

const data = [ [[ 1, 2, 1], [1,2,2], [1,2,3]], [[ 1, 2, 4], [1,2,5], [1,2,6]], [[ 1, 2, 7], [1,2,8], [1,2,9]]];

inputJSON.data.nRows = 3;
inputJSON.data.nColumns = 3;
inputJSON.data.nSlices = 3;

var field_ii_jj = "";

for( var ii = 0; ii < inputJSON.data.nRows; ii++){
  for( var jj = 0; jj < inputJSON.data.nColumns; jj++){

    field_ii_jj = "y_" + ii + "_" + jj;
    inputJSON.data[ field_ii_jj ] = data[ii][jj];
  };
};

console.log( inputJSON )

var inputStringJSON = JSON.stringify( inputJSON );
var id = crypto.randomBytes(20).toString('hex');

const fileName = './temp/mip_' + id + '.txt';

const inputData = new Uint8Array(Buffer.from(inputStringJSON));
fs.writeFile( fileName, inputData, (err) => {
  if (err) {
    fs.unlinkSync( fileName );
    throw err;
  };

  console.log('The file has been saved!');

  const options = { silent: true};
  var exeChild = spawn( "./mip", [fileName, 10], options );

  exeChild.stdout.on( 'data', function(data) {
    var percent = data.toString();

    //console.log(percent)

    if( isNaN(percent) ){
      console.log(percent);
    } else {
      console.log("progress: " + percent)
    };
  });

  exeChild.on( 'exit', function (code, signal) {
    //fs.unlinkSync( fileName );
  });

});

//const test = JSON.parse( result );

//fs.writeFileSync('testResult.json', result);

//console.log( test );
