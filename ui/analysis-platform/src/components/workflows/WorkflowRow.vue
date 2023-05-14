<template>
    <h4 class="text-white workflow-row-header">
      {{ title }}
    </h4>
    <div class="row workflow-row">
      <slot></slot>
    </div>
</template>

<script>

  export default {

    props: {
      title: String,
    },

  }

</script>
