<template>
  <div class="mb-3 mb-auto">
    <button type="button" class="btn btn-primary btn-return" @click="onClick">
        <i class="fa fa-undo"></i>
        <strong>
          Return
        </strong>
    </button>
  </div>
</template>

<script>

  export default{

    props: {
      routername: {default: 'Home'}
    },

    methods: {

      onClick(){
        const routerSpec = { name: this.routername}
        this.$router.push( routerSpec );
      },
    },

  }

</script>
