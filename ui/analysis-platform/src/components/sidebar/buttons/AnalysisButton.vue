<template>
  <div class="mb-3 mb-auto">
    <button type="button" class="btn btn-primary btn-return">
        <i class="fa fa-dna"></i>
        <strong>
          {{ text }}
        </strong>
    </button>
  </div>
</template>

<script>
export default{

  props: [
    'text'
  ]

}
</script>
