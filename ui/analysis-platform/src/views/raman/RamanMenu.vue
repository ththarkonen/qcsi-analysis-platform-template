<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button
        routername="MainMenu">
      </return-button>
    </vue-sidebar>
    <menu-with-sidebar>
      <menu-card
        title="Raman Spectrum Analysis"
        routername="RamanSpectrumMenu"
        image="pics/raman/raman.png">
      </menu-card>
      <menu-card
        title="Hyperspectral Raman"
        routername="Raman"
        image="pics/cars/hyperspectral.jpg">
      </menu-card>
    </menu-with-sidebar>
  </div>
</template>
