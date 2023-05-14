<template>
  <div class="mb-3 mb-auto">
    <label class="btn btn-primary btn-upload">
      <i class="fa fa-upload"></i>
      <strong>
        Upload data
      </strong>
      <input type="file" hidden v-on:change="uploadFile">
    </label>
  </div>
</template>

<script>

import axios from "axios"

export default {

  props: {
    folder: {type: String, required: true},
    mode: {type: String, default: 'spectrum'}
  },

  data(){
    return {
      uploadPercentage: 0,
    }
  },

  methods: {

    uploadFile(event){

      const uploadedFile = event.target.files[0];

      const formData = new FormData();

      formData.append("folder", this.folder)
      formData.append("file", uploadedFile);

      var that = this;

      if( this.mode == "hyperspectrum" ){

        axios.post("/uploadHyperspectrum",
          formData, {
            onUploadProgress: function(progressEvent) {

              var ratio = progressEvent.loaded / progressEvent.total;
              var percentage = 100 * Math.round( progressEvent.loaded / progressEvent.total );
              percentage = parseInt( percentage );

              this.uploadPercentage = percentage;
              console.log( this.uploadPercentage );

              this.$emit( "uploadProgress", percentage);

            }.bind(this)
          }
        )
        .then( function(response){
          console.log(response)
          that.$emit( "fileUpload", response);
        })
      } else {

        axios.post("/upload", formData)
        .then( function(response){
          console.log(response)
          that.$emit( "fileUpload", response);
        })
      };



    },
  },
}

</script>
