<template>
  <li class="project-link">
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center justify-content-left text-white text-decoration-none dropdown-toggle" ref="dropdown" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="fa fa-project-diagram project-item-icon"></i>
        <span class="project-text"> {{ name }} </span>
      </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdown">
            <li>
              <a class="dropdown-item d-flex align-items-center justify-content-left" @click="loadData" href="#">
                <i class="fa fa-database dropdown-item-icon"></i>
                <span class="dropdown-text">Load data</span>
            </a>
            </li>
            <!--
            <li>
              <a class="dropdown-item d-flex align-items-center justify-content-left" @click="showResults" href="#">
                <i class="fa fa-poll dropdown-item-icon"></i>
                <span class="dropdown-text">Results</span>
            </a>
            </li>-->
            <li>
              <a class="dropdown-item d-flex align-items-center justify-content-left" @click="showMetadata" href="#">
                <i class="fa fa-info-circle dropdown-item-icon"></i>
                <span class="dropdown-text">Metadata</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center justify-content-left" @click="download" href="#">
                <i class="fa fa-download dropdown-item-icon"></i>
                <span class="dropdown-text">Download</span>
              </a>
            </li>
            <hr class="dropdown-divider">
            <li>
              <a class="dropdown-item d-flex align-items-center justify-content-left" @click="deleteProject" href="#">
                <i class="fa fa-trash dropdown-item-icon"></i>
                <span class="dropdown-text">Delete</span>
              </a>
            </li>
        </ul>
    </div>
  </li>
</template>

<script>

import axios from "axios"

export default {

  props: [
    'name', 'path'
  ],

  methods: {

    deleteProject(event){
      this.$emit("deleteProject", this.path)
    },

    loadData(event){
      this.$emit("loadData", this.path)
    },

    showMetadata(event){

      var that = this;

      const formData = new FormData();

      formData.append("key", this.path)

      axios.post("/checkMetadata", formData)
      .then( response => {
        
        const metadataExists = response.data;

        if( metadataExists ){
          console.log( metadataExists );
          that.$emit("showMetadata", this.path)
        } else {
          console.log( metadataExists );
          that.$emit("uploadMetadata", this.path)
        };
      });

      
    },

    showResults(event){
      this.$emit("showResults", this.path)
    },

    download(event){
      this.$emit("download", this.path)
    }
  }

}
</script>
