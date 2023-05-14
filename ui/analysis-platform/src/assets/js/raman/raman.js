
import wt from 'discrete-wavelets';
import numeric from 'numeric'
import mh from '../common/math-helpers.js'

export default {

  computeBackgroundMatrix( y ){

    const nData = y.length;

    const waveletName = 'D20';
    const mode = 'symmetric';
    const nLevels = 20;

    var coeffs = wt.wavedec( y, waveletName, mode, nLevels);
    const nCoeffs = coeffs.length;

    var backgroundMatrix = Array( nLevels + 1);

    var tempCoeffs;
    var nTempCoeffs;

    for(var ii = nCoeffs - 1; ii >= 1; ii--){

      tempCoeffs = coeffs[ii];
      nTempCoeffs = tempCoeffs.length;

      for(var jj = 0; jj < nTempCoeffs; jj++){

        tempCoeffs[jj] = 0;
      };

      coeffs[ii] = tempCoeffs;
      backgroundMatrix[ii - 1] = wt.waverec( coeffs, waveletName);
    };

    backgroundMatrix[nLevels] = y;
    return backgroundMatrix;
  },

  computeBackground( backgroundMatrix, constantScale, detailScale){

    if( detailScale > 19 ){
      detailScale = 19;
    };

    var ind = Math.floor(detailScale);
    var detailFactor = detailScale - ind;
    ind = ind + 1;

    var constantBackground = backgroundMatrix[0];
    var detailLevel = backgroundMatrix[ind];
    var detailNextLevel = backgroundMatrix[ind + 1];
    var totalBackground = [];

    var tempValue;

    for (var ii = 0; ii < detailLevel.length; ii++) {

      tempValue = -( 1 - constantScale ) * constantBackground[ii];
      tempValue += detailLevel[ii];
      tempValue += ( detailFactor ) * ( detailNextLevel[ii] - detailLevel[ii] );
      totalBackground.push( tempValue );
    };

    return totalBackground;
  },

  computeCorrectedSpectrum( y, background){

    const nData = y.length;
    var correctedSpectrum = Array(nData);

    var y_ii;
    var bg_ii;

    for(var ii = 0; ii < nData; ii++){

      y_ii = y[ii];
      bg_ii = background[ii];
      correctedSpectrum[ii] = y_ii - bg_ii;
    };

    return correctedSpectrum;
  },

  computeResultSpectra( y, backgroundMatrix, constantLevel, detailLevel){

    const background = this.computeBackground( backgroundMatrix, constantLevel, detailLevel);
    const correctedSpectrum = this.computeCorrectedSpectrum( y, background);

    var result = {};
    result.background = background;
    result.correctedSpectrum = correctedSpectrum;

    return result;
  },
}
