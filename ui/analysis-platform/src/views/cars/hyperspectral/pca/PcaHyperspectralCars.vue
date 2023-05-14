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
                    <span :class="classList.label">{{ checked ? 'Variance' : 'Manual' }}</span>
                  </template>
      </vue-toggle>
      <number-field v-model.number="nComponents"
                    :min = "nMin"
                    :max = "nMax"
                    :step = "nStep"
                    label = "$$ N $$"
                    @input = "updateHeatmap">
      </number-field>
    </vue-sidebar>
    <half-graph-area ref="graph"></half-graph-area>
    <half-graph-area ref="hyperspectralGraph"></half-graph-area>
  </div>
</template>

<script>

import axios from "axios"

import lib from "@/assets/js/cars/cars.js"
import hyper from "@/assets/js/cars/hyperspectral.js"
import ph from "@/assets/js/common/plotHelpers.js"
import hph from "@/assets/js/common/hyperPlotHelpers.js"
import fm from "@/assets/js/common/fileManager.js";

export default {

  props: ['nextPhaseName'],

  data: function() {
    return {

      nComponents: 1,
      nMin: 1,
      nMax: 10,
      nStep: 1,

      invert: {
        value: false,
      },

      fileData: {},

      graph: "",
      config: {},
      drawing: false,

      xData: [],
      yData: [],
      zData: [],

      xSpectrum: [],
      ySpectrum: [],

      background: [],
      correctedSpectrum: [],
      memPhaseSpectrum: [],
      imChi3: [],

      scores: [],
      varianceScores: [],
    }
  },

  methods: {

    initializePlot(){

      hyper.plot( this );
      hyper.plotFalseColorMap( this );
    },

    computeColorMap(){

      console.log( this.invert.value )

      if( !this.invert.value ){
        this.zData = hyper.computeColorMapPCA( this );
      } else {
        this.zData = hyper.computeColorMapVariancePCA( this );
      };

      console.log( this.zData )
    },

    heatmapSelectCallback( eventData ){

      const range = eventData.range;
      this.ySpectrum = hyper.computeMeanSpectrum( this, range);

      console.log( this.ySpectrum );
      hyper.plotRaman( this );
    },

    updateHeatmap(){

      console.log( this.nComponents )

      this.computeColorMap();
      hyper.plotFalseColorMap( this );
    },

    computePCA(){

      var hyperspectralPcaObject = {};

      hyperspectralPcaObject.data = this.yData;
      hyperspectralPcaObject.maxComponents = 10;

      const key = this.filePath;
      const dataFolder = this.dataFolder;

      const exeName = "hpca";
      const workflow = "pca";
      const projectDataString = JSON.stringify( this.projectData );
      const hpcaObjectString = JSON.stringify( hyperspectralPcaObject );

      const formData = new FormData();
      formData.append("key", key);
      formData.append("exe", exeName);
      formData.append("workflow", workflow);
      formData.append("dataFolder", dataFolder);
      formData.append("projectData", projectDataString);
      formData.append("hpcaObject", hpcaObjectString);

      var that = this;

      axios.post("/hpca", formData)
      .then( function(response){
        console.log(response);

        return fm.load( that.filePath );
      })
      .then( projectData => {

        console.log( projectData )

        that.projectData = projectData;
        that.metadata = projectData.metadata;
        that.currentFilePath = that.filePath;

        that.scores = projectData.workflows.pca.result.scores;
        that.varianceScores = projectData.workflows.pca.result.varianceScores;

        that.computeColorMap();
        that.initializePlot();
      });
    },

    saveResults(){

      fm.update( this.projectPath, this.projectData)
      .then( function(response){
        console.log(response);
      });
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
    this.projectData = this.$store.state.projectData;

    console.log( this.projectPath )
    console.log( this.projectData )

    this.xData = this.projectData.data.x;
    this.yData = this.projectData.workflows.pca.backgroundCorrection.imChi3;

    this.xSpectrum = this.projectData.data.x[0][0];
    this.ySpectrum = this.projectData.workflows.pca.backgroundCorrection.imChi3[0][0];

    this.computePCA();
  }
}
</script>
