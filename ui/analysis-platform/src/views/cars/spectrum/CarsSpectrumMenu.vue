<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="CarsMenu"></return-button>
      <upload-file-button :folder="dataFolder" v-on:fileUpload="updateProjectList"></upload-file-button>
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

      <workflow-row title="CARS Background Correction & Raman Spectrum Extraction">
        <workflow-card
          routerName="BackgroundCorrectionCars"
          :dataFolder="dataFolder"
          :nextPhaseRouterName="Home"
          title="Background Correction"
          :disabled="!projectSelected"
        ></workflow-card>
      </workflow-row>

      <workflow-row title="Line Narrowing">
        <workflow-card
          routerName="LineNarrowingCars"
          :dataFolder="dataFolder"
          title="Line Narrowing"
          :disabled="!projectSelected"
        ></workflow-card>
      </workflow-row>

    </workflow-container>

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
      projectSelected: false,

      showMetadataModal: false,

      fileData: {},
      dataFolder: "/cars/spectrum/",
      resultExplorer: "CarsSpectrumResultExplorer",

      currentFilePath: "",
      metadata: {},
    }
  },

  methods: {

    updateProjectList(){

      var that = this;

      that.projects = [];
      that.projectsInProgress = [];
      that.projectsLoading = true;

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

    deleteProject( filePath ){

      var that = this;

      that.projects = [];
      that.projectsInProgress = [];
      that.projectsLoading = true;

      fm.deleteProject( filePath )
      .then( response => {

        console.log( response );
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

      console.log( this.$store.state.projectPath )
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
