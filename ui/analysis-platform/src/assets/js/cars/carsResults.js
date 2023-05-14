
const yLegend = "$ y( \\nu_k ) $";
const backgroundLegend = "$ \\epsilon( \\nu_k, p) $";
const correctedSpectrumLegend = "$ S( \\nu_k ) $"
const imChi3Legend = "$ \\chi_3( \\nu_k ) $";
const lineNarrowingLegend = "$ \\chi_{ 3, \\text{LN} }( \\nu_k ) $";

const xLabel = "$ \\Large \\nu $";

export default {

  returnResultTraces( inputObj ){

    const workflowName = inputObj.workflow;
    const option = inputObj.selectedResult;
    const fileData = inputObj.fileData;

    if( workflowName == "Background correction" ){

      if( option == "Show all" ){

        return this.backgroundCorrectionAll( fileData, "");
      } else if( option == "Error function"){

        return this.backgroundCorrectionErrorFunction( fileData, "");
      } else if( option == "Corrected spectrum"){

        return this.backgroundCorrectionCorrectedSpectrum( fileData, "");
      } else if( option == "MEM phase spectrum"){

        return this.backgroundCorrectionMemPhase( fileData, "");
      } else if( option == "Raman spectrum"){

        return this.backgroundCorrectionRamanSpectrum( fileData, "");
      };

    };

    if( workflowName == "Line narrowing" ){

      if( option == "Show all" ){

        return this.backgroundCorrectionAll( fileData, "lineNarrowing");
      } else if( option == "Error function"){

        return this.backgroundCorrectionErrorFunction( fileData, "lineNarrowing");
      } else if( option == "Corrected spectrum"){

        return this.backgroundCorrectionCorrectedSpectrum( fileData, "lineNarrowing");
      } else if( option == "MEM phase spectrum"){

        return this.backgroundCorrectionMemPhase( fileData, "lineNarrowing");
      } else if( option == "Raman spectrum"){

        return this.backgroundCorrectionRamanSpectrum( fileData, "lineNarrowing");
      } else if( option == "Line-narrowed spectrum"){

        return this.lineNarrowedRamanSpectrum( fileData, "lineNarrowing");
      };;

    };


  },

  backgroundCorrectionErrorFunction( fileData, field){

    const inputData = fileData.data;
    var workflow;

    if( field == "" ){
      workflow = fileData.workflows.backgroundCorrection;
    } else {
      workflow = fileData.workflows[field].backgroundCorrection;
    };

    const xData = inputData.x;
    const yData = inputData.y;

    const background = workflow.background;

    var traceData = {};
    traceData.x = xData;
    traceData.y = yData;
    traceData.mode = "lines";
    traceData.name = "$y(\\nu_k)$";

    var traceBackground = {};
    traceBackground.x = xData;
    traceBackground.y = background;
    traceBackground.mode = "lines";
    traceBackground.name = "$\\epsilon(\\nu_k, p)$";
    traceBackground.yaxis = "y2";

    var data = [];
    data.push( traceData );
    data.push( traceBackground );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = "$$\\Large\\nu$$";
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

    var result = {};
    result.data = data;
    result.layout = layout;

    return result;
  },

  backgroundCorrectionCorrectedSpectrum( fileData, field){

    const inputData = fileData.data;
    var workflow;

    if( field == "" ){
      workflow = fileData.workflows.backgroundCorrection;
    } else {
      workflow = fileData.workflows[field].backgroundCorrection;
    };

    const xData = inputData.x;
    const yData = inputData.y;

    const correctedSpectrum = workflow.correctedSpectrum;

    var traceData = {};
    traceData.x = xData;
    traceData.y = yData;
    traceData.mode = "lines";
    traceData.name = "$y(\\nu_k)$";

    var traceCorrectedSpectrum = {};
    traceCorrectedSpectrum.x = xData;
    traceCorrectedSpectrum.y = correctedSpectrum;
    traceCorrectedSpectrum.mode = "lines";
    traceCorrectedSpectrum.name = "$S(\\nu_k, \\theta)$";

    var data = [];
    data.push( traceData );
    data.push( traceCorrectedSpectrum );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = "$$\\Large\\nu$$";
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

    var result = {};
    result.data = data;
    result.layout = layout;

    return result;
  },

  backgroundCorrectionMemPhase( fileData, field){

    const inputData = fileData.data;
    var workflow;

    if( field == "" ){
      workflow = fileData.workflows.backgroundCorrection;
    } else {
      workflow = fileData.workflows[field].backgroundCorrection;
    };

    const xData = inputData.x;
    const yData = inputData.y;

    const memPhaseSpectrum = workflow.memPhaseSpectrum;

    var traceMemPhase = {};
    traceMemPhase.x = xData;
    traceMemPhase.y = memPhaseSpectrum;
    traceMemPhase.mode = "lines";
    traceMemPhase.name = "$\\phi_{\\text{MEM}}(\\nu_k)$";
    traceMemPhase.showlegend = true;

    var data = [];
    data.push( traceMemPhase );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = "$$\\Large\\nu$$";
    layout.xaxis.autorange = "reversed";

    layout.legend = {};
    layout.legend.x = 0;
    layout.legend.y = 1;
    layout.legend.font = {};
    layout.legend.font.size = 30;
    layout.legend.itemwidth = 20;
    layout.legend.orientation = "h";

    layout.margin = {};
    layout.margin.t = 40;

    var result = {};
    result.data = data;
    result.layout = layout;

    return result;
  },

  backgroundCorrectionRamanSpectrum( fileData, field){

    const inputData = fileData.data;
    var workflow;

    if( field == "" ){
      workflow = fileData.workflows.backgroundCorrection;
    } else {
      workflow = fileData.workflows[field].backgroundCorrection;
    };

    const xData = inputData.x;
    const yData = inputData.y;
    const imChi3 = workflow.imChi3;

    var traceData = {};
    traceData.x = xData;
    traceData.y = yData;
    traceData.mode = "lines";
    traceData.name = "$y(\\nu_k)$";

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = xData;
    traceRamanSpectrum.y = imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = "$V_N(\\nu_k, \\theta)$";
    traceRamanSpectrum.yaxis = "y2";

    var data = [];
    data.push( traceData );
    data.push( traceRamanSpectrum );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = "$$\\Large\\nu$$";
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

    var result = {};
    result.data = data;
    result.layout = layout;

    return result;
  },

  lineNarrowedRamanSpectrum( fileData, field){

    const inputData = fileData.data;
    const workflow = fileData.workflows.lineNarrowing;

    var traceData = {};
    traceData.x = inputData.x;
    traceData.y = inputData.y;
    traceData.mode = "lines";
    traceData.name = yLegend;

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = inputData.xData;
    traceRamanSpectrum.y = workflow.backgroundCorrection.imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = imChi3Legend;
    traceRamanSpectrum.yaxis = "y";

    var traceLineNarrowedRamanSpectrum = {};
    traceLineNarrowedRamanSpectrum.x = inputData.xData;
    traceLineNarrowedRamanSpectrum.y = workflow.result.meanLineNarrowedSpectrum;
    traceLineNarrowedRamanSpectrum.mode = "lines";
    traceLineNarrowedRamanSpectrum.name = lineNarrowingLegend;
    traceLineNarrowedRamanSpectrum.yaxis = "y2";

    var data = [];
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

    layout.margin = {};
    layout.margin.t = 40;

    var result = {};
    result.data = data;
    result.layout = layout;

    return result;
  },

  backgroundCorrectionAll( fileData, field){

    const inputData = fileData.data;
    var workflow;

    if( field == "" ){
      workflow = fileData.workflows.backgroundCorrection;
    } else {
      workflow = fileData.workflows[field].backgroundCorrection;
    };

    const xData = inputData.x;
    const yData = inputData.y;

    const background = workflow.background;
    const correctedSpectrum = workflow.correctedSpectrum;
    const imChi3 = workflow.imChi3;

    var traceData = {};
    traceData.x = xData;
    traceData.y = yData;
    traceData.mode = "lines";
    traceData.name = "$y(\\nu_k)$";

    var traceBackground = {};
    traceBackground.x = xData;
    traceBackground.y = background;
    traceBackground.mode = "lines";
    traceBackground.name = "$\\epsilon(\\nu_k, p)$";
    traceBackground.yaxis = "y2";

    var traceCorrectedSpectrum = {};
    traceCorrectedSpectrum.x = xData;
    traceCorrectedSpectrum.y = correctedSpectrum;
    traceCorrectedSpectrum.mode = "lines";
    traceCorrectedSpectrum.name = "$S(\\nu_k, \\theta)$";

    var traceRamanSpectrum = {};
    traceRamanSpectrum.x = xData;
    traceRamanSpectrum.y = imChi3;
    traceRamanSpectrum.mode = "lines";
    traceRamanSpectrum.name = "$V_N(\\nu_k, \\theta)$";
    traceRamanSpectrum.yaxis = "y3";

    var data = [];
    data.push( traceData );
    data.push( traceBackground );
    data.push( traceCorrectedSpectrum );
    data.push( traceRamanSpectrum );

    var layout = {};

    layout.xaxis = {};
    layout.xaxis.title = "$$\\Large\\nu$$";
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

    var result = {};
    result.data = data;
    result.layout = layout;

    return result;
  },


}
