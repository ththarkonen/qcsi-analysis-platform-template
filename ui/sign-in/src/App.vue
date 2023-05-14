<template>
<div id="app">
  <div class="container container-full">
    <div class="card mx-auto ">
        <form class="align-middle" v-on:submit="handleSignIn">
          <h2 class="card-title center form-title">Sign in</h2>
          <div class="form-floating mb-3">
            <input type="email" v-model="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
            <label for="exampleInputEmail1" class="form-label">Email address</label>
          </div>
          <div class="form-floating mb-3">
            <input type="password" v-model="password" class="form-control" id="exampleInputPassword1">
            <label for="exampleInputPassword1" class="form-label">Password</label>
          </div>
          <button type="submit" class="btn btn-primary">Sign In</button>
        </form>
    </div>
  </div>
</div>
<Particles id="tsparticles" :options=particleOptions></Particles>
</template>
<script>

import axios from "axios"

var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

require("@/js/config.js")
require("@/js/cognito-auth.js")

var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

export default {

  name: 'App',

  data: function(){
    return {

      email: "",
      password: "",

      particleOptions: {
          background: {
              color: {
                  value: '#333'
              }
          },
          fpsLimit: 60,
          interactivity: {
              events: {
                  onClick: {
                      enable: false,
                      mode: 'push'
                  },
                  onHover: {
                      enable: true,
                      mode: 'repulse'
                  },
                  resize: true
              },
              modes: {
                  bubble: {
                      distance: 400,
                      duration: 2,
                      opacity: 0.8,
                      size: 40
                  },
                  push: {
                      quantity: 0
                  },
                  repulse: {
                      distance: 150,
                      duration: 0.1
                  }
              }
          },
          particles: {
              color: {
                  value: '#d33479'
              },
              links: {
                  color: '#ffffff',
                  distance: 150,
                  enable: true,
                  opacity: 0.5,
                  width: 1
              },
              collisions: {
                  enable: false
              },
              move: {
                  direction: 'top-right',
                  enable: true,
                  outMode: 'out',
                  random: true,
                  speed: 6,
                  straight: false
              },
              number: {
                  density: {
                      enable: true,
                      value_area: 800
                  },
                  value: 80
              },
              opacity: {
                  value: 0.75
              },
              shape: {
                  type: 'polygon'
              },
              size: {
                  random: true,
                  value: 10
              }
          },
          detectRetina: false,
          "fullScreen": {
              "enable": true,
              "zIndex": -1 // -1 is behind the body, so if you have a background you have to use 0 or a different value
           }
      },
    }
  },

  methods: {

    handleSignIn(event) {

        const email = this.email;
        const password = this.password;
        event.preventDefault();

        this.signIn( this.signinSuccess, this.signinError);
    },

    signIn( onSuccess, onFailure) {

        const email = this.email;
        const username = this.email;
        const password = this.password;

        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = this.createCognitoUser( email );
        cognitoUser.authenticateUser( authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    },

    signinSuccess(result) {

        console.log('Successfully Logged In');
        axios.post('/setTokenCookie', result)
        .then( function(response){
          window.location.href = response.data;
        })
    },

    signinError(err) {
        alert(err);
    },

    createCognitoUser( email ) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    },

  },

  mounted() {
  }

}
</script>
