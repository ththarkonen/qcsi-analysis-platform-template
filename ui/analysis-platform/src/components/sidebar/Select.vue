<template>
  <select :value="modelValue" class="resultSelector" @change="update">
    <option v-for="option in options" v-bind:value="option">
      {{ option.text }}
    </option>
  </select>
</template>

<script>
export default {

  props: {
    'modelValue':{
      type: Object,
      default: () => ({}),
    },
    'options': {type: Array, default: []}
  },

  emits: ['update:modelValue'],

  methods: {
    update(event) {
      this.$emit('update:modelValue', event.target.value);
    },
  },

  mounted: function() {
    console.log( this.options )
  }
}
</script>
