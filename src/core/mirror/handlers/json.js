'use strict'

const path = require('path')
const store = require('../store')
const INDEX_JSON = 'index.json'
const log = require('debug')('ipfs:registry-mirror:handlers:json')
const config = require('../../config')

module.exports = (request, response, next) => {
  log(`Requested ${request.url}`)

  let file = request.url

  if (!file.endsWith(INDEX_JSON)) {
    file = path.join(file, INDEX_JSON)
  }

  log(`Loading ${file}`)
  request.app.locals.store
    .createReadStream(file)
    .once('error', (error) => {
      response.statusCode = 404

      next(error)
    })
    .once('data', () => {
      response.statusCode = 200
      response.setHeader('Content-type', 'application/json; charset=utf-8')
      response.setHeader('Content-Disposition', `attachment; filename="${INDEX_JSON}"`)
    })
    .pipe(response)
}
