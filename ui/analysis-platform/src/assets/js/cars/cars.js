
import wt from 'discrete-wavelets'
import numeric from 'numeric'
import mh from '../common/math-helpers.js'

import Plotly from 'plotly.js-dist'

const yLegend = "$ y( \\nu_k ) $";
const backgroundLegend = "$ \\epsilon( \\nu_k, p) $";
const correctedSpectrumLegend = "$ S( \\nu_k ) $"
const imChi3Legend = "$ \\chi_3( \\nu_k ) $";
const lineNarrowingLegend = "$ \\chi_{ 3, \\text{LN} }( \\nu_k ) $";

const xLabel = "$ \\Large \\nu $";

export default {

  computeBackgroundMatrix( y ){

    const nData = y.length;
    var yLog = Array(nData);

    var y_ii = 0;

    for(var ii = 0; ii < nData; ii++){

      y_ii = y[ii];
      yLog[ii] = Math.log( y_ii );
    };

    const waveletName = 'D10';
    const mode = 'symmetric';
    const nLevels = 20;

    var coeffs = wt.wavedec( yLog, waveletName, mode, nLevels);
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

    backgroundMatrix[nLevels] = yLog;
    return backgroundMatrix;
  },

  computeBackground( backgroundMatrix, detailScale){

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

      tempValue = -constantBackground[ii];
      tempValue += detailLevel[ii];
      tempValue += ( detailFactor ) * ( detailNextLevel[ii] - detailLevel[ii] );
      totalBackground.push( tempValue );
    };

    return totalBackground;
  },

  computeCorrectedSpectrum( yLog, background){

    const nData = yLog.length;
    var correctedSpectrum = Array(nData);
    var yLog_ii;
    var bg_ii;

    for(var ii = 0; ii < nData; ii++){

      yLog_ii = yLog[ii];
      bg_ii = background[ii];

      correctedSpectrum[ii] = Math.exp( yLog_ii - bg_ii );
    };

    return correctedSpectrum;
  },

  computeResultSpectra( y, backgroundMatrix, detailLevel){

    const nData = y.length;
    var yLog = Array(nData);

    var y_ii = 0;

    for(var ii = 0; ii < nData; ii++){

      y_ii = y[ii];
      yLog[ii] = Math.log( y_ii );
    };

    const background = this.computeBackground( backgroundMatrix, detailLevel);
    const correctedSpectrum = this.computeCorrectedSpectrum( yLog, background);
    const memPhase = this.computeMemPhase( correctedSpectrum );
    const imChi3 = this.computeImChi3( correctedSpectrum, memPhase);

    var result = {};
    result.background = background;
    result.correctedSpectrum = correctedSpectrum;
    result.memPhase = memPhase;
    result.imChi3 = imChi3;

    return result;
  },

  computeImChi3( x, memPhase){

    var n = x.length;
    var imChi3 = [];

    var memPhase = this.computeMemPhase( x );

    for(var ii = 0; ii < n; ii++){
      imChi3[ii] = Math.sqrt( x[ii] ) * Math.sin( memPhase[ii] );
    };

    return imChi3;
  },

  computeMemPhase( x ){

    var n = x.length;
    var halfN = Math.floor( 0.5 * n);

    a = mh.levinson( n - 1, x);

    var dctWeights = mh.computeDctWeights( x );
    var dctOutput = mh.dct( x, dctWeights );

    for(var ii = 0; ii < n; ii++){
      dctOutput[ii] = dctOutput[ii] / n;
    };

    dctOutput[0] = dctOutput[0] * Math.sqrt(2);

    var a = mh.levinson( dctOutput, halfN );

    var realPart = Array( 2 * n ).fill(0);
    var imagPart = Array( 2 * n ).fill(0);

    for(var ii = 0; ii < halfN; ii++){
      realPart[ii] = a[ii];
    };

    if (n % 2 == 1) {
        realPart[ halfN ] = a[ halfN ];
    };

    var temp = new numeric.T( realPart, imagPart );
    var fftResult = temp.fft();

    var angle = numeric.atan2( fftResult.y, fftResult.x );

    var memPhase = Array( n ).fill(0);
    var minPhase = Infinity;

    for(var ii = 0; ii < n; ii++){
      memPhase[ii] = angle[ii];

      if( memPhase[ii] < minPhase ){
        minPhase = memPhase[ii];
      };
    };

    if( minPhase < 0 ){
      for(var ii = 0; ii < n; ii++){
        memPhase[ii] = memPhase[ii] - minPhase;
      };
    };

    return memPhase;
  },

  computeChi3Modulus( imChi3, constantBackground ){

    var n = imChi3.length;
    var minusRealChi3 = hilbert( imChi3 );

    var realChi3 = [];
    var chiModulus = [];

    for(var ii = 0; ii < n; ii++){

      realChi3[ii] = -minusRealChi3[ii] + Math.sqrt( Math.exp( constantBackground[ii] ) );
      chiModulus[ii] = realChi3[ii] * realChi3[ii] + imChi3[ii] * imChi3[ii];
    };

    return chiModulus;
  },

  plot( component ){

    var traceData = {};
    traceData.x = component.xData;
    traceData.y = component.yData;
    traceData.mode = "lines";
    traceData.name = yLegend;

    var traceBackground = {};
    traceBackground.x = component.xData;
    traceBackground.y = component.background;
    traceBackground.mode = "lines";
    traceBackground.name = backgroundLegend;
    traceBackground.yaxis = "y2";

    var traceCorrectedSpectrum = {};
    traceCorrectedSpectrum.x = component.xData;
    traceCorrectedSpectrum.y = component.correctedSpectrum;
    traceCorrectedSpectrum.mode = "lines";
    traceCorrectedSpectrum.name = correctedSpectrumLegend;

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = component.xData;
    traceRamanSpectrum.y = component.imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = imChi3Legend;
    traceRamanSpectrum.yaxis = "y3";

    var data = [];
    data.push( traceData );
    data.push( traceBackground );
    data.push( traceCorrectedSpectrum );
    data.push( traceRamanSpectrum );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = xLabel;
    layout.xaxis.autorange = "reversed";

    layout.legend = {};
    layout.legend.x = 0;
    layout.legend.y = 1;
    layout.legend.font = {};
    layout.legend.font.size = 30;
    layout.legend.itemwidth = 20;
    layout.legend.orientation = "h"

    layout.yaxis2 = {};
    layout.yaxis2.overlaying = "y";
    layout.yaxis2.side = "right";
    layout.yaxis2.visible = false;

    layout.yaxis3 = {};
    layout.yaxis3.overlaying = "y";
    layout.yaxis3.side = "right";
    layout.yaxis3.visible = true;

    layout.margin = {};
    layout.margin.t = 40;

    Plotly.newPlot( component.graph, data, layout, component.config);
  },

  plotRaman( component ){

    var traceData = {};
    traceData.x = component.xData;
    traceData.y = component.yData;
    traceData.mode = "lines";
    traceData.name = yLegend;

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = component.xData;
    traceRamanSpectrum.y = component.imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = imChi3Legend;
    traceRamanSpectrum.yaxis = "y2";

    var data = [];
    data.push( traceData );
    data.push( traceRamanSpectrum );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = xLabel;
    layout.xaxis.autorange = "reversed";

    layout.legend = {};
    layout.legend.x = 0;
    layout.legend.y = 1;
    layout.legend.font = {};
    layout.legend.font.size = 30;
    layout.legend.itemwidth = 20;
    layout.legend.orientation = "h"

    layout.yaxis2 = {};
    layout.yaxis2.overlaying = "y";
    layout.yaxis2.side = "right";
    layout.yaxis2.visible = true;

    layout.margin = {};
    layout.margin.t = 40;

    Plotly.newPlot( component.graph, data, layout, component.config);
  },

  plotLineNarrowing( component ){

    var traceData = {};
    traceData.x = component.xData;
    traceData.y = component.yData;
    traceData.mode = "lines";
    traceData.name = yLegend;

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = component.xData;
    traceRamanSpectrum.y = component.imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = imChi3Legend;
    traceRamanSpectrum.yaxis = "y2";

    var traceLineNarrowedRamanSpectrum = {};
    traceLineNarrowedRamanSpectrum.x = component.xData;
    traceLineNarrowedRamanSpectrum.y = component.lineNarrowedImChi3;
    traceLineNarrowedRamanSpectrum.mode = "lines";
    traceLineNarrowedRamanSpectrum.name = lineNarrowingLegend;
    traceLineNarrowedRamanSpectrum.yaxis = "y3";

    var data = [];
    data.push( traceData );
    data.push( traceRamanSpectrum );
    data.push( traceLineNarrowedRamanSpectrum );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = xLabel;
    layout.xaxis.autorange = "reversed";

    layout.legend = {};
    layout.legend.x = 0;
    layout.legend.y = 1;
    layout.legend.font = {};
    layout.legend.font.size = 30;
    layout.legend.itemwidth = 20;
    layout.legend.orientation = "h"

    layout.yaxis2 = {};
    layout.yaxis2.overlaying = "y";
    layout.yaxis2.side = "right";
    layout.yaxis2.visible = true;

    layout.yaxis3 = {};
    layout.yaxis3.overlaying = "y";
    layout.yaxis3.side = "right";
    layout.yaxis3.visible = true;

    layout.margin = {};
    layout.margin.t = 40;

    Plotly.newPlot( component.graph, data, layout, component.config);
  },

}
