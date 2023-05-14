<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsSpectrumMenu"></return-button>
      <analysis-button text="Line narrowing" @click="startLineNarrowing"></analysis-button>
      <hr>
      <h5>Priors</h5>
      <MathText text="$$ \pi_0(\gamma) = \mathcal{U}( \gamma_{\text{min}}, \gamma_{\text{max}}) $$"></MathText>
      <MathText text="$$ \pi_0(M) = \mathcal{U}( M_{\text{min}}, M_{\text{max}}) $$"></MathText>
      <hr>
      <h5>Prior parameters</h5>
      <number-field v-model.number="gammaMin"
                    :min = "0"
                    :max = "gammaMax - gammaStep"
                    :step = "gammaStep"
                    label = "$$ \gamma_{\text{min}} $$">
      </number-field>
      <number-field v-model.number="gammaMax"
                    :min = "gammaStep"
                    :step = "gammaStep"
                    label = "$$ \gamma_{\text{max}} $$">
      </number-field>
      <number-field v-model.number="mMin"
                    min = "2"
                    :max = "mMax - 1"
                    label = "$$ M_{\text{min}} $$">
      </number-field>
      <number-field v-model.number="mMax"
                    min = "3"
                    label = "$$ M_{\text{max}} $$">
      </number-field>
      <hr>
      <h5>SMC settings</h5>
      <number-field v-model.number="noiseStandardDeviation"
                    min="0"
                    step="0.001"
                    label="$$ \sigma_{\varepsilon} $$">
      </number-field>
      <number-field v-model.number="numberOfParticles"
                    min="10"
                    label="$$ J $$">
      </number-field>
      <number-field v-model.number="numberOfMcmcSteps"
                    min="0"
                    label="$$ N_{\text{MCMC}} $$">
      </number-field>
      <hr>
      <number-field v-model.number="learningRate"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    label="$$ \eta $$">
      </number-field>
      <number-field v-model.number="targetAcceptanceRateMCMC"
                    min="0.10"
                    max="0.50"
                    step="0.01"
                    label="$$ \alpha_{\text{target}} $$">
      </number-field>
      <number-field v-model.number="minimumEffectiveSampleSize"
                    min="0" max="1.01"
                    step="0.01"
                    label="$$ J_{\text{min}} / J $$">
      </number-field>
    </vue-sidebar>
    <graph-area ref="graph"></graph-area>
  </div>
</template>

<script>

import axios from "axios"

import lib from "@/assets/js/cars/cars.js"
import ph from "@/assets/js/common/plotHelpers.js"
import fm from "@/assets/js/common/fileManager.js";

export default {

  props: ['nextPhaseName'],

  data: function() {
    return {

      gammaMin: 1,
      gammaMax: 30,
      gammaStep: 0.01,

      mMin: 10,
      mMax: 60,

      noiseStandardDeviation: 0.01,
      numberOfParticles: 500,
      numberOfMcmcSteps: 5,

      learningRate: 0.8,
      targetAcceptanceRateMCMC: 0.30,
      minimumEffectiveSampleSize: 0.80,


      projectData: {},
      config: {},

      xData: [],
      yData: [],
      imChi3: [],
      lineNarrowedImChi3: [],
    }
  },

  methods: {

    initializePlot(){

      lib.plotRaman( this );
    },

    plotLineNarrowing(){

      lib.plotLineNarrowing( this );
    },

    startLineNarrowing(){

      const minGamma = this.gammaMin;
      const maxGamma = this.gammaMax;

      const minN = this.mMin;
      const maxN = this.mMax;

      const noiseSigma = this.noiseStandardDeviation;

      var lineNarrowingObject = {};
      lineNarrowingObject.x = this.xData;
      lineNarrowingObject.y = this.imChi3;
      lineNarrowingObject.priors = [
                                    {"distribution": "uniform", "parameters": [ minGamma, maxGamma]},
                                    {"distribution": "discreteuniform", "parameters": [ minN, maxN]},
                                    ];


      lineNarrowingObject.numberOfParticles = this.numberOfParticles;
      lineNarrowingObject.learningRate = this.learningRate;
      lineNarrowingObject.numberOfStepsMCMC = this.numberOfMcmcSteps;
      lineNarrowingObject.targetAcceptanceRateMCMC = this.targetAcceptanceRateMCMC;
      lineNarrowingObject.minimumEffectiveSampleSize = this.minimumEffectiveSampleSize * this.numberOfParticles;
      lineNarrowingObject.mode = "lorentz";
      lineNarrowingObject.noiseSigma2 = noiseSigma * noiseSigma;

      const key = this.projectPath;
      const dataFolder = this.dataFolder;

      const exeName = "lna";
      const workflow = "lineNarrowing";
      const projectDataString = JSON.stringify( this.projectData );
      const smcObjectString = JSON.stringify( lineNarrowingObject );

      const formData = new FormData();
      formData.append("key", key);
      formData.append("exe", exeName);
      formData.append("workflow", workflow);
      formData.append("dataFolder", dataFolder);
      formData.append("projectData", projectDataString);
      formData.append("smcObject", smcObjectString);

      var that = this;

      axios.post("/smc", formData)
      .then( function(response){
        console.log(response);

        return fm.load( that.projectPath + "." + exeName );
      })
      .then( lnaResult => {

        console.log( lnaResult );

        that.lineNarrowedImChi3 = lnaResult.meanLineNarrowedSpectrum;
        that.plotLineNarrowing();
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

      that.loadingData = false;

      return fm.loadObject( this.projectPath + ".raman" );
    })
    .then( result => {

      console.log( result )
      that.imChi3 = result.imChi3;
      that.initializePlot();
    });

  }
}
</script>
