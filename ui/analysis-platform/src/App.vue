<template>
  <nav-bar></nav-bar>
    <router-view v-slot="{ Component }">
      <transition :name="transitionName">
        <component :is="Component"></component>
      </transition>
    </router-view>
</template>

<script>

export default {

  watch: {
    $route(to, from) {

      const toPath = to.path.split("/");
      const fromPath = from.path.split("/");

      var toDepth = toPath.length;
      var fromDepth = fromPath.length;

      if( toPath[toDepth - 1] == '' ){
        toDepth = toDepth - 1;
      };

      if( fromPath[fromDepth - 1] == '' ){
        fromDepth = fromDepth - 1;
      };

      this.transitionName = toDepth >= fromDepth ? "slide-right" : "slide-left";
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
