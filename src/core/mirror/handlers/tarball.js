'use strict'

const path = require('path')
const log = require('debug')('ipfs:registry-mirror:handlers:tarball')

module.exports = (request, response, next) => {
  log(`Requested ${request.url}`)

  log(`Loading ${request.url}`)

  const readStream = request.app.locals.store.createReadStream(request.url)

  readStream.once('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        response.statusCode = 504
      } else if (error.code === 'ECONNRESET') {
        // will trigger a retry from the npm client
        response.statusCode = 500
      } else {
        response.statusCode = 404
      }

      readStream.unpipe(response)

      next(error)
    })
    .once('data', () => {
      response.statusCode = 200
      response.setHeader('Content-type', 'application/octet-stream')
      response.setHeader('Content-Disposition', `attachment; filename="${path.basename(request.url)}"`)
    })
    .pipe(response)
}
