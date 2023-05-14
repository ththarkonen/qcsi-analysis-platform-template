<template>
    <div class="card menu-card text-center col-4 d-flex">
      <img :src="require(`@/assets/${image}`)" class="menu-card-img-top center" alt="...">
      <div class="card-body">
        <h5 class="card-title">
          <strong> {{ title }} </strong>
        </h5>
        <p class="card-text">{{ text }}</p>
        <button type="button" class="btn btn-primary btn-return" @click="onClick">
            <strong> Show {{ title }} Tools </strong>
        </button>
      </div>
    </div>
</template>
<script>

export default {

  props: {
    title: { default: 'Title'},
    text: { default: "Some quick example text to build on the card title and make up the bulk of the card's content."},
    image: { default: "pics/logo.png"},
    id: {default: "Main"},
    routername: String,
  },

  data: function() {
    return {
      cardImage: {},
    }
  },

  methods: {

    onClick(event){
      const routerSpec = { name: this.routername}
      this.$router.push( routerSpec );
    },
  },

  mounted(){
    this.cardImage = this.image;
  }

}

</script>

<style scoped>

  .card {
    margin: 25px;
  }

  img {
    max-height: 20rem;
  }

</style>
