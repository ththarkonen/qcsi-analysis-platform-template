<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsHyperspectralMenu"></return-button>
      <save-results-button @click="saveResults"></save-results-button>
      <hr>
      <h5>Analysis Controls</h5>
      <!--
      <vue-toggle v-model="invert.value"
                  v-bind="invert"
                  class="invert-toggle"
                  @input = "updateHeatmap">
                  <template v-slot:label="{ checked, classList }">
                    <span :class="classList.label">{{ checked ? 'Uninverted' : 'Inverted' }}</span>
                  </template>
      </vue-toggle>
       -->
      <number-field v-model.number="nu1"
                    :min = "0"
                    :max = "2000"
                    :step = "pStep"
                    label = "$$ \nu_1 $$"
                    @input = "updateHeatmap">
      </number-field>
      <number-field v-model.number="nu2"
                    :min = "0"
                    :max = "2000"
                    :step = "pStep"
                    label = "$$ \nu_2 $$"
                    @input = "updateHeatmap">
      </number-field>
      <number-field v-model.number="nu3"
                    :min = "0"
                    :max = "2000"
                    :step = "pStep"
                    label = "$$ \nu_3 $$"
                    @input = "updateHeatmap">
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

      nu1: 270,
      nu2: 475,
      nu3: 565,

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

    initializePlot(){
      hyper.plotFalseColorMap( this );
    },

    computeColorMap( component ){

      const waveNumberLocations = [ component.nu1, component.nu2, component.nu3];
      component.waveNumberLocations = waveNumberLocations;

      component.zData = hyper.computeFalseColor( this );
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

    updateHeatmap(){

      const updateCall = "computeColorMap";
      const fields = [ "zData"];

      hph.update( this, updateCall, fields);
    },

    saveResults(){
      fm.uploadROI( this.projectPath, this.ROI);
    },
  },

  mounted: function() {

    this.config = ph.config();
    this.hyperspectralConfig = hyper.config();

    this.graph = this.$refs.graph.$refs.graph;
    this.hyperspectralGraph = this.$refs.hyperspectralGraph.$refs.graph;

    this.$nextTick( function() {
       MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    });

    this.projectPath = this.$store.state.projectPath;

    console.log( this.projectPath )
    console.log( this.projectData )

    this.computeColorMap( this );
    this.initializePlot();
  }
}
</script>
