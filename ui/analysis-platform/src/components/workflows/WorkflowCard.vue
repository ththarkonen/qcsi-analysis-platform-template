<template>
    <div class="card workflow-card">
      <img src="@/assets/pics/logo.png" class="card-img-top center" alt="...">
      <div class="card-body">
        <button type="button" class="btn workflow-button btn-primary btn-return" :disabled="disabled" @click="onClick">
            <strong>{{ title }}</strong>
        </button>
      </div>
    </div>
</template>
<script>

export default {

  props: {
    title: String,
    image: { default: "@/assets/logo.png"},
    routerName: String,
    inputFileData: Object,
    filePath: String,
    dataFolder: String,
    nextPhaseName: {default: "Home"},
    disabled: Boolean,
  },

  methods: {

    onClick(event){

      var startTime = performance.now()
      const fileDataString = JSON.stringify( this.inputFileData );
      var endTime = performance.now()
      console.log(`Call took ${endTime - startTime} milliseconds`)
      console.log( fileDataString )

      var params = {};
      params.inputFileData = fileDataString;
      params.filePath = this.filePath;
      params.dataFolder = this.dataFolder;
      params.nextPhaseName = this.nextPhaseName;

      var routerSpec = {};

      routerSpec.name = this.routerName;
      routerSpec.params = params;

      this.$router.push( routerSpec );
    },
  },
}

</script>
