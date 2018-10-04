'use strict'

const fs = require('fs')
const path = require('path')

module.exports = (options, ipfs, app) => {
  return async (request, response, next) => {
    fs.createReadStream(path.join(__dirname, 'favicon.png'))
      .on('error', () => {})
      .pipe(response)
  }
}
