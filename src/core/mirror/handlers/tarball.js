'use strict'

const path = require('path')
const log = require('debug')('ipfs:registry-mirror:handlers:tarball')

module.exports = (request, response, next) => {
  log(`Requested ${request.url}`)

  log(`Loading ${request.url}`)
  request.app.locals.store
    .createReadStream(request.url)
    .once('error', (error) => {
      response.statusCode = 404

      next(error)
    })
    .once('data', () => {
      response.statusCode = 200
      response.setHeader('Content-type', 'application/octet-stream')
      response.setHeader('Content-Disposition', `attachment; filename="${path.basename(request.url)}"`)
    })
    .pipe(response)
}
