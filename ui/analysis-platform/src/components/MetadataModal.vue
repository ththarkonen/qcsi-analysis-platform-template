<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">

      <div class="modal-header-mod">
          <h3>Metadata</h3>
          <br>
      </div>  

      <json-viewer :value="metadata"
      ></json-viewer>

        <div class="modal-footer">
            <button class="modal-default-button btn-primary btn"
              @click="$emit('close')"> 
              <strong>
                  Close
              </strong>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {

  props: {
    metadata: Object
  },

  mounted: function() {

      console.log( this.metadata)
  },

}

</script>

<style scoped>

</style>
