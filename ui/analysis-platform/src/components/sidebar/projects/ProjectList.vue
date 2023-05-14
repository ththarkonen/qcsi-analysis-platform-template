<template>
  <div>
    <hr>
    <h5> {{ listName }} </h5>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto project-list">
      <list-loader :loading="loading"></list-loader>
      <slot></slot>
    </ul>
  </div>
</template>

<script>

  export default {

    props: {
      loading: {Default: false},
      listName: String,
    },

  }

</script>
