const fs = require('fs');
var child = require('child_process').execFile;
var spawn = require('child_process').spawn;
var crypto = require("crypto");

var bg = require('./bg.json');

var inputJSON = require('./resonator2_5peaks.json')
var inputJSON = inputJSON.data;

inputJSON.backgroundMatrix = bg;

var nLineShapes = 5;
var x0 = [100, 300, 500, 700, 900];
var y = inputJSON.y;

const yMin = Math.min(...y);
const yMinAbs = Math.abs( yMin );
const yMax = Math.max(...y);

const maxScaling = Math.max(yMinAbs, yMax);

inputJSON.priors = [];

for( var ii = 0; ii < nLineShapes; ii++ ){

  var prior = {};
  prior.distribution = "uniform";
  prior.parameters = [0, 1];

  inputJSON.priors.push( prior );
};

for( var ii = 0; ii < nLineShapes; ii++ ){

  x0_ii = x0[ii];

  var prior = {};
  prior.distribution = "uniform";
  prior.parameters = [x0_ii - 30, x0_ii + 30];

  inputJSON.priors.push( prior );
};

for( var ii = 0; ii < nLineShapes; ii++ ){

  var prior = {};
  prior.distribution = "uniform";
  prior.parameters = [0, 10];

  inputJSON.priors.push( prior );
};

var prior = {};
prior.distribution = "uniform";
prior.parameters = [yMin, yMax];

inputJSON.priors.push( prior );

prior = {};
prior.distribution = "uniform";
prior.parameters = [0.5, 1.5 / maxScaling];

inputJSON.priors.push( prior );

prior = {};
prior.distribution = "uniform";
prior.parameters = [10.00, 11.00];

inputJSON.priors.push( prior );

inputJSON.numberOfParticles = 1000;
inputJSON.learningRate = 0.7;
inputJSON.numberOfStepsMCMC = 3;
inputJSON.targetAcceptanceRateMCMC = 0.50;
inputJSON.minimumEffectiveSampleSize = 1.1 * inputJSON.numberOfParticles;
inputJSON.noiseSigma2 = 0.01 * 0.01;

var inputStringJSON = JSON.stringify( inputJSON );
var id = crypto.randomBytes(20).toString('hex');

const fileName = './temp/lqr_' + id + '.txt';

const inputData = new Uint8Array(Buffer.from(inputStringJSON));
fs.writeFile( fileName, inputData, (err) => {
  if (err) {
    fs.unlinkSync( fileName );
    throw err;
  };

  console.log('The file has been saved!');

  const options = { silent: true};
  var exeChild = spawn( "./lqr", [fileName], options );

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
    fs.unlinkSync( fileName );
  });

});

//const test = JSON.parse( result );

//fs.writeFileSync('testResult.json', result);

//console.log( test );
