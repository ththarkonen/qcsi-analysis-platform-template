const fs = require('fs');
const path = require('path')

module.exports = {

  devServer: {
    port: 8080,
  },

  outputDir: process.env.NODE_ENV === 'production'
    ? path.resolve( __dirname, "../../views/analysis-platform")
    : path.resolve( __dirname, "../../views/analysis-platform")
};
