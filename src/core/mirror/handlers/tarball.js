'use strict'

const path = require('path')
const log = require('debug')('ipfs:registry-mirror:handlers:tarball')

module.exports = (request, response, next) => {
  const file = request.url

  log(`Requested ${file}`)

  log(`Loading ${file}`)

  const readStream = request.app.locals.store.createReadStream(file)

  readStream.once('error', (error) => {
    log(`Error loading ${file} - ${error}`)

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
      log(`Loaded ${file}`)

      response.statusCode = 200
      response.setHeader('Content-type', 'application/octet-stream')
      response.setHeader('Content-Disposition', `attachment; filename="${path.basename(request.url)}"`)
    })
    .pipe(response)
}
