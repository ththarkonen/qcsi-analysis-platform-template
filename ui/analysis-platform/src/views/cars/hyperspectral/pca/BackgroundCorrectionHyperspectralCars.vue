<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsHyperspectralMenu"></return-button>
      <save-results-button @click="saveResults"></save-results-button>
      <hr>
      <h5>Analysis Controls</h5>
      <vue-toggle v-model="invert.value"
                  v-bind="invert"
                  class="invert-toggle"
                  @input = "updateHeatmap">
                  <template v-slot:label="{ checked, classList }">
                    <span :class="classList.label">{{ checked ? 'Uninverted' : 'Inverted' }}</span>
                  </template>
      </vue-toggle>
      <number-field v-model.number="p"
                    :min = "pMin"
                    :max = "pMax"
                    :step = "pStep"
                    label = "$$ p $$"
                    @input = "updatePlot">
      </number-field>
    </vue-sidebar>
    <half-graph-area ref="graph"></half-graph-area>
    <half-graph-area ref="hyperspectralGraph"></half-graph-area>
  </div>
</template>

<script>

import lib from "@/assets/js/cars/cars.js"
import hyper from "@/assets/js/cars/hyperspectral.js"
import ph from "@/assets/js/common/plotHelpers.js"
import hph from "@/assets/js/common/hyperPlotHelpers.js"
import fm from "@/assets/js/common/fileManager.js";

export default {

  props: ['nextPhaseName'],

  data: function() {
    return {

      p: 10,

      pMin: 0,
      pMax: 19,
      pStep: 0.01,

      invert: {
        value: false,
      },

      fileData: {},

      graph: "",
      config: {},
      drawing: false,

      xData: [],
      yData: [],

      xSpectrum: [],
      ySpectrum: [],

      background: [],
      correctedSpectrum: [],
      memPhaseSpectrum: [],
      imChi3: [],
    }
  },

  methods: {

    updatePlot(){

      const updateCall = "computeImChi3";
      const fields = [ "ySpectrum", "background", "correctedSpectrum", "imChi3"];

      ph.update( this, updateCall, fields);
    },

    computeBackgroundMatrix(){

      const bgMatrix = lib.computeBackgroundMatrix( this.ySpectrum );
      this.backgroundMatrix = bgMatrix;
    },

    computeImChi3( component ){

      const result = lib.computeResultSpectra( component.ySpectrum, component.backgroundMatrix, component.p);

      component.background = result.background;
      component.correctedSpectrum = result.correctedSpectrum;
      component.memPhaseSpectrum = result.memPhase;
      component.imChi3 = result.imChi3;

      component.xSpectrum = [0];

      for( var ii = 1; ii < component.imChi3.length; ii++){

        component.xSpectrum.push( ii );
      };
    },

    heatmapSelectCallback( eventData ){

      const range = eventData.range;
      const nX = this.nX;
      const nY = this.nY;

      const indices = hyper.selectionIndices( nX, nY, range);
      var that = this;

      hyper.meanSpectrum( this.projectPath, indices)
      .then( meanSpectrum => {

        that.ySpectrum = meanSpectrum;
        console.log( that.ySpectrum );

        that.computeBackgroundMatrix();
        that.computeImChi3( that );
        hyper.plot( that );
      });
    },

    saveResults(){

      if( !this.projectData.hasOwnProperty("workflows") ){
        this.projectData.workflows = {};
      };

      if( !this.projectData.workflows.hasOwnProperty("pca") ){
        this.projectData.workflows.pca = {};
      };

      if( !this.projectData.workflows.pca.hasOwnProperty("backgroundCorrection") ){
        this.projectData.workflows.pca.backgroundCorrection = {};
      };

      this.projectData.workflows.pca.backgroundCorrection.imChi3 = hyper.computeHyperspectralImChi3( this );
      this.$store.commit( 'updateProjectData', this.projectData);

      fm.nextPhase( this.projectPath, this.projectData, this.nextPhaseName, this.$router);
    },
  },

  mounted: function() {

    this.config = ph.config();
    this.hyperspectralConfig = hyper.config();

    this.graph = this.$refs.graph.$refs.graph;
    this.hyperspectralGraph = this.$refs.hyperspectralGraph.$refs.graph;
    this.projectPath = this.$store.state.projectPath;

    this.$nextTick( function() {
       MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    });

    var that = this;

    hyper.mip( this.projectPath )
    .then( response => {

      console.log( response );

      that.xSpectrum = response.x;
      that.zData = response.mip;

      that.nX = that.zData.length;
      that.nY = that.zData[0].length;

      hyper.plotHeatmap( that );
    });

    console.log( this.projectPath )
  }
}
</script>
