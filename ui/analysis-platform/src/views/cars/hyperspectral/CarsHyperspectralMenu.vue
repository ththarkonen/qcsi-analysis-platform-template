<template>
  <div class="wrapper">

    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsMenu"></return-button>
      <upload-file-button
        :folder="dataFolder"
        :mode="uploadMode"
        v-on:fileUpload="updateProjectList"
        v-on:uploadProgress="showUploadProgress">
      </upload-file-button>
      <input ref="uploadMetadataButton" type="file" v-on:change="uploadMetadata" hidden>

      <project-list :loading="projectsLoading" listName="Projects">
        <project-item
          v-for="(project,index) in projects"
          :name="project.name"
          :path="project.dataPath"
          v-on:loadData="loadData"
          v-on:download="download"
          v-on:showResults="showResults"
          v-on:deleteProject="deleteProject"
          v-on:uploadMetadata = "startMetadataUpload"
          v-on:showMetadata = "showMetadata"
        ></project-item>
      </project-list>

      <project-list v-show="showProgressList" listName="Preprocessing">
        <project-preprocessing
          v-for="(project,index) in projectsInProgress"
          :name="project.name"
          :path="project.dataPath"
          progress = ""
        ></project-preprocessing>
      </project-list>

    </vue-sidebar>

    <workflow-container>

      <workflow-row title="MIP CARS Explorer & Background Correction & Raman Spectrum Extraction">
        <workflow-card
          routerName="BackgroundCorrectionCarsHyperspectral"
          :dataFolder="dataFolder"
          :nextPhaseRouterName="Home"
          title="Maximum Intensity Projection"
          :disabled="!projectSelected"
        ></workflow-card>
      </workflow-row>

      <workflow-row title="Layer-wise CARS Explorer & Background Correction & Raman Spectrum Extraction">
        <workflow-card
          routerName="FrameExplorerCarsHyperspectral"
          :dataFolder="dataFolder"
          :nextPhaseRouterName="Home"
          title="Layer Explorer"
          :disabled="!projectSelected"
        ></workflow-card>
      </workflow-row>
      <!--
      <workflow-row title=" Univariate Analysis">
          <workflow-card
            routerName="UnivariateAnalysisHyperspectralCars"
            :dataFolder="dataFolder"
            nextPhaseName="Home"
            title="Univariate Analysis"
            :disabled="!projectSelected"
          ></workflow-card>
      </workflow-row>
      -->
      <!--
      <workflow-row title="MIP CARS Explorer & Background Correction & Hyperspectral Raman Spectrum Extraction & Principal Component Analysis">
        <workflow-card
          routerName="BackgroundCorrectionPcaCarsHyperspectral"
          :dataFolder="dataFolder"
          nextPhaseName="PcaHyperspectralCars"
          title="Maximum Intensity Projection"
        ></workflow-card>
          <workflow-card
            routerName="PcaHyperspectralCars"
            :dataFolder="dataFolder"
            nextPhaseName="Home"
            title="Principal Component Analysis"
          ></workflow-card>
      </workflow-row>
      -->

      <workflow-row title="CARS Principal Component Analysis">
          <workflow-card
            routerName="CarsPcaHyperspectralCars"
            :dataFolder="dataFolder"
            nextPhaseName="Home"
            title="Principal Component Analysis"
            :disabled="!projectSelected"
          ></workflow-card>
      </workflow-row>

    </workflow-container>

    <transition name="modal">
      <modal 
        v-if="showProgressModal"
        :progress="uploadProgress"
        @close="showProgressModal = false">
        <!--
          you can use custom content here to overwrite
          default content
        -->
        <template v-slot:header>
        </template>
      </modal>
    </transition>
    <transition name="metadata-modal">
      <metadata-modal 
        v-if="showMetadataModal"
        :metadata="metadata"
        @close="showMetadataModal = false">
        <template v-slot:header>
        </template>
      </metadata-modal>
    </transition>
  </div>
</template>

<script>

import axios from "axios"
import fm from "@/assets/js/common/fileManager.js";

export default {

  data: function() {
    return {

      projects: [],
      projectsInProgress: [],
      showProgressList: false,
      projectsLoading: true,

      uploadProgress: 0,
      showProgressModal: false,
      showMetadataModal: false,

      fileData: {},
      dataFolder: "/cars/hyperspectral/",
      resultExplorer: "CarsHyperpectralResultExplorer",

      uploadMode: "hyperspectrum",
      currentFilePath: "",
      projectSelected: false,
      metadata: {},
    }
  },

  methods: {

    updateProjectList(){

      //this.showProgressModal = false;
      var that = this;

      that.projects = [];
      that.projectsInProgress = [];
      that.projectsLoading = true;

      fm.loadProjects( this.dataFolder )
      .then( projectObject => {

        that.projects = projectObject.projects;
        that.projectsInProgress = projectObject.projectsInProgress;
        that.showProgressList = projectObject.showProgressList;

        that.projectsLoading = false;
      });

    },

    startMetadataUpload( filePath ){
      
      this.currentFilePath = filePath;
      this.$refs.uploadMetadataButton.click();
    },

    uploadMetadata(event){

      const uploadedFile = event.target.files[0];

      const formData = new FormData();

      formData.append("folder", this.currentFilePath);
      formData.append("file", uploadedFile);

      fm.upload( this.currentFilePath)

      axios.post("/uploadMetadata", formData)
      .then( function(response){
        console.log(response)
      })
    },

    showMetadata(event){
      
      var that = this;
      const folderPath = event;
      const metadataPath = folderPath + ".metadata";

      fm.load( metadataPath )
      .then( response => {
        console.log( response )
        that.metadata = response;
        that.showMetadataModal = true;
      })
    },

    showUploadProgress( event ){

      this.showProgressModal = true;
      this.uploadProgress = event;
    },

    deleteProject( filePath ){

      var that = this;

      that.projects = [];
      that.projectsInProgress = [];
      that.projectsLoading = true;

      fm.deleteProject( filePath )
      .then( response => {

        return fm.loadProjects( that.dataFolder );
      })
      .then( projectObject => {

        that.projects = projectObject.projects;
        that.projectsInProgress = projectObject.projectsInProgress;
        that.showProgressList = projectObject.showProgressList;

        that.projectsLoading = false;
      });
    },

    loadData( filePath ){

      this.$store.commit( 'updateProjectPath', filePath);
      this.projectSelected = true;
    },

    showResults( filePath ){

      fm.results( filePath, this.resultExplorer, this.$router);
    },

    download( filePath ){

      fm.download( filePath );
    },

  },

  mounted: function() {

    var that = this;
    that.$store.commit( 'updateProjectPath', "");

    fm.loadProjects( this.dataFolder )
    .then( projectObject => {

      that.projects = projectObject.projects;
      that.projectsInProgress = projectObject.projectsInProgress;
      that.showProgressList = projectObject.showProgressList;

      console.log( that.projects )
      console.log( that.projectsInProgress )
      console.log( that.showProgressList )

      that.projectsLoading = false;
    });
  }
}
</script>
