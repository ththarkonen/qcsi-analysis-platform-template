<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button routername="RamanMenu"></return-button>
      <upload-file-button :folder="dataFolder" v-on:fileUpload="formatFileData"></upload-file-button>
      <hr>
      <h5>Projects</h5>
      <hr>
      <project-list :loading="projectsLoading" listName="Projects">
        <project-item
          v-for="(project,index) in projects"
          :name="project.name"
          :path="project.dataPath"
          v-on:loadData="loadData"
          v-on:download="download"
          v-on:showResults="showResults"
          v-on:deleteProject="deleteProject"
        ></project-item>
      </project-list>
    </vue-sidebar>
    <workflow-container>
      <workflow-row title="Background Correction">
        <workflow-card
          routername="BackgroundCorrectionRaman"
          :inputData="inputData"
          title="Background Correction"
        ></workflow-card>
      </workflow-row>
      <workflow-row title="Background Correction & Line Narrowing">
        <workflow-card
          routername="BackgroundCorrectionRaman"
          title="Background Correction"
        ></workflow-card>
        <workflow-card
          routername="BackgroundCorrectionRaman"
          title="Line Narrowing"
        ></workflow-card>
      </workflow-row>
    </workflow-container>
</div>
</template>

<script>

import axios from "axios"

export default {

  data: function() {
    return {
      files: [],
      inputData: {},
      dataFolder: "/raman/spectrum/"
    }
  },

  methods: {

    deleteProject(filePath){

      const formData = new FormData();

      formData.append("folder", this.dataFolder)
      formData.append("key", filePath);

      var that = this;

      axios.post("/delete", formData)
      .then( function(response){
        that.formatFileData( response );
      })
    },

    loadData(filePath){

      const formData = new FormData();

      formData.append("folder", this.dataFolder)
      formData.append("key", filePath);

      var that = this;

      axios.post("/loadData", formData)
      .then( function(response){

        that.inputData = response.data;
        that.currentFilePath = filePath;
      })
    },

    download(filePath){
      console.log(filePath)
      console.log(this.inputData)
      console.log(this.currentFilePath)
    },

    formatFileData(response){

      const contents = response.data.Contents;
      const nFiles = contents.length;

      var files = [];

      for(var ii = 0; ii < nFiles; ii++){

        var file_ii = contents[ii];

        var key_ii = file_ii.Key;

        var pathParts = key_ii.split('/');
        var nParts = pathParts.length;

        var fileName_ii = pathParts[ nParts - 1 ];

        pathParts = fileName_ii.split('_');
        nParts = pathParts.length;

        pathParts[ 0 ] = '';
        fileName_ii = pathParts.filter(Boolean).join('_');

        pathParts = fileName_ii.split('.');
        nParts = pathParts.length;

        pathParts[ nParts - 1 ] = '';
        fileName_ii = pathParts.join('');

        var tempFile = {};
        tempFile.name = fileName_ii;
        tempFile.dataPath = key_ii;

        files.push( tempFile );
      };

      this.files = files;
    }
  },

  mounted: function() {

    var that = this;

    const formData = new FormData();
    formData.append("folder", this.dataFolder)

    axios.post("/listFiles", formData)
    .then( function(response){
      that.formatFileData( response );
    })
  }
}
</script>
