<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsHyperspectralMenu"></return-button>
      <save-results-button @click="saveResults"></save-results-button>
      <hr>
      <h5>Analysis Controls</h5>
      <!--  <vue-toggle v-model="invert.value"
                  v-bind="invert"
                  class="invert-toggle"
                  @input = "updateHeatmap">
                  <template v-slot:label="{ checked, classList }">
                    <span :class="classList.label">{{ checked ? 'Variance' : 'Manual' }}</span>
                  </template>
      </vue-toggle>-->
      <number-field v-model.number="nComponents"
                    :min = "nMin"
                    :max = "nMax"
                    :step = "nStep"
                    label = "$$ N $$"
                    @input = "updateHeatmap">
      </number-field>
      <number-field v-model.number="p"
                    :min = "pMin"
                    :max = "pMax"
                    :step = "pStep"
                    label = "$$ p $$"
                    @input = "updatePlot">
      </number-field>
    </vue-sidebar>
    <half-graph-area>
        <quarter-graph-area ref="graph">
          <quarter-graph-loader v-show="loadingSpectrum"></quarter-graph-loader>
        </quarter-graph-area>
        <quarter-graph-area ref="loadingsGraph">
          <quarter-graph-loader v-show="loadingLoadings"></quarter-graph-loader>
        </quarter-graph-area>
    </half-graph-area>
    <half-graph-area ref="hyperspectralGraph">
      <half-graph-loader v-show="loadingHeatmap"></half-graph-loader>
    </half-graph-area>
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

      nComponents: 2,
      p: 10,

      nMin: 1,
      nMax: 10,
      nStep: 1,

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

      loadingSpectrum: false,
      loadingLoadings: true,
      loadingHeatmap: true,

      xData: [],
      yData: [],
      zData: [],

      xSpectrum: [],
      ySpectrum: [],

      background: [],
      correctedSpectrum: [],
      memPhaseSpectrum: [],
      imChi3: [],

      loadings: [[1,2,3],
                 [2,3,4],
                 [3,2,1]],

      scores: [],
      varianceScores: [],
    }
  },

  methods: {

    updatePlot(){

      const updateCall = "computeImChi3";
      const fields = [ "ySpectrum", "background", "correctedSpectrum", "imChi3"];

      ph.update( this, updateCall, fields);
    },

    updateHeatmap(){

      var that = this;
      that.loadingHeatmap = true;

      hyper.clearGraph( this.hyperspectralGraph )
      .then( result => {

        return hyper.pcaColor( this.projectPath, this.nComponents - 1)
      })
      .then( response => {

        that.zData = response.pcaColor;
        return hyper.plotFalseColor( that );
      })
      .then( result => {
        that.loadingHeatmap = false;
      });
    },

    computeBackgroundMatrix(){

      const bgMatrix = lib.computeBackgroundMatrix( this.ySpectrum )
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
      that.loadingSpectrum = true;

      hyper.clearGraph( this.graph ).
      then( result => {

        return hyper.meanSpectrum( this.projectPath, indices);
      })
      .then( meanSpectrum => {

        that.ySpectrum = meanSpectrum;
        console.log( that.ySpectrum );

        that.computeBackgroundMatrix();
        that.computeImChi3( that );
        return hyper.plot( that );
      })
      .then( result => {

        that.ROI = {};
        that.ROI.indices = indices;
        that.ROI.spectrum = that.ySpectrum;

        that.loadingSpectrum = false;
      });
    },

    saveResults(){
      fm.uploadROI( this.projectPath, this.ROI);
    },
  },

  mounted: function() {

    this.config = ph.config();
    this.hyperspectralConfig = hyper.config();

    this.graph = this.$refs.graph.$refs.graph;
    this.loadingsGraph = this.$refs.loadingsGraph.$refs.graph;
    this.hyperspectralGraph = this.$refs.hyperspectralGraph.$refs.graph;
    this.projectPath = this.$store.state.projectPath;

    this.$nextTick( function() {
       MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    });

    var that = this;
    that.loadingLoadings = true;
    that.loadingHeatmap = true;

    hyper.getLoadings( this.projectPath )
    .then( response => {

      console.log( response )

      that.loadings = response.loadings;
      hyper.plotLoadings( that );

      that.loadingLoadings = false;
    });

    hyper.pcaColor( this.projectPath, this.nComponents - 1)
    .then( response => {

      console.log( response );

      that.zData = response.pcaColor;

      that.nX = that.zData.length;
      that.nY = that.zData[0].length;

      return hyper.plotFalseColor( that );
    })
    .then( result => {
      that.loadingHeatmap = false;
    });

    console.log( this.projectPath )
  }
}
</script>
