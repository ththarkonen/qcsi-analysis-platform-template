<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsSpectrumMenu"></return-button>
      <save-results-button @click="saveResults"></save-results-button>
      <hr>
      <h5>Analysis Controls</h5>
      <number-field v-model.number="p"
                    :min = "pMin"
                    :max = "pMax"
                    :step = "pStep"
                    label = "$$ p $$"
                    @input = "updatePlot">
      </number-field>
    </vue-sidebar>
    <graph-area ref="graph">
        <half-graph-loader v-show="loadingData"></half-graph-loader>
    </graph-area>
  </div>
</template>

<script>

import lib from "@/assets/js/cars/cars.js"
import ph from "@/assets/js/common/plotHelpers.js"
import fm from "@/assets/js/common/fileManager.js";

export default {

  data: function() {
    return {

      p: 10,

      pMin: 0,
      pMax: 19,
      pStep: 0.01,

      fileData: {},

      graph: "",
      config: {},
      drawing: false,
      loadingData: true,

      xData:[],
      yData:[],

      background: [],
      correctedSpectrum: [],
      memPhaseSpectrum: [],
      imChi3: [],
    }
  },

  methods: {

    initializePlot(){

      lib.plot( this );
    },

    updatePlot(){

      const updateCall = "computeImChi3";
      const fields = [ "yData", "background", "correctedSpectrum", "imChi3"];

      ph.update( this, updateCall, fields);
    },

    computeBackgroundMatrix(){

      const bgMatrix = lib.computeBackgroundMatrix( this.yData )
      this.backgroundMatrix = bgMatrix;
    },

    computeImChi3( component ){

      const result = lib.computeResultSpectra( component.yData, component.backgroundMatrix, component.p);

      component.background = result.background;
      component.correctedSpectrum = result.correctedSpectrum;
      component.memPhaseSpectrum = result.memPhase;
      component.imChi3 = result.imChi3;
    },

    saveResults(){

      var result = {};
      result.background = this.background;
      result.correctedSpectrum = this.correctedSpectrum;
      result.memPhaseSpectrum = this.memPhaseSpectrum;
      result.imChi3 = this.imChi3;

      fm.upload( this.projectPath + ".raman", result)
      .then( function(response){
        console.log(response);
      });
    },
  },

  mounted: function() {

    this.config = ph.config();
    this.graph = this.$refs.graph.$refs.graph;

    this.$nextTick( function() {
       MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    });

    this.projectPath = this.$store.state.projectPath;
    var that = this;

    fm.loadCARS( this.projectPath )
    .then( response => {

      console.log( response )

      that.xData = response.data.x;
      that.yData = response.data.y;

      that.computeBackgroundMatrix();
      that.computeImChi3( this );
      that.initializePlot();

      that.loadingData = false;
    });

  }
}
</script>
