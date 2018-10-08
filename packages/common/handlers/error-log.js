'use strict'

const fs = require('fs')
const path = require('path')

module.exports = function (error, request, response, next) {
  console.error(`💀 ${request.method} ${request.url} ${response.statusCode} - ${error.stack}`)

  next()
}
