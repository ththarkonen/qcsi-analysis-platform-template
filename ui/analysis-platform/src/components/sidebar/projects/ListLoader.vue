<template>
    <li v-if="loading">
      <ScaleLoader :loading="loading"
                   :color="color"
                   :height="height"
                   :width="width">
      </ScaleLoader>
      <div class="loader-text">{{ text }}</div>
      <ScaleLoader :loading="loading"
                   :color="color"
                   :height="height"
                   :width="width">
      </ScaleLoader>
    </li>
</template>

<script>

  import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'

  export default {

    components: {
      ScaleLoader,
    },

    props: {
      loading: Boolean,

      color: { default: "#d33479"},
      height: { default: "16px"},
      width: { default: "10px"},
      text: { default: "Loading"},
    },

  }

</script>
