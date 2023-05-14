<template>
  <div class="input-group mb-3">
    <div class="input-group-addon" tabindex="-1">
      <span tabindex="-1" class="input-group-text" id="inputGroup-sizing-default">{{ label }}</span>
    </div>
    <input type = "number"
           :value = "modelValue"
           :min = "min"
           :max = "max"
           :step = "step"
           class="form-control"
           @input="onInput">
  </div>
</template>

<script>
export default {

  props: [
    'label', 'modelValue', 'min', 'max', 'step',
  ],

  methods: {

    onInput(e){
      this.$emit('update:modelValue', e.target.value)
    },

  },

}
</script>

<style scoped>

  .input-group {
    margin-bottom: 4px!important;
  }

  .input-group-text {
    padding-top: 0px;
    padding-bottom: 0px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    min-width: 90px;
    line-height: 1;
    max-height: 40px;
  }

</style>
