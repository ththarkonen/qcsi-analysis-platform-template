<template>
  <nav class="navbar navbar-inverse fixed-top">
    <a class="navbar-brand" href="#">qCSI</a>
    <div class="dropdown"> <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false"> <strong>User</strong> </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
            <li>
                <hr class="dropdown-divider">
            </li>
            <li><a class="dropdown-item" v-on:click="logout" href="#">Sign out</a></li>
        </ul>
    </div>
  </nav>
</template>

<script>

import axios from "axios"

export default {

  methods: {

    logout(){
      axios.get("/logout")
      .then( function(response){
        window.location.href = response.data;
      })
    },
  },
}
</script>

<style scoped>
  .dropdown{
    width: 100px;
    margin-right: 10px;
  }

  .dropdown-toggle {
    width: 75px; 
  }

  .dropdown-menu.show {
    display: inline-flex;
  }
</style>
