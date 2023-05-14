<template>
  <div class="wrapper">
    <vue-sidebar>
      <h5>Controls</h5>
      <hr>
      <return-button
        routername = "MainMenu">
      </return-button>
    </vue-sidebar>
    <menu-with-sidebar>
      <menu-card
        title = "CARS Spectrum Analysis"
        routername = "CarsSpectrumMenu"
        image = "pics/cars/cars.png"
        text = "Analysis tools for coherent anti-Stokes Raman spectral measurements.">
      </menu-card>
      <menu-card
        title = "Hyperspectral CARS"
        routername = "CarsHyperspectralMenu"
        image = "pics/cars/hyperspectral.jpg"
        text = "Analysis tools for coherent anti-Stokes Raman hyperspectral measurements.">
      </menu-card>
    </menu-with-sidebar>
  </div>
</template>
