'use strict'

const fs = require('fs')
const path = require('path')

module.exports = function (request, response, next) {
  response.locals.start = Date.now()

  response.on('finish', () => {
    const disposition = response.getHeader('Content-Disposition')
    let prefix = '📄'

    if (disposition && disposition.endsWith('tgz')) {
      prefix = '🎁'
    }

    console.info(`${prefix} ${request.method} ${request.url} ${response.statusCode} ${Date.now() - response.locals.start}ms`)
  })

  next()
}
