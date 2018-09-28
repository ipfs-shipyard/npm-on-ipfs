'use strict'

const log = require('debug')('ipfs:registry-mirror:handlers:files')
const path = require('path')

module.exports = async (request, response, next) => {
  log(`Requested ${request.url}`)

  let file = request.url

  log(`Loading ${file}`)
  const readStream = request.app.locals.store.createReadStream(file)

  readStream.on('error', (error) => {
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
      response.setHeader('Content-type', 'application/json; charset=utf-8')

      if (request.url.endsWith('.tgz')) {
        response.setHeader('Content-Disposition', `attachment; filename="${path.basename(request.url)}"`)
      }
    })
    .pipe(response)
}
