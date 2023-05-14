<template>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

        <div class="modal-header-mod" v-if="progress != 100">
            <h3>Uploading file...</h3>
            <br>
            <h3>Please wait...</h3>
            <br>
        </div>  

        <div class="modal-header-mod" v-show="progress == 100">
            <h3>File uploaded.</h3>
            <br>
            <h3>The data is being preprocessed now. This may take several minutes.
                <i class="fa fa-coffee"></i>
            </h3>
        </div>  

        <div style="width: 100%">
            <LvProgressBar :value="progress" color="#3479D3"/>
        </div>

          <div class="modal-footer">
              <button class="modal-default-button btn-primary btn"
                v-if="progress == 100"
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
      progress: Number
    },

    mounted: function() {

        console.log( this.progress )
    },

}

</script>