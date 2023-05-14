const fs = require('fs');
const path = require('path')

module.exports = {
  devServer: {
    port: 8080,
    https: {
      key: fs.readFileSync('.certs/key.pem'),
      cert: fs.readFileSync('.certs/cert.pem'),
    },
    hotOnly: false,
  },
  outputDir: process.env.NODE_ENV === 'production'
    ? path.resolve( __dirname, "../../views/signin")
    : '/dist'
};
