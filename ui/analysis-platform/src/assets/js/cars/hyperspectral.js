
import axios from "axios"
import Plotly from 'plotly.js-dist'
import cars from './cars.js'
import mh from '../common/math-helpers.js'

const yLegend = "$ y( \\nu_k ) $";
const backgroundLegend = "$ \\epsilon( \\nu_k, p) $";
const correctedSpectrumLegend = "$ S( \\nu_k ) $"
const imChi3Legend = "$ \\chi_3( \\nu_k ) $";
const lineNarrowingLegend = "$ \\chi_{ 3, \\text{LN} }( \\nu_k ) $";

const xLabel = "$ \\Large \\nu $";
const x1Label = "$ \\Large x_1 $";
const x2Label = "$ \\Large x_2 $";

export default {

  config(){

    var plotlyConfiguration = {};
    plotlyConfiguration.displaylogo = false;
    plotlyConfiguration.responsive = true;
    plotlyConfiguration.modeBarButtonsToRemove = ['sendDataToCloud', 'toImage'];
    plotlyConfiguration.modeBarButtonsToAdd = ['lasso', 'select', 'lasso2d', 'select2d'];

    return plotlyConfiguration;
  },

  selectionIndices( nX, nY, range){

    var minX = Math.min( ...range.x );
    var maxX = Math.max( ...range.x );

    var minY = Math.min( ...range.y );
    var maxY = Math.max( ...range.y );

    minX = Math.max( minX, 0);
    maxX = Math.min( maxX, nX);

    minY = Math.max( minY, 0);
    maxY = Math.min( maxY, nY);

    minX = Math.round( minX );
    maxX = Math.round( maxX );

    minY = Math.round( minY );
    maxY = Math.round( maxY );

    var indices = {};
    indices.ii = [ minY, maxY];
    indices.jj = [ minX, maxX];


    console.log( indices )

    return indices;
  },

  plot( component ){

    console.log( component )

    var traceData = {};
    traceData.x = component.xSpectrum;
    traceData.y = component.ySpectrum;
    traceData.mode = "lines";
    traceData.name = yLegend;

    var traceBackground = {};
    traceBackground.x = component.xSpectrum;
    traceBackground.y = component.background;
    traceBackground.mode = "lines";
    traceBackground.name = backgroundLegend;
    traceBackground.yaxis = "y2";
    traceBackground.visible = "legendonly";

    var traceCorrectedSpectrum = {};
    traceCorrectedSpectrum.x = component.xSpectrum;
    traceCorrectedSpectrum.y = component.correctedSpectrum;
    traceCorrectedSpectrum.mode = "lines";
    traceCorrectedSpectrum.name = correctedSpectrumLegend;
    traceCorrectedSpectrum.visible = "legendonly";

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = component.xSpectrum;
    traceRamanSpectrum.y = component.imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = imChi3Legend;
    traceRamanSpectrum.yaxis = "y3";
    traceRamanSpectrum.visible = "legendonly";

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

  plotLoadings( component ){

    console.log( component )

    var data = [];

    var xSpectrum = [0];

    for( var ii = 1; ii < component.loadings[0].length; ii++){

      xSpectrum.push(ii);
    };

    for(var ii = 0; ii < component.loadings.length; ii++){

      var traceLoading_ii = {};
      traceLoading_ii.x = xSpectrum;
      traceLoading_ii.y = component.loadings[ii];
      traceLoading_ii.mode = "lines";
      traceLoading_ii.name = "$ \\large V_{" + (ii + 1) + "}$"

      data.push( traceLoading_ii );
    };

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

    layout.margin = {};
    layout.margin.t = 40;

    Plotly.newPlot( component.loadingsGraph, data, layout, component.config);
  },

  plotRaman( component ){

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = component.xSpectrum;
    traceRamanSpectrum.y = component.ySpectrum;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = imChi3Legend;

    var data = [];
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

    layout.margin = {};
    layout.margin.t = 40;

    Plotly.newPlot( component.graph, data, layout, component.config);
  },

  plotHeatmap( component ){
    return new Promise( (resolve, reject) => {

      var traceHyperSpectral = {};
      traceHyperSpectral.z = component.zData;
      traceHyperSpectral.type = "heatmap";
      traceHyperSpectral.showscale = false;
      traceHyperSpectral.reversescale = component.invert.value;

      var data = [];
      data.push( traceHyperSpectral );

      var layout = {};

      layout.xaxis = {};
      layout.xaxis.title = x1Label;

      layout.yaxis = {};
      layout.yaxis.title = x2Label;

      layout.legend = {};
      layout.legend.x = 0;
      layout.legend.y = 1;
      layout.legend.font = {};
      layout.legend.font.size = 30;
      layout.legend.itemwidth = 20;
      layout.legend.orientation = "h"

      layout.margin = {};
      layout.margin.t = 40;
      layout.dragmode = "select";
      layout.modebar = {};
      layout.modebar.add = ["lasso", "lasso2d", "select", "select2d"];

      Plotly.newPlot( component.hyperspectralGraph, data, layout, component.hyperspectralConfig);

      component.hyperspectralGraph.on('plotly_selected', eventData => {
        component.heatmapSelectCallback( eventData );
      });

      resolve("Heatmap done.")
    });
  },

  updateHeatmap( graph, zData){
    return new Promise( (resolve, reject) => {

      Plotly.restyle( graph, {z: [zData]});
      resolve("Heatmap done.")
    });
  },

  clearGraph( graph ){
    return new Promise( (resolve, reject) => {

      Plotly.purge( graph );
      resolve("Graph cleared.")
    });
  },

  plotFalseColor( component ){

    return new Promise( (resolve, reject) => {

      var traceHyperSpectral = {};
      traceHyperSpectral.z = component.zData;
      traceHyperSpectral.type = "image";
      traceHyperSpectral.colormode = ""
      traceHyperSpectral.showscale = false;
      traceHyperSpectral.reversescale = component.invert.value;

      var data = [];
      data.push( traceHyperSpectral );

      var layout = {};

      layout.xaxis = {};
      layout.xaxis.title = x1Label;

      layout.yaxis = {};
      layout.yaxis.title = x2Label;
      layout.yaxis.autorange = true;

      layout.legend = {};
      layout.legend.x = 0;
      layout.legend.y = 1;
      layout.legend.font = {};
      layout.legend.font.size = 30;
      layout.legend.itemwidth = 20;
      layout.legend.orientation = "h"

      layout.margin = {};
      layout.margin.t = 40;
      layout.dragmode = "select";
      layout.modebar = {};
      layout.modebar.add = ["lasso", "lasso2d", "select", "select2d"];

      Plotly.newPlot( component.hyperspectralGraph, data, layout, component.hyperspectralConfig);

      component.hyperspectralGraph.on('plotly_selected', eventData => {
        component.heatmapSelectCallback( eventData );
      });

      resolve("Hyperspectral graph done.")
    });
  },

  updateFalseColor( graph, zData){
    return new Promise( (resolve, reject) => {

      Plotly.restyle( graph, {z: [zData]});
      resolve("False color done.")
    });
  },

  computeMeanSpectrum( component, range){

    const yData = component.yData;
    const nData = yData[0][0].length;

    var xMin = Math.min( ...range.x );
    var xMin = Math.ceil( xMin );

    var xMax = Math.max( ...range.x );
    var xMax = Math.floor( xMax );

    var yMin = Math.min( ...range.y );
    var yMin = Math.ceil( yMin );

    var yMax = Math.max( ...range.y );
    var yMax = Math.floor( yMax );

    console.log( range )
    console.log( [ xMin, xMax, yMin, yMax] )

    const nX = xMax - xMin;
    const nY = yMax - yMin;
    const nSpectra = ( nX + 1 ) * ( nY + 1 );

    var y_ii_jj;
    var meanSpectrum = Array( nData ).fill( 0.0 );

    for( var ii = xMin; ii <= xMax; ii++ ){
      for( var jj = yMin; jj <= yMin; jj++){

        y_ii_jj = yData[ii][jj];

        for( var kk = 0; kk < nData; kk++){
          console.log( y_ii_jj[kk] )
          meanSpectrum[kk] = meanSpectrum[kk] + y_ii_jj[kk] / nSpectra;
        };
      };
    };

    return meanSpectrum;
  },

  computeColorMap( component ){

    const yData = component.yData;

    const n = yData.length;
    const m = yData[0].length;

    var zData = [];
    var zRow;
    var z_ii_jj;

    var y_ii_jj;
    var yMin;
    var yMax;

    for( var ii = 0; ii < n; ii++){

      zRow = [];
      for( var jj = 0; jj < m; jj++){

        y_ii_jj = yData[ii][jj];

        yMin = Math.min( ...y_ii_jj );
        yMax = Math.max( ...y_ii_jj );

        z_ii_jj = yMax - yMin;
        zRow.push( z_ii_jj )
      };

      zData.push( zRow );
    };

    return zData;
  },

  layer( filePath, layer){
    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", filePath);
      formData.append("layer", layer);

      axios.post("/extractLayer", formData)
      .then( response => {

        console.log("here FM")
        console.log( response )

        var responseObject = {};
        responseObject.layer = response.data.layer;

        resolve( responseObject );
      });
    });
  },

  mip( filePath ){
    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", filePath);

      axios.post("/extractMIP", formData)
      .then( response => {

        console.log("here FM")
        console.log( response )

        const x = response.data.x;
        const mip = response.data.mip;

        var responseObject = {};
        responseObject.x = x;
        responseObject.mip = mip;

        resolve( responseObject );
      });
    });
  },

  meanSpectrum( filePath, indices){
    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", filePath);
      formData.append("indices", JSON.stringify(indices));

      axios.post("/extractMeanSpectrum", formData)
      .then( response => {

        console.log("here FM")
        console.log( response )

        const meanSpectrum = response.data.meanSpectrum;
        resolve( meanSpectrum );
      });
    });
  },

  computeFalseColor( component ){

    const x = component.xSpectrum;
    const yData = component.yData;
    const locations = component.waveNumberLocations;

    const n = yData.length;
    const m = yData[0].length;
    const nLocations = locations.length;

    var x_kk;

    var zData = [];
    var zRow;
    var z_ii_jj;
    var zMax;

    var y_ii_jj;
    var y_ii_jj_kk;
    var yMin;
    var yMax;

    var ind;

    for( var ii = 0; ii < n; ii++){

      zRow = [];
      for( var jj = 0; jj < m; jj++){

        y_ii_jj = yData[ii][jj];
        z_ii_jj = [];

        for( var kk = 0; kk < nLocations; kk++){

          x_kk = locations[kk];
          ind = mh.findClosestIndex( x, x_kk);

          y_ii_jj_kk = y_ii_jj[ind];
          z_ii_jj.push( y_ii_jj_kk );
        };

        zRow.push( z_ii_jj )
      };

      zData.push( zRow );
    };

    zMax = Math.max( ...zData.flat().flat() );

    for( var ii = 0; ii < n; ii++){
      for( var jj = 0; jj < m; jj++){
        for( var kk = 0; kk < nLocations; kk++){

          zData[ii][jj][kk] = 255 * Math.sqrt( zData[ii][jj][kk] / zMax );
        };
      };
    };

    return zData;
  },

  pcaColor( filePath, nComponents){
    return new Promise( (resolve, reject) => {

      console.log( nComponents )

      const formData = new FormData();
      formData.append("key", filePath);
      formData.append("nComponents", nComponents);

      axios.post("/pcaColor", formData)
      .then( response => {

        console.log("here FM")
        console.log( response )

        var responseObject = {};
        responseObject.pcaColor = response.data.pcaColor;

        resolve( responseObject );
      });
    });
  },

  getLoadings( filePath ){
    return new Promise( (resolve, reject) => {

      console.log("getting loadings")

      const formData = new FormData();
      formData.append("key", filePath);

      axios.post("/getLoadings", formData)
      .then( response => {

        console.log("here FM")
        console.log( response )

        var responseObject = {};
        responseObject.loadings = response.data.loadings;

        resolve( responseObject );
      });
    });
  },

  computeColorMapVariancePCA( component ){

    const yData = component.varianceScores;

    const n = yData.length;
    const m = yData[0].length;
    const nComponents = yData[0][0].length;

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


    var zData = [];
    var zRow;
    var z_ii_jj;

    var y_ii_jj;
    var yMin;
    var yMax;

    var basis_kk;
    var rgb_kk;

    for( var ii = 0; ii < n; ii++){

      zRow = [];
      for( var jj = 0; jj < m; jj++){

        y_ii_jj = yData[ii][jj];
        z_ii_jj = [ 0, 0, 0];

        for( var kk = 0; kk < nComponents; kk++){

          basis_kk = colorBasis[kk];
          rgb_kk = y_ii_jj[kk];

          for( var ll = 0; ll < 3; ll++){
            z_ii_jj[ll] = z_ii_jj[ll] + 255 * rgb_kk * basis_kk[ll];
          };
        };

        zRow.push( z_ii_jj )
      };

      zData.push( zRow );
    };

    return zData;
  },

  extractLayer( component ){

    const yData = component.yData;
    const zIndex = component.zIndex;

    const n = yData.length;
    const m = yData[0].length;

    var zData = [];
    var zRow;
    var z_ii_jj;

    var y_ii_jj;

    for( var ii = 0; ii < n; ii++){

      zRow = [];
      for( var jj = 0; jj < m; jj++){

        y_ii_jj = yData[ii][jj];

        z_ii_jj = y_ii_jj[ zIndex ];
        zRow.push( z_ii_jj )
      };

      zData.push( zRow );
    };

    return zData;
  },

  computeHyperspectralImChi3( component ){

    const yData = component.yData;

    const n = yData.length;
    const m = yData[0].length;

    var zData = [];
    var zRow;
    var z_ii_jj;

    var y_ii_jj;

    var backgroundMatrix_ii_jj = [];
    var result_ii_jj = {};
    var imChi3_ii_jj = [];

    for( var ii = 0; ii < n; ii++){

      zRow = [];
      for( var jj = 0; jj < m; jj++){

        y_ii_jj = yData[ii][jj];

        backgroundMatrix_ii_jj = cars.computeBackgroundMatrix( y_ii_jj );
        result_ii_jj = cars.computeResultSpectra( y_ii_jj, backgroundMatrix_ii_jj, component.p);
        imChi3_ii_jj = result_ii_jj.imChi3;

        zRow.push( imChi3_ii_jj );
      };

      zData.push( zRow );
    };

    return zData;
  },
}
