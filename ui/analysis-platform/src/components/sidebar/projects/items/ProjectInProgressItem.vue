<template>
  <li class="project-link">
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" ref="dropdown" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="fa fa-spin fa-cog"></i>
        <span class="ms-2"></span>
        <strong> ({{progress}}%) </strong>
        <span class="ms-1"></span>
        <strong> {{name}} </strong>
      </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdown">
          <li>
            <a class="dropdown-item d-flex align-items-center justify-content-left" @click="showResults" href="#">
              <i class="fa fa-poll dropdown-item-icon"></i>
              <span class="dropdown-text">Results</span>
          </a>
          </li>
          <li>
            <a class="dropdown-item d-flex align-items-center justify-content-left" @click="showDetails" href="#">
              <i class="fa fa-info-circle dropdown-item-icon"></i>
              <span class="dropdown-text">Details</span>
            </a>
          </li>
          <li>
            <a class="dropdown-item d-flex align-items-center justify-content-left" @click="download" href="#">
              <i class="fa fa-download dropdown-item-icon"></i>
              <span class="dropdown-text">Download</span>
            </a>
          </li>
        </ul>
    </div>
  </li>
</template>

<script>
export default {

  props: [
    'name', 'path', 'progress'
  ],

  methods: {

    showDetails(event){
      this.$emit("showDetails", this.path)
    },

    showResults(event){
      this.$emit("showResults", this.path)
    },

    download(event){
      this.$emit("download", this.path)
    }
  },

}
</script>
