<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsSpectrumMenu"></return-button>
      <hr>
      <h5>Workflows</h5>
      <select ref="workflowSelector" v-model="selectedWorkflow" class="resultSelector" @change="showResult">
        <option v-for="option in options" v-bind:value="option">
          {{ option.text }}
        </option>
      </select>
      <hr>
      <h5>Results</h5>
      <select ref="resultSelector" v-model="selectedResult" class="resultSelector" @change="showResult">
        <option v-for="option in selectedWorkflow.value" v-bind:value="option">
          {{ option.text }}
        </option>
      </select>
    </vue-sidebar>
    <graph-area ref="graph"></graph-area>
  </div>
</template>

<script>

import axios from "axios"
import Plotly from 'plotly.js-dist'

import lib from "@/assets/js/cars/carsResults.js"
import ph from "@/assets/js/common/plotHelpers.js"

export default {

  props: ['inputFileData'],

  data: function() {
    return {

      fileData: {},

      config: {},
      graph: "",

      background: [],
      correctedSpectrum: [],
      memPhaseSpectrum: [],
      imChi3: [],

      xData:[],
      yData:[],

      options: [],

      workflowOptions: [],
      selectedWorkflow: [],
      selectedResult: [],

      selected: {},

    }
  },

  methods: {

    initializePlot(){

      const graphContainer = this.$refs.graph;

      var traceData = {};
      traceData.x = this.xData;
      traceData.y = this.yData;
      traceData.mode = "lines";
      traceData.name = "$y(\\nu_k)$";
      traceData.showlegend = true;

      var data = [];
      data.push( traceData );

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

      Plotly.newPlot( this.graph, data, layout, this.config);
    },

    showResult(){

      var inputObj = {};
      inputObj.fileData = this.fileData;
      inputObj.workflow = this.selectedWorkflow.text;
      inputObj.selectedResult = this.selectedResult.text;

      const plotObject = lib.returnResultTraces( inputObj );

      const data = plotObject.data;
      const layout = plotObject.layout;

      Plotly.newPlot( this.graph, data, layout, this.config);

    },
  },

  mounted: function() {

    this.config = ph.config();
    this.graph = this.$refs.graph.$refs.graph;

    this.fileData = JSON.parse( this.inputFileData );

    this.xData = this.fileData.data.x;
    this.yData = this.fileData.data.y;

    this.metadata = this.fileData.metadata;

    this.options = [];

    const workflows = this.fileData.workflows;
    console.log(workflows)

    if( workflows.hasOwnProperty("backgroundCorrection") ){

      var option = {};
      option.text = "Background correction";
      option.value = [{text: "Error function" },
                      {text: "Corrected spectrum" },
                      {text: "MEM phase spectrum" },
                      {text: "Raman spectrum" },
                      {text: "Show all" },
                    ];

      this.options.push( option );
    };

    if( workflows.hasOwnProperty("lineNarrowing") ){

      var option = {};
      option.text = "Line narrowing";
      option.value = [{text: "Error function" },
                      {text: "Corrected spectrum" },
                      {text: "MEM phase spectrum" },
                      {text: "Raman spectrum" },
                      {text: "Line-narrowed spectrum" },
                      {text: "Show all" },
                    ];

      this.options.push( option );
    };
  },
}
</script>
